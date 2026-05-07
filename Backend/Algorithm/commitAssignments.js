const { createPassengerRide, decreaseSeats, deleteFullRides } = require("../Database/sql_functions_algorithm.js");

async function commitAssignments(S) {
    for (const passenger of S.passengers) {
        const ride_id = passenger.assignedRide;
        if (ride_id) {
            try {
                await createPassengerRide( ride_id, passenger.passenger_id);
                await decreaseSeats( ride_id );
            } catch (err) {
                console.error(
                    `Failed to assign passenger ${passenger.passenger_id} to ride ${ride_id}:`,
                    err.message
                );
                // optionally continue to next passenger without throwing
                continue;
            }
        }
    }
    await deleteFullRides();
    console.log("Assignments committed to PassengerRides table");
}

module.exports = commitAssignments;
