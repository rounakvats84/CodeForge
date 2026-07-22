import { spawn } from "child_process";
import path from "path";

export async function createContainer(): Promise<string> {

    const hostTempPath = path.resolve("temp");

    return new Promise((resolve, reject) => {

        const containerName = `codeforge-${Date.now()}`;

        const docker = spawn("docker", [
            "run",
            "-dit",

            "--name",
            containerName,

            "--memory=256m",
            "--cpus=1",

            "-v",
            `${hostTempPath}:/workspace/temp`,

            "-w",
            "/workspace",

            "lc-worker",

            "bash"
        ]);

        let stderr = "";

        docker.stderr.on("data", data => {
            stderr += data.toString();
        });

        docker.on("close", code => {

            if (code === 0) {
                resolve(containerName);
            } else {
                reject(new Error(stderr));
            }

        });

    });
}