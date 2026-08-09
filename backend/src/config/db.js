require("dotenv").config();

const mongoose = require("mongoose");

const connectToDatabase = async () => {
    try {
        const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/uvms";
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log("Database connected");
    } catch (error) {
        console.error("Database connection error:", error.message);
        throw error;
    }
};

module.exports = { connectToDatabase };