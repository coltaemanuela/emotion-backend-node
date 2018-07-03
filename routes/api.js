var config = require('../config/config.json');
var express = require('express');
var bodyParser = require('body-parser');
var fs = require("fs");
var apiResponse = require('../service/apiResponse');
var expressValidator = require('express-validator');
const Storage = require('@google-cloud/storage');
var DeepAffects = require('deep-affects');
var jsonrequest = require('jsonrequest');
var firebase = require('firebase');
var router = express.Router();

//storage initialization
var storage = new Storage ({
    projectId:config.firebase.projectId,
    keyFilename: config.firebase.keyFileName
  });

router.get('/affects', function(req,res,next){    
    var defaultClient = DeepAffects.ApiClient.instance;
    // Configure API key authorization: UserSecurity
    var UserSecurity = defaultClient.authentications['UserSecurity'];
    UserSecurity.apiKey = config.deepaffect_API_key;
    var apiInstance = new DeepAffects.EmotionApi();
    var body = DeepAffects.Audio.fromFile("./resources/female600.wav");  //source: http://www.signalogic.com/melp/EngSamples/female600.wav. Length:49s

    jsonrequest("https://proxy.api.deepaffects.com/audio/generic/api/v1/sync/recognise_emotion?apikey=Y72YkFQJ6etxIpLyyzWhUqtoEdLOC1KE", body, (err, data) => {
    if (err) {
        console.error(err);
    } else {
    console.log(data);
    }
    });
    next();
});

router.post('/add-recording', function(req,res,next){
    var title = req.body.title ? req.body.title.trim() : '';    
    if( !req.body || !title) return res.json(apiResponse.errors['miss_req_params'])    
    if( title.length < 3 ) return res.json(apiResponse.errors['minim_string_length'])
    firebase.database().ref(`recordings`).push({
        'title': title  
	}).catch(function(error) {
			console.log(error);
		  res.send("error");
	});
});

module.exports = router;