import mongoose from "mongoose";
import config from "./configenv.js";

const connectDB = async () => {

    const MongoUri = config.MONGO_URI;

    try {
        const conn = await mongoose.connect(MongoUri);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {

        console.error(`MongoDB connection Failed ${error.message}`);

        process.exit(1);

    }
}

export default connectDB;