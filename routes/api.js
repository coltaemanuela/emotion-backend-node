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
var request = require('request');
var ffmpeg = require('fluent-ffmpeg');
var expressValidator = require('express-validator');
var router = express.Router();

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname ) //Appending extension + path.extname(file.originalname)
  }
});

var upload = multer({ storage: storage });

router.post("/upload_file", upload.single('audio'),  async (req, res) => {
  try {
    var orig1 = req.file;	
    console.log(req.file.originalname);
    res.json(apiResponse.success('file uploaded'));
  }
  catch(err){
    res.sendStatus(400);
  }
});


router.post('/transcript', function(req,res,next){
  fs.writeFile("transcripts/"+ req.body.document_id+".txt", req.body.message, function(err) {
    if(err) {
      return console.log(err);
    }  
    return res.json(apiResponse.success("The transcript file was saved!"));
    next();
  }); 
});


router.post('/affects-v2', function(req, res, next) {    
  var defaultClient = DeepAffects.ApiClient.instance;
  var encoded1 = req.body.encoded1;
  // Configure API key authorization: UserSecurity
  var UserSecurity = defaultClient.authentications['UserSecurity'];
  UserSecurity.apiKey = config.deepaffect_backup_API_key;
  var apiInstance = new DeepAffects.EmotionApi();
  // var body = DeepAffects.Audio.fromFile(track.path);
  var body = {
    encoding: "MULAW",
    sampleRate: 16000,
    languageCode: "en-GB",
    content: encoded1
  };

  jsonrequest("https://proxy.api.deepaffects.com/audio/generic/api/v2/sync/recognise_emotion?apikey=l1W8ZHBa2pSjYbEe0Vxz7e0acaMecFRG", body, (err, data) => {
    if (err) {
      console.error(err);
      res.json(apiResponse.customError(err));
    } else {
    console.log(data);
    res.json(apiResponse.success(data));
    }
  });
});
// curl -X POST "https://proxy.api.deepaffects.com/audio/generic/api/v2/sync/recognise_emotion?apikey=l1W8ZHBa2pSjYbEe0Vxz7e0acaMecFRG" -H 'content-type: application/json' -d @data.json
// curl -X POST "https://proxy.api.deepaffects.com/audio/generic/api/v2/async/recognise_emotion?apikey=l1W8ZHBa2pSjYbEe0Vxz7e0acaMecFRG&webhook=http://localhost:4200/&request_id=a37cacc3-71d5-40f0-a329-a051a3949ced" -H 'content-type: application/json' -d @data.json
// curl -X POST "https://proxy.api.deepaffects.com/audio/generic/api/v1/sync/recognise_emotion?apikey=l1W8ZHBa2pSjYbEe0Vxz7e0acaMecFRG" -H 'content-type: application/json' -d @data.json

router.post('/affects', function(req, res, next) {    
  var defaultClient = DeepAffects.ApiClient.instance;
  var encoded1 = req.body.encoded1;
  // Configure API key authorization: UserSecurity
  var UserSecurity = defaultClient.authentications['UserSecurity'];
  UserSecurity.apiKey = config.deepaffect_backup_API_key;
  var apiInstance = new DeepAffects.EmotionApi();
  // var body = DeepAffects.Audio.fromFile(track.path);
  // DeepAffects.Audio.sampleRate = 24414;
  

  var body = {
    encoding: "MULAW",
    sampleRate: 16000,
    languageCode: "en-GB",
    content: encoded1
  };

  var callback = function(error, data, response) {
  if (error) {
    console.error(error);
    res.json(apiResponse.customError(err));
  } else {
    console.log('API called successfully. Returned data: ' + data);
    res.json(apiResponse.success(data));
  }
};
apiInstance.syncRecogniseEmotion(body, callback);
});


router.post('/affects-v3', function(req, res, next) {    
  var defaultClient = DeepAffects.ApiClient.instance;
  var path = req.body.path;
  // Configure API key authorization: UserSecurity
  var UserSecurity = defaultClient.authentications['UserSecurity'];
  UserSecurity.apiKey = config.deepaffect_backup_API_key;
  var apiInstance = new DeepAffects.EmotionApi();
  var body = DeepAffects.Audio.fromFile('./uploads/wav_files/'+path +'.wav');

  var callback = function(error, data, response) {
  if (error) {
    console.error(error);
    res.json(apiResponse.customError(err));
  } else {
    console.log('API called successfully. Returned data: ' + data);
    res.json(apiResponse.success(data));
  }
};
apiInstance.syncRecogniseEmotion(body, callback);
});


router.post('/denoising', function(req,res,next) {

  var encod = req.body.encod;
  console.log(req.body);
  var defaultClient = DeepAffects.ApiClient.instance;
  var UserSecurity = defaultClient.authentications["UserSecurity"];
  UserSecurity.apiKey = config.deepaffect_backup_API_key;
  
  var apiInstance = new DeepAffects.DenoiseApi();
  
  var body = DeepAffects.Audio.fromFile('../data.json'); // {Audio} Audio object
  
  var callback = function(error, data, response) {
    if (error) {
      console.error(error);
    } else {
      console.log("API called successfully. Returned data: " + data);
    }
  };
  apiInstance.syncDenoiseAudio(body, callback);
});


  router.post('/affects-v1',upload.single('audio_wav'), function(req, res, next) {   
  var track = req.file;
  console.log(track);
  var defaultClient = DeepAffects.ApiClient.instance;  
  // Configure API key authorization: UserSecurity
  var UserSecurity = defaultClient.authentications['UserSecurity'];
  UserSecurity.apiKey = config.deepaffect_backup_API_key;
  var apiInstance = new DeepAffects.EmotionApi();
  var body = DeepAffects.Audio.fromFile(track.path);
  // var encoded = fs.readFileSync(track).toString('base64');
  jsonrequest("https://proxy.api.deepaffects.com/audio/generic/api/v1/sync/recognise_emotion?apikey=l1W8ZHBa2pSjYbEe0Vxz7e0acaMecFRG", body,(err, data) => {
  if (err) {
      console.error(err);
      res.json(apiResponse.customError(err));
    } else {
    console.log(data);
    res.json(apiResponse.success(data));
    }
  });
});


router.post('/empath-analysis', function (req, res) {
  var path = req.body.path;  
  const API_ENDPOINT = 'https://api.webempath.net/v2/analyzeWav';
  var formData = {
    apikey: config.empath_API_key,
    wav:fs.createReadStream( path )  //fs.createReadStream("./resources/0wuqx-scsny.wav") //should be .wav format, shouldn't exceed 5s, 1.9MB  and frequency should be 11025 Hz
  };  
  console.log(formData);
  debugger
  request.post({ url: API_ENDPOINT, formData: formData }, function(err, response) {
    debugger
  if (err) 
    console.trace(err);  
  debugger
  var respBody = JSON.parse(response.body);
  console.log("result: " + JSON.stringify(respBody));
  res.json(JSON.stringify(respBody));
  });
});


router.post('/convert-ffmpeg',upload.single('audio'), function(req,res,next){
  let track = req.file;
  ffmpeg('./uploads/'+ track.originalname)
  .audioChannels(1)
  .withAudioFrequency(44100)  
  .toFormat('wav')
  .on('error', (err) => {	  
      res.json(apiResponse.customError(err.message));	     
  }).on('progress', (progress) => {
      console.log('Processing: ' + progress.targetSize + ' KB converted');	      
  }).on('end', () => {    	  
     res.json(apiResponse.success('Processing finished!'));	      
  }).save('./uploads/wav_files/'+ req.body.title +'.wav');	 
});

module.exports = router;