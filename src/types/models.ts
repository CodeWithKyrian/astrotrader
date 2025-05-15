export interface ShipState {
    name: string;
    cargoCapacity: number;
    currentCargo: Array<{ commodityId: string; quantity: number }>;
    fuel: number;
    maxFuel: number;
    // speed, etc. for future
}

export interface UserData {
    civicUserId: string;
    solWalletAddress: string;
    currentPlanetId: string;
    ship: ShipState;
    hasClaimedInitialCredits: boolean;
    lastSaved: number;
}

export interface Commodity {
    id: string;
    name: string;
    description: string;
    baseValue?: number;
}

export interface PlanetMarketListing {
    commodityId: string;
    buyPrice?: number;      // Price planet sells TO user
    sellPrice?: number;     // Price planet buys FROM user
    stock?: number;         // Optional: available stock
    demandFactor?: number;  // Optional: affects price
}

export interface Planet {
    id: string;                             // e.g., "terra-prime"
    name: string;
    description: string;
    coordinates: { x: number; y: number };  // For starmap
    marketListings: PlanetMarketListing[];
    fuelPrice: number;                      // Price per unit of fuel
    // Faction, tech level, etc. for future
}

export enum BlueprintEffectType {
    INCREASE_CARGO_CAPACITY = "INCREASE_CARGO_CAPACITY",
    INCREASE_MAX_FUEL = "INCREASE_MAX_FUEL",
}

export interface BlueprintEffect {
    type: BlueprintEffectType;
    value: number; // e.g., +50 cargo, +20 fuel
}

export interface BlueprintDefinition {
    id: string;
    name: string;
    description: string;
    tier: number;
    imageUrl: string;
    metadataUri: string;
    effects: BlueprintEffect[];
    // Rarity, crafting recipe, etc. for future
}
    
export interface OwnedBlueprintNft {
    mintAddress: string;
    blueprintDefinitionId: string;
    name: string;       // From NFT metadata (should match definition)
    imageUrl?: string;  // From NFT metadata
    // Potentially other parsed attributes if needed, but definition covers most
}