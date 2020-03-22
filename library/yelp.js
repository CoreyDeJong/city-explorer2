'use strict'

const superagent = require('superagent')

function handleYelp (request,response) {
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
}

function Yelp (obj){
    this.name = obj.name;
    this.image_url = obj.image_url;
    this.price = obj.price;
    this.rating = obj.rating;
    this.url = obj.url;
}

module.exports = handleYelp;