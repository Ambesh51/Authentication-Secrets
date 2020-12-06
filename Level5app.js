const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

//SETUP THE SESSION
app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

//INITIALIZE PASSPORT
app.use(passport.initialize());

//TELL THE APP TO USE THE PASSPORT AND ALSO USE THE SESSION
//USE THE PASSPORT DEALING WITH SESSION 
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});


//Here we did not add any methods to hash our password or to compare
// our passwords as we do normally for authentication 
//because passport-local-mongoose will do all that for us.
userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

//createStrategy() Creates a configured 
//passport-local LocalStrategy instance that can be used in passport.
passport.use(User.createStrategy());

//SERIALIZE ONLY NECESSARY WHEN WE ARE USEING SESSIONS
//SEARIALIZE USE FOR  USER IDENTIFICATION INTO THE COOKIES
passport.serializeUser(User.serializeUser());
//SEARIALIZE USE FOR  USER IDENTIFICATION INTO THE COOKIES
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res){
  res.render("home");
});
app.get("/login", function(req, res){
  res.render("login");
});
app.get("/register", function(req, res){
  res.render("register");
});

app.get("/secrets", function(req, res){
  if (req.isAuthenticated()){
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});



// model.register() this come from passport-local-mongoose package. And it's only because of the package
// that we can avoid creating our new user, saving our user and interacting with Mongoose directly. Instead
// we're going to be using the passport-local-mongoose package as our middleman to handle all of that for
// us.So inside here we're going to first add the username field and we're going to pass.
app.post("/register", function(req, res){

  
  User.register({username: req.body.username}, req.body.password, function(err, user){
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      });
    }
  });

});

app.post("/login", function(req, res){
  const username = req.body.username;
  const password = req.body.password;

 

  req.login(user, function(err){
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        bcrypt.compare(password, foundUser.password, function(err, result) {
          if (result === true) {
            res.render("secrets");
          }
        });
      }
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      });
    }
  });

});


app.listen(3000, function() {
  console.log("Server started on port 3000.");
});