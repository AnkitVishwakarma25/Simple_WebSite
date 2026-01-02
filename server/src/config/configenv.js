import dotenv from "dotenv";

dotenv.config();

const requiredEnv = [
    "PORT",
    "MONGO_URI",
    "JWT_ACCESS_SECRET",
    "JWT_REFRESH_SECRET",
    "REDIS_URL",
];

requiredEnv.forEach((key) => {
    if (!process.env[key]) {
        throw new Error(`❌ Missing environment variable: ${key}`);
    }
});

const config = {
    PORT: process.env.PORT,
    MONGO_URI: process.env.MONGO_URI,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    REDIS_URL: process.env.REDIS_URL,
    NODE_ENV: process.env.NODE_ENV || "development",
};


export default config;