# Technical Integration Document: Pixel Pet Rancher

**Version:** 1.0
**Date:** 2024-07-18

## 1. Introduction & Concept Note

Pixel Pet Rancher is a browser-based virtual pet and idle collector game built on Next.js and Solana. Users adopt, nurture, and interact with unique, procedurally generated pixel pets represented as Non-Fungible Tokens (NFTs). The core gameplay loop involves caring for pets, playing mini-games to earn an in-game currency ("Sparkle Kibble" - an SPL Token), and using this currency or small amounts of SOL to purchase cosmetic items or boosts.

The key innovation lies in leveraging **Civic Auth** with **Embedded Wallets**. This removes the traditional friction of Web3 onboarding, allowing users to log in seamlessly via familiar methods (e.g., Google) and automatically have a non-custodial Solana wallet provisioned for them. This wallet directly holds their Pet NFTs and Sparkle Kibble, providing true ownership without requiring users to manage seed phrases or install browser extensions.

## 2. Goals

*   **Seamless Onboarding:** Utilize Civic Auth for frictionless user login and automatic embedded Solana wallet creation.
*   **True Ownership:** Represent pets as Solana NFTs (Metaplex standard) held directly in the user's embedded wallet.
*   **Simple In-Game Economy:** Implement an SPL Token ("Sparkle Kibble") for rewards and purchases.
*   **Accessible Microtransactions:** Allow purchases using earned Kibble or small amounts of SOL via the embedded wallet.
*   **Engaging Gameplay:** Provide a fun core loop of pet care, collection, and mini-games.
*   **Demonstrate Civic Auth Value:** Clearly showcase how Civic Auth simplifies Web3 integration for both developers and users within the context of a fun application.
*   **Meet Bounty Requirements:** Fulfill all technical requirements of the Civic Bounty, including using `@civic/auth-web3`, embedded wallets, providing a working demo, and a clear codebase.

## 3. Technology Stack

*   **Frontend Framework:** Next.js (~14.2 / ~15.2 or higher) with React & TypeScript
*   **Styling:** Tailwind CSS
*   **State Management:**
    *   React Context API (via Civic Auth Provider) for global auth/user/wallet state.
    *   Zustand (or Jotai/Valtio) for local/game component state.
*   **Backend:** Next.js API Routes (Serverless Functions)
*   **Blockchain:** Solana (Devnet for development, Mainnet Beta target)
*   **Authentication & Wallet:** `@civic/auth-web3`
*   **Solana Interaction:**
    *   `@solana/web3.js`: Core RPC communication, transaction building.
    *   `@solana/spl-token`: SPL Token creation and interaction (Sparkle Kibble).
    *   `@metaplex-foundation/mpl-token-metadata`: Creating and managing NFT metadata.
    *   `(Optional) @metaplex-foundation/js`: Higher-level SDK for Metaplex interactions.
*   **Data Storage (Off-Chain):**
    *   Vercel KV (Redis): For caching frequently accessed data, session info (if needed beyond Civic), pet state (happiness, hunger timers).
    *   (Alternative) Vercel Postgres or Supabase: If more relational data structures are needed (e.g., complex leaderboards, user profiles). *KV is likely sufficient for MVP.*
*   **Deployment:** Vercel

## 4. System Architecture

```
+-------------------+      +-----------------------+      +----------------------------+
|   User Browser    | ---->|  Next.js Frontend     | ---->|     Next.js API Routes     |
| (React Components)|      | (CivicAuthProvider)   |      | (Serverless Functions)     |
+-------------------+      +-----------------------+      +----------------------------+
        |                          |         ^                     |           ^
        | (Civic Login Redirect)   |         | (User/Wallet Ctx)   |           | (Blockchain Ops)
        v                          v         |                     v           |
+-------------------+      +-----------------------+      +----------------------------+
|   Civic Auth      | <--- | Embedded Wallet Interaction |<----|     Solana Blockchain      |
| (SSO, Wallet Prov)|      | (Signing via Hook)    |      | (RPC Node - Devnet/Mainnet)|
+-------------------+      +-----------------------+      +----------------------------+
                                                                    |           ^
                                                                    |           | (Data Read/Write)
                                                                    v           |
                                                          +----------------------------+
                                                          | Off-Chain Data Store       |
                                                          | (Vercel KV / Postgres)     |
                                                          +----------------------------+
```

**Explanation:**

