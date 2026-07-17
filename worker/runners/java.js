"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.javaRunner = exports.sourceFile = void 0;
exports.compileJava = compileJava;
exports.executeJava = executeJava;
const child_process_1 = require("child_process");
exports.sourceFile = "Main.java";
const twoSum_1 = require("../templates/twoSum");
async function compileJava(tempDir) {
    return new Promise((resolve, reject) => {
        const compiler = (0, child_process_1.spawn)("javac", [exports.sourceFile], {
            cwd: tempDir
        });
        let compileError = "";
        compiler.stderr.on("data", (data) => {
            compileError += data.toString();
        });
        compiler.on("close", (exitCode) => {
            if (exitCode === 0) {
                resolve();
            }
            else {
                reject(new Error(compileError || "Compilation Failed"));
            }
        });
    });
}
async function executeJava(tempDir) {
    return new Promise((resolve, reject) => {
        const program = (0, child_process_1.spawn)("java", ["Main"], {
            cwd: tempDir
        });
        let output = "";
        let runtimeError = "";
        const timeout = setTimeout(() => {
            program.kill();
            reject(new Error("Time Limit Exceeded"));
        }, 2000);
        program.stdout.on("data", (data) => {
            output += data.toString();
        });
        program.stderr.on("data", (data) => {
            runtimeError += data.toString();
        });
        program.on("close", (exitCode) => {
            clearTimeout(timeout);
            if (exitCode === 0) {
                resolve(output);
            }
            else {
                reject(new Error(runtimeError || "Runtime Error"));
            }
        });
    });
}
exports.javaRunner = {
    sourceFile: exports.sourceFile,
    generateSourceCode: twoSum_1.generateJavaTwoSum,
    compile: compileJava,
    execute: executeJava
};
//# sourceMappingURL=java.js.map