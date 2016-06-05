module.exports = function(app,passport){

  /* GET HOME PAGE*/
  app.get('/',function(req,res){
    res.render('index.ejs');
  });

  app.get('/login',function(req,res){
    res.render('login.ejs',{message:req.flash('message')});
  });

 app.post('/login',passport.authenticate('local-login',{
   successRedirect:'/profile',
   failureRedirect:'/login',
   failureFlash:true
 }));

 app.get('/signup',function(req,res){
   res.render('signup.ejs',{message:req.flash('message')});
 });

 app.post('/signup',passport.authenticate('signup',{
   successRedirect:'/profile',
   failureRedirect:'/signup',
   failureFlash:true
 }));

 app.get('/profile',isLoggedIn,function(req,res){
   res.render('profile.ejs',{user:req.user});
 });

 app.get('/auth/facebook',passport.authenticate('facebook',{
   scope:'email'
 }));

 // handle the callback after facebook has authenticated the user
 app.get('/auth/facebook/callback',passport.authenticate('facebook',{
   successRedirect:'/profile',
   failureRedirect:'/'
 }));

 app.get('/logout', function(req, res) {
   req.logout();
   res.redirect('/');
 });

};

// route middleware to make sure
function isLoggedIn(req,res,next){
     //if user is authenticated in the session,carry on
     if(req.isAuthenticated())
        return next();

    //if user is not authenticated
    res.redirect('/'); 
}
