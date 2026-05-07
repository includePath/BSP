// node Testing/locations_scalling.js
const { populateDatabase } = require("../Database/populate_database.js");
const simulatedAnnealing = require("../Algorithm/simulatedAnnealing.js");
const { pool, setup } = require("../Database/sql_pools.js");

const TEST_SIZES = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];

async function testScaling() {
    console.log("Testing scalability with increasing number of users and locations...");

    for (const size of TEST_SIZES) {
        console.log(`Testing with ${size} users...`);
        await populateDatabase(100, size); //populate the database with 100 users and size locations
        console.log("Database populated");
        const startTime = Date.now();
        await simulatedAnnealing(pool);
        const endTime = Date.now();
        console.log(`Time taken for ${size} users: ${(endTime - startTime) / 1000} seconds`);
        //wait between each test to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

}

async function main() {
    await testScaling();
    await setup.end();  
    await pool.end();
}

main();