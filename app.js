var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var fs = require('fs');
var https = require('https'); 
var request = require('request');
var firebase = require('firebase');
var admin = require('firebase-admin');
var expressValidator = require('express-validator');
var rs = require('./service/apiResponse.js');
var config = require('./config/config.json');
var serviceAccount = require("./voice-sentiment-a2d855ce0859.json");
var general = require('./routes/general');
var api = require('./routes/api');
var app = express();

//setup view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 1000000}));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
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
app.use(function (req, res, next) {
      res.setHeader('Access-Control-Allow-Origin','http://127.0.0.1:4200'); // for allowing the frontend to connect
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type'); // Request headers to allow  
      // Set to true if you need the website to include cookies in the requests sent to the API (e.g. in case you use sessions)
      // res.setHeader('Access-Control-Allow-Credentials', true);  
      next();
  });

firebase.initializeApp(config.firebase);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: config.firebase.databaseURL
});

//server
app.listen(config.server.port, function () {
  console.log('App listening on port: '+ config.server.port);
});
