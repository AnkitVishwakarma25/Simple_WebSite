
import { createClient } from "redis"
import config from "./configenv.js"

const redisClient = createClient({
    url: config.REDIS_URL,
})

redisClient.on("connect", () => {
    console.log("Redis connected successfully");
});


redisClient.on("error", (err) => {

    console.error("Redis error:", err);
});

await redisClient.connect();

export default redisClient;