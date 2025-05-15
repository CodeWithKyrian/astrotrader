import { NextResponse } from 'next/server';
import { getUser } from '@civic/auth-web3/nextjs';
import { PublicKey } from '@solana/web3.js';
import { transferSplFromServerPool, GALACTIC_CREDITS_MINT } from '@/lib/spl-server';
import { getUserSolanaWalletAddress, minterKeypair, treasuryKeypair } from '@/lib/solana-server';
import { planetRepository } from '@/repositories/planet-repository';
import { commodityRepository } from '@/repositories/commodity-repository';
import { Planet, Commodity, PlanetMarketListing } from '@/types/models';

interface ExecuteSellRequestBody {
    commodityId: string;
    quantity: number;
    planetId: string;
}

export async function POST(request: Request) {
    try {
        const user = await getUser();
        if (!user || !user.id) {
            return NextResponse.json({ error: 'Unauthorized: No active user session' }, { status: 401 });
        }

        const userSolWalletAddress = getUserSolanaWalletAddress(user);

        if (!userSolWalletAddress) {
            return NextResponse.json({
                error: 'User authenticated, but no Solana wallet address found in session. Ensure wallet is created.',
            }, { status: 400 });
        }

        const userPublicKey = new PublicKey(userSolWalletAddress);

        const body: ExecuteSellRequestBody = await request.json();
        const { commodityId, quantity, planetId } = body;

        if (!commodityId || !Number.isInteger(quantity) || quantity <= 0 || !planetId) {
            return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 });
        }

        const planets = await planetRepository.getAll();
        const planet = planets.find((p: Planet) => p.id === planetId);
        if (!planet) {
            return NextResponse.json({ error: 'Invalid planet ID' }, { status: 400 });
        }

        const commodityMarketInfo = planet.marketListings.find((c: PlanetMarketListing) => c.commodityId === commodityId);
        if (!commodityMarketInfo || !commodityMarketInfo.sellPrice) {
            return NextResponse.json({ error: 'Commodity not bought at this planet or no sell price' }, { status: 400 });
        }

        const commodities = await commodityRepository.getAll();
        const commodityDetails = commodities.find((c: Commodity) => c.id === commodityId);
        if (!commodityDetails) {
            return NextResponse.json({ error: 'Invalid commodity ID' }, { status: 400 });
        }

        const pricePerUnit = commodityMarketInfo.sellPrice;
        const totalPayoutLamports = BigInt(Math.round(quantity * pricePerUnit * Math.pow(10, 6)));

        console.log(`Processing sell: User ${userPublicKey.toBase58()} sells ${quantity} of ${commodityId} at ${planetId} for ${pricePerUnit} GC each.`);
        console.log(`Total payout: ${Number(totalPayoutLamports) / Math.pow(10, 6)} GC`);

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
            creditsAwarded: Number(totalPayoutLamports) / Math.pow(10, 6),
        });

    } catch (error) {
        console.error('Error executing sell trade:', error);
        const errorDetails = error instanceof Error ? error.message : error;
        if (error instanceof Error && 'logs' in error) {
            console.error("Solana Logs:", error.logs);
        }
        return NextResponse.json({ error: 'Failed to execute sell trade', details: errorDetails }, { status: 500 });
    }
}