import { spawn } from "child_process";

export const sourceFile = "Main.java";
import { generateJavaTwoSum } from "../templates/twoSum";

export async function compileJava(tempDir: string): Promise<void> {

    return new Promise((resolve, reject) => {

        const compiler = spawn(
            "javac",
            [sourceFile],
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

export async function executeJava(tempDir: string): Promise<string> {

    return new Promise((resolve, reject) => {

        const program = spawn(
            "java",
            ["Main"],
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

export const javaRunner: Runner = {

    sourceFile,

    generateSourceCode: generateJavaTwoSum,

    compile: compileJava,

    execute: executeJava

};