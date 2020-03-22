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

//libraries
const handleWeather = require('./library/weather.js')
app.get('/weather', handleWeather);




// server set-up
// database is a connection object to our postgress instance
const database = new pg.Client(process.env.DATABASE_URL);
database.on('error', err => console.error(err));

// only turn on the server if you first connect to the database
database.connect()
    .then(() => {
        app.listen(PORT,() => console.log(`Listening on port ${PORT}`));
    });



app.get('/location', (request, response) => {
    
    let city = request.query.city;
    //   console.log('city Info', city)
        
    let sql = 'SELECT * FROM city_explorer_table WHERE search_query=$1;';
    let safeValues = [city];
    database.query(sql, safeValues)
        .then(results => {
        //this will get the rows of cities that are in the database
        // console.log(results.rows);
        if(results.rows.length > 0){
            //send the response of the first index of the row, which is just the city name.
            response.send(results.rows[0])
        } else {
                let url = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEO_API_KEY}&q=${city}&format=json&limit=1`;
        
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
 })

//bringing in the obj from the api/data files and the city from the user
function Location (obj, city){
    this.search_query = city;
    this.formatted_query = obj.display_name;
    this.latitude = obj.lat;
    this.longitude = obj.lon;
}
    //response needed to send to front-end
    // {
    //     "search_query": "seattle",
    //     "formatted_query": "Seattle, WA, USA",
    //     "latitude": "47.606210",
    //     "longitude": "-122.332071"
    //   }





app.get('/trails', (request, response)=> {
    let trailObject = request.query;
    // console.log('coreys trail object', trailObject)
    let url = `https://www.hikingproject.com/data/get-trails?lat=${trailObject.latitude}&lon=${trailObject.longitude}&maxDistance=10&key=${process.env.TRAIL_API_KEY}`;
    // console.log('coreys trail api is....', url);


    superagent.get(url).then(results => {
        let hikingArray = results.body.trails;
        // console.log('coreys hikingArray is ...', hikingArray);
        let hikingResponse = hikingArray.map(trail => new Hiking (trail));
        response.status(200).send(hikingResponse);
    })
});

function Hiking(obj){
    this.name = obj.name;
    this.location = obj.location;
    this.length = obj.length;
    this.stars = obj.stars;
    this.star_votes = obj.starVotes;
    this.summary = obj.summary;
    this.trail_url = obj.url;
    this.conditions = obj.conditionStatus;
    this.condition_date = obj.conditionDate.slice(0,10);
    this.condition_time = obj.conditionDate.slice(11,19);
  };

app.get('/movies', (request, response) => {
    let city = request.query.search_query;
    // console.log('movie request city', city);

    let url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIE_API_KEY}&language=en-US&query=${city}&page=1&include_adult=false&total_results=20`;
    // console.log(url);

    superagent.get(url).then(superAgentResults => {
        // console.log (superAgentResults.body.results)
        let movies = superAgentResults.body.results.map(films =>{
            return new Movies(films);
        })
        response.status(200).send(movies)
    })
})

function Movies(obj){
    this.title = obj.title;
    this.overview = obj.overview;
    this.average_votes = obj.vote_average;
    this.total_votes = obj.vote_count;
    this.image_url = 'https://image.tmdb.org/t/p/w500'.concat(obj.poster_path);
    this.popularity = obj.popularity;
    this.released_on =obj.release_date;
    // console.log("movie image", this.image_url);
}


app.get('/yelp', (request,response) => {
    let city = request.query.search_query
    // console.log('yelp city', city)
    let url = `https://api.yelp.com/v3/businesses/search?location=${city}`;
    
    superagent.get(url)
    //.set with create a header
    .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
    .then(data => {
        // console.log('yeld data.body', data.body);
            let yelpResults = data.body.businesses.map(values => {
                return new Yelp (values);
            });

            response.status(200).send(yelpResults);
        })
})

function Yelp (obj){
    this.name = obj.name;
    this.image_url = obj.image_url;
    this.price = obj.price;
    this.rating = obj.rating;
    this.url = obj.url;
}


//404 error is no page is found
app.get('*', (request, response) => response.status(404).send('Sorry, chuck norris says that route does not exist.'));

