import { spawn } from "child_process";

export async function dockerExec(
    containerName: string,
    command: string[]
): Promise<string> {

    return new Promise((resolve, reject) => {

        const docker = spawn("docker", [
            "exec",
            containerName,
            ...command
        ]);

        let stdout = "";
        let stderr = "";

        docker.stdout.on("data", data => {
            stdout += data.toString();
        });

        docker.stderr.on("data", data => {
            stderr += data.toString();
        });

        docker.on("close", code => {

            if (code === 0) {

                resolve(stdout.trim());

            } else {

                reject(new Error(stderr));

            }

        });

    });

}