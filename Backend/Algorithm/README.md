# generateInitialRoute.js
-> generates initial feasible assignments for all passengers by randomly matching them to compatible drivers
INPUT: pool
OUTPUT: state S = {[passengers: {passenger_id, start_loc, end_loc, ride_time, needs, assignedRide}], [drivers: {driver_id, seats, ride_id, start_loc, end_loc, ride_time, needs, [passengers]}]}

# generateNewRoute.js
-> creates alternative assignments by randomly reassigning passengers to different compatible drivers
INPUT: state S
OUTPUT: state S_new with modified passenger-to-driver assignments

# helperFunctions.js
-> computes the cost of a state and provides utility functions
INPUT: state S
OUTPUT: cost C (lower = better assignments)

# simulatedAnnealing.js
-> iteratively optimizes assignments using simulated annealing technique to find the best matching
INPUT: pool, T (initial temperature), T_min (minimum temperature), alpha (cooling rate)
OUTPUT: optimized state S with best passenger-to-driver assignments

# commitAssignement.js
-> commits the optimized assignments to the PassengerRides table in the database
INPUT: optimized state S
OUTPUT: writes to database, returns success status
