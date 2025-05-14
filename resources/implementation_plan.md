
## Pixel Pet Rancher: Phased Implementation Plan (Hackathon MVP)

**Goal:** Deliver a functional MVP demonstrating Civic Auth login, embedded wallet creation, Pet NFT ownership, SPL token earning, and basic SPL token spending within ~4 days.

**Key Principles:**
*   **Prioritize Core Flow:** Focus relentlessly on the main user journey required by the bounty (Login -> Wallet -> Own -> Earn -> Spend).
*   **Iterative Development:** Build features incrementally and test frequently.
*   **MVP Scope:** Use placeholders (images, simple logic) where complex features aren't essential for the demo.
*   **Civic First:** Ensure the Civic integration works flawlessly early on.
*   **Clear Commits:** Use descriptive git commits for each task/feature.

---

### **Phase 0: Project Setup & Foundation (Estimated: ~3-4 hours)**

*   **Objective:** Initialize the project, install dependencies, set up environment variables, and establish basic Solana connections.
*   **Tasks:**
    1.  **Initialize Next.js Project:**
        *   `npx create-next-app@latest pixel-pet-rancher --ts --tailwind --eslint --app`
        *   Navigate into the project directory.
    2.  **Install Core Dependencies:**
        *   `npm install @civic/auth-web3 @solana/web3.js @solana/spl-token @metaplex-foundation/mpl-token-metadata zustand @vercel/kv`
        *   (Optional but recommended: `npm install axios @metaplex-foundation/js`)
    3.  **Environment Setup (`.env.local`):**
        *   Create the `.env.local` file.
        *   Add `CIVIC_CLIENT_ID` (Get from auth.civic.com).
        *   Add `SOLANA_RPC_URL` (e.g., `https://api.devnet.solana.com`).
        *   **Generate Server Wallets:** Use `solana-keygen new --outfile wallet-name.json` *three times* to create JSON keypairs for `MINTER_WALLET`, `REWARD_POOL_WALLET`, `TREASURY_WALLET`.
        *   **Fund Server Wallets:** Airdrop Devnet SOL to the public keys of these three wallets (`solana airdrop 2 <WALLET_ADDRESS> --url https://api.devnet.solana.com`).
        *   Add the private keys (as byte arrays or base58 strings) to `.env.local` (e.g., `MINTER_PRIVATE_KEY`, `REWARD_POOL_PRIVATE_KEY`, `TREASURY_PRIVATE_KEY`). **Handle with extreme care.**
    4.  **Basic Solana Library Setup (`src/lib/solana.ts`):**
        *   Create the file.
        *   Initialize Solana `Connection` using `SOLANA_RPC_URL`.
        *   Create helper functions to load server keypairs from environment variables.
        *   (Optional) Add basic `sendAndConfirmTransaction` wrapper for server-signed transactions.
    5.  **Vercel KV Setup:**
        *   Create a Vercel account if you don't have one.
        *   Link the project repository to Vercel.
        *   Add a Vercel KV database via the Vercel dashboard. Connect it to the project. Environment variables (`KV_URL`, etc.) should be automatically injected in deployment and can be copied for local use.
    6.  **Initial Project Structure:**
        *   Create the basic directories outlined in the Technical Document (`app/api`, `components`, `hooks`, `lib`, `store`, etc.).
    7.  **Git Initialization:** `git init`, create initial commit.

---

### **Phase 1: Civic Auth & Wallet Integration (Estimated: ~4-6 hours)**

*   **Objective:** Implement user login via Civic, automatic embedded wallet creation, and display basic user/wallet info.
*   **Tasks:**
    1.  **Configure `next.config.js`:**
        *   Import `createCivicAuthPlugin` from `@civic/auth-web3/nextjs`.
        *   Wrap `nextConfig` with `createCivicAuthPlugin({ clientId: process.env.CIVIC_CLIENT_ID })`.
    2.  **Implement Civic API Route:**
        *   Create `src/app/api/auth/[...civicauth]/route.ts`.
        *   Import `handler` from `@civic/auth-web3/nextjs` and export `GET = handler()`.
    3.  **Integrate `CivicAuthProvider`:**
        *   Wrap the `{children}` in `src/app/layout.tsx` with `<CivicAuthProvider>`.
    4.  **Create `UserButtonClient` Component:**
        *   Create `src/components/auth/UserButtonClient.tsx`.
        *   Make it a client component (`'use client'`).
        *   Import and render `UserButton` from `@civic/auth-web3/react`. Add basic styling.
    5.  **Implement Login/Logout:**
        *   Add `UserButtonClient` to the main layout or a header component.
        *   Test the login flow redirects to Civic/Google and back. Test logout.
    6.  **Create `useCivicWallet` Hook (`src/hooks/useCivicWallet.ts`):**
        *   Make it a client component hook.
        *   Use `useUser` from `@civic/auth-web3/react`.
        *   Return relevant context: `user`, `isLoading`, `login`, `logout`.
        *   Check `userContext.user` and `userHasWallet`. Return status flags: `isLoggedIn`, `hasWallet`, `isCreatingWallet`.
        *   Expose `createWallet` function (`userContext.createWallet`).
        *   Expose `publicKey` (`userContext.solana?.address`).
        *   Expose `wallet` object (`userContext.solana?.wallet` - needed for `sendTransaction`).
    7.  **Implement Wallet Creation UI Flow:**
        *   In the main game page (`src/app/(game)/page.tsx` or similar):
            *   Use `useCivicWallet`.
            *   If `isLoggedIn && !hasWallet && !isCreatingWallet`, show a "Start Your Ranch!" button that calls the hook's `createWallet` function.
            *   If `isCreatingWallet`, show a loading indicator.
            *   If `isLoggedIn && hasWallet`, proceed to show the game content.
    8.  **Display User/Wallet Info:**
        *   Once `hasWallet` is true, display the `user.name` and truncated `publicKey` somewhere in the UI.
    9.  **Testing:** Thoroughly test login, logout, first-time login with wallet creation prompt, wallet creation process, and display of info.

