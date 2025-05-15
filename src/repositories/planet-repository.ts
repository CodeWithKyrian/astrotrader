import type { Planet, PlanetMarketListing } from '@/types/models';

import planetsData from '@/data/mock-db/planets.json';

const typedPlanetsData: Planet[] = planetsData as Planet[];

export const planetRepository = {
    async getAll(): Promise<Planet[]> {
        return Promise.resolve(typedPlanetsData);
    },

    async getById(id: string): Promise<Planet | undefined> {
        return typedPlanetsData.find(p => p.id === id);
    },

    async getMarketListings(planetId: string): Promise<PlanetMarketListing[]> {
        const planet = await this.getById(planetId);
        return planet?.marketListings || [];
    },
};

