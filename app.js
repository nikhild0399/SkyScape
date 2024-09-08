if(process.env.NODE_ENV != 'production'){
  require('dotenv').config();
} 


const express = require("express"); // Express for creating the server and managing routes
const app = express(); // Creating an instance of Express
const mongoose = require("mongoose"); // Mongoose for interacting with MongoDB
const path = require("path"); // Path module for handling file and directory paths
const methodOverride = require("method-override"); // Allows form methods like PUT and DELETE
const ejsMate = require("ejs-mate"); // Layout engine for EJS templating
const ExpressError = require("./utils/ExpressError.js"); // Custom error handler for the application
const session = require("express-session"); // Session management for storing user sessions
const MongoStore = require('connect-mongo');
const flash = require("connect-flash"); // Flash messages middleware to display messages
const passport = require("passport"); // Passport.js for authentication strategies
const LocalStrategy = require("passport-local"); // Local authentication strategy using username/password
const User = require("./models/user"); // User model for authentication and database interaction

// Route Files
const listingRouter = require("./routes/listing.js");  // Routes for handling listings functionality
const reviewRouter = require("./routes/review.js"); // Routes for handling reviews functionality
const userRouter = require("./routes/user.js"); // Routes for handling User functionality


// Mongoose DB connection
const port = 8080;
const dbUrl = process.env.ATLAS_DB

main()
  .then(() => {
    console.log("Connected TO DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

// Setting EJS as the templating engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Use ejs-mate for EJS layouts
app.engine("ejs", ejsMate);

// Middleware for parsing form data (URL-encoded)
app.use(express.urlencoded({ extended: true }));


// Method Override middleware for handling PUT/DELETE requests from forms
app.use(methodOverride("_method"));

// Setting static files from the 'public' folder
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
  mongoUrl : dbUrl,
  crypto:{
    secret: process.env.SECRET,
    touchAfter: 24*3600,
  }
});

store.on("error",()=>{
  console.log("Error in Mongo Session Store");
})

// Session configuration Options
const sessionOptions = {
    store,
    secret: process.env.SECRET,  
    resave: false,
    saveUninitialized: false,  // Only create sessions when something is stored
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,  // 7 days in milliseconds
        maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days in milliseconds
        secure: false,  // Set to true if using HTTPS
        httpOnly: false,  // Allow access to cookies from the client-side
    }
};



app.use(session(sessionOptions)); //using session options
app.use(flash()); //using flash to diplay success and error message

// Passport for authentication 
app.use(passport.initialize());
app.use(passport.session()); //handling sessions
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



// Middleware to set flash messages globally available to views
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currUser = req.user;
    next();
  });

// Middleware to ensure session is initialized for every request
app.use((req, res, next) => {
    if (!req.session.username) {
      req.session.username = "guest";  // Or initialize any other session data
    }
    next();
  });

// app.get("/demouser",async(req,res)=>{
//   let fakeUser = new User({
//     email:"student@getMaxListeners.com",
//     username:"student"
//   });
//   let registerUser = await User.register(fakeUser,"hello");
//   res.send(registerUser);
// })

app.use("/listings", listingRouter); // Using listing.js
app.use("/listings/:id/reviews", reviewRouter); // Using review.js
app.use("/",userRouter); //using user.js

// Handling all Page Not Found Errors
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

// Handling Server-side Errors using Middleware
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

// Start the Server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
