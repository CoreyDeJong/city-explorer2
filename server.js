'use strict';

require('dotenv').config();
const express = require('express');
const app = express();

const cors = require('cors');
app.use(cors());

const PORT = process.env.PORT || 3001;

let superagent = require('superagent');

//pg is the library that connects the server to the database
const pg = require('pg');


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
    
    // check database if city exists, if exists, pull data from database, if not pull data using superagent from api

    // superagent to get data

    let sql = 'INSERT INTO city_explorer_table (city_name) VALUES ($1);';
    let safeValues = [city];
    

    //put into database
    database.query(sql, safeValues)
});

app.get('/location', (request, response) => {
  
        let city = request.query.city;
        //   console.log('city Info', request)
        let url = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEO_API_KEY}&q=${city}&format=json&limit=1`;
        // console.log(url)
        //   let geo = require('./data/geo.json');
        // let location = new Location(url, city)
        
        superagent.get(url).then(superagentResults => {
            // console.log(superagentResults.body[0])
                let destination = new Location(superagentResults.body[0], city);
                // console.log('this is my destination!!!!', destination);
                response.send(destination);
                
                //500 error is the server has an issue
        }).catch(err => response.status(500).send(err))    
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

//code helped with Alex P.
app.get('/weather', (request, response) => {
    let locationObject = request.query;
    console.log('corey locationObject', locationObject);
    let url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${locationObject.latitude},${locationObject.longitude}`;
    console.log('corey latitude', url)
    
        superagent.get(url).then(results => {
        let weatherArray = results.body.daily.data;
        let weatherMap = weatherArray.map(day => new Weather (day));
        //200 is good
        response.status(200).send(weatherMap);
    })

});


function Weather(obj){
this.time = new Date(obj.time*1000).toDateString();
this.forecast = obj.summary;
}



app.get('/trails', (request, response)=> {
    let trailObject = request.query;
    console.log('coreys trail object', trailObject)
    let url = `https://www.hikingproject.com/data/get-trails?lat=${trailObject.latitude}&lon=${trailObject.longitude}&maxDistance=10&key=${process.env.TRAIL_API_KEY}`;
    console.log('coreys trail api is....', url);


    superagent.get(url).then(results => {
        let hikingArray = results.body.trails;
        console.log('coreys hikingArray is ...', hikingArray);
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


//404 error is no page is found
app.get('*', (request, response) => response.status(404).send('Sorry, chuck norris says that route does not exist.'));

