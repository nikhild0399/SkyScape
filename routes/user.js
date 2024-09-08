const express = require("express");
const router = express.Router();
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");
const userController = require("../controllers/users");

router
  .route("/signup")
  .get( userController.renderSingupForm) // Signup route
  .post(wrapAsync(userController.signup)); // Signup POST route to user registration

router
  .route("/login")
  .get(userController.renderLoginForm) //login route
  .post(
    // Login POST route to user Login
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.login
  );

//logout route
router.get("/logout", userController.logout);
module.exports = router;
