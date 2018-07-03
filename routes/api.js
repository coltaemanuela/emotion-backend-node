var config = require('../config/config.json');
var express = require('express');
var bodyParser = require('body-parser');
var fs = require("fs");
var DeepAffects = require('deep-affects');
var jsonrequest = require('jsonrequest');
var router = express.Router();

//storage initialization
var storage = gcloud.storage({
    projectId:config.firebase.projectId,
    keyFilename: config.firebase.keyFileName
  });
var bucket = storage.bucket(config.firebase.storageBucket);


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

module.exports = router;