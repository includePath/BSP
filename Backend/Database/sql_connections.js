const { 
        checkUser,
        createDriver,
        createPassenger,
        createRide,
        createRequest,
        showRide,
        runAlgorithm,
        getLocations,
        createFavoriteLocations

} = require("./sql_functions.js");

const { isValidLocation, isValidDistance } = require('../Algorithm/helperFunctions.js');


const express = require('express');

const app = express();

const cors = require ("cors");
const corsOptions = {
    origin: ["http://localhost:3000"]
};

app.use(cors(corsOptions));
app.use(express.json());

// -- LOGIN PAGE-- //
app.post("/checkUser", async (req, res) => {
    const { user_id, pass} = req.body;
    const answer = await checkUser( user_id, pass);
    res.send(answer);
}); 

// -- DRIVER PAGE-- //
app.post("/createDriver", async (req, res) => {
    const { driver_id } = req.body;
    await createDriver( driver_id );
    res.status(201).send({ success: true, message: "Driver created successfully" });
}); 
app.post("/createRide", async (req, res) => {
    const { driver_id, seats, start_loc, end_loc, ride_time, needs } = req.body;
    await createRide( driver_id, seats, start_loc, end_loc, ride_time, needs );
    res.status(201).send({ success: true, message: "Ride created successfully" });
});


// -- PASSENGER PAGE-- //
app.post("/createPassenger", async (req, res) => {
    const { passenger_id } = req.body;
    await createPassenger( passenger_id );
    res.status(201).send({ success: true, message: "Passenger created successfully" });
});

app.post("/createRequest", async (req, res) => {
    const { passenger_id, start_loc, end_loc, ride_time, needs } = req.body;
    await createRequest( passenger_id, start_loc, end_loc, ride_time, needs );
    res.status(201).send({ success: true, message: "Request created successfully" });
});

// -- RIDES PAGE-- //
app.post("/showRide", async (req, res) => {
    const { passenger_id } = req.body;
    const state = await showRide( passenger_id );

    res.send(state);
});
app.post("/runAlgorithm", async (req, res) => {
    const result = await runAlgorithm();
    res.send(result);
});

// -- USER PAGE --//
app.get("/getLocations", async (req, res) => {
    const locations = await getLocations();
    res.json(locations);
});

app.post("/createFavoriteLocations", async (req, res) => {
    const { user_id, location_ids } = req.body;
    await createFavoriteLocations(user_id, location_ids);
    res.status(201).send({ success: true, message: "Favorite locations updated successfully" });    
});

// -- LOCATION VALIDATION FUNCTION -- //
app.post("/isValidLocation", async (req, res) => {
    const { location } = req.body;
    const valid = await isValidLocation(location);
    res.send({ valid });
});

// -- DISTANCE VALIDATION FUNCTION -- //
app.post("/isValidDistance", async (req, res) => {
    const { loc1, loc2 } = req.body;
    const valid = await isValidDistance(loc1, loc2);
    res.send({ valid });
});

app.listen(8080, () => {
    console.log("Server started on port 8080");
});