import path from "path";
import { dockerExec } from "../execution/dockerExec";
import { Runner } from "../types/Runner";

export const sourceFile = "main.py";

export async function compilePython(tempDir: string, containerName: string): Promise<void> {
    return;
}

export async function executePython(tempDir: string, containerName: string): Promise<string> {
    const folderName = path.basename(tempDir);
    return dockerExec(containerName, ["python3", `/workspace/temp/${folderName}/${sourceFile}`]);
}

export function generatePython(code: string, testCase: any, template: string): string {
    let finalCode = template.replace("{{USER_CODE}}", code);
    for (const key of Object.keys(testCase)) {
        let val = testCase[key];
        if (Array.isArray(val)) val = val.join(",");
        finalCode = finalCode.split(`{{${key}}}`).join(String(val));
    }
    return finalCode;
}

export const pythonRunner: Runner = {
    sourceFile,
    generateSourceCode: generatePython,
    compile: compilePython,
    execute: executePython
};