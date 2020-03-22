'use strict';
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
const PORT = process.env.PORT || 3001;

//pg is the library that connects the server to the database
const pg = require('pg');

const superagent = require('superagent');

// server set-up
// database is a connection object to our postgress instance

//libraries
const handleWeather = require('./library/weather.js');
app.get('/weather', handleWeather);

const handleTrails = require('./library/trails.js');
app.get('/trails', handleTrails);

const handleMovies = require('./library/movies.js');
app.get('/movies', handleMovies);

const handleYelp = require('./library/yelp.js');
app.get('/yelp', handleYelp);


const database = new pg.Client(process.env.DATABASE_URL);
database.on('error', err => console.error(err));


app.get('/location', (request, response) => {
    
    let city = request.query.city;
      console.log('city Info', city)
        
    let sql = 'SELECT * FROM city_explorer_table WHERE search_query=$1;';
    let safeValues = [city];
    database.query(sql, safeValues)
        .then(results => {
        //this will get the rows of cities that are in the database
        // console.log(results);
        if(results.rows.length > 0){
            //send the response of the first index of the row, which is just the city name.
            console.log('database test')
            response.send(results.rows[0])
        } else {
                let url = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEO_API_KEY}&q=${city}&format=json&limit=1`;
                console.log('testing else stmt', url)
                // superagent to get data
                    superagent.get(url).then(superagentResults => {
                        console.log(superagentResults.body[0])
                            let destination = new Location(superagentResults.body[0], city);
                            // console.log('this is my destination!!!!', destination);
                            response.status(200).send(destination);
                            
                            //500 error is the server has an issue
                            let sql = 'INSERT INTO city_explorer_table (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4) returning id;';
                            let safeValues = [city, destination.formatted_query, destination.latitude, destination.longitude];
                            //put into database
                            database.query(sql, safeValues)
                    }) .catch(err => response.status(500).send(err))    
                }
        })            
 });

//bringing in the obj from the api/data files and the city from the user
function Location (obj, city){
    this.search_query = city;
    this.formatted_query = obj.display_name;
    this.latitude = obj.lat;
    this.longitude = obj.lon;
}


//404 error is no page is found
app.get('*', (request, response) => response.status(404).send('Sorry, chuck norris says that route does not exist.'));

// only turn on the server if you first connect to the database
database.connect()
    .then(() => {
        app.listen(PORT,() => console.log(`Listening on port ${PORT}`));
    });
