'use strict'

// npm init
// npm install -S express
// npm i -s dotenv
// npm i -s cors
// nodemon

// express library sets up our server
const express = require('express');
// initializes express library into constant app
const app = express();

// dotenv lets us get our secrets from our .env file
require('dotenv').config();

// tells who is okay to send data to
const cors = require('cors');
app.use(cors());

// bring in the PORT through process.env.variable name]
const PORT = process.env.PORT || 3001;

app.get('/', (request, response) => {
  // will show in terminal
  console.log('hello');
  // will show in browser
  response.send('I wanna go outside');
})

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
})


// //////////////
// // notes from class

// // express library sets up our server
// const express = require('express');
// // initializes express library into constant app
// const app = express();

// // dotenv lets us get our secrets from our .env file
// require('dotenv').config();

// // serve static files from public directory (if there was a public folder in your directories).. display these files instead of home route
// app.use(express.static('./public'));

// // bring in the PORT through process.env.variable name
// const PORT = process.env.PORT || 3001;

// // route
// app.get('/', (request, response) => {
//   // will show in terminal
//   console.log('hello');
//   // will show in browser
//   response.send('I wanna go outside');
// })

// // makes its own route called makingThisUp
// // backend versions of event listeners
// app.get('/makingThisUp', (request, response) => {
//   console.log('Hey this is the public folder that doesnt exist but if it did this would work.');
//   response.send(' so confuseed but this is public')
// })

// // for routes that don't exist
// app.get('*', (request, response) => {
//   console.log('for routes that dont exist');
//   response.status(404).send('This route does not exist.')
// })

// app.get('/location', (request, response) => {
//   console.log(request.query.city);
//   let searchQuery = request.query.city;
// });


// // turn on the lights - move into the house - start the server
// app.listen(PORT, () => {
//   console.log(`listening on ${PORT}`)
// })

