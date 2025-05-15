import { NextResponse } from 'next/server';
import { getUser } from '@civic/auth-web3/nextjs';
import { PublicKey } from '@solana/web3.js';
import { mintBlueprintNft } from '@/lib/metaplex-server';
import { minterKeypair as serverMinterKeypair } from '@/lib/solana-server'; 
import { getRedisClient } from '@/lib/redis';
import { blueprintDefinitionRepository } from '@/repositories/blueprint-definition-repository';

const BLUEPRINT_MINT_EXPIRY_SECONDS = 60 * 60 * 24 * 365 * 2; // 2 years

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { blueprintId, transactionSignature } = body;
        
        if (!blueprintId) {
            return NextResponse.json({ error: 'Missing blueprintId in request' }, { status: 400 });
        }

        const user = await getUser();
        if (!user || !user.id) {
            return NextResponse.json({ error: 'Unauthorized: No active user session' }, { status: 401 });
        }

        const userSolWalletAddressString = (user as any).solana.address;
        if (!userSolWalletAddressString) {
            return NextResponse.json({
                error: 'User authenticated, but no Solana wallet found in session. Ensure wallet is created.',
            }, { status: 400 });
        }
        
        const recipientPublicKey = new PublicKey(userSolWalletAddressString);

        // TODO: Verify transaction signature
        if (!transactionSignature) {
            return NextResponse.json({ error: 'Missing transaction signature' }, { status: 400 });
        }

        const blueprintDefinition = await blueprintDefinitionRepository.getById(blueprintId);
        if (!blueprintDefinition) {
            return NextResponse.json({ error: 'Blueprint not found' }, { status: 404 });
        }

        const redis = getRedisClient();
        const mintedFlagKey = `user:${user.id}:blueprintMinted:${blueprintId}`;
        const alreadyMinted = await redis.get(mintedFlagKey);

        if (alreadyMinted === 'true') {
            console.log(`User ${user.id} already has blueprint: ${blueprintId}`);
            return NextResponse.json({ 
                message: 'Blueprint already owned by this user.',
                alreadyMinted: true 
            }, { status: 200 });
        }

        console.log(`Minting blueprint ${blueprintId} to user ${user.id} (${recipientPublicKey.toBase58()})`);

        // Mint the NFT
        const nftSymbol = "ASTROBP";

        const { mintAddress, signature } = await mintBlueprintNft({
            recipientPublicKey,
            blueprintDefinition: blueprintDefinition,
            symbol: nftSymbol,
            minterKeypair: serverMinterKeypair,
        });

        await redis.set(mintedFlagKey, 'true', 'EX', BLUEPRINT_MINT_EXPIRY_SECONDS);
        console.log(`Blueprint ${blueprintId} minted for user ${user.id}. Mint: ${mintAddress.toBase58()}, Sig: ${signature}`);

        return NextResponse.json({
            message: 'Blueprint minted successfully!',
            mintAddress: mintAddress.toBase58(),
            signature: signature,
            blueprintId: blueprintId,
            alreadyMinted: false,
        });

    } catch (error: any) {
        console.error('Error minting blueprint via API:', error);
        return NextResponse.json({ 
            error: 'Failed to mint blueprint', 
            details: error.message || error.toString() 
        }, { status: 500 });
    }
} 