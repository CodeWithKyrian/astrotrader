import { NextResponse } from 'next/server';
import { getUser } from '@civic/auth-web3/nextjs';
import { PublicKey } from '@solana/web3.js';
import { minterKeypair as serverMinterKeypair } from '@/lib/solana-server'; 
import { getRedisClient } from '@/lib/redis';
import { getPublicEnv } from '@/config/environment';

const PLACEHOLDER_BLUEPRINT_ID_FOR_REDIS = "cargo_expansion_mk1_placeholder_v1";
const PLACEHOLDER_BLUEPRINT_EXPIRY_SECONDS = 60 * 60 * 24 * 365 * 2; // 2 years

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
        
        const recipientPublicKey = new PublicKey(userSolWalletAddressString);

        const redis = getRedisClient();
        const claimFlagKey = `user:${user.id}:blueprintAwarded:${PLACEHOLDER_BLUEPRINT_ID_FOR_REDIS}`;
        const alreadyAwarded = await redis.get(claimFlagKey);

        if (alreadyAwarded === 'true') {
            console.log(`User ${user.id} already awarded placeholder blueprint: ${PLACEHOLDER_BLUEPRINT_ID_FOR_REDIS}`);
            return NextResponse.json({ message: 'Placeholder blueprint already awarded to this user.' , alreadyAwarded: true }, { status: 200 });
        }

        console.log(`Awarding placeholder blueprint to user ${user.id} (${recipientPublicKey.toBase58()})`);

        const publicEnv = getPublicEnv();
        const nftName = "Expanded Cargo Bay Mk1 (P)";
        const nftSymbol = "ASTROBP";

        const { mintAddress, signature } = await mintPlaceholderBlueprintNft({
            recipientPublicKey,
            name: nftName,
            symbol: nftSymbol,
            minterKeypair: serverMinterKeypair,
        });

        await redis.set(claimFlagKey, 'true', 'EX', PLACEHOLDER_BLUEPRINT_EXPIRY_SECONDS);
        console.log(`Placeholder blueprint awarded for user ${user.id}. Mint: ${mintAddress.toBase58()}, Sig: ${signature}. Claim flag set.`);

        return NextResponse.json({
            message: 'Placeholder Blueprint awarded successfully!',
            mintAddress: mintAddress.toBase58(),
            signature,
            alreadyAwarded: false,
        });

    } catch (error: any) {
        console.error('Error awarding placeholder blueprint via API:', error);
        return NextResponse.json({ error: 'Failed to award blueprint', details: error.message || error.toString() }, { status: 500 });
    }
}