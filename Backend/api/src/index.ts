import "dotenv/config";
import app from "./app";
// Import the connection function
import { connectRedis } from "./config/redis"; 

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        // 1. Wait for Redis to connect
        await connectRedis();

        // 2. Only start the server if Redis is ready
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to connect to Redis. Server startup aborted.", error);
        // Exit the process if we can't connect to our core queue
        process.exit(1); 
    }
};

startServer();