const mongoose = require("mongoose");
const Schema = mongoose.Schema; // Define a schema from Mongoose
const passportLocalMongoose = require("passport-local-mongoose"); // Import passport-local-mongoose for authentication

const userSchema = new Schema({
    email:{
        type:String,
        required:true,
    },
    username:{
        type:String,
        required:true,
    }
});

// Add passport-local-mongoose plugin to handle username, password and hashing automatically
userSchema.plugin(passportLocalMongoose); 

module.exports = mongoose.model("User",userSchema);