---

### **Phase 2: Core Game UI & Off-Chain State (Estimated: ~4-5 hours)**

*   **Objective:** Build basic UI components for displaying pets and interacting with them, using mocked off-chain state managed via Vercel KV.
*   **Tasks:**
    1.  **Create Pet Components:**
        *   `src/components/game/PetDisplay.tsx`: Takes pet data (image URL, name, stats) as props. Render a placeholder image and basic text stats.
        *   `src/components/game/PetActions.tsx`: Takes `petId` and functions (`onFeed`, `onClean`) as props. Render "Feed" and "Clean" buttons.
        *   `src/components/game/RanchView.tsx`: Component to display multiple `PetDisplay` components.
    2.  **Setup Vercel KV Library (`src/lib/state.ts`):**
        *   Import KV client from `@vercel/kv`.
        *   Create functions like `getPetState(petId)`, `updatePetState(petId, updates)`, `initializePetState(petId)`. These will interact with KV using keys like `pet:${petId}`.
    3.  **Implement Pet State API Route:**
        *   Create `src/app/api/pets/state/[mint]/route.ts` (GET): Fetch state using `getPetState`. Requires user authentication (`getUser`).
        *   Create `src/app/api/pets/interact/route.ts` (POST): Takes `petId`, `action` (feed/clean). Verify user auth. Update state using `updatePetState` (e.g., increment happiness, update `lastFedTime`). Return updated state.
    4.  **Create `usePetState` Hook (`src/hooks/usePetState.ts`):**
        *   Takes `petId` (NFT mint address - mocked for now).
        *   Fetches initial state from `/api/pets/state/[mint]`.
        *   Provides current state and functions (`feedPet`, `cleanPet`) that call the `/api/pets/interact` endpoint and update local state optimistically or upon success.
    5.  **Integrate UI:**
        *   In the main game page, use `RanchView`. For now, display a single `PetDisplay` with mocked data/ID.
        *   Wire `PetActions` buttons to the `usePetState` functions.
        *   Display basic stats (e.g., happiness) fetched via the hook.
    6.  **Testing:** Test fetching initial state, clicking Feed/Clean updates the displayed state (check KV via Vercel dashboard if needed).

---

### **Phase 3: Pet NFT Minting & Display (Estimated: ~5-6 hours)**

*   **Objective:** Implement the pet adoption flow, minting a real (placeholder) NFT to the user's embedded wallet. Display owned NFTs.
*   **Tasks:**
    1.  **Metaplex Library Setup (`src/lib/metaplex.ts`):**
        *   Import necessary Metaplex functions (`createMint`, `createMetadataAccountV3`, etc.).
        *   Create a helper function `mintPetNft(connection, minterKeypair, recipientPublicKey, metadataUri)` that:
            *   Loads the `MINTER_WALLET` keypair.
            *   Constructs instructions to create mint, user ATA, mint token, create metadata account.
            *   Uses a **placeholder `metadataUri`** for now (can point to a generic JSON file stored in `/public`).
            *   Sends and confirms the transaction signed by the `minterKeypair`.
            *   Returns the new NFT mint address.
    2.  **Implement Adopt API Route:**
        *   Create `src/app/api/pets/adopt/route.ts` (POST).
        *   Verify user auth (`getUser`). Get `userPublicKey`.
        *   Call `mintPetNft` function from `lib/metaplex.ts`.
        *   Call `initializePetState` from `lib/state.ts` for the new mint address in Vercel KV.
        *   Return the new NFT mint address upon success.
    3.  **Implement Adoption UI:**
        *   Add an "Adopt New Pet" button to the main game page.
        *   On click, call the `/api/pets/adopt` endpoint. Show loading state.
    4.  **Fetch & Display Owned NFTs:**
        *   Modify `usePetState` or create a new hook (`useOwnedPets`).
        *   Get the user's `publicKey` from `useCivicWallet`.
        *   Use `connection.getTokenAccountsByOwner` to get all token accounts.
        *   **Filter:** For MVP, filter accounts with amount = 1. *Proper filtering requires checking against a collection mint or update authority setup during minting (skip for MVP if needed).*
        *   For each potential NFT mint:
            *   Fetch its Metaplex metadata (use a helper in `lib/metaplex.ts`).
            *   Fetch its off-chain state using the `/api/pets/state/[mint]` endpoint or `usePetState`.
        *   Update `RanchView` to display all owned pets based on fetched data.
    5.  **Testing:** Test the "Adopt" button flow. Verify NFT appears in the user's wallet (check Solscan Devnet) and is displayed in the UI. Verify interactions (Feed/Clean) still work for the *real* NFT mint address.

