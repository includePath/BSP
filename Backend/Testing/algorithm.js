// node Testing/algorithm.js
const { populateDatabase } = require("../Database/populate_database.js");
const simulatedAnnealing = require("../Algorithm/simulatedAnnealing.js");
const commitAssignments = require("../Algorithm/commitAssignments.js");
const { pool, setup } = require("../Database/sql_pools.js");

//run the algorithm and print the result
async function test() {
    //await populateDatabase(5,1); 
    //get the test user's request
    const testRequest = await pool.query("SELECT * FROM requests WHERE passenger_id = 'test' LIMIT 1");
    console.log("Test user request:", testRequest[0]);
    //run the algorithm with the test passenger
    const state = await simulatedAnnealing(pool);
    await commitAssignments(state);
    const result = await pool.query(`
        SELECT Rides.*
        FROM PassengerRides
        JOIN Rides ON PassengerRides.ride_id = Rides.ride_id
        WHERE PassengerRides.passenger_id = ?
    `, ['test']);

    //output the ride assigned to the test passenger
    console.log("Ride assigned to test passenger:", result[0][0]);
}

if (require.main === module) {
    test();
    
}
