"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cppRunner = exports.executableFile = exports.sourceFile = void 0;
exports.compileCpp = compileCpp;
exports.executeCpp = executeCpp;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
exports.sourceFile = "main.cpp";
exports.executableFile = "main.exe";
const twoSum_1 = require("../templates/twoSum");
async function compileCpp(tempDir) {
    return new Promise((resolve, reject) => {
        const compiler = (0, child_process_1.spawn)("g++", [
            exports.sourceFile,
            "-o",
            exports.executableFile
        ], {
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
async function executeCpp(tempDir) {
    return new Promise((resolve, reject) => {
        const executablePath = path_1.default.join(tempDir, exports.executableFile);
        const program = (0, child_process_1.spawn)(executablePath);
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
exports.cppRunner = {
    sourceFile: exports.sourceFile,
    generateSourceCode: twoSum_1.generateCppTwoSum,
    compile: compileCpp,
    execute: executeCpp
};
//# sourceMappingURL=cpp.js.map