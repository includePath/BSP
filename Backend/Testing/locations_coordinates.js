// node Testing/locations_coordinates.js
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

//random locations
const locations = ["Luxembourg City", "Thionville", "Audun Le Tiche", "Wasserbillig", "Trier",
                    "Esch-sur-Alzette", "Dudelange", "Bettembourg", "Metz", "Differdange",
                    "Clervaux", "Diekirch", "Ettelbruck", "Wiltz", "Redange", 
                    "Vianden","Remich", "Grevenmacher", "Mondorf-les-Bains", "Larochette", 
                    "Mersch","Capellen", "Steinsel", "Bertrange", "Strassen", 
                    "Hesperange","Sanem", "Kayl", "Roeser", "Schifflange"];

async function main() {
    for (const location of locations) {
        const coor = await getGeocode(location);
        console.log(`${location}: ${coor ? `lat=${coor.lat}, lon=${coor.lon}` : "No coordinates found"}`);
        await new Promise(resolve => setTimeout(resolve, 1000)); //delay to avoid hitting API rate limits
    }
} 

if (require.main === module) {
    main();
}