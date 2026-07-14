import IORedis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

export const bullConnection = process.env.REDIS_URL
    ? new IORedis.Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: null,
      })
    : new IORedis.Redis({
        host: "localhost",
        port: 6379,
        maxRetriesPerRequest: null,
      });