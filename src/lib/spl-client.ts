import { PublicKey, Transaction } from '@solana/web3.js';
import { getAccount, createTransferInstruction, getAssociatedTokenAddress } from '@solana/spl-token';
import { connection } from './solana-client';
import { getPublicEnv } from '@/config/environment';

const env = getPublicEnv();

export const GALACTIC_CREDITS_MINT = new PublicKey(env.GALACTIC_CREDITS_MINT_ADDRESS);
export const TREASURY_WALLET = new PublicKey(env.TREASURY_PUBLIC_KEY);

export async function getSplBalance(
    ownerPublicKey: PublicKey,
    mintPublicKey: PublicKey = GALACTIC_CREDITS_MINT
): Promise<number> {
    try {
        const associatedTokenAccountAddress = await getAssociatedTokenAddress(
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

export async function createTreasuryTransferTransaction(
    payerPublicKey: PublicKey,
    tokenAmount: number
): Promise<Transaction | null> {
    try {
        const sourceTokenAccount = await getAssociatedTokenAddress(
            GALACTIC_CREDITS_MINT,
            payerPublicKey,
            true
        );

        const destinationTokenAccount = await getAssociatedTokenAddress(
            GALACTIC_CREDITS_MINT,
            TREASURY_WALLET,
            true
        );

        const transaction = new Transaction();

        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.lastValidBlockHeight = lastValidBlockHeight;
        transaction.feePayer = payerPublicKey;

        transaction.add(
            createTransferInstruction(
                sourceTokenAccount,
                destinationTokenAccount,
                payerPublicKey,
                BigInt(tokenAmount.toString())
            )
        );

        return transaction;
    } catch (error) {
        console.error("Error creating treasury transfer transaction:", error);
        return null;
    }
}