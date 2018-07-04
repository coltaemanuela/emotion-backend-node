var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var fs = require('fs');
var https = require('https'); 
var request = require('request');
var firebase = require('firebase');
var expressValidator = require('express-validator');
var rs = require('./service/apiResponse.js');
var config = require('./config/config.json');
var general = require('./routes/general');
var api = require('./routes/api');
var app = express();

//setup view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/', general);
app.use('/api', api)
app.use(expressValidator({
  errorFormatter: function (param, msg, value) {
      var namespace = param.split('.')
              , root = namespace.shift()
              , formParam = root;

      while (namespace.length) {
          formParam += '[' + namespace.shift() + ']';
      }

      return msg !== "Invalid value" ? msg : "Missing '" + formParam + "' param or no value";
  }
}));

firebase.initializeApp(config.firebase);

//server
app.listen(config.server.port, function () {
  console.log('App listening on port: '+ config.server.port);
});
