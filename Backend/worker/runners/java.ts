import path from "path";
import { dockerExec } from "../execution/dockerExec";
import { Runner } from "../types/Runner";

export const sourceFile = "Main.java";

export async function compileJava(tempDir: string, containerName: string): Promise<void> {
    const folderName = path.basename(tempDir);
    await dockerExec(containerName, ["javac", `/workspace/temp/${folderName}/${sourceFile}`]);
}

export async function executeJava(tempDir: string, containerName: string): Promise<string> {
    const folderName = path.basename(tempDir);
    return dockerExec(containerName, ["java", "-cp", `/workspace/temp/${folderName}`, "Main"]);
}

export function generateJava(code: string, testCase: any, template: string): string {
    let finalCode = template.replace("{{USER_CODE}}", code);
    for (const key of Object.keys(testCase)) {
        let val = testCase[key];
        if (Array.isArray(val)) val = val.join(",");
        finalCode = finalCode.split(`{{${key}}}`).join(String(val));
    }
    return finalCode;
}

export const javaRunner: Runner = {
    sourceFile,
    generateSourceCode: generateJava,
    compile: compileJava,
    execute: executeJava
};