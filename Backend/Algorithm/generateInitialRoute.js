async function generateInitialRoute (pool) {

    //load all drivers + their requests
    const [passengers] = await pool.query(`
        SELECT p.passenger_id, r.start_loc, r.end_loc, r.ride_time, r.needs
        FROM Passengers p
        INNER JOIN Requests r ON r.passenger_id = p.passenger_id; 
    `,);
    if (passengers.length === 0) {
        throw new Error("No passengers found");
    }

    //load all drivers + their rides 
    const [drivers] = await pool.query(`
        SELECT d.driver_id, r.ride_id, r.seats, r.start_loc, r.end_loc, r.ride_time, r.needs
        FROM Drivers d
        INNER JOIN Rides r ON r.driver_id = d.driver_id;
    `,);
    if (drivers.length === 0) {
        throw new Error("No drivers found");
    }

    //create a map of rides for easy access
    const rideMap = new Map(); 
    for (const ride of drivers) {
        rideMap.set(ride.ride_id, {
            ride_id: ride.ride_id,
            driver_id: ride.driver_id,
            seats: ride.seats, 
            start_loc: ride.start_loc,
            end_loc: ride.end_loc,
            ride_time: ride.ride_time,
            needs: ride.needs,
            passengers: []
        });
    }

    //assign to each passenger a random ride with available seats
    for (const passenger of passengers) {
        //shuffle rides to ensure randomness
        const shuffledRides = Array.from(rideMap.values()).sort(() => Math.random() - 0.5);
        let assignedRide = null;

        //find a ride with available seats
        for (const ride of shuffledRides) {
            if (ride.passengers.length < ride.seats) {
                assignedRide = ride;
                ride.passengers.push(passenger.passenger_id);
                passenger.assignedRide = ride.ride_id;
                break;
            }
        }

        //record the assigned ride
        if (!assignedRide) { 
            passenger.assignedRide = null;
        }

    }

    //return the state
    let state = {
        passengers, //passenger_id, start_loc, end_loc, ride_time, needs, assignedRide
        rides: rideMap, //array of all rides with passenger assignments
    } 
        
    return state;
}

module.exports = generateInitialRoute;

//test -> node generateInitialRoute.js
async function test() {

    const { pool } = require("../Database/sql_pools.js");

    const S = await generateInitialRoute(pool);

    console.log(S.passengers);
    console.log(S.rides);
}

//test();