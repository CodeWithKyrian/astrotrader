import {
    Metaplex,
    guestIdentity,
    isNft,
    isSft,
    type Nft,
    type Sft,
    type Metadata,
} from "@metaplex-foundation/js";
import { connection } from "./solana-client";
import { PublicKey } from "@solana/web3.js";
import type { ProcessedBlueprint, BlueprintEffectType } from "@/types/blueprints";

const metaplexGuest = Metaplex.make(connection).use(guestIdentity());

/**
 * Fetches all NFTs owned by a publicKey and attempts to parse them as Blueprints.
 */
export async function fetchAndProcessOwnedBlueprints(owner: PublicKey): Promise<ProcessedBlueprint[]> {
    console.log(`Fetching NFTs for owner: ${owner.toBase58()}`);

    try {
        const rawAssets = await metaplexGuest.nfts().findAllByOwner({ owner });
        console.log(`Found ${rawAssets.length} raw NFT/SFT entries.`);

        const processedBlueprints: ProcessedBlueprint[] = [];

        for (const asset of rawAssets) {
            let fullAsset: Nft | Sft;

            if (asset.json && asset.jsonLoaded) {
                if (isNft(asset) || isSft(asset)) {
                    fullAsset = asset;
                } else {

                    try {
                        fullAsset = await metaplexGuest.nfts().load({ metadata: asset as Metadata });
                    } catch (loadErr) {
                        console.error(`Failed to load asset ${asset.address.toBase58()} even with existing JSON:`, loadErr);
                        continue;
                    }
                }
            } else {
                try {
                    fullAsset = await metaplexGuest.nfts().load({ metadata: asset as Metadata });
                } catch (loadErr) {
                    console.error(`Failed to load metadata for ${asset.address.toBase58()}:`, loadErr);
                    continue;
                }
            }

            if (fullAsset.json && fullAsset.json.attributes) {
                let blueprintIdAttr, effectTypeAttr, effectValueAttr, tierAttr, descriptionAttr;

                for (const attr of fullAsset.json.attributes) {
                    if (attr.trait_type === "Blueprint ID") blueprintIdAttr = String(attr.value);
                    if (attr.trait_type === "Effect Type") effectTypeAttr = attr.value as BlueprintEffectType;
                    if (attr.trait_type === "Effect Value") effectValueAttr = Number(attr.value);
                    if (attr.trait_type === "Tier") tierAttr = Number(attr.value);
                    if (attr.trait_type === "Description") descriptionAttr = String(attr.value);
                }

                if (blueprintIdAttr && effectTypeAttr && typeof effectValueAttr === 'number' && typeof tierAttr === 'number' && descriptionAttr) {
                    processedBlueprints.push({
                        mintAddress: fullAsset.address.toBase58(),
                        name: fullAsset.name || "Unknown Blueprint",
                        imageUrl: fullAsset.json.image,
                        nftDescription: fullAsset.json.description || "No description.",
                        parsedAttributes: {
                            blueprintId: blueprintIdAttr,
                            effectType: effectTypeAttr,
                            effectValue: effectValueAttr,
                            tier: tierAttr,
                            description: descriptionAttr,
                        },
                    });
                } else {
                    console.warn(`NFT ${fullAsset.address.toBase58()} named "${fullAsset.name}" is missing required blueprint attributes (${!blueprintIdAttr ? 'Blueprint ID, ' : ''}${!effectTypeAttr ? 'Effect Type, ' : ''}${typeof effectValueAttr !== 'number' ? 'Effect Value, ' : ''}${typeof tierAttr !== 'number' ? 'Tier, ' : ''}${!descriptionAttr ? 'Description' : ''}).`);
                }
            } else {
                // console.warn(`Asset ${fullAsset.address.toBase58()} ("${fullAsset.name}") has no JSON metadata or attributes after loading.`);
            }
        }

        console.log(`Processed ${processedBlueprints.length} blueprints.`);

        return processedBlueprints;
    } catch (error) {
        console.error(`Error fetching or processing blueprints for owner ${owner.toBase58()}:`, error);
        return [];
    }
}