var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

//define schema for our user model
var userSchema = mongoose.Schema({
  local       :  {
                  email:String,
                  password:String,
                  firstname:String,
                  lastname:String
                 },
  facebook    :  {
                 id:String,
                 token:String,
                 email:String,
                 name:String,
                 picture:String
                 }
});

//checking if password is valid using bcrypt
userSchema.methods.validPassword = function(password){
  return bcrypt.compareSync(password,this.local.password);
}

//this method hashes the password and sets the user password
userSchema.methods.generateHash = function(password) {
	  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
	};

//create a modul for users and expose it to our app
module.exports = mongoose.model('User',userSchema);
