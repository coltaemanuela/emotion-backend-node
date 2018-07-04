var express = require('express');
var firebase = require('firebase');
var config = require("../config/config.json");
var apiResponse = require('../service/apiResponse');
var router = express.Router();
var expressValidator = require('express-validator');
var admin = require('firebase-admin');
router.use(expressValidator())

var getToken = function(uid){
    var additionalClaims =   firebase.database().ref(`users/${uid}`).once("value").then(function(userRecord) {
        console.log("Successfully fetched user data:", userRecord.toJSON());
        return userRecord.toJSON();
      })
      
    admin.auth().createCustomToken(uid).then(function(customToken, additionalClaims) {
      // Send token back to client
      console.log(customToken);
    })
    .catch(function(error) {
      console.log("Error creating custom token:", error);
      return res.json(apiResponse.customError('Error creating custom token'));
    })
  }; 


router.post("/register", function(req, res,next) {
    req.checkBody('email').notEmpty();
    req.checkBody('username').notEmpty();
    req.checkBody('password').notEmpty();    
    req.checkBody('password', 'Password must have 6 to 20 characters').len(6, 20);      
    if(req.validationErrors()) return res.json(apiResponse.errors['validation_errors']);
      
    //Register a new user with email and password    
    firebase.auth().createUserWithEmailAndPassword(req.body.email, req.body.password).then(function(data) {        
        firebase.auth().signInWithEmailAndPassword(req.body.email, req.body.password).then(function(data1) {    
            firebase.database().ref(`users/${data1.user.uid}`).set({
                "email": req.body.email,
                "username": req.body.username?req.body.username:""
            });        
            getToken(data1.user.uid);
            next();
        }).catch(function (err) {
            console.log(err);
            res.send("error"); //throw new Error('user_existing');
        });
    }).catch(function(error) {
        if (error.code === "auth/email-already-in-use") {
            return res.json(apiResponse.errors['user_existing'])
        }        
    });
});

router.post("/login", function(req,res){
    req.checkBody('email').notEmpty();
    req.checkBody('password').notEmpty();  
    if(req.validationErrors()) return res.json(apiResponse.errors['miss_req_params']);

    firebase.auth().signInWithEmailAndPassword(req.body.email, req.body.password).then(function(data) {
        firebase.database().ref(`users/${data.uid}`).once("value")
        .then(function(details) {
            console.log(firebase.auth().currentUser.email,firebase.auth().currentUser.uid, firebase.auth().currentUser.getIdTokenResult());           
        });
    });
});
module.exports = router;