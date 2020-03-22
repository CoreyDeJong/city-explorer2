'use strict'

const superagent = require('superagent')


function handleTrails (request, response) {
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
};

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

  module.exports = handleTrails;