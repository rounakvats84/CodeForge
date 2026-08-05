import { Router } from "express";

import {
    createSubmission,
    getSubmissionById,
    getUserSubmissions,
    createSubmissionForRun,
} from "../controllers/submission.controller";

import authenticate from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, createSubmission);

router.post("/run", authenticate, createSubmissionForRun);

router.get("/", authenticate, getUserSubmissions);

router.get("/:submissionId", authenticate, getSubmissionById);

export default router;