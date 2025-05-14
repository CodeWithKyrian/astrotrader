// src/app/api/trade/execute-sell/route.ts
import { NextResponse } from 'next/server';
import { getUser } from '@civic/auth-web3/nextjs';
import { PublicKey } from '@solana/web3.js';
import { transferSplFromServerPool, GALACTIC_CREDITS_MINT } from '@/lib/spl-server';
import { minterKeypair, treasuryKeypair, rewardPoolKeypair } from '@/lib/solana-server'; // Minter for fees, Treasury/RewardPool as source of funds
import { PLANETS_DATA, COMMODITIES_DATA } from '@/store/gameStore'; // To verify price, etc.

interface ExecuteSellRequestBody {
    commodityId: string;
    quantity: number;
    planetId: string;
    // userPublicKeyString: string; // No longer needed if getUser provides solWalletAddress
}

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

        const body: ExecuteSellRequestBody = await request.json();
        const { commodityId, quantity, planetId } = body;

        if (!commodityId || !Number.isInteger(quantity) || quantity <= 0 || !planetId) {
            return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 });
        }

        // --- Game Logic Verification ---
        const planet = PLANETS_DATA.find(p => p.id === planetId);
        if (!planet) {
            return NextResponse.json({ error: 'Invalid planet ID' }, { status: 400 });
        }

        const commodityMarketInfo = planet.commodities.find(c => c.commodityId === commodityId);
        if (!commodityMarketInfo || !commodityMarketInfo.sellPrice) { // Planet must BUY this commodity (user SELLS to planet)
            return NextResponse.json({ error: 'Commodity not bought at this planet or no sell price' }, { status: 400 });
        }

        const commodityDetails = COMMODITIES_DATA.find(c => c.id === commodityId);
        if (!commodityDetails) {
            return NextResponse.json({ error: 'Invalid commodity ID' }, { status: 400 });
        }

        const pricePerUnit = commodityMarketInfo.sellPrice;
        const totalPayoutLamports = BigInt(Math.round(quantity * pricePerUnit * Math.pow(10, 6))); // 6 decimals

        console.log(`Processing sell: User ${userPublicKey.toBase58()} sells ${quantity} of ${commodityId} at ${planetId} for ${pricePerUnit} GC each.`);
        console.log(`Total payout: ${Number(totalPayoutLamports) / Math.pow(10,6)} GC`);

        // For MVP, let's assume Treasury pays the user.
        const signature = await transferSplFromServerPool(
            minterKeypair,          // Wallet to pay transaction fees
            treasuryKeypair,        // Source of funds (Treasury's GC ATA)
            userPublicKey,          // Recipient
            totalPayoutLamports,
            GALACTIC_CREDITS_MINT,
            `Sale of ${quantity} ${commodityDetails.name} at ${planet.name}`
        );

        console.log(`Sell transaction successful. Payout signature: ${signature}`);

        return NextResponse.json({
            message: `Successfully sold ${quantity} ${commodityDetails.name}!`,
            signature,
            creditsAwarded: Number(totalPayoutLamports) / Math.pow(10,6),
        });

    } catch (error: any) {
        console.error('Error executing sell trade:', error);
        let errorDetails = error.message || error.toString();
        if(error.logs) {
            console.error("Solana Logs:", error.logs);
        }
        return NextResponse.json({ error: 'Failed to execute sell trade', details: errorDetails }, { status: 500 });
    }
}