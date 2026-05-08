const { pool, setup } = require("./sql_pools.js");

// --DB FUNCTIONS-- //

//create the database
module.exports.createDatabase = async function() {
    await setup.query(`
        CREATE DATABASE IF NOT EXISTS carpool;
    `);
    await setup.query(`
        USE carpool;
    `);
    await setup.query(`
        CREATE TABLE IF NOT EXISTS Users (
            user_id VARCHAR(50) PRIMARY KEY,
            pass VARCHAR(50) 
        );
    `); 
    await setup.query(`
        CREATE TABLE IF NOT EXISTS Drivers (
            driver_id VARCHAR(50) PRIMARY KEY,
            FOREIGN KEY (driver_id) REFERENCES Users(user_id)
        );
    `);
    await setup.query(`
        CREATE TABLE IF NOT EXISTS Passengers (
            passenger_id VARCHAR(50) PRIMARY KEY,
            FOREIGN KEY (passenger_id) REFERENCES Users(user_id)
        );  
    `);

    await setup.query(`
        CREATE TABLE IF NOT EXISTS Locations (
            location_id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100)
        );
    `); 

    await setup.query(`
        CREATE TABLE IF NOT EXISTS FavoriteLocations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id VARCHAR(50),
            location_id INT,
            FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
            FOREIGN KEY (location_id) REFERENCES Locations(location_id) ON DELETE CASCADE
        );
    `);

    await setup.query(`
        CREATE TABLE IF NOT EXISTS Requests (
            request_id INT AUTO_INCREMENT PRIMARY KEY,
            passenger_id VARCHAR(50),
            start_loc INT,
            end_loc INT,
            ride_time TIME,
            needs BOOLEAN,
            FOREIGN KEY (passenger_id) REFERENCES Passengers(passenger_id) ON DELETE CASCADE,
            FOREIGN KEY (start_loc) REFERENCES Locations(location_id),
            FOREIGN KEY (end_loc) REFERENCES Locations(location_id)
        );
    `);

    await setup.query(`
        CREATE TABLE IF NOT EXISTS Rides (
            ride_id INT AUTO_INCREMENT PRIMARY KEY,
            driver_id VARCHAR(50) NOT NULL,
            seats INT, 
            start_loc INT,
            end_loc INT,
            ride_time TIME,
            needs BOOLEAN,
            FOREIGN KEY (driver_id) REFERENCES Drivers(driver_id) ON DELETE CASCADE,
            FOREIGN KEY (start_loc) REFERENCES Locations(location_id),
            FOREIGN KEY (end_loc) REFERENCES Locations(location_id)
        );
    `);
    await setup.query(`
        CREATE TABLE IF NOT EXISTS PassengerRides (
            ride_id INT,
            passenger_id VARCHAR(50),
            PRIMARY KEY (ride_id, passenger_id),
            FOREIGN KEY (ride_id) REFERENCES Rides(ride_id) ON DELETE CASCADE,
            FOREIGN KEY (passenger_id) REFERENCES Passengers(passenger_id)
        );
    `);

    //connect pool to the new database
    await pool.query(`USE carpool;`);
    
    console.log("Database created");
}

//delete the database
module.exports.deleteDatabase = async function() {
    await setup.query(`
        DROP DATABASE IF EXISTS carpool;
    `);
    console.log("Database deleted");
}

// --POSTED FUNCTIONS (sql_connections.js)-- //

//check if the user id and password are correct (login page)
module.exports.checkUser = async function(user_id, pass){
    //check if the id is in Users
    const rows = await pool.query(`
        SELECT *
        FROM Users
        WHERE user_id=?
        `,[user_id]);

    //if not return false
    if (rows[0].length === 0){
        return false;
    }

    //check if the password corresponding to the id is correct
    const user = rows[0][0];
    if (user.pass === pass){
        return true
    } else {
        return false;
    }
}

//create a new driver (driver page)
module.exports.createDriver = async function(driver_id){
    //check if the driver exist already
    const [check] = await pool.query(`
        SELECT * FROM DRIVERS WHERE driver_id = (?)
        `, [driver_id])

    //only create the driver if it doesn't exist
    if (check.length === 0) {
        await pool.query(`
        INSERT INTO Drivers (driver_id)
        VALUES(?)
        `, [driver_id])
    }

}

