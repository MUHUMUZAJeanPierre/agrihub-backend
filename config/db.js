const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
    } catch (err) {
        console.error('DB Connection error', err.message);

    }
}

module.exports = connectDB;