1.  **User Interaction:** The user interacts with the Next.js frontend application in their browser.
2.  **Authentication:** Login is handled via redirect to Civic Auth. Civic returns user info and provides access to the embedded wallet context via the `CivicAuthProvider` and `useUser` hook.
3.  **Frontend Logic:** React components handle UI rendering, local state (Zustand), and trigger actions.
4.  **Backend API:** Frontend components call Next.js API Routes for actions requiring secure logic or blockchain interaction (e.g., minting NFTs, distributing SPL tokens, verifying purchases, updating off-chain state).
5.  **Blockchain Interaction:**
    *   **User-Signed:** Actions initiated by the user (e.g., spending Kibble/SOL) use the `sendTransaction` function provided by the Civic `useUser` hook's wallet context.
    *   **Server-Signed:** Actions paid for by the application (e.g., minting the initial pet NFT, distributing rewards) are executed by API routes using dedicated server-side wallets (Minter, Reward Pool).
6.  **Data Storage:** API routes interact with Vercel KV (or other DB) to store and retrieve mutable pet state (happiness, timers) and potentially other off-chain data.
7.  **Solana Network:** All blockchain transactions (NFT mints, SPL transfers, SOL transfers) are processed and confirmed on the Solana network via an RPC endpoint.

## 5. Project Structure (Next.js App Router)

```
pixel-pet-rancher/
├── public/                     # Static assets (favicon, base pet images)
├── src/
│   ├── app/                    # App Router directory
│   │   ├── api/                # API Routes (Backend Logic)
│   │   │   ├── auth/[...civicauth]/route.ts # Civic Auth handler (REQUIRED)
│   │   │   ├── pets/
│   │   │   │   ├── adopt/route.ts           # POST: Mint/assign new pet NFT
│   │   │   │   ├── interact/route.ts        # POST: Update off-chain state (feed, clean)
│   │   │   │   └── state/[mint]/route.ts    # GET: Fetch off-chain state for a pet NFT
│   │   │   ├── rewards/
│   │   │   │   ├── minigame/route.ts        # POST: Process results, award Kibble
│   │   │   │   ├── claim/route.ts           # POST: Claim task/milestone rewards
│   │   │   ├── store/
│   │   │   │   ├── items/route.ts           # GET: Fetch available store items
│   │   │   │   ├── purchase/confirm/route.ts # POST: Verify TX signature, deliver item
│   │   │   └── wallet/
│   │   │       └── balance/route.ts         # GET: Fetch Kibble/SOL balance (server-side if needed)
│   │   ├── (game)/             # Route group requiring auth/wallet
│   │   │   ├── layout.tsx        # Game-specific layout, ensures wallet exists
│   │   │   └── page.tsx          # Main game dashboard/ranch view
│   │   ├── layout.tsx          # Root layout (CivicAuthProvider, global styles, providers)
│   │   └── page.tsx            # Landing/Login page
│   ├── components/             # Reusable UI components
│   │   ├── auth/UserButtonClient.tsx # Client wrapper for Civic UserButton
│   │   ├── game/PetDisplay.tsx       # Renders pet visuals + stats
│   │   ├── game/PetActions.tsx       # Buttons: Feed, Clean, Play
│   │   ├── game/RanchView.tsx        # Overall view of user's pets/ranch
│   │   ├── minigames/FetchGame.tsx   # Example mini-game logic/UI
│   │   ├── store/Shop.tsx            # Store interface
│   │   ├── store/ShopItem.tsx        # Individual store item display
│   │   └── ui/                     # Generic UI elements (Button, Modal, Spinner)
│   ├── hooks/                    # Custom React Hooks
│   │   ├── useCivicWallet.ts     # Simplifies accessing Civic user/wallet context, handles wallet creation prompt
│   │   ├── usePetState.ts        # Fetches/manages combined on-chain (NFT data) & off-chain state
│   │   ├── useSplBalance.ts      # Hook to fetch and display SPL token balance
│   │   └── useSolBalance.ts      # Hook to fetch and display SOL balance
│   ├── lib/                      # Core logic, utilities, constants
│   │   ├── civic.ts              # Civic Auth setup details (if needed beyond config)
│   │   ├── solana.ts             # Solana connection, helper fns (sendTx, confirmTx, getATA)
│   │   ├── metaplex.ts           # Metaplex NFT minting/fetching utilities
│   │   ├── spl.ts                # SPL token interaction utilities
│   │   ├── state.ts              # Functions for interacting with off-chain KV store
│   │   ├── constants.ts          # Mint Addrs, Program IDs, RPC URL (from env)
│   │   └── utils.ts              # General helper functions
│   ├── providers/                # React Context Providers (if needed beyond Civic)
│   └── store/                    # State management (e.g., Zustand stores)
│       ├── gameStore.ts
│       └── userStore.ts
├── next.config.js              # Next.js config (Civic Auth Plugin REQUIRED)
├── tsconfig.json
├── package.json
└── .env.local                  # Environment variables (REQUIRED & SENSITIVE)
```

