var config = require('../config/config.json');
var express = require('express');
var path= require("path");
var bodyParser = require('body-parser');
var fs = require("fs");
var apiResponse = require('../service/apiResponse');
var expressValidator = require('express-validator');
const Storage = require('@google-cloud/storage');
var DeepAffects = require('deep-affects');
var jsonrequest = require('jsonrequest');
var firebase = require('firebase');
var multer = require('multer');
var expressValidator = require('express-validator');
var router = express.Router();

//storage initialization
var storage = new Storage ({
    projectId:config.firebase.projectId,
    keyFilename: config.firebase.keyFileName
  });

// Creates a client
// const storage = new Storage();

// const bucketName = 'recordigs';
// const filename = './screenshot.png';

// // Uploads a local file to the bucket
// storage
//   .bucket(bucketName)
//   .upload(filename)
//   .then(() => {
//     console.log(`${filename} uploaded to ${bucketName}.`);
//   })
//   .catch(err => {
//     console.error('ERROR:', err);
//   });

router.get('/dummy', function(req,res,next){
  console.log('dummy route from backend API working');
  res.json('dummy route from backend API working');
  next();
});

router.post("/upload", multer({ dest: './uploads/'}).array('newfile', 10), function(req, res, next) { 
  var orig = req.files;	
	const fileObjects = orig.map(currentFile => ({
    id: currentFile.filename,
    file_name: currentFile.originalname,
    mimetype: currentFile.mimetype,
    path: currentFile.path+".jpg"
  }));
  next();
});



router.post('/transcript', function(req,res,next){

  fs.writeFile("transcripts/"+ req.body.document_id+".txt", req.body.message, function(err) {
    if(err) {
        return console.log(err);
    }  
    console.log("The file was saved!");
    res.json("The file was saved!");
    next();
  }); 

});



router.get('/affects', function(req,res,next){    
  var defaultClient = DeepAffects.ApiClient.instance;
  // Configure API key authorization: UserSecurity
  var UserSecurity = defaultClient.authentications['UserSecurity'];
  UserSecurity.apiKey = config.deepaffect_API_key;
  var apiInstance = new DeepAffects.EmotionApi();
  var body = DeepAffects.Audio.fromFile("../resources/female600.wav");  //source: http://www.signalogic.com/melp/EngSamples/female600.wav. Length:49s
  jsonrequest("https://proxy.api.deepaffects.com/audio/generic/api/v1/sync/recognise_emotion?apikey=Y72YkFQJ6etxIpLyyzWhUqtoEdLOC1KE", body, (err, data) => {
  if (err) {
      console.error(err);
  } else {
  console.log(data);
  }
  });
  next();
});


router.get('/empath-analysis', function (req, res) {
    const API_ENDPOINT = 'https://api.webempath.net/v2/analyzeWav';
    var formData = {
    apikey: config.empath_API_key,
    wav: fs.createReadStream("./resources/0wuqx-scsny.wav") //should be .wav format, shouldn't exceed 5s, 1.9MB  and frequency should be 11025 Hz
    };
  
    request.post({ url: API_ENDPOINT, formData: formData }, function(err, response) {
    if (err) 
      console.trace(err);  
    var respBody = JSON.parse(response.body);
    console.log("result: " + JSON.stringify(respBody));
    res.json(JSON.stringify(respBody));
    });
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