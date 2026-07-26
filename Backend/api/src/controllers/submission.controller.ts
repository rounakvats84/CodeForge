import { Request, Response, NextFunction } from "express";
import {
    createSubmissionService,
    getUserSubmissionsService,
    getSubmissionByIdService,
} from "../services/submission.service";

export const createSubmission = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { problemId, language, code } = req.body;

        const submission = await createSubmissionService({
            userId: req.user!.id,
            problemId,
            language,
            code,
        });

        return res.status(201).json({
            success: true,
            data: submission,
        });
    } catch (error) {
        next(error);
    }
};

export const getUserSubmissions = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const submissions = await getUserSubmissionsService(req.user!.id);

        return res.status(200).json({
            success: true,
            data: submissions,
        });
    } catch (error) {
        next(error);
    }
};

export const getSubmissionById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Cast here as well
        const { submissionId } = req.params as { submissionId: string };

        const submission = await getSubmissionByIdService(
            submissionId,
            req.user!.id
        );

        return res.status(200).json({
            success: true,
            data: submission,
        });
    } catch (error) {
        next(error);
    }
};