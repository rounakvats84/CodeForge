import { createClient } from "redis";
const client = createClient();
import fs from "fs/promises";
import path from "path";

const SOURCE_FILE = "main.cpp";
const EXECUTABLE_FILE = "main.exe";

import { spawn } from "child_process";

interface TestCase{
    nums:number[];
    target:number;
    expectedOutput:string;
}

async function processSubmission(submission: string) {

    const { code, language, problemId } = JSON.parse(submission);

    const testCases = [
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

            const { expectedOutput } = testCase;

            await writeSourceCode(tempDir, code, testCase);

            await compileCpp(tempDir);

            const output = await executeCpp(tempDir);

            if(output.trim()===expectedOutput.trim()){
                console.log("Output of ",testCase," is ",output);
            }
            else{
                console.log("Wrong answer on testcase: ",testCase,"\n expected output: ",expectedOutput,"\n but got: ",output);
                return;
            }
        }
        console.log("Accepted!")
    }
    
    catch(error){

        console.error(error);

    }
    finally{

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

// to create a temporary folder for each submission something like temp/1234567890 where 1234567890 is the timestamp
async function createTempFolder(): Promise<string> {
    const folderName = Date.now().toString();
    const tempDir = path.join("temp", folderName);
    await fs.mkdir(tempDir, { recursive: true });
    return tempDir;
}

// to add main.cpp file in the temp folder with the code from the submission
async function writeSourceCode(tempDir: string, code: string, testCase: TestCase): Promise<string> {
    const generatedCode = `
#include<bits/stdc++.h>

using namespace std;

${code}

int main(){

    vector<int> nums={${testCase.nums.join(",")}};

    int target=${testCase.target};

    Solution obj;

    vector<int> ans=obj.twoSum(nums,target);

    for(int x:ans)
        cout<<x<<" ";

}
`;
    const filePath = path.join(tempDir, SOURCE_FILE);
    await fs.writeFile(filePath ,generatedCode ,"utf8");
    return filePath;
}

// to compile the main.cpp file in the temp folder and create an executable file
async function compileCpp(tempDir: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const compiler = spawn(
            "g++",
            [
                SOURCE_FILE,
                "-o",
                EXECUTABLE_FILE
            ],
            {
                cwd: tempDir
            }
        );
        let compileError = "";
        compiler.stderr.on("data", (data: Buffer) => {
            compileError += data.toString();
        });
        compiler.on("close", (exitCode) => {
            if (exitCode === 0) {
                resolve();
            } else {
                reject(
                    new Error(
                        compileError || "Compilation Failed"
                    )
                );
            }
        });

    });

}

// to execute the executable file in the temp folder and return the output
async function executeCpp(tempDir: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const executablePath = path.join(tempDir, EXECUTABLE_FILE);
        const program = spawn(executablePath);

        let output = "";
        let runtimeError = "";

        const timeout = setTimeout(() => {
            program.kill();
            reject(new Error("Time Limit Exceeded"));
        }, 2000);

        program.stdout.on("data", (data: Buffer) => {
            output += data.toString();
        });
        program.stderr.on("data", (data: Buffer) => {
            runtimeError += data.toString();
        });
        program.on("close", (exitCode) => {
            clearTimeout(timeout);
            if (exitCode === 0) {
                resolve(output);
            } else {
                reject(
                    new Error(
                        runtimeError || "Runtime Error"
                    )
                );
            }
        });
    });

}
// to cleanup the temp folder after the submission is processed
async function cleanup(tempDir: string): Promise<void> {
    await fs.rm(tempDir, {
        recursive: true,
        force: true
    });

}
startWorker();  