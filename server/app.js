var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var diapersRouter = require('./routes/diapers');
var dataRouter = require('./routes/sales');

var cors = require('cors')
var app = express()

app.use(cors({ origin: 'http://localhost:8080' }))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/diapers', diapersRouter);
app.use('/data', dataRouter);

module.exports = app;
