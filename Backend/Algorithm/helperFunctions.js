//used to make url requests
const axios = require("axios")
const { getFavoriteLocations, getAvoidUsers } = require("../Database/sql_functions_algorithm.js");

// --HELPER FUNCTIONS-- //

// --AXIOS INSTANCE-- //
const http = require("http");
const https = require("https");

const axiosOSRM = axios.create({
    baseURL: "http://localhost:5000",
    timeout: 5000,
    httpAgent: new http.Agent({ keepAlive: true }),
    httpsAgent: new https.Agent({ keepAlive: true })
});


// --NORMALIZATION-- //
function normalizeLocation(location) {
    return location.trim()
            .replace(/é/g, "e") //replace é by e
            .replace(/\s+/g, " ")     // collapse multiple spaces
            .replace(/[^\w\s,.-]/g, "") // remove weird characters
            .toLowerCase();
}

// --TIME CONVERSION-- //

//converts a string in the format HH:MM:SS to seconds
function stringToTime(ride_time) {
    if (!ride_time || typeof ride_time !== 'string') {
        console.warn("Invalid ride_time format:", ride_time);
        return 0;
    }
    const parts = ride_time.split(":").map(Number);
    if (parts.length !== 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
        console.warn("Invalid ride_time format:", ride_time);
        return 0;
    }
    const [hours, minutes, seconds] = parts;
    return (hours * 3600 + minutes * 60 + seconds);
}

// --GEOCODING-- //

//converts a text location to coordinates using Nominatim 
const coorCache = {};
async function getGeocode(location) {
    //check if location is undefined or empty
    if (!location) {
        console.error("Invalid location for geocoding", location);
        return null;
    }

    //sanitize the location string for URL encoding
    location = normalizeLocation(location);

    //check cache first before making an API call
    if (coorCache[location]) {
        return coorCache[location];
    }

    //create a request
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'CarpoolApp/1.0 (0232590719@uni.lu)'
            },
            timeout: 5000
        });
        const data = response.data[0];
        
        //trim the location and try again if no data is found (handles cases like "Luxembourg, Luxembourg")
        if (!data) {
            const trimmedLocation = location.split(",")[0].trim()
                .replace(/\s+/g, " ")
                .replace(/[^\w\s,.-]/g, "")
                .toLowerCase();

            if (trimmedLocation !== location) {
                return await getGeocode(trimmedLocation);
            }
            console.error("No geocode data found for location:", location);            
            return null;
        }
        const { lat, lon } = data;
        coorCache[location] = { lat: parseFloat(lat), lon: parseFloat(lon) }; //store in cache
        return { lat: parseFloat(lat), lon: parseFloat(lon) };
    }
    catch (error) {
        console.error("Error during geocoding:", error);
        return null;
    }
}

//check if a location is valid
async function isValidLocation(location) {
    const coord = await getGeocode(location);
    return coord !== null;
}

//preload all coordinates
async function preloadGeocodes(S) { 
    const locations = new Set(); 
    
    //gather all unique locations
    for (const passenger of S.passengers) {
        if (passenger.start_loc) locations.add(normalizeLocation(passenger.start_loc));
        if (passenger.end_loc) locations.add(normalizeLocation(passenger.end_loc));
    }
    for (const ride of S.rides.values()) {
        if (ride.start_loc) locations.add(normalizeLocation(ride.start_loc));
        if (ride.end_loc) locations.add(normalizeLocation(ride.end_loc));
    }

    //compute geocodes for all locations
    for (const loc of locations) { 
        //add a small delay to avoid overwhelming the API
        await getGeocode(loc); 
        await new Promise(resolve => setTimeout(resolve, 1000));
    } 
}

// --DISTANCE-- //

//fallback function to calculate distance using Haversine formula (in case OSRM fails)
function haversineDistance(coord1, coord2) {
    const R = 6371; // Earth radius in kilometers
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLon = (coord2.lon - coord1.lon) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *   
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
}

//get the distance between two coordinates using OSRM
const distCache = {};
async function getDistance(coord1, coord2) {
    //validate coordinates before making API call
    if (!coord1 || !coord2 || !coord1.lat || !coord1.lon || !coord2.lat || !coord2.lon) {
        console.error("Invalid coordinates for distance calculation:", coord1, coord2);
        return null;
    }

    //normalize the key to ensure consistency 
    const key = `${coord1.lat.toFixed(5)},${coord1.lon.toFixed(5)}-${coord2.lat.toFixed(5)},${coord2.lon.toFixed(5)}`;


    //check cache first before making an API call
    if (distCache[key] !== undefined) {
        return distCache[key];
    }

    
    //use local OSRM instance for distance calculation
    const url = `http://localhost:5000/route/v1/driving/${coord1.lon},${coord1.lat};${coord2.lon},${coord2.lat}?overview=false`;
    try {
        const response = await axiosOSRM.get(url);
        const data = response.data;
        if (!data.routes || data.routes.length === 0) {
            console.error("No route data found for coordinates:", coord1, coord2);
            return null;
        }
        let distance = data.routes[0].distance; // in meters
        distance *= 0.001; // convert to kilometers
        distCache[key] = distance; //store in cache
        return distance;
    }
    //if OSRM fails, fallback to Haversine distance
    catch (error) {
        console.warn("OSRM distance calculation failed, falling back to Haversine:", error);
        const distance = haversineDistance(coord1, coord2);
        distCache[key] = distance; //store in cache
        return distance;
    }
}

