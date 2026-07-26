import { Router } from "express";

import {
    getAllProblems,
    getProblemById,
} from "../controllers/problem.controller";

const router = Router();

router.get("/", getAllProblems);

router.get("/:problemId", getProblemById);

export default router;