import { NextResponse } from 'next/server';
import { blueprintDefinitionRepository } from '@/repositories/blueprint-definition-repository';

export async function GET(request: Request) {
    try {
        const blueprintDefinitions = await blueprintDefinitionRepository.getAll();
        return NextResponse.json(blueprintDefinitions);
    } catch (error: any) {
        console.error("Error fetching blueprint definitions:", error);
        return NextResponse.json({ error: "Failed to fetch blueprint definitions" }, { status: 500 });
    }
}