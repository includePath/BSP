const axios = require("axios");

//node Testing/test.js
const locations = ["Luxembourg City", "Thionville", "Audun Le Tiche", "Wasserbillig", "Trier",
                    "Esch-sur-Alzette", "Dudelange", "Bettembourg", "Metz", "Differdange",
                    "Clervaux", "Diekirch", "Ettelbruck", "Wiltz", "Redange", 
                    "Vianden","Remich", "Grevenmacher", "Mondorf-les-Bains", "Larochette", 
                    "Mersch","Capellen", "Steinsel", "Bertrange", "Strassen", 
                    "Hesperange","Sanem", "Kayl", "Roeser", "Schifflange",
                    "Pétange", "Rumelange", "Villerupt", "Audun-le-Roman", "Volmerange-les-Mines",
                    "Rodange", "Differdange", "Dudelange", "Esch-sur-Alzette", "Bettembourg",
                    "Thionville", "Yutz", "Terville", "Hettange-Grande", "Basse-Ham",
                    "Moyeuvre-Grande", "Sémécourt", "Metz", "Woippy", "Marange-Silvange",
                    "Amnéville", "Rombas", "Fameck", "Talange", "Hayange",
                    "Serémange-Erzange", "Uckange", "Nilvange", "Florange", "Tressange"
                    ];
                
const length = locations.length;

// --NORMALIZATION-- //
function normalizeLocation(location) {
    //replace é by e 
    location = location.replace(/é/g, "e");
    return location.trim()
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

async function test() {
    for (const location of locations) {
        const coor = await getGeocode(location);
        console.log(`${location}: ${coor ? `lat=${coor.lat}, lon=${coor.lon}` : "No coordinates found"}`);
        await new Promise(resolve => setTimeout(resolve, 1000)); //delay to avoid hitting API rate limits
    }
}

if (require.main === module) {
    console.log(length);
    test();
}