import mongoose from "mongoose";

let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is missing. Add it to your .env file or your deployment's environment variables.");
  }

  try {
    cachedConnection = await mongoose.connect(uri);
    console.log("MongoDB connected");
    return cachedConnection;
  } catch (err) {
    cachedConnection = null;
    console.error("MongoDB connection failed:", err.message);
    throw err;
  }
};

export default connectDB;