## 6. Core Components & Modules

*   **`app/api/auth/[...civicauth]/route.ts`**: Handles Civic OAuth callbacks. **Essential**.
*   **`app/layout.tsx`**: Root layout, MUST contain `<CivicAuthProvider>`.
*   **`hooks/useCivicWallet.ts`**: Central hook for components to access user login status, wallet address, `sendTransaction`, `signMessage`, and trigger wallet creation if needed.
*   **`lib/solana.ts`**: Initializes Solana `Connection`, provides wrappers for common tasks like sending transactions signed by the server, confirming transactions, finding Associated Token Accounts (ATAs).
*   **`lib/metaplex.ts`**: Contains functions using Metaplex SDKs to mint NFTs (used by `/api/pets/adopt`) and fetch NFT metadata.
*   **`lib/spl.ts`**: Contains functions to transfer SPL tokens (used by `/api/rewards/*`) and get token balances.
*   **`lib/state.ts`**: Contains functions to get/set pet state in Vercel KV.
*   **API Routes (`/api/*`)**: Handle all secure backend logic and blockchain interactions not signed directly by the user's embedded wallet.

## 7. Authentication & Wallet Management (Civic Auth)

*   **Setup:**
    *   Install `@civic/auth-web3`.
    *   Configure `next.config.js` with `createCivicAuthPlugin({ clientId: process.env.CIVIC_CLIENT_ID })`.
    *   Implement the `app/api/auth/[...civicauth]/route.ts` handler.
    *   Add `CIVIC_CLIENT_ID` to `.env.local`.
*   **Login Flow:**
    1.  User clicks "Login with Google" (rendered via `UserButtonClient` or custom button triggering login).
    2.  User is redirected to Civic, then Google for authentication.
    3.  User is redirected back to `/api/auth/callback/civic`.
    4.  Civic Auth handler exchanges code for tokens, establishes session.
    5.  User is redirected back to the application (e.g., `/game`).
*   **Wallet Creation Flow:**
    1.  After login, `useCivicWallet` hook checks `userContext` state.
    2.  If `!userHasWallet(userContext)`, the hook indicates wallet needs creation.
    3.  UI prompts user ("Start Your Ranch!").
    4.  User clicks button, triggering `userContext.createWallet()`.
    5.  UI shows loading state (`walletCreationInProgress`).
    6.  Once complete, `userContext` updates, `userHasWallet` becomes true, and `userContext.solana.address` / `userContext.solana.wallet` become available.
*   **Accessing User/Wallet:**
    *   **Frontend:** `useCivicWallet` hook provides `user`, `publicKey`, `wallet` (for `sendTransaction`/`signMessage`), `createWallet`, status flags.
    *   **Backend (API Routes):** Use `getUser()` from `@civic/auth-web3/nextjs` to get authenticated user details server-side. **Note:** `getUser()` provides basic user info; accessing the user's *wallet signing capabilities* is only possible from the frontend context where the embedded wallet logic resides.

## 8. Blockchain Integration (Solana)

*   **Connection:** Initialize a `Connection` instance in `lib/solana.ts` using an RPC URL from environment variables (`SOLANA_RPC_URL`). Use Devnet initially.
*   **Wallets:**
    *   **User Embedded Wallet:** Accessed via `useCivicWallet` hook. Signs user-initiated transactions (spending). Starts with 0 SOL/Kibble.
    *   **Minter Wallet:** Server-side `Keypair` loaded from `.env.local` (`MINTER_PRIVATE_KEY`). Funded with Devnet SOL. Used by API routes to pay fees for minting Pet NFTs.
    *   **Reward Pool Wallet:** Server-side `Keypair` (`REWARD_POOL_PRIVATE_KEY`). Holds the main supply of Sparkle Kibble. Used by API routes to transfer Kibble rewards to users. Funded with Devnet SOL for transaction fees.
    *   **Treasury Wallet:** Server-side `Keypair` (`TREASURY_PRIVATE_KEY`). Receives SOL/Kibble payments from users making purchases. Funded with Devnet SOL for fees if it needs to perform actions.
