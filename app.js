var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var fs = require('fs');
var https = require('https'); 
var DeepAffects = require('deep-affects');
var request = require('request');
var jsonrequest = require('jsonrequest');
var config = require('./config/config.json');
var app = express();

//setup view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//homepage
app.get('/', function (req, res) {
  const API_ENDPOINT = 'https://api.webempath.net/v2/analyzeWav';
  var formData = {
  apikey: config.empath_API_key,
  wav: fs.createReadStream("./resources/0wuqx-scsny.wav") //should not be .wav format, should not exceed 5seconds, 1.9MB  and frequency should be 11025 Hz
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


app.get('/affects', function(req,res){

  var defaultClient = DeepAffects.ApiClient.instance;
  // Configure API key authorization: UserSecurity
  var UserSecurity = defaultClient.authentications['UserSecurity'];
  UserSecurity.apiKey = config.deepaffect_API_key;
  var apiInstance = new DeepAffects.EmotionApi();
  var body = DeepAffects.Audio.fromFile("./resources/female600.wav");  //source: http://www.signalogic.com/melp/EngSamples/female600.wav

  jsonrequest("https://proxy.api.deepaffects.com/audio/generic/api/v1/sync/recognise_emotion?apikey=Y72YkFQJ6etxIpLyyzWhUqtoEdLOC1KE", body, (err, data) => {
    if (err) {
      console.error(err);
    } else {
    console.log(data);
    }
  });

});

//server
app.listen(config.server.port, function () {
  console.log('App listening on port: '+ config.server.port);
});
