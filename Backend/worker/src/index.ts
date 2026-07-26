import { connectRedis } from "./config/redis";
import redis from "./config/redis";
import { judgeSubmission } from "./services/judge.service";

async function startWorker() {
    try {
        await connectRedis();

        while (true) {
            try {
                // Ensure we are listening to the exact same queue name used in the API
                const submission = await redis.brPop("submissionQueue", 0);

                if (!submission) {
                    continue;
                }

                await judgeSubmission(submission.element);

            } catch (error) {
                console.error("Error processing submission payload:", error);
            }
        }
    } catch (error) {
        console.error("Failed to start worker system:", error);
        process.exit(1);
    }
}

startWorker();