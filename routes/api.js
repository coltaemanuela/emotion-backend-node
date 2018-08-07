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

//GCP/FIREBASE storage initialization
var storage1 = new Storage ({
    projectId:config.firebase.projectId,
    keyFilename: config.firebase.keyFileName
  });

// Creates a client
// const storage1 = new Storage();

// const bucketName = 'recordigs';
// const filename = './screenshot.png';

// // Uploads a local file to the bucket
// storage1
//   .bucket(bucketName)
//   .upload(filename)
//   .then(() => {
//     console.log(`${filename} uploaded to ${bucketName}.`);
//   })
//   .catch(err => {
//     console.error('ERROR:', err);
//   });

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)) //Appending extension
  }
});
var upload = multer({ storage: storage });


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
  return res.json(apiResponse.success(fileObjects));
  next();
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


//multer({ dest: './uploads/wav_files/'}).single('audio')
router.post('/convert-to-wav', upload.single('audio'), function(req,res, next){
  let track = './' + req.file.path;
  ffmpeg(track).toFormat('wav').on('error', (err) => {
      res.json(apiResponse.customError(err.message));
  }).on('progress', (progress) => {
      console.log('Processing: ' + progress.targetSize + ' KB converted');
  }).on('end', () => {    
      res.json(apiResponse.success('Processing finished!'));
  }).save('./uploads/wav_files/'+ req.file.originalname+'.wav');
  // next();
});


router.post('/affects',upload.single('audio_wav'), function(req, res, next) {    
  var defaultClient = DeepAffects.ApiClient.instance;
  var track = req.file;
  console.log();
  // Configure API key authorization: UserSecurity
  var UserSecurity = defaultClient.authentications['UserSecurity'];
  UserSecurity.apiKey = config.deepaffect_API_key;
  var apiInstance = new DeepAffects.EmotionApi();
  var body = DeepAffects.Audio.fromFile(track.path); //DeepAffects.Audio.fromFile("./resources/speech1.wav");  //source: http://www.signalogic.com/melp/EngSamples/female600.wav. Length:49s
  jsonrequest("https://proxy.api.deepaffects.com/audio/generic/api/v1/sync/recognise_emotion?apikey=Y72YkFQJ6etxIpLyyzWhUqtoEdLOC1KE", body, (err, data) => {
    console.log(body);
      
    if (err) {
      console.error(err);
      res.json(apiResponse.customError(err));
    } else {
    // console.log(data);
      res.json(apiResponse.success(data));
      // next();
    }
  });
});


router.post('/empath-analysis',upload.single('audio_wav'), function (req, res) {
  var track = req.file;
  
  const API_ENDPOINT = 'https://api.webempath.net/v2/analyzeWav';
  var formData = {
  apikey: config.empath_API_key,
  wav: track.path  //fs.createReadStream("./resources/0wuqx-scsny.wav") //should be .wav format, shouldn't exceed 5s, 1.9MB  and frequency should be 11025 Hz
  };  
  console.log(formData);
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
    return res.json(apiResponse.customError(error));		
  });
  res.json(apiResponse.success('new recording added successfully'));
});

module.exports = router;