const Listing = require("./models/listing");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js"); // JOI schema for validation

// Middleware to check if the user is authenticated
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl; 
    req.flash("error", "You must be logged in to create a listing!");
    return res.redirect("/login");
  }
  next();
};

// Middleware to save the redirect URL from the session to locals
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl; 
    delete req.session.redirectUrl; 
  }
  next(); 
};

//isOwner Middleware
module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if(!listing.owner.equals(res.locals.currUser._id)){
    req.flash("error", "You must be the owner of this listing!");
    return res.redirect(`/listings/${id}`);
  }
  next();
}


// Middleware to validate listing data using Joi
module.exports.validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    // status code 400 for validation errors
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

//validating review using JOI
module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(404, errMsg); 
  } else {
    next();
  }
};

//is Author
module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);
  if(!review.author.equals(res.locals.currUser._id)){
    req.flash("error", "You are not the author of this listing!");
    return res.redirect(`/listings/${id}`);
  }
  next();
}