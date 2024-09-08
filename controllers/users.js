
const User = require("../models/user")

module.exports.renderSingupForm = (req, res) => {
    res.render("users/signup.ejs");
  }

  module.exports.signup = async (req, res) => {
    try {
      const { username, email, password } = req.body;
      const newUser = new User({ email, username });
      
      const registerUser = await User.register(newUser, password);
      
      req.login(registerUser, (err) => {
        if (err) {
          return next(err);
        }
        req.flash("success", "Welcome to Adventura");
        res.redirect("/listings");
      });
  
    } catch (e) {
  if (e.name === 'UserExistsError') {
    req.flash("error", "Username is already taken.");
  } else if (e.name === 'ValidationError') {
    req.flash("error", "There was an error with your input.");
  } else {
    req.flash("error", e.message);  // Generic error message
  }

}
  };
module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
  };

module.exports.login = async (req, res) => {
    req.flash("success", "Welcome back to Adventura");
    let redirectUrl = res.locals.redirectUrl ||"/listings"
    res.redirect(redirectUrl);
  }

module.exports.logout = (req, res) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "You are logged Out!!!");
      res.redirect("/listings");
    });
  }