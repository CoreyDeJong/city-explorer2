'use strict'

const superagent = require('superagent')

function handleMovies (request, response) {
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
    });
};

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

module.exports = handleMovies;