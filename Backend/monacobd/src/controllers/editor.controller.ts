import { Request, Response } from 'express';
import prisma from '../config/db';

export const saveEditorState = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const { problemId, language, code } = req.body;

        if (!problemId || !language || code === undefined) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Dynamically assign the code to the correct language column
        const updateData: any = {};
        if (language === 'cpp') updateData.codeCpp = code;
        else if (language === 'java') updateData.codeJava = code;
        else if (language === 'python') updateData.codePython = code;
        else return res.status(400).json({ success: false, message: "Unsupported language" });

        // Upsert creates the record if it doesn't exist, or updates it if it does
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
        const { problemId } = req.params;

        if (!problemId || typeof problemId !== 'string') {
            return res.status(400).json({ success: false, message: "Invalid problemId" });
        }

        const state = await prisma.editorState.findUnique({
            where: {
                userId_problemId: { userId, problemId }
            }
        });

        // If no state is found, return null data. The frontend will know to load the default template.
        return res.status(200).json({ success: true, data: state || null });
    } catch (error) {
        console.error("Get State Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};