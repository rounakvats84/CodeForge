import prisma from "../config/prisma";
import { runners } from "../../runner-bundler/runners";
import { createTempFolder } from "../../execution/createTempFolder";
import { cleanup } from "../../execution/cleanup";
import { writeSourceCode } from "../../execution/writeSourceCode";
import { createContainer } from "../../execution/createContainer";
import { destroyContainer } from "../../execution/destroyContainer";

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

        // Get the correct DB template based on language
        let template = "";
        if (language === "cpp") template = problem.templateCpp;
        else if (language === "java") template = problem.templateJava;
        else if (language === "python") template = problem.templatePython;
        
        if (!template) throw new Error(`Template missing for language: ${language}`);

        const visibleTestCases = (problem.visibleTestCases as any[]) || [];
        const hiddenTestCases = (problem.hiddenTestCases as any[]) || [];
        const testCases = [...visibleTestCases, ...hiddenTestCases];

        const runner = runners[language as keyof typeof runners];
        if (!runner) throw new Error(`Unsupported Language: ${language}`);

        containerName = await createContainer();
        console.log(`Docker Container Created: ${containerName}`);

        let allPassed = true;
        let maxRuntime = 0;
        let finalVerdict = "ACCEPTED";
        let failedTestCaseDetails: any = undefined;

        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];
            const isHidden = i >= visibleTestCases.length;
            
            console.log(`\n--- Running Test Case ${i + 1} (${isHidden ? 'HIDDEN' : 'VISIBLE'}) ---`);
            
            // Pass the DB template to the generic generator
            const generatedCode = runner.generateSourceCode(code, testCase, template);

            await writeSourceCode(tempDir, runner.sourceFile, generatedCode);

            try {
                await runner.compile(tempDir, containerName);
            } catch (compileError) {
                finalVerdict = "COMPILATION_ERROR";
                allPassed = false;
                break;
            }

            try {
                const startTime = Date.now();
                const output = (await runner.execute(tempDir, containerName)).trim();
                const runtime = Date.now() - startTime;
                
                maxRuntime = Math.max(maxRuntime, runtime);
                const expected = String(testCase.expectedOutput).trim();

                console.log(`Received : ${output}`);

                if (output !== expected) {
                    finalVerdict = "WRONG_ANSWER";
                    allPassed = false;
                    failedTestCaseDetails = {
                        input: testCase, 
                        expected: expected,
                        actual: output
                    };
                    console.log("❌ Verdict: WRONG_ANSWER");
                    break; 
                } else {
                    console.log("✅ Passed");
                }
            } catch (runtimeError: any) {
                // Check if our dockerExec threw the timeout error
                if (runtimeError.message === "TIME_LIMIT_EXCEEDED") {
                    finalVerdict = "TIME_LIMIT_EXCEEDED";
                    console.log("❌ Verdict: TIME_LIMIT_EXCEEDED");
                } else {
                    finalVerdict = "RUNTIME_ERROR";
                    console.log("❌ Verdict: RUNTIME_ERROR");
                }
                
                allPassed = false;
                
                // Save the failure details for the frontend
                failedTestCaseDetails = {
                    input: testCase,
                    expected: String(testCase.expectedOutput).trim(),
                    actual: finalVerdict // Show the user they got a TLE or Runtime Error
                };
                
                break;
            }
        }

        await prisma.submission.update({
            where: { id: submissionId },
            data: {
                status: "COMPLETED",
                verdict: finalVerdict as any,
                testCaseFailure: failedTestCaseDetails,
                runtime: maxRuntime,
                memory: 0, 
                completedAt: new Date(),
            },
        });

        console.log(`\n================ FINAL VERDICT: ${finalVerdict} ================`);

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