"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pythonRunner = exports.sourceFile = void 0;
exports.compilePython = compilePython;
exports.executePython = executePython;
const child_process_1 = require("child_process");
exports.sourceFile = "main.py";
const twoSum_1 = require("../templates/twoSum");
async function compilePython() {
    // Python is interpreted.
    return;
}
async function executePython(tempDir) {
    return new Promise((resolve, reject) => {
        const program = (0, child_process_1.spawn)("python", [exports.sourceFile], {
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
exports.pythonRunner = {
    sourceFile: exports.sourceFile,
    generateSourceCode: twoSum_1.generatePythonTwoSum,
    compile: compilePython,
    execute: executePython
};
//# sourceMappingURL=python.js.map