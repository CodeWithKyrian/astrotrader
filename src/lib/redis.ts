import Redis from 'ioredis';
import { getServerEnv } from '@/config/environment';

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
    if (redisClient) {
        return redisClient;
    }

    const env = getServerEnv();
    if (!env.REDIS_URL) {
        throw new Error("REDIS_URL is not configured in environment variables.");
    }

    redisClient = new Redis(env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
    });

    redisClient.on('connect', () => {
        console.log('✅ Successfully connected to Redis');
    });

    redisClient.on('ready', () => {
        console.log('✅ Redis client is ready');
    });

    redisClient.on('error', (err) => {
        console.error('❌ Redis connection error:', err);
        redisClient = null;
    });

    return redisClient;
}

export async function closeRedisConnection(): Promise<void> {
    if (redisClient) {
        await redisClient.quit();
        redisClient = null;
        console.log('Redis connection closed.');
    }
}