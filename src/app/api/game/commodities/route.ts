import { NextResponse } from 'next/server';
import { commodityRepository } from '@/repositories/commodity-repository';

export async function GET(request: Request) {
    try {
        const commodities = await commodityRepository.getAll();
        return NextResponse.json(commodities);
    } catch (error: any) {
        console.error("Error fetching commodities:", error);
        return NextResponse.json({ error: "Failed to fetch commodities data" }, { status: 500 });
    }
}