import { Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import bs58 from 'bs58';
import { getServerEnv } from '@/config/environment';
import { User } from '@civic/auth-web3';

const env = getServerEnv();

const rpcUrl = env.SOLANA_RPC_URL;
export const connection = new Connection(rpcUrl, 'confirmed');


function loadKeypairFromEnv(keyName: string, envValue: string): Keypair {
    try {
        if (envValue.startsWith('[') && envValue.endsWith(']')) {
            const secretKey = Uint8Array.from(JSON.parse(envValue));
            return Keypair.fromSecretKey(secretKey);
        }
        const secretKey = bs58.decode(envValue);
        return Keypair.fromSecretKey(secretKey);
    } catch (error) {
        console.error(`Failed to parse private key for ${keyName}:`, error);
        throw new Error(`Invalid format for private key ${keyName}.`);
    }
}

export const minterKeypair = loadKeypairFromEnv('MINTER_PRIVATE_KEY', env.MINTER_PRIVATE_KEY);
export const rewardPoolKeypair = loadKeypairFromEnv('REWARD_POOL_PRIVATE_KEY', env.REWARD_POOL_PRIVATE_KEY);
export const treasuryKeypair = loadKeypairFromEnv('TREASURY_PRIVATE_KEY', env.TREASURY_PRIVATE_KEY);

export function getUserSolanaWalletAddress(user: User): string | null {
    return (user as unknown as { solana: { address: string } }).solana.address || null;
}

export async function sendServerSignedTransaction(
    transaction: Transaction,
    payer: Keypair,
    signers: Keypair[] = []
): Promise<string> {
    try {
        if (!transaction.recentBlockhash) {
            const { blockhash } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
        }
        if (!transaction.feePayer) {
            transaction.feePayer = payer.publicKey;
        }
        const signature = await sendAndConfirmTransaction(connection, transaction, [payer, ...signers], {
            commitment: 'confirmed',
            skipPreflight: false,
        });
        console.log(`Transaction successful with signature: ${signature}`);
        return signature;
    } catch (error) {
        console.error("Error sending server-signed transaction:", error);
        if (error instanceof Error && 'logs' in error) {
            console.error("Transaction Logs:", error.logs);
        }
        throw error;
    }
}

export function safePublicKey(key: string | undefined | null): PublicKey | null {
    try {
        return key ? new PublicKey(key) : null;
    } catch {
        return null;
    }
}