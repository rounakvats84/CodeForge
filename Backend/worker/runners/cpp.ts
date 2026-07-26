import path from "path";
import { dockerExec } from "../execution/dockerExec";
import { Runner } from "../types/Runner";

export const sourceFile = "main.cpp";
export const executableFile = "main";

export async function compileCpp(tempDir: string, containerName: string): Promise<void> {
    const folderName = path.basename(tempDir);
    await dockerExec(containerName, [
        "g++",
        `/workspace/temp/${folderName}/${sourceFile}`,
        "-o",
        `/workspace/temp/${folderName}/${executableFile}`
    ]);
}

export async function executeCpp(tempDir: string, containerName: string): Promise<string> {
    const folderName = path.basename(tempDir);
    return dockerExec(containerName, [`/workspace/temp/${folderName}/${executableFile}`]);
}

// GENERIC INTERPOLATOR
export function generateCpp(code: string, testCase: any, template: string): string {
    let finalCode = template.replace("{{USER_CODE}}", code);
    
    for (const key of Object.keys(testCase)) {
        let val = testCase[key];
        if (Array.isArray(val)) {
            val = val.join(",");
        }
        finalCode = finalCode.split(`{{${key}}}`).join(String(val));
    }
    
    return finalCode;
}

export const cppRunner: Runner = {
    sourceFile,
    generateSourceCode: generateCpp,
    compile: compileCpp,
    execute: executeCpp
};