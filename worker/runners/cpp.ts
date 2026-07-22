import path from "path";

import { dockerExec } from "../execution/dockerExec";
import { generateCppTwoSum } from "../templates/twoSum";
import { Runner } from "../types/Runner";

export const sourceFile = "main.cpp";
export const executableFile = "main";

export async function compileCpp(
    tempDir: string,
    containerName: string
): Promise<void> {

    const folderName = path.basename(tempDir);

    await dockerExec(containerName, [
        "g++",
        `/workspace/temp/${folderName}/${sourceFile}`,
        "-o",
        `/workspace/temp/${folderName}/${executableFile}`
    ]);

}

export async function executeCpp(
    tempDir: string,
    containerName: string
): Promise<string> {

    const folderName = path.basename(tempDir);

    return dockerExec(containerName, [
        `/workspace/temp/${folderName}/${executableFile}`
    ]);

}

export const cppRunner: Runner = {

    sourceFile,

    generateSourceCode: generateCppTwoSum,

    compile: compileCpp,

    execute: executeCpp

};