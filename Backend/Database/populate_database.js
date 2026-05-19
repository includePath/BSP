//node Database/populate_database.js
const {
    createDatabase, 
    deleteDatabase, 
    createUser, 
    createDriver, 
    createPassenger, 
    createRide,
    createRequest,
    createLocation,
    getLocationID
} = require("./sql_functions.js");
const { pool, setup } = require("./sql_pools.js");

// --HELPER FUNCTIONS-- //

//generate a random password
function generatePassword(length=12) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        password += characters[randomIndex];
    }
    return password;
}

//random boolean
function randomBoolean(){
    return Math.random() < 0.5;
}

//random locations
const locations = ["Luxembourg City, Luxembourg", "Thionville, France", "Audun Le Tiche, France", "Wasserbillig, Luxembourg", "Trier, Germany",
                    "Esch-sur-Alzette, Luxembourg", "Dudelange, Luxembourg", "Bettembourg, Luxembourg", "Metz, France", "Differdange, Luxembourg",
                    "Clervaux, Luxembourg", "Diekirch, Luxembourg", "Ettelbruck, Luxembourg", "Wiltz, Luxembourg", "Redange, Luxembourg",
                    "Vianden, Luxembourg","Remich, Luxembourg", "Grevenmacher, Luxembourg", "Mondorf-les-Bains, Luxembourg", "Larochette, Luxembourg",
                    "Mersch, Luxembourg","Capellen, Luxembourg", "Steinsel, Luxembourg", "Bertrange, Luxembourg", "Strassen, Luxembourg",
                    "Hesperange, Luxembourg","Sanem, Luxembourg", "Kayl, Luxembourg", "Roeser, Luxembourg", "Schifflange, Luxembourg",
                    "Petange, Luxembourg", "Rumelange, Luxembourg", "Villerupt, France", "Audun-le-Roman, France", "Volmerange-les-Mines, France",
                    "Rodange, Luxembourg", "Differdange, Luxembourg", "Dudelange, Luxembourg", "Esch-sur-Alzette, Luxembourg", "Bettembourg, Luxembourg",
                    "Thionville, France", "Yutz, France", "Terville, France", "Hettange-Grande, France", "Basse-Ham, France",
                    "Moyeuvre-Grande, France", "Sémécourt, France", "Metz, France", "Woippy, France", "Marange-Silvange, France",
                    "Amneville, France", "Rombas, France", "Fameck, France", "Talange, France", "Hayange, France",
                    "Seremange-Erzange", "Uckange", "Nilvange", "Florange", "Tressange"
                    ];

function randomLocation(selectedLocations=locations){
    return selectedLocations[Math.floor(Math.random() * selectedLocations.length)];
}

//random time
function randomTime(){
    const hour = Math.floor(Math.random() * 24);
    const minute = Math.floor(Math.random() * 60);
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

// --DELETE DATABASE-- //

async function clearDatabase(){
    //clear the database
    await deleteDatabase();
}

// --POPULATE DATABASE-- //

async function populateDatabase(numUsers = 100, numLocations = 5, closeConnection = false){

    //create the database
    await createDatabase();

    //only take the first numLocations locations
    const selectedLocations = [...new Set(locations)].slice(0, numLocations);


    //populate locations table
    for (const loc of selectedLocations) {
        await createLocation(loc);
    }
    //also add University of Luxembourg as a location
    await createLocation("University of Luxembourg");

    //create an admin 
    await createUser("admin", "admin");

    //create a mock user for manual testing
    await createUser("test", "test");
    await createPassenger("test");
    await createDriver("test");
    const start_loc_id = await getLocationID(randomLocation(selectedLocations));
    const end_loc_id = await getLocationID(randomLocation(selectedLocations));
    await createRequest("test", start_loc_id, end_loc_id, randomTime(), randomBoolean());
    await createRide("test", 3, start_loc_id, end_loc_id, randomTime(), randomBoolean());

    //create users
    for(let i = 1; i <= numUsers; i++){
        const user_id = `user${i}`;
        const pass = generatePassword();
        await createUser(user_id, pass);

        //60% driver and 40% passenger
        const isDriver = i <= numUsers / 10 * 6;

        //get the id of the locations
        const start_loc_id = await getLocationID(randomLocation(selectedLocations));
        const end_loc_id = await getLocationID(randomLocation(selectedLocations));
        const uni_id = await getLocationID("University of Luxembourg");

        if(isDriver){
            //create driver
            const seats = Math.floor(Math.random() * 4) + 1;
            await createDriver(user_id);

            //create 1-3 rides for the driver
            const numRides = Math.floor(Math.random() * 3) + 1;

            for(let j = 1; j <= numRides; j++){
                const direction = randomBoolean();
                const start_loc = direction ? start_loc_id : uni_id;
                const end_loc = direction ? uni_id : end_loc_id;
                const ride_time = randomTime();
                const needs = randomBoolean(); 
                await createRide(user_id, seats, start_loc, end_loc, ride_time, needs);
            }

        } else {
            //create passenger
            await createPassenger(user_id);

            //create 1-3 requests for the passenger
            const numRequests = Math.floor(Math.random() * 3) + 1;
            for(let j = 1; j <= numRequests; j++){
                const direction = randomBoolean();
                const start_loc = direction ? start_loc_id : uni_id;
                const end_loc = direction ? uni_id : end_loc_id;
                const ride_time = randomTime();
                const needs = randomBoolean();
                await createRequest(user_id, start_loc, end_loc, ride_time, needs);
            }
        }
    }
    console.log("Database population complete");
    
    //close connections if requested
    if (closeConnection) {
        await setup.end();
        await pool.end();
    }
}

async function main(){
    const numUsers = parseInt(process.argv[2]) || 100;
    await populateDatabase(numUsers, 5, true);  // true to close connections when run from CLI
}

if (require.main === module) {
    main();
}

module.exports = { populateDatabase, clearDatabase };