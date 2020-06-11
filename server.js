'use strict'

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

app.get('/location', (request, response) => {
  try {
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
            })
        }
      })
  } catch (err) {
    response.status(500).send('Sorry, something went wrong');
  }
})


function Location(searchQuery, obj) {
  this.search_query = searchQuery;
  this.formatted_query = obj.display_name;
  this.latitude = obj.lat;
  this.longitude = obj.lon;
}

app.get('/weather', (request, response) => {
  try {
    let search_query = request.query.search_query;
    let url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${search_query}&key=${process.env.WEATHER_API_KEY}&days=8`;

    superagent.get(url)
      .then(results => {
        let weatherResults = results.body.data.map(weatherResults => {
          let day = new Weather(weatherResults);
          return day;
        });
        response.status(200).send(weatherResults);
      });

  } catch (err) {
    response.status(500).send('Sorry, something went wrong');
  }
});

// parameter are city and weather info
function Weather(obj) {
  this.forecast = obj.weather.description;
  this.time = obj.datetime;
}

app.get('/trails', (request, response) => {
  try {
    let latitude = request.query.latitude;
    let longitude = request.query.longitude;

    let url = `https://www.hikingproject.com/data/get-trails?lat=${latitude}&lon=${longitude}&maxDistance=10&key=${process.env.TRAIL_APT_KEY}`;

    superagent.get(url)
      .then(results => {
        let hikeResults = results.body.trails.map(hike => {
          let trail = new Hike(hike);
          return trail;
        });
        response.status(200).send(hikeResults);
      });

  } catch (err) {
    response.status(500).send('Sorry, something went wrong');
  }
});

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

app.get('*', (request, response) => {
  response.status(404).send('Sorry, this is not a webpage');
});

client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`listening on ${PORT}`);
    });
  });
