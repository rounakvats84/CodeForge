import prisma from "../config/prisma";
import { runners } from "../../runner-bundler/runners";
import { createTempFolder } from "../../execution/createTempFolder";
import { cleanup } from "../../execution/cleanup";
import { writeSourceCode } from "../../execution/writeSourceCode";
import { createContainer } from "../../execution/createContainer";
import { destroyContainer } from "../../execution/destroyContainer";

import { publisher } from "../config/redis"; 

export async function judgeSubmission(payload: string) {
    const { submissionId, problemId, language, code, executionType = "SUBMIT" } = JSON.parse(payload);

    console.log(`\n================ JUDGING: ${submissionId} [${executionType}] ================`);

    if (executionType === "SUBMIT") {
        await prisma.submission.update({
            where: { id: submissionId },
            data: { status: "RUNNING" },
        });
    }

    await publisher.publish(
        `submission:${submissionId}`, 
        JSON.stringify({ id: submissionId, status: "RUNNING", executionType })
    );

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
        
        const testCases = executionType === "RUN" 
            ? visibleTestCases 
            : [...visibleTestCases, ...hiddenTestCases];
            
        const totalTestCases = testCases.length;

        const runner = runners[language as keyof typeof runners];
        if (!runner) throw new Error(`Unsupported Language: ${language}`);

        containerName = await createContainer();
        console.log(`Docker Container Created: ${containerName}`);

        let passedTestCases = 0;
        let maxRuntime = 0;
        let finalVerdict = "ACCEPTED";
        
        let failedTestCase = null;
        let compilerErr = null;
        let runtimeErr = null;

        const runResults: any[] = [];

        for (let i = 0; i < totalTestCases; i++) {
            const testCase = testCases[i];
            
            const generatedCode = runner.generateSourceCode(code, testCase, template);
            await writeSourceCode(tempDir, runner.sourceFile, generatedCode);

            const { expectedOutput, _id, ...inputsOnly } = testCase;
            const formattedInput = Object.entries(inputsOnly)
                .map(([key, val]) => `${key} = ${JSON.stringify(val)}`)
                .join("\n");

            const expected = String(testCase.expectedOutput).trim();

            try {
                await runner.compile(tempDir, containerName);
            } catch (compileError: any) {
                finalVerdict = "COMPILATION_ERROR";
                compilerErr = compileError.message || String(compileError);
                break;
            }

            try {
                const startTime = Date.now();
                const output = (await runner.execute(tempDir, containerName)).trim();
                const runtime = Date.now() - startTime;
                
                maxRuntime = Math.max(maxRuntime, runtime);

                if (output !== expected) {
                    finalVerdict = "WRONG_ANSWER";
                    failedTestCase = i + 1;
                    
                    runResults.push({
                        caseNumber: i + 1,
                        input: formattedInput,
                        expectedOutput: expected,
                        actualOutput: output,
                        passed: false
                    });
                    
                    break; 
                } else {
                    passedTestCases++;
                    runResults.push({
                        caseNumber: i + 1,
                        input: formattedInput,
                        expectedOutput: expected,
                        actualOutput: output,
                        passed: true
                    });
                }
            } catch (error: any) {
                if (error.message === "TIME_LIMIT_EXCEEDED") {
                    finalVerdict = "TIME_LIMIT_EXCEEDED";
                } else {
                    finalVerdict = "RUNTIME_ERROR";
                    runtimeErr = error.message || String(error);
                }
                
                failedTestCase = i + 1;
                
                runResults.push({
                    caseNumber: i + 1,
                    input: formattedInput,
                    expectedOutput: expected,
                    actualOutput: "Error: Execution Terminated",
                    passed: false
                });
                break;
            }
        }

        console.log(`\n================ FINAL VERDICT: ${finalVerdict} ================`);

        const resultPayload = {
            id: submissionId,
            status: "COMPLETED",
            verdict: finalVerdict,
            passedTestCases,
            totalTestCases,
            failedTestCase,
            compilerOutput: compilerErr,
            runtimeError: runtimeErr,
            runtime: finalVerdict === "ACCEPTED" ? maxRuntime : null,
            memory: finalVerdict === "ACCEPTED" ? 0 : null,
            completedAt: new Date(),
            executionType,
            runResults,
            code,      // <-- ADDED THIS so frontend gets the snapshot
            language,  // <-- ADDED THIS to label the code block properly
        };

        if (executionType === "SUBMIT") {
            await prisma.submission.update({
                where: { id: submissionId },
                data: {
                    status: "COMPLETED",
                    verdict: finalVerdict as any,
                    passedTestCases,
                    totalTestCases,
                    failedTestCase,
                    compilerOutput: compilerErr,
                    runtimeError: runtimeErr,
                    runtime: finalVerdict === "ACCEPTED" ? maxRuntime : null,
                    memory: finalVerdict === "ACCEPTED" ? 0 : null,
                    completedAt: new Date(),
                },
            });
        }

        await publisher.publish(`submission:${submissionId}`, JSON.stringify(resultPayload));
        console.log(`Broadcasted result to channel: submission:${submissionId}`);

    } catch (error: any) {
        console.error("Worker Execution Error:", error);
        if (executionType === "SUBMIT") {
            await prisma.submission.update({
                where: { id: submissionId },
                data: { status: "ERROR", completedAt: new Date() },
            });
        }
        await publisher.publish(
            `submission:${submissionId}`, 
            JSON.stringify({ id: submissionId, status: "ERROR", executionType, error: error.message })
        );
    } finally {
        if (containerName) {
            try { await destroyContainer(containerName); } catch (err) {}
        }
        await cleanup(tempDir);
    }
}