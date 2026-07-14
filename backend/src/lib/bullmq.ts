import IORedis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisUrl = process.env.REDIS_URL;
if (redisUrl) {
    console.log(`BullMQ connecting to Redis using REDIS_URL (starts with: ${redisUrl.substring(0, 10)}...)`);
} else {
    console.log("⚠️ BullMQ REDIS_URL is not defined in environment variables, falling back to localhost:6379");
}

export const bullConnection = redisUrl
    ? new IORedis.Redis(redisUrl, {
        maxRetriesPerRequest: null,
      })
    : new IORedis.Redis({
        host: "localhost",
        port: 6379,
        maxRetriesPerRequest: null,
      });