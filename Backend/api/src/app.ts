import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes";
import problemRoutes from "./routes/problem.routes";
import submissionRoutes from "./routes/submission.routes";

import errorHandler from "./middleware/error.middleware";

const app = express();

app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
    })
);

app.use(express.json());

app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/problems", problemRoutes);
app.use("/submissions", submissionRoutes);

app.get("/", (_, res) => {
    res.json({
        success: true,
        message: "CodeForge API is running",
    });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

app.use(errorHandler);

export default app;