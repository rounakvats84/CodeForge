import { createClient } from "redis";
import "dotenv/config";

if (!process.env.REDIS_URL) {
    throw new Error("REDIS_URL is not set in environment variables");
}

// Dedicated subscriber client
export const subscriber = createClient({
    url: process.env.REDIS_URL,
});

subscriber.on("error", (err) => {
    console.error("WebSocket Redis Subscriber Error:", err);
});

export const connectRedisSubscriber = async () => {
    await subscriber.connect();
    console.log("WebSocket connected to Redis Pub/Sub");
};