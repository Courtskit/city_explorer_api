'use strict'

// express library sets up our server
const express = require('express');
// initializes express library into constant app
const app = express();
require('dotenv').config();
// tells who is okay to send data to
const cors = require('cors');
app.use(cors());
const superagent = require('superagent');
// bring in the PORT through process.env.variable name]
const PORT = process.env.PORT || 3001;

// app.get('/location', (request, response) => {
//   try {
//     let search_query = request.query.city;
//     let geoData = require('./data/location.json');
//     let returnObj = new Location(search_query, geoData[0]);
//     response.status(200).send(returnObj);
//   } catch (err) {
//     response.status(500).send('Sorry, something went wrong');
//   }
// })

app.get('/location', (request, response) => {
  try {
    let city = request.query.city;

    let url = `GET https://us1.locationiq.com/v1/search.php?key=${process.env.GEO_DATA_API_KEY}&q=${city}&format=json`;

    superagent.get(url)
      .then(results => {
        let finalObj = new Location(city, results.body[0]);
        response.status(200).send(finalObj);
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
    let weatherData = require('./data/weather.json');
    let weatherDay = weatherData.data.map(value => {
      let weather = new Weather(value);
      return weather;
    })
    response.status(200).send(weatherDay);
  } catch (err) {
    response.status(500).send('Sorry, something went wrong');
  }
})

// app.get('/weather', (request, response) => {
//   try {
//     let search_query = request.query.search_query;
//     let url = `GET https://api.weatherbit.io/v2.0/current?city=${search_query}&key=${process.env.WEATHER_API_KEY}`;
//     superagent.get(url)
//       .then(results => {
//         console.log(results.body);
//       })
//   } catch (err) {
//     response.status(500).send('Sorry, something went wrong');
//   }
// })

// parameter are city and weather info
function Weather(obj) {
  this.forecast = obj.weather.description;
  this.time = obj.datetime;
}


app.get('*', (request, response) => {
  response.status(404).send('Sorry, this is not a webpage');
})

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
})