---

### **Phase 4: SPL Token (Sparkle Kibble) & Rewards (Estimated: ~4-5 hours)**

*   **Objective:** Create the SPL token, implement a way to earn it (simple mini-game placeholder), and display the balance.
*   **Tasks:**
    1.  **Create SPL Token (One-Time):**
        *   Use `spl-token create-token` command (or a UI tool). Record the **Token Mint Address**.
        *   Use `spl-token create-account <TOKEN_MINT_ADDRESS>` for the **Reward Pool Wallet**. Record the **Reward Pool Token Account Address**.
        *   Use `spl-token mint <TOKEN_MINT_ADDRESS> <AMOUNT> <REWARD_POOL_TOKEN_ACCOUNT_ADDRESS>` to mint initial supply.
        *   Add `SPARKLE_KIBBLE_MINT_ADDRESS` to `.env.local`.
    2.  **SPL Library Setup (`src/lib/spl.ts`):**
        *   Add functions:
            *   `transferSplTokens(connection, payerKeypair, sourceTokenAccount, recipientPublicKey, amount, tokenMintAddress)`: Handles finding recipient ATA, creating transfer instruction, sending tx signed by `payerKeypair`.
            *   `getSplBalance(connection, ownerPublicKey, tokenMintAddress)`: Finds ATA and gets balance.
    3.  **Implement Reward API Route:**
        *   Create `src/app/api/rewards/minigame/route.ts` (POST).
        *   Verify user auth (`getUser`). Get `userPublicKey`.
        *   Validate input (e.g., basic score check). Calculate reward amount.
        *   Load the `REWARD_POOL_WALLET` keypair.
        *   Call `transferSplTokens` using Reward Pool keypair/token account as source, user's public key as recipient.
        *   Return success/amount awarded.
    4.  **Create Simple Mini-Game Placeholder:**
        *   Add a "Play Mini-Game" button in the UI (`PetActions` or elsewhere).
        *   On click, simulate game completion (maybe a short timeout) and call the `/api/rewards/minigame` endpoint with a fixed score. Show loading/success feedback.
    5.  **Implement Balance Display Hook (`src/hooks/useSplBalance.ts`):**
        *   Takes `tokenMintAddress`.
        *   Gets `publicKey` from `useCivicWallet`.
        *   Calls `getSplBalance` from `lib/spl.ts` periodically or on demand.
        *   Returns the balance.
    6.  **Integrate Balance Display:**
        *   Use `useSplBalance` in the main UI to show the user's Sparkle Kibble balance.
    7.  **Testing:** Test clicking the mini-game button. Verify Kibble balance increases in the UI and on Solscan (check user's ATA for the Kibble mint).

---

### **Phase 5: Basic Purchase Flow (SPL Token) (Estimated: ~4-5 hours)**

*   **Objective:** Implement a basic store where users can spend Sparkle Kibble using their embedded wallet.
*   **Tasks:**
    1.  **Treasury Wallet Setup:**
        *   Ensure `TREASURY_WALLET` has Devnet SOL. Create its token account for Sparkle Kibble (`spl-token create-account <KIBBLE_MINT_ADDRESS> --owner <TREASURY_PUBLIC_KEY>`).
    2.  **Basic Store UI (`src/components/store/Shop.tsx`, `ShopItem.tsx`):**
        *   Display 1-2 hardcoded items (e.g., "Pet Hat", "Bonus Food") with Kibble prices.
        *   Add a "Buy" button for each item.
    3.  **Frontend Purchase Logic:**
        *   On "Buy" click:
            *   Get `wallet`, `publicKey` from `useCivicWallet`. Get Kibble balance via `useSplBalance`.
            *   Check if user has sufficient Kibble.
            *   Construct Transaction:
                *   Find user's Kibble ATA.
                *   Find Treasury's Kibble ATA.
                *   Use `createTransferInstruction` from `@solana/spl-token`. Authority is the user's `publicKey`.
                *   Create a new `Transaction().add(instruction)`.
            *   Sign & Send: Call `wallet.sendTransaction(transaction, connection)`. Show loading state.
            *   Wait for Confirmation: `connection.confirmTransaction(signature)`.
            *   If confirmed, send the `signature` to the confirmation API endpoint.
    4.  **Implement Confirmation API Route:**
        *   Create `src/app/api/store/purchase/confirm/route.ts` (POST).
        *   Receive `signature` and `itemId` in the request body.
        *   Verify user auth (`getUser`). Get `userPublicKey`.
        *   **CRITICAL VERIFICATION:**
            *   Fetch transaction: `connection.getTransaction(signature, { maxSupportedTransactionVersion: 0 })`.
            *   Parse transaction instructions. Find the SPL transfer instruction.
            *   Verify `source` matches user's Kibble ATA.
            *   Verify `destination` matches Treasury's Kibble ATA.
            *   Verify `owner`/`signer` matches user's `publicKey`.
            *   Verify `amount` matches the `itemId`'s price.
            *   Verify transaction was successful (no error).
        *   If verification passes:
            *   Update off-chain state: Use `lib/state.ts` to mark the item as purchased for the user in Vercel KV (e.g., `user:${userId}:items = ["Pet Hat"]`). **(Skip accessory NFT minting for MVP).**
            *   Return success.
        *   If verification fails, return an error.
    5.  **Update UI on Success:** Show a success message or visually unlock/add the item in the UI based on updated state fetched from KV.
    6.  **Testing:** Test buying an item. Verify Kibble balance decreases. Verify the confirmation API performs checks correctly (try sending bad data). Verify item appears "unlocked" (check KV state).

---

### **Phase 6: Polish, Testing & Demo Prep (Estimated: ~4-6 hours)**

*   **Objective:** Refine the UI, test end-to-end flows, prepare repository, and record the demo video.
*   **Tasks:**
    1.  **UI/UX Polish:**
        *   Add loading indicators for asynchronous actions (API calls, transactions).
        *   Implement basic error handling (show user-friendly messages on failure).
        *   Improve layout and styling for a presentable look.
        *   Use actual (simple) pixel art for pets if possible, otherwise placeholders are fine.
    2.  **End-to-End Testing:**
        *   Test the *entire* user journey: New User Login -> Wallet Creation -> Adopt Pet -> Play Game -> Earn Kibble -> Buy Item -> Logout -> Login Again (verify state persists).
        *   Test edge cases (insufficient funds, API errors).
    3.  **Code Cleanup & Documentation:**
        *   Remove console logs, commented-out code.
        *   Add comments to complex sections (especially API verification logic).
        *   Ensure environment variables are properly used.
    4.  **README.md:**
        *   Write a clear `README.md` explaining:
            *   Project concept.
            *   How Civic Auth is integrated and its benefits.
            *   How to set up (`.env.local` requirements).
            *   How to run the project (`npm install`, `npm run dev`).
            *   Core features implemented.
    5.  **Prepare GitHub Repository:**
        *   Ensure the repository is public.
        *   Push final code.
    6.  **Record Demo Video (Crucial):**
        *   Keep it concise (1-3 minutes).
        *   **Start:** Briefly introduce the game concept.
        *   **Showcase Civic:** Clearly demonstrate the Google login flow via Civic. Show the "Start Ranch" / Wallet Creation step for a new user. Emphasize the seamlessness.
        *   **Showcase Core Loop:** Show adopting a pet (mention it's an NFT), playing the mini-game, earning Kibble (show balance update), visiting the store, and buying an item using Kibble (show the Civic confirmation pop-up briefly if possible, then balance decrease).
        *   **Explain:** Briefly narrate *why* Civic Auth makes this easy (no extensions, no seed phrases, direct NFT/SPL ownership).
        *   Ensure good audio/video quality.




        Important Note on Selling: For this MVP phase, the handleTrade for 'sell' updates client-side cargo and simulates a credit increase by just refreshing the balance (which won't change yet as no on-chain payout happened from the server). A full sell cycle where the user receives SPL from the market would require:
User action (click "Sell").
Client calls a backend API (e.g., /api/trade/sell).
Backend API verifies the sale, then uses the rewardPoolKeypair or treasuryKeypair to transferSplFromPoolToServer (our lib/spl.ts function) to the user's publicKey.
Client then refreshes balance.
We will defer implementing this backend API for selling to keep Phase 2 focused on the user-signed "buy" transaction.