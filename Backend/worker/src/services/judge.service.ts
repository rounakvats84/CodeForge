import prisma from "../config/prisma";
import { runners } from "../../runner-bundler/runners";
import { createTempFolder } from "../../execution/createTempFolder";
import { cleanup } from "../../execution/cleanup";
import { writeSourceCode } from "../../execution/writeSourceCode";
import { createContainer } from "../../execution/createContainer";
import { destroyContainer } from "../../execution/destroyContainer";

import { publisher } from "../config/redis"; 

export async function judgeSubmission(payload: string) {
    const { submissionId, problemId, language, code } = JSON.parse(payload);

    console.log(`\n================ JUDGING SUBMISSION: ${submissionId} ================`);

    await prisma.submission.update({
        where: { id: submissionId },
        data: { status: "RUNNING" },
    });

    const tempDir = await createTempFolder();
    let containerName = "";

    try {
        const problem = await prisma.problem.findUnique({
            where: { id: problemId }
        });

        if (!problem) throw new Error(`Problem ${problemId} not found`);

        let template = "";
        if (language === "cpp") template = problem.templateCpp;
        else if (language === "java") template = problem.templateJava;
        else if (language === "python") template = problem.templatePython;
        
        if (!template) throw new Error(`Template missing for language: ${language}`);

        const visibleTestCases = (problem.visibleTestCases as any[]) || [];
        const hiddenTestCases = (problem.hiddenTestCases as any[]) || [];
        const testCases = [...visibleTestCases, ...hiddenTestCases];
        const totalTestCases = testCases.length;

        const runner = runners[language as keyof typeof runners];
        if (!runner) throw new Error(`Unsupported Language: ${language}`);

        containerName = await createContainer();
        console.log(`Docker Container Created: ${containerName}`);

        let passedTestCases = 0;
        let maxRuntime = 0;
        let finalVerdict = "ACCEPTED";
        
        // Error tracking variables
        let failedTestCase = null;
        let failedInput = null;
        let expectedOut = null;
        let actualOut = null;
        let compilerErr = null;
        let runtimeErr = null;

        for (let i = 0; i < totalTestCases; i++) {
            const testCase = testCases[i];
            
            const generatedCode = runner.generateSourceCode(code, testCase, template);
            await writeSourceCode(tempDir, runner.sourceFile, generatedCode);

            // 1. Compilation Phase
            try {
                await runner.compile(tempDir, containerName);
            } catch (compileError: any) {
                finalVerdict = "COMPILATION_ERROR";
                compilerErr = compileError.message || String(compileError);
                break;
            }

            // 2. Execution Phase
            try {
                const startTime = Date.now();
                const output = (await runner.execute(tempDir, containerName)).trim();
                const runtime = Date.now() - startTime;
                
                maxRuntime = Math.max(maxRuntime, runtime);
                const expected = String(testCase.expectedOutput).trim();

                if (output !== expected) {
                    finalVerdict = "WRONG_ANSWER";
                    failedTestCase = i + 1;
                    failedInput = `nums=[${testCase.nums}], target=${testCase.target}`;
                    expectedOut = expected;
                    actualOut = output;
                    break; 
                } else {
                    passedTestCases++;
                }
            } catch (error: any) {
                if (error.message === "TIME_LIMIT_EXCEEDED") {
                    finalVerdict = "TIME_LIMIT_EXCEEDED";
                } else {
                    finalVerdict = "RUNTIME_ERROR";
                    runtimeErr = error.message || String(error);
                }
                
                failedTestCase = i + 1;
                failedInput = `nums=[${testCase.nums}], target=${testCase.target}`;
                break;
            }
        }

        // 3. Save the exact state to the Database
        await prisma.submission.update({
            where: { id: submissionId },
            data: {
                status: "COMPLETED",
                verdict: finalVerdict as any,
                passedTestCases,
                totalTestCases,
                failedTestCase,
                input: failedInput,
                expectedOutput: expectedOut,
                actualOutput: actualOut,
                compilerOutput: compilerErr,
                runtimeError: runtimeErr,
                runtime: finalVerdict === "ACCEPTED" ? maxRuntime : null,
                memory: finalVerdict === "ACCEPTED" ? 0 : null,
                completedAt: new Date(),
            },
        });

        console.log(`\n================ FINAL VERDICT: ${finalVerdict} ================`);

        // 4. Publish the exact DB record to Redis Pub/Sub        
        await publisher.publish(
            `submission:${submissionId}`,
            JSON.stringify(await prisma.submission.findUnique({ where: { id: submissionId } }))
        );
        console.log(`Broadcasted result to channel: submission:${submissionId}`);

    } catch (error) {
        console.error("Worker Execution Error:", error);
        await prisma.submission.update({
            where: { id: submissionId },
            data: { status: "ERROR", completedAt: new Date() },
        });
    } finally {
        if (containerName) {
            try { await destroyContainer(containerName); } catch (err) {}
        }
        await cleanup(tempDir);
    }
}