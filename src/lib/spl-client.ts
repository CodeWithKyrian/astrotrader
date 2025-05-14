import { PublicKey } from '@solana/web3.js';
import { getAccount, getAssociatedTokenAddressSync } from '@solana/spl-token';
import { connection } from './solana-client';
import { getPublicEnv } from '@/config/environment';

const env = getPublicEnv();

export const GALACTIC_CREDITS_MINT = new PublicKey(env.GALACTIC_CREDITS_MINT_ADDRESS);

export async function getSplBalance(
    ownerPublicKey: PublicKey,
    mintPublicKey: PublicKey = GALACTIC_CREDITS_MINT
): Promise<number> {
    try {
        const associatedTokenAccountAddress = getAssociatedTokenAddressSync(
            mintPublicKey,
            ownerPublicKey,
            true
        );
        const accountInfo = await getAccount(connection, associatedTokenAccountAddress, 'confirmed');
        return Number(accountInfo.amount) / Math.pow(10, 6);
    } catch (error) {
        if (error instanceof Error && error.name === 'TokenAccountNotFoundError') {
            console.log(`Client: Token account not found for ${ownerPublicKey.toBase58()}. Balance 0.`);
        } else {
            console.error('Client: Error fetching SPL balance:', error);
        }
        return 0;
    }
}