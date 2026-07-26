import { Request, Response, NextFunction } from "express";

import {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
} from "../services/auth.service";

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { username, email, password } = req.body;

        const { user, token } = await registerUser({
            username,
            email,
            password,
        });

        res.cookie("token", token, cookieOptions);

        return res.status(201).json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, password } = req.body;

        const { user, token } = await loginUser({
            email,
            password,
        });

        res.cookie("token", token, cookieOptions);

        return res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

export const logout = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        await logoutUser();

        res.clearCookie("token");

        return res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    } catch (error) {
        next(error);
    }
};

export const CurrentUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = await getCurrentUser(req.user!.id);

        return res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};