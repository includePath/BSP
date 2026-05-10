const { pool } = require("./sql_pools.js");

// -- ALGORITHM FUNCTIONS -- //

//create a new passenger ride and ignore duplicates
module.exports.createPassengerRide = async function(ride_id, passenger_id){
    await pool.query(`
        INSERT IGNORE INTO PassengerRides (ride_id, passenger_id)
        VALUES(?,?)
        `, [ride_id, passenger_id])
}

//decrease the number of available seats for a ride
module.exports.decreaseSeats = async function(ride_id){
    //check current seats
    const seats = await pool.query(`
        SELECT seats
        FROM Rides
        WHERE ride_id = ?
        `, [ride_id]);

    //check if ride exists
    if (!seats[0] || !seats[0][0]) {
        console.warn(`Ride ${ride_id} not found in database`);
        return;
    }

    const seatCount = seats[0][0].seats;   

    
    //decrease seats if there are seats available
    if (seatCount >= 1) {
        await pool.query(`
        UPDATE Rides
        SET seats = seats - 1
        WHERE ride_id = ?
        `, [ride_id])
    }

    return;
}

//delete every ride that has 0 seats left
module.exports.deleteFullRides = async function(){
    await pool.query(`
        DELETE FROM Rides
        WHERE seats <= 0
    `);
}

//get the user's favorite locations name 
module.exports.getFavoriteLocations = async function(user_id) {
    const [rows] = await pool.query(`
        SELECT l.location_id, l.name
        FROM FavoriteLocations fl
        JOIN Locations l ON fl.location_id = l.location_id
        WHERE fl.user_id = ?
    `, [user_id]);
    return rows;
}

//get the name of a location by its id
module.exports.getLocationName = async function(location_id) {
    const [rows] = await pool.query(`
        SELECT name FROM Locations WHERE location_id = ?
    `, [location_id]);
    if (rows.length === 0) {
        throw new Error(`Location with id ${location_id} not found`);
    }
    return rows[0].name;
}

//get all the users that a user wants to avoid
module.exports.getAvoidUsers = async function(user_id) {
    const [rows] = await pool.query(`
        SELECT avoid_user_id
        FROM AvoidUsers
        WHERE main_user_id = ?
    `, [user_id]);
    return rows.map(row => row.avoid_user_id);
}