var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var diapersController = require('./controllers/diapersController');

var cors = require('cors')
var app = express()

// If running the front-end from node, uncomment line below
app.use(cors({ origin: 'http://localhost:8080' }))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/diapers', diapersController);


module.exports = app;
