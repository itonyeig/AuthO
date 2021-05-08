//jshint esversion:6
require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs')
const mongoose = require('mongoose')
const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({
  extended: true
}));

//initializing express-session
app.use(session({
  secret: 'Loremipsumdolorsitametconsectetur!',
  resave: false,
  saveUninitialized: false,
}))

app.use(passport.initialize());// initalize passport package
app.use(passport.session())// use passport for deling with session

//set up passport local mongoose package... add it as plugin


//connect app to mongodb
mongoose.connect('mongodb://localhost:27017/userDB', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false})

//create user schema
const userSchema =  new mongoose.Schema({
  email: String,
  password: String
})

userSchema.plugin(passportLocalMongoose) // used to hash and salt password



//use userSchema to set up new user 'model'
const User = new mongoose.model('User', userSchema)

//serializeUser user adds user info to cookie
//deserializeUser crumbles the cookie
passport.use(User.createStrategy());// create a locallogin strategy
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.get('/', function(req, res){
    res.render('home')
})

app.get('/login', function(req, res){
    res.render('login')
})

app.get('/register', function(req, res){
    res.render('register')
})

app.get('/secrets', function(req, res){
    if (req.isAuthenticated()) {
        res.render('secrets')
    } else {
        res.redirect('/login')
    }
})

app.get('/logout', function(req, res){
    req.logout();
  res.redirect('/');
})


//REGISTER
app.post('/register', function (req, res) {
    
    User.register( {username: req.body.username }, req.body.password, function(err, user){
        if (!err) {
            passport.authenticate('local')(req, res, function(){
            res.redirect('/secrets')
            })
        } else {
            console.log(err);
            res.redirect('/register')
        }
    })

})

//LOGIN

app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/secrets');
  });

app.listen(3000, function(){
    console.log('server is running');
})