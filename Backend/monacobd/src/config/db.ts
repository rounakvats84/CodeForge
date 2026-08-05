import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
// Import the generated ClientTypes or Client directly
import { PrismaClient } from "@prisma/client"; 
import "dotenv/config"; // Ensure environment variables are loaded
const { Pool } = pg;

// 1. Manually pull the DB connection string string
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

// 2. Build the adapter layer
const adapter = new PrismaPg(pool);

// 3. Force the adapter object directly into the custom constructor
const prisma = new PrismaClient({ 
  adapter: adapter 
} as any); // Use 'as any' if the custom directory types are misaligned

export default prisma;
