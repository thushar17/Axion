import IORedis from "ioredis";
export const bullConnection = new IORedis.Redis({
    host: "localhost",
    port: 6379,
});
//# sourceMappingURL=bullmq.js.map