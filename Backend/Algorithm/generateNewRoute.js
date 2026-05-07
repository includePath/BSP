async function generateNewRoute (S) {

    //copy the state to avoid mutating the original
    const passengers = S.passengers.map(p => ({ ...p }));
    const rides = new Map();
    for (const [rideId, ride] of S.rides.entries()) {
        rides.set(rideId, {
            ride_id: ride.ride_id,
            driver_id: ride.driver_id,
            seats: ride.seats,
            start_loc: ride.start_loc,
            end_loc: ride.end_loc,
            ride_time: ride.ride_time,
            needs: ride.needs,
            passengers: [...ride.passengers]
        });
    }   
    
    //50% chance to swap or move
    const doSwap = Math.random() < 0.5;
    
    //pick random passenger to move
    const p1 = passengers[Math.floor(Math.random() * passengers.length)];
    
    //get the passenger's current ride
    const r1 = p1.assignedRide;
    if (!r1) return { passengers, rides };
    const ride1 = rides.get(r1);
    if (!ride1) return { passengers, rides };


    // --SWAP-- //

    //if moving 2 passengers, pick a second one from another ride
    let p2 = null;
    if (doSwap) {
        const otherPassengers = passengers.filter(p => p.passenger_id !== p1.passenger_id && p.assignedRide !== r1);    
        if (otherPassengers.length === 0) return { passengers, rides };
        
        p2 = otherPassengers[Math.floor(Math.random() * otherPassengers.length)];
        
        //get the second passenger's current ride
        const r2 = p2.assignedRide;
        if (!r2) return { passengers, rides };
        const ride2 = rides.get(r2);
        if (!ride2) return { passengers, rides };
        
        //perform the swap
        ride1.passengers = ride1.passengers.filter(pid => pid !== p1.passenger_id);
        ride2.passengers = ride2.passengers.filter(pid => pid !== p2.passenger_id);
        
        ride1.passengers.push(p2.passenger_id);
        ride2.passengers.push(p1.passenger_id);

        p1.assignedRide = r2;
        p2.assignedRide = r1;

        //return the new state
        const newState = {
            passengers,
            rides,
        };
        return newState;
    } 

    // --MOVE-- //

    //pick a random destination ride (must be different from current)
    const allRideIds = Array.from(rides.keys());
    let r2 = allRideIds[Math.floor(Math.random() * allRideIds.length)];
    while (r2 === r1) {
        r2 = allRideIds[Math.floor(Math.random() * allRideIds.length)];
    }

    const ride2 = rides.get(r2);
    if (!ride2) return { passengers, rides };

    //check if destination ride has capacity for passenger
    if (ride2.passengers.length >= ride2.seats) return { passengers, rides };

    //remove p1 from old ride
    ride1.passengers = ride1.passengers.filter(pid => pid !== p1.passenger_id);
    
    //add p1 to new ride
    ride2.passengers.push(p1.passenger_id);
    
    p1.assignedRide = r2;

    //return the new state
    const newState = {
        passengers,
        rides,
    };
    return newState;
}

module.exports = generateNewRoute;

//test -> node generateNewRoute.js
async function test() {

    const { pool } = require("C:/Users/laeti/Documents/BICS/S5/BSP-S5/Project/Database/sql_pools.js");
    const generateInitialRoute = require("./generateInitialRoute.js");

    const S = await generateInitialRoute(pool);
    console.log(S.rides);

    const newS = await generateNewRoute(S);
    console.log(newS.rides);
}

//test();