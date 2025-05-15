import type { BlueprintDefinition } from '@/types/models';

import blueprintsData from '@/data/mock-db/blueprints.json';

const typedBlueprintsData: BlueprintDefinition[] = blueprintsData as BlueprintDefinition[];

export const blueprintDefinitionRepository = {
    async getAll(): Promise<BlueprintDefinition[]> {
        return Promise.resolve(typedBlueprintsData);
    },

    async getById(id: string): Promise<BlueprintDefinition | undefined> {
        return typedBlueprintsData.find(bp => bp.id === id);
    },
};

