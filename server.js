var express = require('express');
var app = express();
var port = process.env.PORT||8080

var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var expressSession = require('express-session');
var configDB = require('./db.js');

// configuration ===============================================================
mongoose.connect(configDB.url);//connect to our database

require('./config/passport')(passport);//pass passport for configuration



  //set up our express application
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());

  app.set('view engine','ejs');//set up ejs for templating

  //required for passport
  app.use(expressSession({ secret: 'mySecretKey', cookie: { maxAge: 60000 }, resave: true, saveUninitialized: true }))
  app.use(passport.initialize());
  app.use(passport.session());//persistent login sessions
  app.use(flash());//use connect-flash for flash messages stored in session


// routes ======================================================================
require('./routes/routes')(app,passport);// load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);
