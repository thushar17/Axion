import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();
const redisUrl = process.env.REDIS_URL;
if (redisUrl) {
    console.log(`Connecting to Redis using REDIS_URL (starts with: ${redisUrl.substring(0, 10)}...)`);
}
else {
    console.log("⚠️ REDIS_URL is not defined in environment variables, falling back to redis://localhost:6379");
}
export const pubClient = createClient({
    url: redisUrl || "redis://localhost:6379"
});
export const subClient = pubClient.duplicate();
export async function connectRedis() {
    await pubClient.connect();
    await subClient.connect();
    console.log("✅ Redis Connected");
}
//# sourceMappingURL=redis.js.map