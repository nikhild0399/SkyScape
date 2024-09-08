const Review = require("../models/review");
const Listing = require("../models/listing"); //  listing model

module.exports.createReview = async (req, res) => {
    
    let list = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    await newReview.save();
    await list.save();
    req.flash("success", "New Review Created");
    console.log("Review saved");
    res.redirect(`/listings/${list._id}`);
  };

  module.exports.deleteReview = async (req, res) => {
    let { id, review_id } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: review_id } });
    await Review.findByIdAndDelete(review_id);
    req.flash("success", "Review Deleted");
    res.redirect(`/listings/${id}`);
  }
