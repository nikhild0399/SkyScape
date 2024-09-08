const axios = require('axios'); // Use Axios to make requests to LocationIQ
const Listing = require('../models/listing'); // Your listing model
const User = require('../models/user');

// INDEX - Display all listings
module.exports.index = async (req, res) => {
  const allListing = await Listing.find({});
  res.render('listings/index', { allListing });
};

// RENDER NEW LISTING FORM
module.exports.renderNewForm = (req, res) => {
  res.render('listings/new');
};

// SHOW A SPECIFIC LISTING
module.exports.showList = async (req, res) => {
  const { id } = req.params;
  const OneListing = await Listing.findById(id).populate({ 
    path: 'reviews', 
    populate: { path: 'author' },
  }).populate('owner');
  
  if (!OneListing) {
    req.flash('error', 'Listing you requested does not exist');
    return res.redirect('/listings');
  }
  
  res.render('listings/show', { OneListing });
};

// CREATE A NEW LISTING - Replace Mapbox with LocationIQ
module.exports.createListing = async (req, res) => {
  try {
    // Geocoding request to LocationIQ API
    const response = await axios.get('https://us1.locationiq.com/v1/search.php', {
      params: {
        key: process.env.LOCATIONIQ_API_KEY, // Your LocationIQ API token
        q: req.body.listing.location, // Location provided in the form
        format: 'json',
      },
    });

    // Check if a valid response is returned
    if (response.data.length === 0) {
      req.flash('error', 'Location not found. Please provide a valid location.');
      return res.redirect('/listings/new');
    }

    // Get latitude and longitude from the first result
    const { lat, lon } = response.data[0];

    // Handle file upload (if any)
    const url = req.file ? req.file.path : null;
    const filename = req.file ? req.file.filename : null;

    // Create a new listing
    const listing = new Listing(req.body.listing);
    listing.owner = req.user._id;
    listing.image = { url, filename };
    listing.geometry = { type: 'Point', coordinates: [lon, lat] }; // Store in GeoJSON format

    // Save the listing to the database
    await listing.save();

    // Flash success message and redirect
    req.flash('success', 'New Listing Created');
    res.redirect('/listings');
  } catch (error) {
    console.error('Error creating listing:', error.message);
    req.flash('error', 'An error occurred while creating the listing. Please try again.');
    res.redirect('/listings/new');
  }
};

// RENDER EDIT LISTING FORM
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const data = await Listing.findById(id);
  
  if (!data) {
    req.flash('error', 'Listing you requested does not exist');
    return res.redirect('/listings');
  }
  
  res.render('listings/edit', { data });
};

// UPDATE LISTING
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  
  if (!listing.owner.equals(req.user._id)) {
    req.flash('error', 'You do not have permission to edit this listing');
    return res.redirect(`/listings/${id}`);
  }

  const updatedListing = await Listing.findByIdAndUpdate(id, req.body.listing, { new: true, runValidators: true });
  
  if (req.file) {
    updatedListing.image = { url: req.file.path, filename: req.file.filename };
  }
  
  await updatedListing.save();
  
  req.flash('success', 'Listing Updated');
  res.redirect(`/listings/${id}`);
};

// DELETE LISTING
module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  
  req.flash('success', 'Listing Deleted');
  res.redirect('/listings');
};
