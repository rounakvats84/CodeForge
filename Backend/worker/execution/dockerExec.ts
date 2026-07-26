import { spawn } from "child_process";

export async function dockerExec(
    containerName: string,
    command: string[],
    timeoutMs: number = 3000 // Standard 3-second time limit
): Promise<string> {

    return new Promise((resolve, reject) => {
        const docker = spawn("docker", [
            "exec",
            containerName,
            ...command
        ]);

        let stdout = "";
        let stderr = "";

        // 1. Start a countdown timer
        const timeout = setTimeout(() => {
            docker.kill(); // Kill the execution process
            reject(new Error("TIME_LIMIT_EXCEEDED"));
        }, timeoutMs);

        docker.stdout.on("data", data => {
            stdout += data.toString();
        });

        docker.stderr.on("data", data => {
            stderr += data.toString();
        });

        docker.on("close", code => {
            // 2. If the code finishes in time, clear the timer
            clearTimeout(timeout); 

            if (code === 0) {
                resolve(stdout.trim());
            } else {
                // If it fails for other reasons (e.g., memory out of bounds)
                reject(new Error(stderr || "Execution failed"));
            }
        });
    });
}