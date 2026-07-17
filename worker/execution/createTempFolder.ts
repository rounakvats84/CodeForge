import fs from "fs/promises";
import path from "path";

export async function createTempFolder(): Promise<string> {

    const folderName = Date.now().toString();

    const tempDir = path.join("temp", folderName);

    await fs.mkdir(tempDir, {
        recursive: true
    });

    return tempDir;

}