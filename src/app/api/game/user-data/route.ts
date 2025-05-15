import { NextResponse } from 'next/server';
import { getUser } from '@civic/auth-web3/nextjs';
import { getRedisClient } from '@/lib/redis';
import type { UserData, ShipState } from '@/types/models';
import { BASE_CARGO_CAPACITY, BASE_MAX_FUEL } from '@/store/gameStore';
import { planetRepository } from '@/repositories/planet-repository';
import { getUserSolanaWalletAddress } from '@/lib/solana-server';


async function getDefaultUserData(civicUserId: string, solWalletAddress: string): Promise<UserData> {
    const planets = await planetRepository.getAll();
    const defaultInitialPlanetId = planets.length > 0 ? planets[0].id : "terra-prime";

    const defaultShip: ShipState = {
        name: 'Stardust Hopper MkI',
        cargoCapacity: BASE_CARGO_CAPACITY,
        currentCargo: [],
        fuel: BASE_MAX_FUEL,
        maxFuel: BASE_MAX_FUEL,
    };

    return {
        civicUserId,
        solWalletAddress,
        currentPlanetId: defaultInitialPlanetId,
        ship: defaultShip,
        hasClaimedInitialCredits: false,
        lastSaved: Date.now(),
    };
}

// GET: Load user data
export async function GET() {
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

        const redis = getRedisClient();
        const userDataKey = `user:${user.id}:userData`;
        const savedDataString = await redis.get(userDataKey);

        if (savedDataString) {
            const userData: UserData = JSON.parse(savedDataString);
            console.log(`User data loaded for ${user.id}`);
            return NextResponse.json({ userData, found: true });
        } else {
            const defaultData = await getDefaultUserData(user.id, userSolWalletAddress);
            await redis.set(userDataKey, JSON.stringify(defaultData));
            return NextResponse.json({ userData: defaultData, found: false });
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        return NextResponse.json({ error: 'Failed to load user data', details: error instanceof Error ? error.message : error }, { status: 500 });
    }
}

// POST: Save user data
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

        const body: Partial<Omit<UserData, 'civicUserId' | 'solWalletAddress' | 'lastSaved'>> = await request.json();

        if (!body.currentPlanetId || !body.ship) {
            return NextResponse.json({ error: 'Incomplete user data provided for saving' }, { status: 400 });
        }

        const redis = getRedisClient();
        const userDataKey = `user:${user.id}:userData`;

        // Fetch existing data to merge, or start with default if none
        let existingData: UserData | null = null;
        const savedDataString = await redis.get(userDataKey);
        if (savedDataString) {
            existingData = JSON.parse(savedDataString);
        } else {
            existingData = await getDefaultUserData(user.id, userSolWalletAddress);
        }

        if (!existingData) {
            return NextResponse.json({ error: 'No existing user data found' }, { status: 400 });
        }

        const dataToSave: UserData = {
            ...existingData,
            civicUserId: user.id,
            solWalletAddress: userSolWalletAddress,
            currentPlanetId: body.currentPlanetId ?? existingData.currentPlanetId,
            ship: body.ship ? { ...existingData.ship, ...body.ship } : existingData.ship,
            hasClaimedInitialCredits: body.hasClaimedInitialCredits ?? existingData.hasClaimedInitialCredits,
            lastSaved: Date.now(),
        };

        await redis.set(userDataKey, JSON.stringify(dataToSave));

        console.log(`User data saved for ${user.id}`);

        return NextResponse.json({ message: 'User data saved successfully', savedAt: dataToSave.lastSaved, savedData: dataToSave });

    } catch (error) {
        console.error('Error saving user data:', error);
        return NextResponse.json({ error: 'Failed to save user data', details: error instanceof Error ? error.message : error }, { status: 500 });
    }
}