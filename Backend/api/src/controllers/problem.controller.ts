import { Request, Response, NextFunction } from "express";
import {
    getAllProblemsService,
    getProblemByIdService,
} from "../services/problem.service";

export const getAllProblems = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const problems = await getAllProblemsService();

        return res.status(200).json({
            success: true,
            data: problems,
        });
    } catch (error) {
        next(error);
    }
};

export const getProblemById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Cast the destructured params to guarantee it's a string
        const { problemId } = req.params as { problemId: string };

        const problem = await getProblemByIdService(problemId);

        return res.status(200).json({
            success: true,
            data: problem,
        });
    } catch (error) {
        next(error);
    }
};