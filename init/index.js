const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const mongoURL = "mongodb://127.0.0.1:27017/StayScape";

async function main() {
    await mongoose.connect(mongoURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    console.log("Connected to DB");
    initDb();  // Initialize the database after ensuring connection
}

main().catch(err => {
    console.log("Connection error:", err);
});

const initDb = async () => {
    try {
        await Listing.deleteMany({});  // Clear existing data
        const updatedData = initData.data.map(obj => ({
            ...obj,
            owner: new mongoose.Types.ObjectId("66db2eb23dcc993099e34350"), // Corrected syntax
            geometry: {  // Ensuring all objects include geometry structure
                type: "Point",
                coordinates: [-73.935242, 40.730610]  // Example coordinates (longitude, latitude)
            }
        }));
        await Listing.insertMany(updatedData);
        console.log("Database initialized with data.");
    } catch (err) {
        console.error("Error initializing database:", err);
    }
};
