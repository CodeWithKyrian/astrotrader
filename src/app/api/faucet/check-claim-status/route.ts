import { NextResponse } from 'next/server';
import { getUser } from '@civic/auth-web3/nextjs';
import { getRedisClient } from '@/lib/redis';

export async function GET(request: Request) {
    try {
        const userSession = await getUser();
        if (!userSession || !userSession.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = userSession.id;
        const redis = getRedisClient();
        const claimFlagKey = `user:${userId}:initialCreditsClaimed`;
        const hasClaimed = await redis.get(claimFlagKey);

        return NextResponse.json({ hasClaimed: hasClaimed === 'true' });

    } catch (error: any) {
        console.error('Error checking claim status:', error);
        return NextResponse.json({ error: 'Failed to check claim status', details: error.message }, { status: 500 });
    }
}