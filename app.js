//jshint esversion:6
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs')
const mongoose = require('mongoose')
const encrypt = require('mongoose-encryption')


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

//this is for the mongoose-encription package
const secret = 'Loremipsumdolorsitametconsectetur'
userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] });

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

//catch when the user attempts to register. handles user registration
app.post('/register', function (req, res) {
    //create a new user uning the user model
    const newUser =  new User({
        email: req.body.username,
        password: req.body.password
    });

    //save the new user
    newUser.save(function (err) {
        if (!err) {
            res.render('secrets')
        } else {
            console.log(err);
        }
    })
})

//handles the user login in
app.post('/login', function (req, res) {
    //credentials that user put in
    const username = req.body.username
    const password = req.body.password

    //look through our collection of users. email is what we have in our database and username is what user entered
    User.findOne({ email: username }, function(err, foundUser){
        if (!err) {
            //check to see if there was a found user with the email that was entered
            if (foundUser) {
                // check if the founduser's password (db) is equal to what the user entered
                if (foundUser.password === password) {
                    res.render('secrets')
                }
            }
            //if the user is not found, then redirect to register page
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