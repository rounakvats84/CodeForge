import { createClient } from "redis";
const client = createClient();

import { TestCase } from "../types/TestCase";
import { createTempFolder } from "../execution/createTempFolder";
import { cleanup } from "../execution/cleanup";
import { writeSourceCode } from "../execution/writeSourceCode";

import { runners } from "../runner-bundler/runners";

async function processSubmission(submission: string) {
    const { code, language } = JSON.parse(submission);

    console.log("\n================ NEW SUBMISSION ================");
    console.log("Language   :", language);

    const runner = runners[language as keyof typeof runners];

    console.log("\nRunner Selected:");
    console.log({
        sourceFile: runner.sourceFile
    });

    if (!runner) {
        throw new Error("Unsupported Language");
    }

    const testCases: TestCase[] = [
        {
            nums: [2, 7, 11, 15],
            target: 9,
            expectedOutput: "0 1"
        },
        {
            nums: [3, 2, 4],
            target: 6,
            expectedOutput: "1 2"
        },
        {
            nums: [3, 3],
            target: 6,
            expectedOutput: "0 1"
        }
    ];

    const tempDir = await createTempFolder();

    try {

        for (const testCase of testCases) {

            const generatedCode = runner.generateSourceCode(
                code,
                testCase
            );


            await writeSourceCode(
                tempDir,
                runner.sourceFile,
                generatedCode
            );

            await runner.compile(tempDir);

            const output = (await runner.execute(tempDir)).trim();
            console.log("Expected :", testCase.expectedOutput);
            console.log("Received :", output);

            if(output === testCase.expectedOutput.trim()){
                console.log("✅ Test Passed");
            }
    
            else{
                console.log("--------------------");
                console.log("Wrong Answer");
                console.log("Input:", testCase);
                console.log("Expected:", testCase.expectedOutput);
                console.log("Got:", output);
                console.log("--------------------");
                return;

            }
        }

        console.log("Accepted!");

    }
    catch (error) {

        console.error("Submission failed:", error);
    }
    finally {

        await cleanup(tempDir);

    }

}

async function startWorker() {

    try {
        await client.connect();
        console.log("Worker connected to Redis.");

        // Main loop
        while (true) {
            try {
                const submission = await client.brPop("problems", 0);
                // @ts-ignore
                if(!submission) {
                    continue; // No submission received, continue to the next iteration
                }
                await processSubmission(submission.element);
            } catch (error) {
                console.error("Error processing submission:", error);
                // Implement your error handling logic here. For example, you might want to push
                // the submission back onto the queue or log the error to a file.
            }
        }
    } catch (error) {
        console.error("Failed to connect to Redis", error);
    }
}

startWorker();  