# AstroTrader: Galactic Arbitrage - Civic Auth Hackathon Submission

**AstroTrader** is a browser-based sci-fi trading simulation game where players navigate a dynamic galaxy, buy and sell commodities, upgrade their starship with NFT blueprints, and manage their wealth using "Galactic Credits" (an SPL Token). This project showcases a seamless Web3 onboarding experience powered by **Civic Auth** and its embedded wallet functionality.

## Table of Contents

1.  [Project Overview](#project-overview)
2.  [Key Features](#key-features)
3.  [Civic Auth Integration Highlight](#civic-auth-integration-highlight)
4.  [Technology Stack](#technology-stack)
5.  [Core Gameplay Loop & User Flow](#core-gameplay-loop--user-flow)
6.  [Project Structure](#project-structure)
7.  [API Routes](#api-routes)
8.  [Setup & Installation](#setup--installation)
    *   [Prerequisites](#prerequisites)
    *   [Environment Variables](#environment-variables)
    *   [Solana SPL Token & NFT Setup (Devnet)](#solana-spl-token--nft-setup-devnet)
    *   [Running Locally](#running-locally)
9.  [Future Enhancements](#future-enhancements)
10. [Team/Author](#teamauthor)


## Project Overview

AstroTrader aims to provide an engaging trading simulation experience while demonstrating how Web3 technologies, particularly seamless authentication and wallet management via Civic Auth, can enhance gameplay with true digital ownership (NFTs for ship blueprints) and an on-chain economy (SPL Tokens for Galactic Credits). Players explore planets, analyze markets, make strategic trades, and improve their ship to become the ultimate galactic entrepreneur.

The core challenge addressed is the typical friction associated with Web3 onboarding. AstroTrader, using Civic, allows users to sign in with familiar methods (like Google) and immediately have a secure, non-custodial Solana wallet created for them, enabling on-chain interactions without needing prior crypto knowledge, browser extensions, or seed phrase management.


##  Key Features

*   **Seamless Onboarding:** Users log in via Civic Auth, with automatic embedded Solana wallet creation.
*   **Galactic Trading:** Buy and sell various commodities across different planets with fluctuating market prices.
*   **On-Chain Economy:** "Galactic Credits" are an SPL Token on the Solana Devnet, used for all in-game transactions.
*   **NFT Ship Blueprints:** Players can acquire unique NFT blueprints that provide persistent upgrades to their starship (e.g., increased cargo capacity, better fuel efficiency).
*   **Persistent User Game State:** Player progress (ship status, cargo, current location, owned blueprints) is saved server-side (using Redis via Next.js API Routes).
*   **Dynamic Starmap Navigation:** Travel between planets, consuming fuel.
*   **Planet-Specific Services:** Refuel your ship or purchase blueprints at planetary stores/shipyards.
*   **Intuitive Sci-Fi UI:** A "command console" themed interface designed for desktop.


## Civic Auth Integration Highlight

Civic Auth is central to AstroTrader's user experience and Web3 functionality:

*   **Frictionless Login:** Players use `signIn()` from `@civic/auth-web3/react` (triggered by the custom login button) for a familiar Google-based authentication flow.
*   **Embedded Wallet Creation:** Upon first successful login, if no wallet exists for the user, the game prompts them to initialize their "Guild Wallet." This calls `createWallet()` from the Civic user context, seamlessly provisioning a non-custodial Solana EOA linked to their Civic identity.
*   **On-Chain Interactions via Embedded Wallet:**
    *   **SPL Token Transfers:** When a player buys commodities or fuel using Galactic Credits, the transaction to transfer these SPL Tokens from their embedded wallet to the treasury/service wallet is constructed on the client and signed using `sendTransaction()` provided by the Civic wallet context (`useCivicWallet` hook).
    *   **NFT Ownership:** Acquired Blueprint NFTs are minted directly to the user's embedded wallet address. The game client then fetches and verifies ownership of these NFTs from the blockchain to apply their in-game effects.
*   **User Identity:** Civic User ID (`user.id`) is used server-side as a key for storing persistent game state in Redis, ensuring data is tied to the correct authenticated user. The user's solana wallet address from their Civic session is used as the recipient for NFT mints and initial SOL/token airdrops.
*   **Simplified UX:** By abstracting away seed phrases and browser extensions, Civic Auth allows players to engage with on-chain assets and an SPL token economy without needing to be crypto-savvy, directly aligning with the bounty's goal of simple, flexible, and fast authentication with embedded wallets.
*   **Initial SOL for Fees:** To further reduce friction, the initial faucet API sends a small amount of Devnet SOL to the user's newly created embedded wallet, covering their first few transaction fees.

## Technology Stack

*   **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS
*   **State Management (Client):** Zustand
*   **Authentication & Wallet:** `@civic/auth-web3` (Civic Auth + Embedded Wallets)
*   **Blockchain:** Solana (Devnet)
    *   `@solana/web3.js`: Core Solana interactions.
    *   `@solana/spl-token`: For Galactic Credits (SPL Token).
    *   `@metaplex-foundation/js`: For NFT Blueprint minting and fetching.
*   **Backend (within Next.js):** Next.js API Routes
*   **Database (Server-side):** Redis (via `ioredis`) for persistent user game state and idempotency checks.
*   **UI/UX:** Framer Motion (for subtle animations), react-tabs, react-hot-toast


## Core Gameplay Loop & User Flow

1.  **Onboarding:**
    *   User visits the game.
    *   Clicks "Sign In & Initialize Guild Wallet."
    *   Authenticates via Civic (Google).
    *   If a new AstroTrader player, their embedded Solana wallet is created via Civic.
    *   A modal prompts them to "Claim Starting Package."
    *   User clicks "Claim": An API call is made.
        *   Server verifies this is a first-time claim (using Redis).
        *   Server transfers initial Galactic Credits (SPL) and a small amount of Devnet SOL (for fees) to the user's embedded wallet.
2.  **Main Gameplay:**
    *   User sees the main game interface: Header HUD (Credits, Ship info), Starmap (Left), Tabbed Panel (Right - Market/Shipyard).
    *   **Navigation:** User clicks a planet on the Starmap. Ship travels (fuel consumed, state saved via API).
    *   **Trading (Market Tab):**
        *   User views commodity prices on the current planet.
        *   **Buy:** User enters quantity, clicks "Buy." A transaction is prepared to transfer Galactic Credits from their wallet to the treasury. Civic's embedded wallet prompts for signature. If successful, cargo updates, GC balance updates (fetched from chain), game state saved.
        *   **Sell:** User enters quantity, clicks "Sell." An API call is made. Server verifies, transfers GC from treasury/pool to user's wallet. Cargo updates, GC balance updates, game state saved.
    *   **Upgrading (Shipyard Tab):**
        *   User views current ship stats and owned NFT Blueprints.
        *   (MVP) User can click a "Debug: Get Blueprint" button. An API call is made, a placeholder Blueprint NFT is minted to their wallet by the server.
        *   The UI reflects owned blueprints, and their passive effects (e.g., increased cargo capacity) are applied to the ship's stats (game state saved).
    *   **Refueling:** At planets offering fuel, user can spend GC to refuel their ship (on-chain SPL transfer).
3.  **Progression:** Earn more GC, acquire blueprints, upgrade ship, explore more planets.
4.  **Sign Out:** User data is persisted on the server.


## 6. Project Structure

```
src/
├── app/
│   ├── (game)/page.tsx       # Main game interface
│   ├── api/
│   │   ├── auth/[...civicauth]/route.ts
│   │   ├── blueprints/
│   │   │   └── award-placeholder/route.ts
│   │   ├── faucet/
│   │   │   └── claim-initial-credits/route.ts
│   │   ├── game/
│   │   │   ├── user-data/route.ts # Load/Save user game state
│   │   │   ├── planets/route.ts
│   │   │   └── commodities/route.ts
│   │   └── trade/
│   │       └── execute-sell/route.ts
│   ├── animations.css
│   ├── layout.tsx            # Root layout with CivicAuthProvider
│   └── globals.css
├── components/
│   ├── game/                 # Game view components
│   │   ├── HudView.tsx       # Game HUD display
│   │   ├── MarketView.tsx    # Planet market interface
│   │   ├── RefuelView.tsx    # Ship refueling interface with wallet integration
│   │   └── ShipyardView.tsx  # Blueprint management with NFT integration
│   └── ui/                   # Reusable UI components 
│       ├── Header.tsx
│       ├── LoadingScreen.tsx
│       ├── Modal.tsx
│       ├── StoreButton.tsx
│       └── StoreModal.tsx
├── config/environment.ts     # Type-safe environment variable access
├── data/
│   └── mock-db/              # JSON files for game data
│       ├── planets.json      # Planet definitions including fuel prices
│       ├── commodities.json  # Commodity definitions
│       └── blueprints.json   # Blueprint definitions
├── hooks/                    # Custom React hooks
│   ├── useCivicWallet.ts     # Hook for Civic wallet integration
│   ├── useGalacticCredits.ts # Hook for token balance and transfers
│   └── useOwnedBlueprints.ts # Hook for fetching NFT blueprints
├── lib/                      # Utility libraries
│   ├── solana-client.ts      # Client-side Solana interactions
│   ├── solana-server.ts      # Server-side Solana operations
│   ├── spl-client.ts         # Client-side SPL token handling
│   ├── spl-server.ts         # Server-side SPL token operations
│   ├── metaplex-client.ts    # NFT metadata handling with blueprint parsing
│   ├── metaplex-server.ts    # Server-side NFT operations
│   ├── redis.ts              # Redis client for persistent storage
├── providers/                # React context providers
├── repositories/             # Data access repositories
│   ├── blueprint-definition-repository.ts
│   ├── commodity-repository.ts
│   └── planet-repository.ts
├── store/
│   └── creditsStore.ts       # Zustand global credits store
│   └── gameStore.ts          # Zustand global game state store
└── types/
    ├── models.ts             # Core data structures
    └── blueprints.ts         # Blueprint type definitions
```

## API Routes

*   **`/api/auth/[...civicauth]` (GET):** Handles Civic Auth OAuth callbacks and session management. Provided by `@civic/auth-web3/nextjs`.
*   **`/api/faucet/claim-initial-credits` (POST):** For authenticated users to claim their one-time starting package of Galactic Credits (SPL) and Devnet SOL. Uses Redis for idempotency. Server wallets fund this.
*   **`/api/game/planets` (GET):** Returns a list of all planets and their market data (from `game-data-repository`).
*   **`/api/game/commodities` (GET):** Returns a list of all commodity definitions (from `game-data-repository`).
*   **`/api/game/blueprint-definitions` (GET):** Returns a list of all blueprint definitions (from `game-data-repository`).
*   **`/api/game/user-data`:**
    *   **GET:** Loads the authenticated user's persistent game state (ship, cargo, location, owned blueprints) from Redis. Returns default state if none found.
    *   **POST:** Saves the authenticated user's current game state to Redis.
*   **`/api/blueprints/mint` (POST):** Mints a blueprint NFT to the authenticated user's wallet after payment verification. Takes blueprintId and transactionSignature, verifies user ownership, and ensures the blueprint hasn't been minted already for this user using Redis for idempotency. The server pays minting fees.
*   **`/api/trade/execute-sell` (POST):** Processes a user's request to sell commodities. Verifies the request, then transfers Galactic Credits from a server wallet (Treasury/Reward Pool) to the user's wallet.

## Setup & Installation

### Prerequisites

*   Node.js (v18.x or later recommended)
*   npm or yarn or bun
*   Solana CLI (for creating SPL Token and initial funding if done manually outside the app, or for checking balances)
*   A running Redis instance (local Docker or cloud-hosted)

### Environment Variables

Create a `.env.local` file in the root of the project and populate it with the following variables:

```dotenv
# Civic Auth
NEXT_PUBLIC_CIVIC_CLIENT_ID=YOUR_CIVIC_CLIENT_ID_FROM_AUTH.CIVIC.COM
CIVIC_CLIENT_ID=YOUR_CIVIC_CLIENT_ID_FROM_AUTH.CIVIC.COM # For server-side plugin if needed

# Solana
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com # Or your preferred Devnet RPC

# Galactic Credits SPL Token (Create this in the upcoming steps)
NEXT_PUBLIC_GALACTIC_CREDITS_MINT_ADDRESS=YOUR_GALACTIC_CREDITS_TOKEN_MINT_ADDRESS

# Treasury Wallet Public Key (Create wallet, get public key)
NEXT_PUBLIC_TREASURY_WALLET_PUBLIC_KEY=YOUR_TREASURY_WALLET_PUBLIC_KEY

# Server-Side Wallet Private Keys (Byte Arrays as comma-separated numbers in a string, or base58)
# Generate these using `solana-keygen new --outfile walletname.json`
MINTER_PRIVATE_KEY="[...your minter private key bytes...]"
REWARD_POOL_PRIVATE_KEY="[...your reward pool private key bytes...]"
TREASURY_PRIVATE_KEY="[...your treasury private key bytes...]" # Private key for the treasury

# Redis
REDIS_URL="redis://localhost:6379" # Or your cloud Redis connection string

# Optional: For bypassing build errors during development
# IGNORE_BUILD_ERRORS=true
# IGNORE_LINT_ERRORS=true
```

### Solana SPL Token & NFT Setup (Devnet)

These steps are typically done once using the Solana CLI.

1.  **Create Server Wallets (if not done):**
    Use `solana-keygen new --outfile minter_wallet.json` (and similarly for `reward_pool_wallet.json`, `treasury_wallet.json`). Fund them with Devnet SOL:
    `solana airdrop 2 <WALLET_ADDRESS_OR_FILEPATH> --url https://api.devnet.solana.com`

2.  **Create "Galactic Credits" SPL Token:**
    ```bash
    spl-token create-token --decimals 6 --url https://api.devnet.solana.com --fee-payer minter_wallet.json
    ```
    *   Note the output "Token Mint Address" and set `NEXT_PUBLIC_GALACTIC_CREDITS_MINT_ADDRESS` in `.env.local`.
    *   The `minter_wallet.json` (or your specified fee payer) becomes the default mint authority.

3.  **Create Token Account for Reward Pool & Mint Initial Supply:**
    ```bash
    # Get Reward Pool Wallet public key: solana-keygen pubkey reward_pool_wallet.json
    spl-token create-account NEXT_PUBLIC_GALACTIC_CREDITS_MINT_ADDRESS --owner <REWARD_POOL_PUBLIC_KEY> --url https://api.devnet.solana.com --fee-payer minter_wallet.json
    spl-token mint NEXT_PUBLIC_GALACTIC_CREDITS_MINT_ADDRESS <AMOUNT_IN_SMALLEST_UNITS> <REWARD_POOL_PUBLIC_KEY> --url https://api.devnet.solana.com --mint-authority minter_wallet.json
    ```
    *   Example amount for 1 billion GC with 6 decimals: `1000000000000000`.

4.  **Create Token Account for Treasury Wallet:**
    ```bash
    # Get Treasury Wallet public key: solana-keygen pubkey treasury_wallet.json
    spl-token create-account NEXT_PUBLIC_GALACTIC_CREDITS_MINT_ADDRESS --owner <TREASURY_PUBLIC_KEY> --url https://api.devnet.solana.com --fee-payer minter_wallet.json
    ```
    *   Set `NEXT_PUBLIC_TREASURY_WALLET_PUBLIC_KEY` in `.env.local`.

5.  **Host Blueprint Metadata JSON:**
    *   Create your `placeholder-blueprint-metadata.json` as described in Phase 3.
    *   Host it (e.g., in `public/blueprints/` and use `http://localhost:3000/blueprints/placeholder-blueprint-metadata.json` for local dev, or use JSONKeeper).
    *   Set `NEXT_PUBLIC_PLACEHOLDER_BLUEPRINT_METADATA_URI` in `.env.local`.

### Running Locally

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Codewithkyrian/astrotrader
    cd astrotrader
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # bun install
    ```
3.  **Set up your `.env.local` file** as described above.
4.  **Ensure your Redis server is running** and accessible via `REDIS_URL`.
5.  **Start the development server:**
    ```bash
    npm run dev
    # or
    # yarn dev
    ```
6.  Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Future Enhancements

*   More complex commodity pricing and market events.
*   Diverse ship types and more detailed upgrade paths.
*   Crafting system using resources and blueprints.
*   Player-to-player trading.
*   Faction reputation and missions.
*   Visual enhancements for travel (e.g., hyperlane animations).
*   More blueprint types with varied effects.
*   Mobile responsiveness.

---

## 1Team/Author

*   **Kyrian Obikwelu**
*   Contact: https://x.com/CodeWithKyrian