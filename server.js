'use strict'


//LIBRARIES
const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
app.use(cors());
const superagent = require('superagent');
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.error(err));
const PORT = process.env.PORT || 3001;


// ERROR FUNCTION
const errorAlert = (err, response) => {
  response.status(500).send('Sorry, something went wrong');
  console.log('error', err);
}


/////////////////////////////////////GETS//////////////////////////////////////////
app.get('/location', locationHandler);
app.get('/weather', weatherHandler);
app.get('/trails', trailsHandler);
app.get('/movies', moviesHandler);
app.get('/yelp', yelpHandler);
/////////////////////////////////////LOCATION//////////////////////////////////////

function locationHandler(request, response) {
  let city = request.query.city;
  let url = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEO_DATA_API_KEY}&q=${city}&format=json`;
  let sqlQuery = 'SELECT * FROM locations WHERE search_query LIKE ($1);'
  let safeValue = [city];

  client.query(sqlQuery, safeValue)
    .then(sqlResults => {
      if (sqlResults.rowCount) {
        response.status(200).send(sqlResults.rows[0]);
      } else {
        superagent.get(url)
          .then(results => {
            let finalObj = new Location(city, results.body[0]);
            let sqlQuery = 'INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4);';
            let safeValue = [finalObj.search_query, finalObj.formatted_query, finalObj.latitude, finalObj.longitude];
            response.status(200).send(finalObj);
            client.query(sqlQuery, safeValue);
          }).catch(error => errorAlert(error, response));
      }
    }).catch(error => errorAlert(error, response));
}
///////////////////////////////////WEATHER///////////////////////////////////////

function weatherHandler(request, response) {
  let search_query = request.query.search_query;
  let url = 'https://api.weatherbit.io/v2.0/forecast/daily';

  const queryParams = {
    city: search_query,
    key: process.env.WEATHER_API_KEY,
    days: 8
  }

  superagent.get(url)
    .query(queryParams)
    .then(results => {
      let weatherResults = results.body.data.map(weatherResults => {
        let day = new Weather(weatherResults);
        return day;
      });
      response.status(200).send(weatherResults);
    }).catch(error => errorAlert(error, response));
}

//////////////////////////////////HIKES///////////////////////////////////////////

function trailsHandler(request, response) {
  let latitude = request.query.latitude;
  let longitude = request.query.longitude;
  let url = 'https://www.hikingproject.com/data/get-trails';

  const queryParams = {
    lat: latitude,
    lon: longitude,
    key: process.env.TRAIL_API_KEY
  }

  superagent.get(url)
    .query(queryParams)
    .then(results => {
      let hikeResults = results.body.trails.map(hiker => {
        let trail = new Hike(hiker);
        return trail;
      });
      response.status(200).send(hikeResults);
    }).catch(error => errorAlert(error, response));
}

////////////////////////////////Movies/////////////////////////////////////////

function moviesHandler(request, response) {
  let city = request.query.search_query;
  let url = 'https://api.themoviedb.org/3/search/movie';

  const queryParams = {
    api_key: process.env.MOVIE_API_KEY,
    query: city,
    limit: 20
  }

  superagent.get(url)
    .query(queryParams)
    .then(data => {
      // console.log('results from superagent', data.body.results);
      let moviesArray = data.body.results;
      let allMovies = moviesArray.map(oneMovie => new Movie(oneMovie));
      // console.log(allMovies);
      response.status(200).send(allMovies);
    }).catch(error => errorAlert(error, response));
}

///////////////////////////////YELP//////////////////////////////////////////

function yelpHandler(request, response) {
  let city = request.query.search_query;
  let url = 'https://api.yelp.com/v3/businesses/search';

  const queryParams = {
    location: city,
    term: 'food',
    limit: 5
  }

  superagent.get(url)
    .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
    .query(queryParams)
    .then(data => {
      let foodData = data.body.businesses;
      let allRestuarants = foodData.map(food => new Restaurant(food));
      // console.log('results from superagent', data.body);
      response.status(200).send(allRestuarants);
    }).catch(error => errorAlert(error, response));
}

//////////////////////////////Constructors////////////////////////////////////

// Location Constructor
function Location(searchQuery, obj) {
  this.search_query = searchQuery;
  this.formatted_query = obj.display_name;
  this.latitude = obj.lat;
  this.longitude = obj.lon;
}

// Weather Constructor - parameter are city and weather info
function Weather(obj) {
  this.forecast = obj.weather.description;
  this.time = obj.datetime;
}

// Hike Constructor
function Hike(obj) {
  this.name = obj.name;
  this.location = obj.location;
  this.length = obj.length;
  this.stars = obj.stars;
  this.star_votes = obj.starVotes;
  this.summary = obj.summary;
  this.trail_url = obj.url;
  this.conditions = obj.conditions;
  this.condition_date = new Date(obj.conditionDate).toLocaleDateString();
  this.condition_time = new Date(obj.conditionDate).toLocaleTimeString();
}

// Movie Constructor
function Movie(obj) {
  this.title = obj.original_title;
  this.overview = obj.overview;
  this.average_votes = obj.vote_average;
  this.total_votes = obj.vote_count;
  this.image_url = `https://image.tmdb.org/t/p/w500/${obj.poster_path}`;
  this.popularity = obj.popularity;
  this.released_on = obj.release_date;
}

// Yelp Restaurant Constructor
function Restaurant(obj) {
  this.name = obj.name;
  this.image_url = obj.image_url;
  this.price = obj.price;
  this.rating = obj.rating;
  this.url = obj.url;
}

////////////////////////////////LISTENERS//////////////////////////////////////
app.get('*', (request, response) => {
  response.status(404).send('Sorry, this is not a webpage');
});

client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`listening on ${PORT}`);
    });
  })
