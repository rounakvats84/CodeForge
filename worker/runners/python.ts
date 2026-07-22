import path from "path";

import { dockerExec } from "../execution/dockerExec";
import { generatePythonTwoSum } from "../templates/twoSum";
import { Runner } from "../types/Runner";

export const sourceFile = "main.py";

export async function compilePython(
    tempDir: string,
    containerName: string
): Promise<void> {

    return;

}

export async function executePython(
    tempDir: string,
    containerName: string
): Promise<string> {

    const folderName = path.basename(tempDir);

    return dockerExec(containerName, [
        "python3",
        `/workspace/temp/${folderName}/${sourceFile}`
    ]);

}

export const pythonRunner: Runner = {

    sourceFile,

    generateSourceCode: generatePythonTwoSum,

    compile: compilePython,

    execute: executePython

};