import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import editorRoutes from './routes/editor.routes';

dotenv.config();

const app = express();

// Credentials MUST be true for cookies to be sent cross-origin from the frontend
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true 
}));

app.use(express.json());
// Parses the Cookie header and populates req.cookies
app.use(cookieParser()); 

// Routes
app.use('/api/editor', editorRoutes);

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
    console.log(`🚀 Monaco Backend Service running on port ${PORT}`);
});