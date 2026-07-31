import "dotenv/config";
import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
    throw new Error("REDIS_URL environment variable is not set");
}

// 1. The Queue Consumer Client
const redis = createClient({ url: redisUrl });

// 2. The Pub/Sub Publisher Client
export const publisher = createClient({ url: redisUrl });

redis.on("error", (err) => console.error("Worker Redis Error:", err));
publisher.on("error", (err) => console.error("Worker Publisher Error:", err));

export const connectRedis = async () => {
    await redis.connect();
    await publisher.connect(); // Connect the publisher too!
    console.log("Worker connected to Redis (Queue & Pub/Sub)");
};

export default redis;