//create a new ride (driver page)
module.exports.createRide = async function(driver_id, seats, start_loc, end_loc, ride_time, needs) {
    await pool.query(`
        INSERT INTO Rides (driver_id, seats, start_loc, end_loc, ride_time, needs)
        VALUES (?, ?, ?, ?, ?, ?)
    `, [driver_id, seats, start_loc, end_loc, ride_time, needs]);
};

//create a new passenger (passenger page)
module.exports.createPassenger = async function(passenger_id){
    //check if the passenger exist already
    const [check] = await pool.query(`
        SELECT * FROM Passengers WHERE passenger_id = (?)
        `, [passenger_id])

    //only create the passenger if it doesn't exist
    if (check.length === 0) {
       await pool.query(`
        INSERT INTO Passengers (passenger_id)
        VALUES (?)
        `, [passenger_id])
    }
}

//create a new request (passenger page)
module.exports.createRequest = async function(passenger_id, start_loc, end_loc, ride_time, needs) {
    await pool.query(`
        INSERT INTO Requests (passenger_id, start_loc, end_loc, ride_time, needs)
        VALUES(?,?,?,?,?)
        `,[passenger_id, start_loc, end_loc, ride_time, needs])
}

//show the ride matched to the passenger (rides page)
module.exports.showRide = async function(passenger_id){
    const [rows] = await pool.query(`
        SELECT Rides.*
        FROM PassengerRides
        JOIN Rides ON PassengerRides.ride_id = Rides.ride_id
        WHERE PassengerRides.passenger_id = ?
    `, [passenger_id]);

    return { ride: rows[0] || null };
}

//run the carpool matching algorithm and commit to DB
module.exports.runAlgorithm = async function() {
    //check if there are enough rides for the requests
    const [requests] = await pool.query(`
        SELECT Count(*)
        FROM Requests
    `);
    const [seats] = await pool.query(`
        SELECT SUM(seats)
        FROM Rides
    `);
    if (requests[0]['Count(*)'] > seats[0]['SUM(seats)']) {
        return { success: false, reason: "Not enough seats for all requests" };
    }

    //lazy load to avoid circular imports
    const simulatedAnnealing = require("../Algorithm/simulatedAnnealing.js");
    const commitAssignments = require("../Algorithm/commitAssignments.js");
    
    //run annealing to get state
    const state = await simulatedAnnealing(pool);

    //commit assignements to DB
    await commitAssignments(state);

    return { success: true };
}

//get all the locations (user page)
module.exports.getLocations = async function() {
    const [rows] = await pool.query(`
        SELECT * FROM Locations
    `);
    return rows;
}

//create the favorite locations for a user (user page)
module.exports.createFavoriteLocations = async function(user_id, location_ids) {
    //delete old favorite locations for the user
    await pool.query(`
        DELETE FROM FavoriteLocations WHERE user_id = ?
    `, [user_id]);

    //insert new favorite locations for the user
    for (const location_id of location_ids) {
        await pool.query(`
            INSERT INTO FavoriteLocations (user_id, location_id)
            VALUES (?, ?)
        `, [user_id, location_id]);
    }
}

// -- POPULATE FUNCTIONS -- //

//create an user (populate_database.js)
module.exports.createUser = async function(user_id, pass) {
    await pool.query(`
        INSERT INTO Users (user_id, pass)
        VALUES(?,?)
        `, [user_id, pass]
    )
}

//create a new location
module.exports.createLocation = async function(name) {
    //check if location already exists
    const [check] = await pool.query(`
        SELECT * FROM Locations WHERE name = (?)
    `, [name]);

    //only insert if it doesn't exist
    if (check.length === 0) {
        await pool.query(`
            INSERT INTO Locations (name)
            VALUES (?)
        `, [name]);
    }
}

//get the id of the location
module.exports.getLocationID = async function(name) {
    const [rows] = await pool.query(`
        SELECT location_id FROM Locations WHERE name = (?)
    `, [name]);
    if (rows.length === 0) {
        throw new Error(`Location ${name} not found`);
    }
    return rows[0].location_id;
}