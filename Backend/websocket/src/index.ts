import express from "express";
import http from "http";
import { Server } from "socket.io";
import "dotenv/config";
import { connectRedisSubscriber, subscriber } from "./config/redis";
import { socketAuthMiddleware } from "./middleware/auth.middleware";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
    },
});

// Apply JWT authentication
io.use(socketAuthMiddleware);

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.data.user.username} (Socket ID: ${socket.id})`);

    // Listen for the frontend asking to subscribe to a specific submission
    socket.on("subscribeToSubmission", async (submissionId: string) => {
        const channelName = `submission:${submissionId}`;
        console.log(`Socket ${socket.id} subscribing to ${channelName}`);

        // Subscribe to the unique Redis channel
        await subscriber.subscribe(channelName, (message) => {
            const resultData = JSON.parse(message);
            
            // Forward the result directly to this specific socket
            socket.emit("submissionResult", resultData);
            
            // Cleanup: Once we get a final verdict, unsubscribe to save memory
            if (resultData.status === "COMPLETED" || resultData.status === "ERROR") {
                subscriber.unsubscribe(channelName);
                console.log(`Unsubscribed from ${channelName}`);
            }
        });
    });

    socket.on("disconnect", () => {
        console.log(`User Disconnected: ${socket.data.user.username}`);
    });
});

const PORT = process.env.PORT || 3001;

const startServer = async () => {
    try {
        await connectRedisSubscriber();
        server.listen(PORT, () => {
            console.log(`🚀 WebSocket Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start WebSocket Server", error);
        process.exit(1);
    }
};

startServer();