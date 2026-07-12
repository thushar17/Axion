import { Queue } from "bullmq";
import { bullConnection } from "../lib/bullmq.js";
export const notificationQueue = new Queue("notification", {
    connection: bullConnection
});
//# sourceMappingURL=notification.queue.js.map