import { Router } from "express";

import {
    register,
    login,
    logout,
    CurrentUser,
} from "../controllers/auth.controller";

import authenticate from "../middleware/auth.middleware";
import validate from "../middleware/validate.middleware";
import { RegisterSchema, LoginSchema } from "../schemas/auth.schema";

const router = Router();

// Validate intercepts the request before it hits the register controller
router.post("/register", validate(RegisterSchema), register);

// Validate intercepts the request before it hits the login controller
router.post("/login", validate(LoginSchema), login);

router.get("/me", authenticate, CurrentUser);

router.post("/logout", authenticate, logout);

export default router;