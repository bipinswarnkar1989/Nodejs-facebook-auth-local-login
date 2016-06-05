//load all the thinhs we need
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var bCrypt = require('bcrypt-nodejs');

//load up the user model
var User = require('../models/user');

//load the auth variables
var configAuth = require('./auth');

//expose the function to our app using module.exports
module.exports = function(passport){
  passport.serializeUser(function(user,done){
	  console.log('serializing user: ');
    done(null,user._id);
  });

  passport.deserializeUser(function(id,done){
   User.findById(id,function(err,user){
	   console.log('deserializing user: ',user);
     done(err,user);
   });
  });

  // =========================================================================
  // LOCAL LOGIN =============================================================
  // =========================================================================
  // we are using named strategies since we have one for login and one for signup
  // by default, if there was no name, it would just be called 'local'

  passport.use('local-login',new LocalStrategy({
    //by default local strategy uses username and password,we will override with email
    usernameField:'email',
    passwordField:'password',
    passReqToCallback:true   //allows us to passback the entire request to the callback
  },
  function(req,email,password,done){ //callback with email and password from our form
    // find a user whose email is the same as the forms email
    // find user in Mongo with given email
    User.findOne({'local.email':email},function(err,user){
      //if there were any errors return the error before anything else
      if(err)
       return done(err);

       //if user is not found ,return the message
       if(!user)  // req.flash is the way to set flashdata using connect-flash
        return done(null,false,req.flash('message','No User Found'));

        //if the user is found ,but password is wrong
        if(!user.validPassword(password))
         return done(null,false,req.flash('message','Oops! Wrong Password'));//create a loginMessage and save it to as session as flashdata

         //all is well return successful user
         return done(null,user);

    });
  }
));
  
 //LOCAL SIGNUP
  passport.use('signup',new LocalStrategy({
	  usernameField:'email',
	  passwordField:'password',
	  passReqToCallback:true,  //allows us to passback the entire request to the callback
  },
  function(req,email,password,done) {
	findOrCreateUser = function(){
		//we are checking to see if the user trying to login already exists
		User.findOne({'local.email':email},function(err,user){
		    //In case of any error return error using done method
			if(err){
				console.log('Error in signup:' +err);
				return done(err);
			      }
			//check if user with given email already exists
			if(user){
				console.log('User already exists with the given email: '+email);
				return done(null,false,req.flash('message','User already exists with given email'));
			}
			else{
				//create new user
				var newUser = new User();
				
				//set the user credentials
				newUser.local.email = email;
				newUser.local.password = newUser.generateHash(password);
				newUser.local.firstname = req.param('firstname');
				newUser.local.lastname = req.param('lastname');
				
				//save new user
				newUser.save(function(err){
					if(err){
						console.log('Error in saving user: '+err);
						throw err;
					}
					console.log('User Registration Successfull');
					return done(null,newUser);
				});
			}
		});
	}
	//Delay the execution of findOrCreateUser and execute the method in the next trick of event loop
    process.nextTick(findOrCreateUser);

}
  ));

// =========================================================================
// FACEBOOK ================================================================
// =========================================================================
passport.use(new FacebookStrategy({

    //pull in your app id and secret from your auth.js file
   clientID :     configAuth.facebookAuth.clientID,
   clientSecret:  configAuth.facebookAuth.clientSecret,
   callbackURL:   configAuth.facebookAuth.callbackURL,
   profileFields: ['id', 'name','picture.type(large)', 'emails', 'displayName', 'about', 'gender']
},
 //facebook will send back the token and profile
 function(token,refreshToken,profile,done){
   //asynchronous
   process.nextTick(function(){
     //find the user in the database based on their facebook id
     User.findOne({'facebook.id':profile.id},function(err,user){

       //if there is an error ,stop everything and return that
       //ie an error connecting to the database
       if(err)
        return done(err);

        //if the user is found,then log them in
        if(user){
          return done(null,user);//user found return that user
                }
            else{
            //if there is no user found with that facebook id,create them
            var newUser = new User();

            //set all of the facebook information in our user model
            newUser.facebook.id = profile.id; //set the users facebook id
            newUser.facebook.token = token; //we will save the token that facebook provides to user
            newUser.facebook.name = profile.displayName ;  // look at the passport user profile to see how names are returned
            newUser.facebook.email = profile.emails[0].value;//facebook can return multiple emails so we'll take the first

            newUser.save(function(err){
              if(err)
              throw err;

              //if successful return the new user
              return done(null,newUser);
            });

            }
     });
   });
 }
)
);


}
