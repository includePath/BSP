# Carpool System for Students of the University of Luxembourg developed  by Laetitia Richard for BSP S5

## Project Structure

Project/
├── Algorithm/
│   ├── simulatedAnnealing.js          # Main matching algorithm
│   ├── generateInitialRoute.js        # Generates initial route assignments
│   ├── generateNewRoute.js            # Generates new route variations
│   ├── helperFunctions.js             # Cost calculation & utilities
│   └── commitAssignments.js           # Commits assignments to database
├── Database/
│   ├── sql_functions.js               # Database table creation & queries
│   ├── sql_functions_algorithm.js     # Algorithm-specific database functions
│   ├── sql_connections.js             # Database connection setup
│   ├── sql_pools.js                   # Connection pooling
│   └── populate_database.js           # Initial data population
├── Testing/
│   ├── locations_scallings.js         # Tests the ammount of locs supported by the alg
└── UI/
    └── src/
        ├── App.js                     # Main React component
        └── content/
            ├── Login.js               # User authentication page
            ├── Driver.js              # Driver ride creation page
            ├── Passenger.js           # Passenger request page
            └── Rides.js               # Ride assignment display page


## Start the app
>>start backend server:
    cd Database
    node Database/populate_database.js     # Optional: resets and populates the database
    node Database/sql_connections.js       # Starts the Express backend on port 8080
      

>>start carpool UI:
    cd UI
    npm install                   # Only needed the first time
    npm start                     # Launches the UI on http://localhost:3000


>>start OSRM server:
cd ~/osrm
osrm-routed --algorithm mld merged-europe.osrm

http://localhost:5000