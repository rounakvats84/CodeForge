import fs from "fs/promises";
import path from "path";

export async function writeSourceCode(
    tempDir: string,
    sourceFile: string,
    generatedCode: string
): Promise<string>{

    const filePath=path.join(tempDir,sourceFile);

    await fs.writeFile(
        filePath,
        generatedCode,
        "utf8"
    );

    return filePath;

}