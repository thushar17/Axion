import IORedis from "ioredis";
export const bullConnection = new IORedis.Redis({
    host: "localhost",
    port: 6379,
    maxRetriesPerRequest: null,
});
//# sourceMappingURL=bullmq.js.map