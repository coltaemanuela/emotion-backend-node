var express = require('express');
var firebase = require('firebase');
var config = require("../config/config.json");
var apiResponse = require('../service/apiResponse');
var router = express.Router();
var expressValidator = require('express-validator');

router.use(expressValidator())

router.post("/register", function(req, res,next) {
    req.checkBody('email').notEmpty();
    req.checkBody('username').notEmpty();
    req.checkBody('password').notEmpty();    
    req.checkBody('password', 'Password must have 6 to 20 characters').len(6, 20);      
    if(req.validationErrors()) {
        return res.json(apiResponse.errors['validation_errors']);
      }
    //Register a new user with email and password    
    console.log(req.body);    
    firebase.auth().createUserWithEmailAndPassword(req.body.email, req.body.password).then(function(data) {        
        firebase.auth().signInWithEmailAndPassword(req.body.email, req.body.password).then(function(data1) {    
            firebase.database().ref(`users/${data1.user.uid}`).set({
                "email": req.body.email,
                "username": req.body.username?req.body.username:""
            });        
            next();
        }).catch(function (err) {
            console.log(err);
            res.send("error"); //throw new Error('user_existing');
        });
    }).catch(function(error) {
        if (error.code === "auth/email-already-in-use") {
            console.log("auth/email-already-in-use");
            return res.json(apiResponse.errors['user_existing'])
        }        
    });
});

module.exports = router;