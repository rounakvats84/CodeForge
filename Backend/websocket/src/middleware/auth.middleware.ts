import { Socket } from "socket.io";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import "dotenv/config";

interface JwtPayload {
    id: string;
    username: string;
}

export const socketAuthMiddleware = (socket: Socket, next: (err?: Error) => void) => {
    try {
        const cookieString = socket.handshake.headers.cookie;
        
        if (!cookieString) {
            return next(new Error("Authentication error: No cookies found"));
        }

        const token = cookieString
        .split(";")
        .find(c => c.trim().startsWith("token="))
        ?.split("=")[1]

        if (!token) {
            return next(new Error("Authentication error: Token missing"));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        
        // Attach user info to socket for later use if needed
        socket.data.user = decoded;
        
        next();
    } catch (error) {
        return next(new Error("Authentication error: Invalid or expired token"));
    }
};