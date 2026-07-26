import { spawn } from "child_process";

export async function destroyContainer(
    containerName: string
): Promise<void> {

    return new Promise((resolve, reject) => {

        const docker = spawn("docker", [
            "rm",
            "-f",
            containerName
        ]);

        let stderr = "";

        docker.stderr.on("data", data => {
            stderr += data.toString();
        });

        docker.on("close", code => {

            if (code === 0) {

                resolve();

            } else {

                reject(new Error(stderr));

            }

        });

    });

}