import crypto from "crypto";
import prisma from "../config/prisma";
import redis from "../config/redis";

export const createSubmissionService = async (data: {
    userId: string;
    problemId: string;
    language: string;
    code: string;
}) => {
    // 1. Validate problem exists before doing anything
    const problem = await prisma.problem.findUnique({
        where: { id: data.problemId },
        select: { id: true },
    });

    if (!problem) {
        throw new Error("Problem not found");
    }

    // 2. Generate UUID
    const submissionId = crypto.randomUUID();

    // 3. Create QUEUED row in DB
    const submission = await prisma.submission.create({
        data: {
            id: submissionId,
            userId: data.userId,
            problemId: data.problemId,
            language: data.language,
            code: data.code,
            status: "QUEUED",
        },
        select: {
            id: true,
            status: true,
        },
    });

    // 4. Try pushing to Redis, rollback DB insert if it fails
    try {
        const queuePayload = JSON.stringify({
            submissionId: submission.id,
            userId: data.userId, // Added userId so worker doesn't need to fetch it
            problemId: data.problemId,
            language: data.language,
            code: data.code,
        });

        // Renamed queue to be more accurate
        await redis.lPush("submissionQueue", queuePayload);
    } catch (error) {
        // Rollback: Delete the DB row if Redis push fails so it doesn't get stuck in QUEUED
        await prisma.submission.delete({
            where: { id: submissionId },
        });
        throw new Error("Failed to queue submission. Please try again.");
    }

    // 5. Return only what the frontend actually needs
    return {
        id: submission.id,
        status: submission.status,
    };
};

export const getUserSubmissionsService = async (userId: string) => {
    const submissions = await prisma.submission.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" }, // Newest first
        select: {
            id: true,
            problemId: true,
            language: true,
            status: true,
            verdict: true,
            runtime: true,
            memory: true,
            createdAt: true,
        },
    });

    return submissions;
};

export const getSubmissionByIdService = async (submissionId: string, userId: string) => {
    const submission = await prisma.submission.findUnique({
        where: { id: submissionId },
        // Swapped `include` for `select` to tightly control returned columns
        select: {
            id: true,
            userId: true, // Needed for the ownership check below
            language: true,
            verdict: true,
            status: true,
            runtime: true,
            memory: true,
            code: true,
            createdAt: true,
            completedAt: true,
            problem: {
                select: {
                    title: true,
                    difficulty: true,
                },
            },
        },
    });

    if (!submission) {
        throw new Error("Submission not found");
    }

    // Security check: Ensure the user requesting this is the one who submitted it
    if (submission.userId !== userId) {
        throw new Error("Unauthorized to view this submission");
    }

    // We can strip out the userId before sending it back to the client since they already know who they are
    const { userId: _, ...submissionData } = submission;

    return submissionData;
};