var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var fs = require('fs');
var https = require('https'); 
var cors = require('cors')

var request = require('request');
var firebase = require('firebase');
var admin = require('firebase-admin');
var expressValidator = require('express-validator');
var rs = require('./service/apiResponse.js');
var config = require('./config/config.json');
var general = require('./routes/general');
var api = require('./routes/api');
var app = express();
var BinaryServer = require('binaryjs').BinaryServer;
var binaryserver = new BinaryServer({server: app, path: '/binary-endpoint'});

app.use(cors())
//setup view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 1000000}));
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, X-Auth-Token'); // Request headers to allow  
  next();
});
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



//server
app.listen(config.server.port, function () {
  console.log('App listening on port: '+ config.server.port);
});
