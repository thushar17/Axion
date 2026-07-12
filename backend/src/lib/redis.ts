import {createClient} from 'redis'

export const pubClient = createClient({
    url: "redis://localhost:6379"
})

export const subClient = pubClient.duplicate();

export async function connectRedis() {
    await pubClient.connect();
    await subClient.connect();

    console.log("✅ Redis Connected");
}