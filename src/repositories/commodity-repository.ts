import type { Commodity } from '@/types/models';

import commoditiesData from '@/data/mock-db/commodities.json';

const typedCommoditiesData: Commodity[] = commoditiesData as Commodity[];


export const commodityRepository = {
    async getAll(): Promise<Commodity[]> {
        return Promise.resolve(typedCommoditiesData);
    },

    async getById(id: string): Promise<Commodity | undefined> {
        return typedCommoditiesData.find(c => c.id === id);
    },
};
