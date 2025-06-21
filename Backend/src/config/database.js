const mongoose = require("mongoose");

const connectMangoDB = async () => {
    try{
        await mongoose.connect(process.env.MongoDB_URL);
        console.log("MongoDB connected Successfully");
    } catch (error) {
        console.error("MongoDB connection is Failed", error);
        process.exit(1);
    }
};

module.exports = connectMangoDB ;