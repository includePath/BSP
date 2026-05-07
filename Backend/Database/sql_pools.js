const mysql = require('mysql2');

// --POOL SETUP-- //

//pool to create the database
const setup = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'C4rpu!Pro+ec7'
}).promise();


//pool for queries
const pool = mysql.createPool({
    host: 'localhost',        
    user: 'root',            
    password: 'C4rpu!Pro+ec7', 
    database: 'carpool'       
}).promise();


// --EXPORT POOL-- //
module.exports.setup = setup;
module.exports.pool = pool;