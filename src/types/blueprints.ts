export enum BlueprintEffectType {
    INCREASE_CARGO_CAPACITY = "INCREASE_CARGO_CAPACITY",
    INCREASE_MAX_FUEL = "INCREASE_MAX_FUEL",
    // INCREASE_SHIP_SPEED = "INCREASE_SHIP_SPEED",
    // ENABLE_MODULE_SLOT = "ENABLE_MODULE_SLOT",
}


/**
 * Parsed game-specific attributes from the NFT's metadata.
 */
export interface ParsedBlueprintAttributes {
    blueprintId: string;      // Database ID that links to our blueprint definitions
    effectType: BlueprintEffectType;
    effectValue: number;
    tier: number;
    description: string;
}

/**
 * The fully processed blueprint object combining on-chain NFT info with parsed metadata.
 */
export interface ProcessedBlueprint {
    mintAddress: string;                         // The unique on-chain address of this specific NFT
    name: string;                                // Name from metadata
    imageUrl?: string;                           // Image URL from metadata
    nftDescription: string;                      // Main description from metadata
    parsedAttributes: ParsedBlueprintAttributes; // Our game-specific effects, parsed
}