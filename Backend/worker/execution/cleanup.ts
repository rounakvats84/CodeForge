import fs from "fs/promises";
import path from "path";

export async function cleanup(tempDir: string): Promise<void> {
    await fs.rm(tempDir, {
        recursive: true,
        force: true
    });

}