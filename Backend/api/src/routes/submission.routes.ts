import { Router } from "express";

import {
    createSubmission,
    getSubmissionById,
    getUserSubmissions,
} from "../controllers/submission.controller";

import authenticate from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, createSubmission);

router.get("/", authenticate, getUserSubmissions);

router.get("/:submissionId", authenticate, getSubmissionById);

export default router;