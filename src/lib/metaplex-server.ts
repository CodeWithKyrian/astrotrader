import { Metaplex, keypairIdentity, MetaplexFile } from "@metaplex-foundation/js";
import { Keypair, PublicKey } from "@solana/web3.js";
import { connection, minterKeypair as defaultMinterKeypair } from "./solana-server";
import { getPublicEnv } from "@/config/environment";

const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(defaultMinterKeypair));

const publicEnv = getPublicEnv();

interface MintBlueprintNftParams {
    recipientPublicKey: PublicKey;
    name: string;
    symbol: string;
    minterKeypair?: Keypair;
}

/**
 * Mints a new NFT (Blueprint) pointing to a predefined metadata URI.
 * The server's `minterKeypair` pays all fees and is the update authority.
 */
export async function mintPlaceholderBlueprintNft({
    recipientPublicKey,
    name,
    symbol,
    minterKeypair = defaultMinterKeypair,
}: MintBlueprintNftParams): Promise<{ mintAddress: PublicKey; signature: string }> {
    console.log(`Minting Placeholder Blueprint NFT "${name}" to ${recipientPublicKey.toBase58()}`);
    console.log(`Using Metadata URI: ${publicEnv.PLACEHOLDER_BLUEPRINT_METADATA_URI}`);

    try {
        const { response, nft } = await metaplex.nfts().create({
            uri: publicEnv.PLACEHOLDER_BLUEPRINT_METADATA_URI,
            name: name,
            symbol: symbol,
            sellerFeeBasisPoints: 0,
            isMutable: true,
            mintAuthority: minterKeypair,
            updateAuthority: minterKeypair,
            tokenOwner: recipientPublicKey,
        });

        console.log(`NFT minted successfully: Mint Address - ${nft.address.toBase58()}`);
        console.log(`Transaction signature: ${response.signature}`);

        return { mintAddress: nft.address, signature: response.signature };

    } catch (error) {
        console.error("Error during Metaplex NFT creation:", error);
        if (error instanceof Error && error.message.includes("Bundlr")) {
             console.error("This might be a Bundlr funding issue if Arweave upload was attempted by Metaplex implicitly.");
             console.error("Ensure your metadata URI is correctly pointing to an already hosted JSON (like on JSONKeeper).");
        }
        throw error;
    }
}