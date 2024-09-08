const express = require("express");
const router = express.Router({ mergeParams: true });
const Listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync.js");
const flash = require("connect-flash");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const { storage } = require("../cloudConfig.js");

const listingController = require("../controllers/listing.js");

const multer = require("multer");
const upload = multer({ storage });

// Search route - handles search by title, description, location, or price
router.get('/search', async (req, res) => {
  const { query } = req.query;
  let listings = [];

  // Try parsing the query as a number for price search
  const priceQuery = parseFloat(query);

  try {
    listings = await Listing.find({
      $or: [
        { title: { $regex: query, $options: 'i' } }, // Case-insensitive match for title
        { description: { $regex: query, $options: 'i' } }, // Case-insensitive match for description
        { location: { $regex: query, $options: 'i' } }, // Case-insensitive match for location
        { price: !isNaN(priceQuery) ? priceQuery : null } // Exact match for price if it's a valid number
      ].filter(condition => condition !== null) // Remove null conditions if price is not a number
    });
    
    res.render('listings/index', { allListing: listings });
  } catch (err) {
    console.error(err);
    res.status(500).send('An error occurred while searching.');
  }
});

router
  .route("/")
  .get(wrapAsync(listingController.index)) // Index Page Route - Shows all listings
  .post(
    
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing)
  ); // Create New Listing Route

// New Listing Form Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

router
  .route("/:id")
  .get(wrapAsync(listingController.showList)) // Show Listing Route
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing) // Update Listing Route
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing)); // Delete Listing Route

// Edit Listing Route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

module.exports = router;
