'use strict'

// npm init
// npm install -S express
// npm i -s dotenv



// express library sets up our server
const express = require('express');
// initializes express library into constant app
const app = express();

// dotenv lets us get our secrets from our .env file
require('dotenv').config();

// tells who is okay to send data to 
const cors = require('cors');
app.use(cors());

// bring in the PORT through process.env.variable name
const PORT = process.env.PORT || 3001;

