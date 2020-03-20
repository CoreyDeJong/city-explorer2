'use strict';


const superagent = require('superagent');

//code helped with Alex P.
function handleWeather (request, response) {
    let locationObject = request.query;
    // console.log('corey locationObject', locationObject);

    let url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${locationObject.latitude},${locationObject.longitude}`;
    // console.log('corey latitude', url)
    
        superagent.get(url).then(results => {
        let weatherArray = results.body.daily.data;
        let weatherMap = weatherArray.map(day => new Weather (day));
        //200 is good
        response.status(200).send(weatherMap);
    })

};


function Weather(obj){
this.time = new Date(obj.time*1000).toDateString();
this.forecast = obj.summary;
}


module.exports = handleWeather;