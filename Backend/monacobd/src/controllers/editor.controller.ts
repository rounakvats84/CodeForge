import { Request, Response } from 'express';
import prisma from '../config/db';

export const saveEditorState = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const { language, code } = req.body;
        const problemId = req.body.problemId as string; // Explicit cast for strict TS

        if (!problemId || !language || code === undefined) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const updateData: any = {};
        if (language === 'cpp') updateData.codeCpp = code;
        else if (language === 'java') updateData.codeJava = code;
        else if (language === 'python') updateData.codePython = code;
        else return res.status(400).json({ success: false, message: "Unsupported language" });

        const savedState = await prisma.editorState.upsert({
            where: {
                userId_problemId: { userId, problemId }
            },
            update: updateData,
            create: {
                userId,
                problemId,
                ...updateData
            }
        });

        return res.status(200).json({ success: true, data: savedState });
    } catch (error) {
        console.error("Save State Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getEditorState = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const problemId = req.params.problemId as string; // Explicit cast for strict TS

        if (!problemId) {
            return res.status(400).json({ success: false, message: "Invalid problemId" });
        }

        let state = await prisma.editorState.findUnique({
            where: {
                userId_problemId: { userId, problemId }
            }
        });

        // LAZY INITIALIZATION: If no state exists, fetch the problem templates and create it
        if (!state) {
            // Look up starterCode
            const problem = await prisma.problem.findUnique({
                where: { id: problemId },
                select: { starterCodeCpp: true, starterCodeJava: true, starterCodePython: true }
            });

            if (!problem) {
                return res.status(404).json({ success: false, message: "Problem not found" });
            }

            state = await prisma.editorState.create({
                data: {
                    userId,
                    problemId,
                    codeCpp: problem.starterCodeCpp,
                    codeJava: problem.starterCodeJava,
                    codePython: problem.starterCodePython
                }
            });
        }

        return res.status(200).json({ success: true, data: state });
    } catch (error) {
        console.error("Get State Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const resetEditorState = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const problemId = req.params.problemId as string; // Explicit cast for strict TS

        if (!problemId) {
            return res.status(400).json({ success: false, message: "Invalid problemId" });
        }

        // 1. Fetch starterCode
        const problem = await prisma.problem.findUnique({
            where: { id: problemId },
            select: { starterCodeCpp: true, starterCodeJava: true, starterCodePython: true }
        });

        if (!problem) {
            return res.status(404).json({ success: false, message: "Problem not found" });
        }

        // 2. Overwrite user state with starterCode
        const updatedState = await prisma.editorState.upsert({
            where: {
                userId_problemId: { userId, problemId }
            },
            update: {
                codeCpp: problem.starterCodeCpp,
                codeJava: problem.starterCodeJava,
                codePython: problem.starterCodePython
            },
            create: {
                userId,
                problemId,
                codeCpp: problem.starterCodeCpp,
                codeJava: problem.starterCodeJava,
                codePython: problem.starterCodePython
            }
        });

        return res.status(200).json({ success: true, data: updatedState });
    } catch (error) {
        console.error("Reset State Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};