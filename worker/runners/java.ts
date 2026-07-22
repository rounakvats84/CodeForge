import path from "path";

import { dockerExec } from "../execution/dockerExec";
import { generateJavaTwoSum } from "../templates/twoSum";
import { Runner } from "../types/Runner";

export const sourceFile = "Main.java";

export async function compileJava(
    tempDir: string,
    containerName: string
): Promise<void> {

    const folderName = path.basename(tempDir);

    await dockerExec(containerName, [
        "javac",
        `/workspace/temp/${folderName}/${sourceFile}`
    ]);

}

export async function executeJava(
    tempDir: string,
    containerName: string
): Promise<string> {

    const folderName = path.basename(tempDir);

    return dockerExec(containerName, [
        "java",
        "-cp",
        `/workspace/temp/${folderName}`,
        "Main"
    ]);

}

export const javaRunner: Runner = {

    sourceFile,

    generateSourceCode: generateJavaTwoSum,

    compile: compileJava,

    execute: executeJava

};