*   **NFTs (Pixel Pets - Metaplex Token Metadata):**
    *   **Standard:** Fungible token with 0 decimals, supply of 1. Metadata attached via Metaplex standard.
    *   **Minting (`/api/pets/adopt`):**
        1.  Generate metadata (name, symbol, attributes, image URL).
        2.  Upload metadata JSON to persistent storage (Arweave/IPFS ideally, temporary URL for hackathon OK). Get URI.
        3.  Use `@metaplex-foundation/mpl-token-metadata` or `@metaplex-foundation/js` via `lib/metaplex.ts`.
        4.  Instructions: Create Mint Account, Create User's ATA, Mint 1 Token to ATA, Create Metadata Account.
        5.  Transaction signed by **Minter Wallet**.
    *   **Fetching:** Use `connection.getTokenAccountsByOwner` to find potential NFTs, then fetch Metaplex metadata for details using `lib/metaplex.ts` helpers. Filter based on known Update Authority or Collection if set up.
*   **SPL Token (Sparkle Kibble):**
    *   **Creation (One-time setup):** Use Solana CLI or tools to create the token mint (`SPARKLE_KIBBLE_MINT_ADDRESS` in `.env.local`). Mint initial supply to Reward Pool Wallet's ATA.
    *   **Transfers (`/api/rewards/*`):** Use `@solana/spl-token`'s `createTransferInstruction`. Source is Reward Pool Wallet's ATA, destination is User's ATA (derive using `getAssociatedTokenAddress`), owner is Reward Pool Wallet `Keypair`. Transaction signed by **Reward Pool Wallet**.
    *   **Spending (Frontend):** Use `createTransferInstruction`. Source is User's ATA, destination is Treasury Wallet's ATA, owner is `userContext.solana.address`. Transaction signed by **User Embedded Wallet** via `sendTransaction`.
    *   **Balance Check:** Use `@solana/spl-token`'s `getTokenAccountBalance` on the user's ATA address.

## 9. Core Game Loop Implementation Details

