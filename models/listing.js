const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Reviews = require("./review")
const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url: String,
  },

  price: Number,
  location: String,
  country: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner:{
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  geometry: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
    
  },

});

//Creating middleware to handle reviews delete operation
listingSchema.post("findOneAndDelete",async(listing)=>{
if(listing){
  await Reviews.deleteMany({_id:{$in:listing.reviews}});
}
});

const listing = mongoose.model("listing", listingSchema);

module.exports = listing;
