import { z } from "zod";

export const RegisterSchema = z.object({
    body: z.object({
        username: z
            .string()
            .min(3, "Username must be at least 3 characters")
            .max(20, "Username cannot exceed 20 characters")
            // Strictly alphabetic: No numbers, no spaces, no underscores
            .regex(/^[a-zA-Z]+$/, "Username can only contain letters (no numbers or special characters)"),
            
        email: z
            .string()
            .email("Please provide a valid email address"),
            
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            // Requires at least one letter, one number, and one special character (including @ and _)
            .regex(
                /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@_$!%*?&]).+$/,
                "Password must contain at least one letter, one number, and one special character"
            ),
    }),
});

export const LoginSchema = z.object({
    body: z.object({
        email: z
            .string()
            .email("Please provide a valid email address"),
        password: z
            .string()
            .min(1, "Password is required"), // Just ensure it's not empty for login
    }),
});