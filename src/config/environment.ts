import { z } from 'zod';

const serverEnvSchema = z.object({
    CIVIC_CLIENT_ID: z.string().min(1),
    REDIS_URL: z.string().min(1),
    SOLANA_RPC_URL: z.string().url(),
    MINTER_PRIVATE_KEY: z.string().min(1),
    REWARD_POOL_PRIVATE_KEY: z.string().min(1),
    TREASURY_PRIVATE_KEY: z.string().min(1),
});
export type ServerEnv = z.infer<typeof serverEnvSchema>;

const publicEnvSchema = z.object({
    SOLANA_RPC_URL: z.string({ message: "Please set the NEXT_PUBLIC_SOLANA_RPC_URL environment variable" })
        .url({ message: "NEXT_PUBLIC_SOLANA_RPC_URL must be a valid URL" }),
    GALACTIC_CREDITS_MINT_ADDRESS: z.string({ message: "Please set the NEXT_PUBLIC_GALACTIC_CREDITS_MINT_ADDRESS environment variable" })
        .min(1, { message: "NEXT_PUBLIC_GALACTIC_CREDITS_MINT_ADDRESS must be at least 1 character" }),
    TREASURY_PUBLIC_KEY: z.string({ message: "Please set the NEXT_PUBLIC_TREASURY_PUBLIC_KEY environment variable" })
        .min(1, { message: "NEXT_PUBLIC_TREASURY_PUBLIC_KEY must be at least 1 character" }),
});
export type PublicEnv = z.infer<typeof publicEnvSchema>;


let validatedServerEnv: ServerEnv | null = null;
let validatedPublicEnv: PublicEnv | null = null;

/**
 * Retrieves and validates SERVER-ONLY environment variables.
 * To be called ONLY from server-side code (API routes, getServerSideProps).
 */
export function getServerEnv(): ServerEnv {
    if (validatedServerEnv) return validatedServerEnv;

    const result = serverEnvSchema.safeParse({
        CIVIC_CLIENT_ID: process.env.CIVIC_CLIENT_ID,
        REDIS_URL: process.env.REDIS_URL,
        SOLANA_RPC_URL: process.env.SOLANA_RPC_URL || process.env.NEXT_PUBLIC_SOLANA_RPC_URL,
        MINTER_PRIVATE_KEY: process.env.MINTER_PRIVATE_KEY,
        REWARD_POOL_PRIVATE_KEY: process.env.REWARD_POOL_PRIVATE_KEY,
        TREASURY_PRIVATE_KEY: process.env.TREASURY_PRIVATE_KEY,
    });

    if (!result.success) {
        console.error("❌ Invalid SERVER environment variables:", result.error.flatten().fieldErrors);
        throw new Error("Invalid server environment variables.");
    }

    return result.data;
}

/**
 * Retrieves and validates PUBLIC (NEXT_PUBLIC_) environment variables.
 * Can be called from client or server.
 */
export function getPublicEnv(): PublicEnv {
    if (validatedPublicEnv) return validatedPublicEnv;

    const result = publicEnvSchema.safeParse({
        SOLANA_RPC_URL: process.env.NEXT_PUBLIC_SOLANA_RPC_URL,
        GALACTIC_CREDITS_MINT_ADDRESS: process.env.NEXT_PUBLIC_GALACTIC_CREDITS_MINT_ADDRESS,
        TREASURY_PUBLIC_KEY: process.env.NEXT_PUBLIC_TREASURY_PUBLIC_KEY,
    });

    if (!result.success) {
        console.error("❌ Invalid PUBLIC environment variables:", result.error.flatten().fieldErrors);
        throw new Error("Invalid public environment variables. Ensure NEXT_PUBLIC_ prefixes are correct and vars are set.");
    }

    return result.data;
}