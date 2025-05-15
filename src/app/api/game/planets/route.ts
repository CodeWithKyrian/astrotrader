import { NextResponse } from 'next/server';
import { planetRepository } from '@/repositories/planet-repository';

export async function GET(request: Request) {
    try {
        const planets = await planetRepository.getAll();
        return NextResponse.json(planets);
    } catch (error: any) {
        console.error("Error fetching planets:", error);
        return NextResponse.json({ error: "Failed to fetch planets data" }, { status: 500 });
    }
}