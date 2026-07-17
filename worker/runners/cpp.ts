import { spawn } from "child_process";
import path from "path";

export const sourceFile = "main.cpp";
export const executableFile = "main.exe";

import { generateCppTwoSum } from "../templates/twoSum";

export async function compileCpp(tempDir: string): Promise<void> {

    return new Promise((resolve, reject) => {

        const compiler = spawn(
            "g++",
            [
                sourceFile,
                "-o",
                executableFile
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

export async function executeCpp(tempDir: string): Promise<string> {

    return new Promise((resolve, reject) => {

        const executablePath = path.join(
            tempDir,
            executableFile
        );

        const program = spawn(executablePath);

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

export const cppRunner: Runner = {

    sourceFile,

    generateSourceCode: generateCppTwoSum,

    compile: compileCpp,

    execute: executeCpp

};