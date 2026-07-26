import prisma from "../config/prisma";

export const getAllProblemsService = async () => {
    // Fetch all problems. We select only the necessary fields to keep the list lightweight.
    const problems = await prisma.problem.findMany({
        select: {
            id: true,
            title: true,
            difficulty: true,
        },
    });

    return problems;
};

export const getProblemByIdService = async (problemId: string) => {
    const problem = await prisma.problem.findUnique({
        where: { id: problemId },
        // Select specific fields to ensure 'hiddenTestCases' is NEVER sent to the client
        select: {
            id: true,
            title: true,
            description: true,
            difficulty: true,
            templateCpp: true,
            templateJava: true,
            templatePython: true,
            visibleTestCases: true,
        },
    });

    if (!problem) {
        throw new Error("Problem not found");
    }

    return problem;
};