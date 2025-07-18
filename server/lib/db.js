import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const MONGODB_URI = process.env.MONGODB_URI.replace(/"/g, ''); // Remove quotes
        await mongoose.connect(MONGODB_URI);
        console.log('Database Connected');
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        throw error;
    }
}