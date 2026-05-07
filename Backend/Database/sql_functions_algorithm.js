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