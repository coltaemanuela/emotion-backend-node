var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var gcloud = require('google-cloud');
var fs = require('fs');
var request = require('request');
var config = require('./config/config.json');
var app = express();

//setup view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//homepage
app.get('/', function (req, res) {
    res.send('home');
});


const API_ENDPOINT = 'https://api.webempath.net/v2/analyzeWav';
var formData = {
  apikey: config.empath_API_key,
  wav: fs.createReadStream("./resources/0wuqx-scsny.wav") //shoulb be less than 8s and  11025 Hz
};

request.post({ url: API_ENDPOINT, formData: formData }, function(err, response) {
  if (err) {
console.trace(err);
} else {
  var respBody = JSON.parse(response.body);
  console.log("result: " + JSON.stringify(respBody));
}
});

//server
app.listen(config.server.port, function () {
  console.log('App listening on port: '+ config.server.port);
});
