import { spawn } from "child_process";

export const sourceFile = "main.py";

import { generatePythonTwoSum } from "../templates/twoSum";

export async function compilePython(): Promise<void> {

    // Python is interpreted.
    return;

}

export async function executePython(tempDir: string): Promise<string> {

    return new Promise((resolve, reject) => {

        const program = spawn(
            "python",
            [sourceFile],
            {
                cwd: tempDir
            }
        );

        let output = "";
        let runtimeError = "";

        const timeout = setTimeout(() => {

            program.kill();

            reject(
                new Error("Time Limit Exceeded")
            );

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

import { Runner } from "../types/Runner";

export const pythonRunner: Runner = {

    sourceFile,

    generateSourceCode: generatePythonTwoSum,

    compile: compilePython,

    execute: executePython

};