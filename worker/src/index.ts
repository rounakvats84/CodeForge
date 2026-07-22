import { createClient } from "redis";
const client = createClient();

import { TestCase } from "../types/TestCase";

import { createTempFolder } from "../execution/createTempFolder";
import { cleanup } from "../execution/cleanup";
import { writeSourceCode } from "../execution/writeSourceCode";

import { createContainer } from "../execution/createContainer";
import { destroyContainer } from "../execution/destroyContainer";

import { runners } from "../runner-bundler/runners";

async function processSubmission(submission: string) {

    const { code, language } = JSON.parse(submission);

    console.log("\n================ NEW SUBMISSION ================");
    console.log("Language   :", language);

    const runner = runners[language as keyof typeof runners];

    if (!runner) {
        throw new Error("Unsupported Language");
    }

    console.log("\nRunner Selected:");
    console.log({
        sourceFile: runner.sourceFile
    });

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
    const containerName = await createContainer();

    console.log("\nDocker Container Created:");
    console.log(containerName);

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

            await runner.compile(
                tempDir,
                containerName
            );

            const output = (
                await runner.execute(
                    tempDir,
                    containerName
                )
            ).trim();

            console.log("Expected :", testCase.expectedOutput);
            console.log("Received :", output);

            if (output === testCase.expectedOutput.trim()) {

                console.log("✅ Test Passed");

            } else {

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

    } catch (error) {

        console.error("Submission failed:", error);

    } finally {

        console.log("\nCleaning Up...");

        try {

            await destroyContainer(containerName);
            console.log("Docker Container Removed.");

        } catch (error) {

            console.error("Failed to remove container:", error);

        }

        await cleanup(tempDir);

    }

}

async function startWorker() {

    try {

        await client.connect();
        console.log("Worker connected to Redis.");

        while (true) {

            try {

                const submission = await client.brPop(
                    "problems",
                    0
                );

                // @ts-ignore
                if (!submission) {
                    continue;
                }

                await processSubmission(submission.element);

            } catch (error) {

                console.error(
                    "Error processing submission:",
                    error
                );

            }

        }

    } catch (error) {

        console.error(
            "Failed to connect to Redis",
            error
        );

    }

}

startWorker();