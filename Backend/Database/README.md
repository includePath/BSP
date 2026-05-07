# password for database
-> C4rpu!Pro+ec7

# sql_pools.js
Exports the MySQL connection pools used by the backend.  

# sql_functions.js
Contains all general SQL helper functions used to interact with the database, including:
- creating users, passengers, drivers, rides, and requests  
- retrieving data  
- updating ride information  

# sql_functions_algorithm.js
Provides SQL functions required specifically by the matching algorithm, such as:
- retrieving active passengers and rides  
- updating seat availability  
- inserting final passenger–ride assignments  
- removing rides that become full  

# sql_connections.js
Defines the Express server and exposes the API endpoints.  
Each endpoint calls the functions in `sql_functions.js` or `sql_functions_algorithm.js` to handle:
- authentication  
- passenger and driver submissions  
- location and distance validation  
- triggering the matching algorithm  
- returning assigned rides  

# populate_database.js
Initialises the database with sample data.  
Creates 100 users named `user{number}` with random passwords and inserts them into the `Users` table.