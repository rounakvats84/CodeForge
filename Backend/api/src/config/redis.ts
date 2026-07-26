import "dotenv/config";
import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
    throw new Error("REDIS_URL environment variable is not set");
}

const redis = createClient({
    url: redisUrl
});

redis.on("error", (err) => {
    console.error("Redis Error:", err);
});

// Export the connection logic as a reusable function
export const connectRedis = async () => {
    await redis.connect();
    console.log("Redis Connected");
};

export default redis;