//jshint esversion:6
require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const saltRounds = 10;


const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({
  extended: true
}));

//connect app to mongodb
mongoose.connect('mongodb://localhost:27017/userDB', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false})

//create user schema
const userSchema =  new mongoose.Schema({
  email: String,
  password: String
})



//use userSchema to set up new user 'model'
const User = new mongoose.model('User', userSchema)



app.get('/', function(req, res){
    res.render('home')
})

app.get('/login', function(req, res){
    res.render('login')
})

app.get('/register', function(req, res){
    res.render('register')
})

//REGISTER
//catch when the user attempts to register. handles user registration
app.post('/register', function (req, res) {
    //To use bycript
    bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(req.body.password, salt, function(err, hash) {
        // Store hash in your password DB.
        const newUser =  new User({
        email: req.body.username,
        password: hash
    });

    //save the new user
    newUser.save(function (err) {
        if (!err) {
            res.render('secrets')
        } else {
            console.log(err);
        }
    })
    });
});


    
})

//LOGIN

app.post('/login', function (req, res) {
    //credentials that user put in
    const username = req.body.username
    const password = req.body.password

    //look through our collection of users. email is what we have in our database and username is what user entered
    User.findOne({ email: username }, function(err, foundUser){
        if (!err) {
            //check to see if there was a found user with the email that was entered
            if (foundUser) {
                // using bycrpt to check password
                bcrypt.compare(password, foundUser.password, function(err, result) {
                if (result === true) {
                    res.render('secrets')
                }
            });
            }//if the user is not found, then redirect to register page
            else {
                res.redirect('/register')
                
            }
            
        } else {
            console.log(err);
        }
    })
})

app.listen(3000, function(){
    console.log('server is running');
})