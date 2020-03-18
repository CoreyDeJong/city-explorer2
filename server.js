'use strict';

require('dotenv').config();
const express = require('express');
const app = express();

const cors = require('cors');
app.use(cors());

const PORT = process.env.PORT || 3001;

let superagent = require('superagent');





app.get('/location', (request, response) => {
  
        let city = request.query.city;
        //   console.log('city Info', request)
        let url = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEO_API_KEY}&q=${city}&format=json&limit=1`;
        console.log(url)
        //   let geo = require('./data/geo.json');
        // let location = new Location(url, city)
        
        superagent.get(url).then(superagentResults => {
            console.log(superagentResults.body[0])
                let destination = new Location(superagentResults.body[0], city);
                console.log('this is my destination!!!!', destination);
                response.send(destination);
                
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

    let banana = require('./data/darksky.json');
    const forecastArr = banana.daily.data.map(day => {
        return new Weather(day);
    });


       // day.daily.data.forEach(forecast => {
    //     weather.push(new Weather(forecast));
    // });
    response.status(200).json(forecastArr);
    console.log('Weather corey', response)
});


function Weather(obj){
this.time = new Date(obj.time*1000).toDateString();
this.forecast = obj.summary;
}

  
//weather response
// [
//     {
//       "forecast": "Partly cloudy until afternoon.",
//       "time": "Mon Jan 01 2001"
//     },
//     {
//       "forecast": "Mostly cloudy in the morning.",
//       "time": "Tue Jan 02 2001"
//     },
//     ...
//   ]



app.get('*', (request, response) => response.send('Sorry, that route does not exist.'));

app.listen(PORT,() => console.log(`Listening on port ${PORT}`));