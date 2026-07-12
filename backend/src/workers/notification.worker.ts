import { Worker } from "bullmq";
import { bullConnection } from "../lib/bullmq.js";

export const notificationWorker = new Worker(
    "notification",
    async(job)=> {
        console.log(job.data)
    },
    {
        connection: bullConnection as any
    }
)
