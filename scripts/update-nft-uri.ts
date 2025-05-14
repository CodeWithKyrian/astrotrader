import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import { Keypair, PublicKey } from "@solana/web3.js";
import { config as dotenvConfig } from 'dotenv';
import path from 'path';

// Get command line arguments
const [,, nftMintAddressArg, newMetadataUriArg] = process.argv;

if (!nftMintAddressArg || !newMetadataUriArg) {
    console.error("Usage: ts-node update-nft-uri.ts <NFT_MINT_ADDRESS> <NEW_METADATA_URI>");
    process.exit(1);
}

dotenvConfig({ path: path.resolve(process.cwd(), '.env.local') });

import { Connection } from '@solana/web3.js';
import bs58 from 'bs58';

const rpcUrl = process.env.SOLANA_RPC_URL;
if (!rpcUrl) {
    console.error("SOLANA_RPC_URL is not defined in .env.local");
    process.exit(1);
}
const connection = new Connection(rpcUrl, 'confirmed');

function loadKeypairFromEnvString(envVarName: string, privateKeyString: string | undefined): Keypair {
    if (!privateKeyString) {
        throw new Error(`Environment variable ${envVarName} for private key not found!`);
    }
    try {
        if (privateKeyString.startsWith('[') && privateKeyString.endsWith(']')) {
            const secretKey = Uint8Array.from(JSON.parse(privateKeyString));
            return Keypair.fromSecretKey(secretKey);
        }
        const secretKey = bs58.decode(privateKeyString);
        return Keypair.fromSecretKey(secretKey);
    } catch (error) {
        throw new Error(`Invalid format for private key in ${envVarName}.`);
    }
}

const minterKeypair = loadKeypairFromEnvString('MINTER_PRIVATE_KEY', process.env.MINTER_PRIVATE_KEY);
console.log(`Using Minter (Update Authority): ${minterKeypair.publicKey.toBase58()}`);


async function updateNftMetadataUri(nftMintAddress: string, newMetadataUri: string) {
    if (!newMetadataUri.startsWith('http')) {
        console.error("Please specify a valid metadata URI (must start with http/https).");
        return;
    }

    const metaplex = Metaplex.make(connection)
        .use(keypairIdentity(minterKeypair));

    try {
        const nftMintPublicKey = new PublicKey(nftMintAddress);

        console.log(`Fetching NFT with mint address: ${nftMintPublicKey.toBase58()}`);
        const nftToUpdate = await metaplex.nfts().findByMint({ mintAddress: nftMintPublicKey });

        if (!nftToUpdate) {
            console.error(`NFT with mint address ${nftMintPublicKey.toBase58()} not found.`);
            return;
        }

        console.log(`Found NFT: "${nftToUpdate.name}". Current URI: ${nftToUpdate.uri}`);
        
        if (nftToUpdate.uri === newMetadataUri) {
            console.log(`NFT already has the desired URI. No update needed.`);
            return;
        }

        console.log(`Attempting to update URI to: ${newMetadataUri}`);

        // Before updating, ensure the minterKeypair is indeed the update authority
        if (!nftToUpdate.updateAuthorityAddress.equals(minterKeypair.publicKey)) {
            console.error(`Minter keypair (${minterKeypair.publicKey.toBase58()}) is not the update authority for this NFT.`);
            console.error(`Current update authority: ${nftToUpdate.updateAuthorityAddress.toBase58()}`);
            return;
        }


        const { response } = await metaplex.nfts().update({
            nftOrSft: nftToUpdate,
            uri: newMetadataUri,
            name: nftToUpdate.name,
            symbol: nftToUpdate.symbol,
            sellerFeeBasisPoints: nftToUpdate.sellerFeeBasisPoints,
        });

        console.log(`NFT metadata URI updated successfully!`);
        console.log(`Transaction signature: ${response.signature}`);
        console.log(`New URI: ${newMetadataUri}`);
        console.log(`You can verify on Solscan (Devnet): https://solscan.io/token/${nftMintPublicKey.toBase58()}?cluster=devnet`);

    } catch (error) {
        console.error("Error updating NFT metadata URI:", error);
    }
}

updateNftMetadataUri(nftMintAddressArg, newMetadataUriArg);