//check if the distance between two locations is valid
async function isValidDistance(loc1, loc2) {
    const coord1 = await getGeocode(loc1);
    const coord2 = await getGeocode(loc2);
    const distance = await getDistance(coord1, coord2);
    return distance !== null && distance <= 1000; //1000 km threshold
}

//precompute all the distances
async function preloadDistances(S) {
    const pairs = new Set();

    //retrieve all unique location pairs
    for (const passenger of S.passengers) {
        for (const ride of S.rides.values()) {
            pairs.add(`${passenger.start_loc}+${ride.start_loc}`);
            pairs.add(`${passenger.end_loc}+${ride.end_loc}`);
            pairs.add(`${passenger.start_loc}+${passenger.end_loc}`);
            pairs.add(`${ride.start_loc}+${ride.end_loc}`);
        }
    }

    //compute distances for all pairs
    for (const pair of pairs) {
        const [loc1, loc2] = pair.split("+");
        const coord1 = coorCache[normalizeLocation(loc1)];
        const coord2 = coorCache[normalizeLocation(loc2)];
        await getDistance(coord1, coord2);
    }
}

// -- COST FUNCTION-- //

async function cost (S) {
    //initialize the cost
    let cost = 0;

    //loop through all passengers
    for (const passenger of S.passengers) {

        // --SEATING AND NEEDS-- //

        //get the assigned ride ID
        const assignedRide = passenger.assignedRide;
        //the passenger is not assigned to a ride
        if (!assignedRide) {
            cost += 100000;
            continue;
        }

        //get the assigned ride
        const ride = S.rides.get(assignedRide);
        if (!ride) {
            cost += 100000;
            continue;
        }

        //passenger has needs but ride cant welcome them
        if (passenger.needs === 1 && ride.needs === 0) {
            cost += 100000; // arbitrary penalty
        }

        // --TIME--//

        const passengerTime = stringToTime(passenger.ride_time);
        const rideTime = stringToTime(ride.ride_time);

        cost += Math.floor(Math.abs(passengerTime - rideTime));

        // --DISTANCE-- //

        const passengerStart = coorCache[normalizeLocation(passenger.start_loc)];
        const passengerEnd = coorCache[normalizeLocation(passenger.end_loc)];
        const driverStart = coorCache[normalizeLocation(ride.start_loc)];
        const driverEnd = coorCache[normalizeLocation(ride.end_loc)];

        //check if all coordinates are valid    
        if (!passengerStart || !passengerEnd || !driverStart || !driverEnd) {
            cost += 100000;
            continue;
        }

        //users dont go in the same direction
        if (passenger.start_loc !== passenger.end_loc && ride.start_loc !== ride.end_loc) {
            cost += 100000; // arbitrary penalty
        }
        
        let distance = 0;
        //driver to passenger start
        const key1 = `${driverStart.lat.toFixed(5)},${driverStart.lon.toFixed(5)}-${passengerStart.lat.toFixed(5)},${passengerStart.lon.toFixed(5)}`; 
        const dist1 = distCache[key1] ?? 1000;
        //passenger start to passenger end
        const key2 = `${passengerStart.lat.toFixed(5)},${passengerStart.lon.toFixed(5)}-${passengerEnd.lat.toFixed(5)},${passengerEnd.lon.toFixed(5)}`;
        const dist2 = distCache[key2] ?? 1000;
        //passenger end to driver end
        const key3 = `${passengerEnd.lat.toFixed(5)},${passengerEnd.lon.toFixed(5)}-${driverEnd.lat.toFixed(5)},${driverEnd.lon.toFixed(5)}`;
        const dist3 = distCache[key3] ?? 1000;
        cost += (dist1 + dist2 + dist3)* 10; // weight the distance penalty (arbitrary factor)


        // --PREFERENCES-- //

        //favorite location bonus
        //load only once per passenger to save time
        if (!passenger.favoriteNamesLoaded) {
            const favs = await getFavoriteLocations(passenger.user_id);

            passenger.favoriteNames = new Set(
                favs.map(f => normalizeLocation(f.name))
            );

            passenger.favoriteNamesLoaded = true;
        }

        const favs = passenger.favoriteNames;

        const rideStart = normalizeLocation(ride.start_loc);
        const rideEnd   = normalizeLocation(ride.end_loc);

        if (favs.has(rideStart) || favs.has(rideEnd)) {
            cost = Math.max(0, cost - 500);
        }

        //avoid user penalty
        //load only once per passenger to save time
        if (!passenger.avoidUsersLoaded) {
            passenger.avoidUserIDs = new Set(await getAvoidUsers(passenger.user_id));
            passenger.avoidUsersLoaded = true;
        }

        if (passenger.avoidUserIDs.has(ride.driver_id)) {
            cost += 100000; // arbitrary penalty
        }

    } 

    return cost;
}

module.exports = {
    cost,
    isValidLocation,
    isValidDistance,
    getGeocode,
    preloadGeocodes,
    preloadDistances
};

//test -> node Algorithm/helperFunctions.js
async function test() {

    const { pool } = require("../Database/sql_pools.js");
    const generateInitialRoute = require("./generateInitialRoute.js");
    const generateNewRoute = require("./generateNewRoute.js");

    const S = await generateInitialRoute(pool);
    await preloadGeocodes(S);
    await preloadDistances(S);
    //console.log("Caches:", coorCache, distCache);
    console.log("Initial cost:", await cost(S));
    const S2 = await generateNewRoute(S);
    console.log("New cost:", await cost(S2));

}
//test();
