// node Testing/locations_distances.js
const axios = require("axios")

//converts a text location to coordinates using Nominatim 
const coorCache = {};
async function getGeocode(location) {
    //check if location is undefined or empty
    if (!location) {
        console.error("Invalid location for geocoding", location);
        return null;
    }

    //sanitize the location string for URL encoding
    location = location.trim()
            .replace(/\s+/g, " ")     // collapse multiple spaces
            .replace(/[^\w\s,.-]/g, "") // remove weird characters
            .toLowerCase();

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
        const response = await axios.get(url);
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
//random locations
const locations = ["Belval, Luxembourg", "Walferdange, Luxembourg"];

async function main() {
    const coord1 = await getGeocode(locations[0]);
    const coord2 = await getGeocode(locations[1]);
    console.log(`Coordinates for ${locations[0]}:`, coord1);
    console.log(`Coordinates for ${locations[1]}:`, coord2);
    const distance = await getDistance(coord1, coord2);
    console.log(`Distance between ${locations[0]} and ${locations[1]}:`, distance, "km");
} 

if (require.main === module) {
    main();
}