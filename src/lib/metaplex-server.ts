import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import { Keypair, PublicKey } from "@solana/web3.js";
import { connection, minterKeypair as defaultMinterKeypair } from "./solana-server";
import { BlueprintDefinition } from "@/types/models";

const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(defaultMinterKeypair));

interface MintBlueprintNftParams {
    recipientPublicKey: PublicKey;
    symbol: string;
    blueprintDefinition: BlueprintDefinition;
    minterKeypair?: Keypair;
}

/**
 * Mints a new Blueprint NFT based on the specified blueprintId.
 * Uses blueprint-specific metadata from the API.
 */
export async function mintBlueprintNft({
    recipientPublicKey,
    symbol,
    blueprintDefinition,
    minterKeypair = defaultMinterKeypair,
}: MintBlueprintNftParams): Promise<{ mintAddress: PublicKey; signature: string }> {

    const name = blueprintDefinition.name;
    const metadataUri = blueprintDefinition.metadataUri;

    console.log(`Minting Blueprint NFT "${name}" (ID: ${blueprintDefinition.id}) to ${recipientPublicKey.toBase58()}`);
    console.log(`Using Metadata URI: ${metadataUri}`);

    try {
        const { response, nft } = await metaplex.nfts().create({
            uri: metadataUri,
            name: name,
            symbol: symbol,
            sellerFeeBasisPoints: 0,
            isMutable: true,
            mintAuthority: minterKeypair,
            updateAuthority: minterKeypair,
            tokenOwner: recipientPublicKey,
        });

        console.log(`Blueprint NFT minted successfully: Mint Address - ${nft.address.toBase58()}`);
        console.log(`Transaction signature: ${response.signature}`);

        return { mintAddress: nft.address, signature: response.signature };

    } catch (error) {
        console.error(`Error during Blueprint NFT creation (ID: ${blueprintDefinition.id}):`, error);
        throw error;
    }
}