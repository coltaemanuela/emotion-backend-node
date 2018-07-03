var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var fs = require('fs');
var https = require('https'); 
var request = require('request');
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
app.use('/api', api)

//homepage
app.get('/', function (req, res) {
  const API_ENDPOINT = 'https://api.webempath.net/v2/analyzeWav';
  var formData = {
  apikey: config.empath_API_key,
  wav: fs.createReadStream("./resources/0wuqx-scsny.wav") //should be .wav format, shouldn't exceed 5s, 1.9MB  and frequency should be 11025 Hz
  };

  request.post({ url: API_ENDPOINT, formData: formData }, function(err, response) {
  if (err) {
    console.trace(err);
  } else {
    var respBody = JSON.parse(response.body);
    console.log("result: " + JSON.stringify(respBody));
    res.json(JSON.stringify(respBody));
  }
  });
});


//server
app.listen(config.server.port, function () {
  console.log('App listening on port: '+ config.server.port);
});
