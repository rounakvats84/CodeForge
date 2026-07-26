import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// Import the shared Prisma instance from your config
import prisma from "../config/prisma"; 

// Ensure Typescript doesn't complain about possibly undefined env vars
if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing");
}

const JWT_SECRET = process.env.JWT_SECRET;

export const registerUser = async (data: any) => {
    const { username, email, password } = data;

    // 1. Check if user already exists
    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [{ email }, { username }],
        },
    });

    if (existingUser) {
        throw new Error("User with this email or username already exists");
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Create user (using 'select' so we don't return the passwordHash)
    const user = await prisma.user.create({
        data: {
            username,
            email,
            passwordHash,
        },
        select: {
            id: true,
            username: true,
            email: true,
            createdAt: true,
        },
    });

    // 4. Generate JWT
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
        expiresIn: "7d",
    });

    return { user, token };
};

export const loginUser = async (data: any) => {
    const { email, password } = data;

    // 1. Find user by email
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new Error("Invalid credentials");
    }

    // 2. Compare passwords
    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
        throw new Error("Invalid credentials");
    }

    // 3. Generate JWT
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
        expiresIn: "7d",
    });

    // 4. Remove passwordHash from the returned user object
    const { passwordHash, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
};

export const logoutUser = async () => {
    // Left as a resolved promise for now. 
    // If you ever want to blacklist tokens on logout, you would import redis here.
    return Promise.resolve();
};

export const getCurrentUser = async (id: string) => {
    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            username: true,
            email: true,
            createdAt: true,
        },
    });

    if (!user) {
        throw new Error("User not found");
    }

    return user;
};