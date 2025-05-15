import { NextResponse } from 'next/server';
import { getUser } from '@civic/auth-web3/nextjs';
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { transferSplFromServerPool, GALACTIC_CREDITS_MINT, getSplBalance } from '@/lib/spl-server';
import { rewardPoolKeypair, minterKeypair, connection, sendServerSignedTransaction } from '@/lib/solana-server';
import { getRedisClient } from '@/lib/redis';
import type { UserData } from '@/types/models';

const INITIAL_CREDITS_AMOUNT_UI = 1000;
const INITIAL_CREDITS_LAMPORTS = BigInt(INITIAL_CREDITS_AMOUNT_UI * Math.pow(10, 6));
const INITIAL_SOL_LAMPORTS = BigInt(Math.floor(0.005 * LAMPORTS_PER_SOL)); // 0.005 SOL

export async function POST(request: Request) {
    try {
        const user = await getUser();
        if (!user || !user.id) {
            return NextResponse.json({ error: 'Unauthorized: No active user session' }, { status: 401 });
        }

        const userSolWalletAddressString = (user as any).solana.address;

        if (!userSolWalletAddressString) {
            return NextResponse.json({
                error: 'User authenticated, but no Solana wallet address found in session. Ensure wallet is created.',
            }, { status: 400 });
        }

        const userPublicKey = new PublicKey(userSolWalletAddressString);

        const redis = getRedisClient();
        const userDataKey = `user:${user.id}:userData`;
        const savedDataString = await redis.get(userDataKey);

        if (!savedDataString) {
            return NextResponse.json({ error: 'User data not found' }, { status: 400 });
        }

        const userData: UserData = JSON.parse(savedDataString);

        if (userData.hasClaimedInitialCredits) {
            const currentBalance = await getSplBalance(userPublicKey, GALACTIC_CREDITS_MINT);
            
            return NextResponse.json({
                message: 'Initial credits already claimed.',
                alreadyClaimed: true,
                currentBalance,
            }, { status: 200 });
        }

        console.log(`Attempting to send initial ${INITIAL_CREDITS_AMOUNT_UI} GC to ${userPublicKey.toBase58()}`);

        const signature = await transferSplFromServerPool(
            minterKeypair,
            rewardPoolKeypair,
            userPublicKey,
            INITIAL_CREDITS_LAMPORTS,
            GALACTIC_CREDITS_MINT,
            `Initial ${INITIAL_CREDITS_AMOUNT_UI} AstroTrader Galactic Credits for user ${user.id}`
        );

        userData.hasClaimedInitialCredits = true;
        userData.lastSaved = Date.now();
        await redis.set(userDataKey, JSON.stringify(userData));

        console.log(`Initial credits sent. Signature: ${signature}`);

        const solTransferTx = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: minterKeypair.publicKey,
                toPubkey: userPublicKey,
                lamports: INITIAL_SOL_LAMPORTS,
            })
        );

        const solTransferSignature = await sendServerSignedTransaction(solTransferTx, minterKeypair, [minterKeypair]);

        console.log(`Sent initial SOL for gas to ${userPublicKey.toBase58()}. Signature: ${solTransferSignature}`);

        return NextResponse.json({
            message: 'Initial credits claimed successfully!',
            signature,
            amount: INITIAL_CREDITS_AMOUNT_UI,
            alreadyClaimed: false,
        });

    } catch (error: any) {
        console.error('Error claiming initial credits:', error);
        return NextResponse.json({ error: 'Failed to claim initial credits', details: error.message }, { status: 500 });
    }
}