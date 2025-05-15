import {
    PublicKey,
    Keypair,
    Transaction,
    SystemProgram,
} from '@solana/web3.js';
import {
    getOrCreateAssociatedTokenAccount,
    createTransferInstruction,
    getAssociatedTokenAddressSync,
    getAccount,
} from '@solana/spl-token';
import { connection, sendServerSignedTransaction } from './solana-server';
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
            console.log(`Server: Token account not found for ${ownerPublicKey.toBase58()}. Balance 0.`);
        } else {
            console.error('Server: Error fetching SPL balance:', error);
        }
        return 0;
    }
}


export async function transferSplFromServerPool(
    feePayerKeypair: Keypair,    // e.g., minterKeypair to pay fees
    sourceOwnerKeypair: Keypair, // e.g., rewardPoolKeypair, owns the source ATA
    recipientPublicKey: PublicKey,
    amountLamports: bigint,
    mintPublicKey: PublicKey = GALACTIC_CREDITS_MINT,
    memo?: string
): Promise<string> {
    const sourceAta = await getOrCreateAssociatedTokenAccount(
        connection,
        feePayerKeypair,
        mintPublicKey,
        sourceOwnerKeypair.publicKey,
        true
    );

    const recipientAta = await getOrCreateAssociatedTokenAccount(
        connection,
        feePayerKeypair,
        mintPublicKey,
        recipientPublicKey,
        true
    );

    const transaction = new Transaction().add(
        createTransferInstruction(
            sourceAta.address,
            recipientAta.address,
            sourceOwnerKeypair.publicKey,
            amountLamports
        )
    );

    if (memo) {
        transaction.add(
            SystemProgram.transfer({ // This is a trick to add a memo; it's a 0 SOL transfer to self
                fromPubkey: feePayerKeypair.publicKey,
                toPubkey: feePayerKeypair.publicKey,
                lamports: 0,
            }),
        );
        console.log("Memo for server transfer:", memo);
    }

    return sendServerSignedTransaction(transaction, feePayerKeypair, [sourceOwnerKeypair]);
}