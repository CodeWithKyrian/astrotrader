import { NextResponse } from 'next/server';
import { blueprintDefinitionRepository } from '@/repositories/blueprint-definition-repository';

export async function GET() {
    try {
        const blueprintDefinitions = await blueprintDefinitionRepository.getAll();
        return NextResponse.json(blueprintDefinitions);
    } catch (error) {
        console.error("Error fetching blueprint definitions:", error);
        return NextResponse.json({ error: "Failed to fetch blueprint definitions" }, { status: 500 });
    }
}