*   **Pet Adoption:** Frontend calls `/api/pets/adopt`. Backend mints NFT (pays fee with Minter Wallet), stores initial state in KV, returns NFT mint address. Frontend fetches NFT data and off-chain state via `usePetState`.
*   **Pet Display:** `PetDisplay.tsx` uses `usePetState` which fetches/combines NFT metadata and KV state (happiness, etc.). Renders visuals based on data.
*   **Pet Interaction (Feed/Clean):** Buttons call `/api/pets/interact` with Pet NFT mint and action. Backend updates KV state (e.g., `lastFedTime = Date.now()`, `happiness += 5`). No direct blockchain interaction needed here unless feeding costs Kibble.
*   **Mini-Games:** Frontend game logic -> On completion, calls `/api/rewards/minigame` with score. Backend validates, calculates Kibble reward, transfers Kibble from Reward Pool Wallet to user's ATA.
*   **Store Purchase:**
    1.  Frontend displays items fetched from `/api/store/items`.
    2.  User clicks "Buy". Frontend constructs transaction (SOL `SystemProgram.transfer` or Kibble `splToken.createTransferInstruction`) from User to Treasury.
    3.  Frontend calls `userContext.solana.wallet.sendTransaction`. User confirms in Civic UI.
    4.  Frontend waits for confirmation (`connection.confirmTransaction`).
    5.  Frontend sends *transaction signature* to `/api/store/purchase/confirm`.
    6.  **Backend Verification (CRITICAL):** Fetches transaction by signature. Verifies amount, sender (user's wallet), recipient (Treasury wallet) are correct. Prevents replay attacks or forged requests.
    7.  If verified, backend delivers item (updates KV or mints accessory NFT using Minter Wallet).

## 10. Key User Flows

1.  **First Time User:**
    *   Visit Site -> Click Login -> Civic/Google Auth -> Redirect Back -> App sees no wallet -> Prompt "Start Ranch" -> Click -> `createWallet()` -> Wallet Created -> Show Game Dashboard (empty ranch).
2.  **Adopting a Pet:**
    *   Game Dashboard -> Click "Adopt New Pet" -> API Call `/api/pets/adopt` -> Backend Mints NFT (Minter pays fee) -> API Returns NFT Mint -> Frontend Fetches NFT data + initial state -> Display new Pet.
3.  **Playing Mini-Game & Earning:**
    *   Game Dashboard -> Click "Play Fetch" -> Play Game -> Game Ends -> Frontend sends score to `/api/rewards/minigame` -> Backend validates & transfers Kibble (Reward Pool pays fee) -> API returns success -> Frontend updates Kibble balance display (`useSplBalance`).
4.  **Buying an Item with Kibble:**
    *   Game Dashboard -> Visit Store -> Select Item -> Click "Buy with Kibble" -> Check Balance -> Construct Transfer TX (User -> Treasury) -> `sendTransaction()` -> User Confirms -> Wait Confirmation -> Send TX Sig to `/api/store/purchase/confirm` -> Backend Verifies TX -> Backend Delivers Item -> API returns success -> Frontend shows item acquired.

## 11. Data Management

*   **On-Chain (Solana):**
    *   Pet NFTs (Ownership, Core Metadata URI)
    *   Sparkle Kibble Balances (SPL Token)
    *   SOL Balances
    *   (Optional) Accessory NFTs
*   **Off-Chain (Vercel KV):**
    *   Pet Mutable State: Happiness level, Hunger level, Last interaction timestamps (feed, clean, play). Keyed by Pet NFT Mint Address.
    *   User Profile Data (if any beyond Civic's basic info). Keyed by User Wallet Address.
    *   Store Item Definitions (unless stored on-chain).
    *   Leaderboard Data.
    *   Session data (potentially).

## 12. Environment & Configuration (`.env.local`)

```dotenv
# Civic Auth
CIVIC_CLIENT_ID=YOUR_CIVIC_CLIENT_ID

# Solana
SOLANA_RPC_URL=https://api.devnet.solana.com # Or your preferred Devnet RPC
SPARKLE_KIBBLE_MINT_ADDRESS=YOUR_KIBBLE_TOKEN_MINT_ADDRESS

# Server Wallet Private Keys (Base58 encoded - USE DEVNET KEYS ONLY INITIALLY)
# Generate using `solana-keygen new --outfile server_wallet.json` then get private key bytes
MINTER_PRIVATE_KEY=[PRIVATE_KEY_BYTES_AS_ARRAY_OR_BASE58_STRING]
REWARD_POOL_PRIVATE_KEY=[PRIVATE_KEY_BYTES_AS_ARRAY_OR_BASE58_STRING]
TREASURY_PRIVATE_KEY=[PRIVATE_KEY_BYTES_AS_ARRAY_OR_BASE58_STRING]

# Vercel KV (automatically injected by Vercel deployment, or set manually for local dev)
# KV_URL=...
# KV_REST_API_URL=...
# KV_REST_API_TOKEN=...
# KV_REST_API_READ_ONLY_TOKEN=...
```

## 13. Security Considerations

*   **NEVER** expose server-side private keys (Minter, Reward Pool, Treasury) to the frontend.
*   **Server-Side Verification:** Always verify amounts, senders, and recipients of transactions submitted to confirmation endpoints (`/api/store/purchase/confirm`) by fetching the transaction details from the blockchain using the signature. Do not trust data sent solely from the frontend.
*   **Input Validation:** Sanitize and validate all inputs received by API routes.
*   **Rate Limiting:** Consider basic rate limiting on sensitive API endpoints (minting, rewards) to prevent abuse.
*   **Authentication Checks:** Ensure all backend API routes that require a logged-in user start by calling `getUser()` and verifying the user exists.
*   **Off-Chain State:** Be mindful that off-chain state in KV is mutable and centrally controlled. Use blockchain for critical ownership/value representation.

## 14. Scalability & Future Considerations (Post-Hackathon)

*   **RPC Nodes:** Use a dedicated RPC provider (e.g., Helius, Triton, QuickNode) for production instead of the public RPC.
*   **Metadata Storage:** Use Arweave or IPFS via services like Pinata or Shadow Drive for permanent NFT metadata storage.
*   **Indexing:** For complex queries (e.g., finding all pets with specific traits), use a Solana indexer (e.g., Helius DAS, The Graph, SimpleHash).
*   **Caching:** Implement more robust caching for blockchain data (balances, NFT details) to reduce RPC calls.
*   **Error Handling:** Implement more granular error handling and user feedback.
*   **Gas Optimization:** Optimize transaction instructions.
*   **Compressed NFTs:** Consider using Metaplex Compressed NFTs for accessories or lower-value items to drastically reduce minting costs if scale becomes large.