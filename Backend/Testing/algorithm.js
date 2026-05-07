// node Testing/algorithm.js
const { populateDatabase } = require("../Database/populate_database.js");
const simulatedAnnealing = require("../Algorithm/simulatedAnnealing.js");
const commitAssignments = require("../Algorithm/commitAssignments.js");
const { pool, setup } = require("../Database/sql_pools.js");

//run the algorithm and print the result
async function test() {
    await populateDatabase(5,1); 
    //pick random request
    const randomRequest = await pool.query("SELECT * FROM requests ORDER BY RAND() LIMIT 1");
    console.log("Random request:", randomRequest[0]);
    //run the algorithm with the random passenger
    const state = await simulatedAnnealing(pool);
    await commitAssignments(state);
    const result = await pool.query(`
        SELECT Rides.*
        FROM PassengerRides
        JOIN Rides ON PassengerRides.ride_id = Rides.ride_id
        WHERE PassengerRides.passenger_id = ?
    `, [randomRequest[0][0].passenger_id]);

    //output the ride assigned to the random passenger
    console.log("Ride assigned to random passenger:", result[0][0]);
}

if (require.main === module) {
    test();
    
}
