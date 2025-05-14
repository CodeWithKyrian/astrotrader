# Civic Auth Solana Integration Guide Summary

**Source:** [Civic Docs - Solana](https://docs.civic.com/auth/web3/solana)

**Status:** Early Access (API subject to change)

## Creating a Wallet

*   Wallets are not created by default upon login.
*   Use the `createWallet` function on the user context object to provision a wallet.
*   Use the `userHasWallet` type guard from `@civic/auth-web3` to check if a user already has a wallet.

```javascript
import { userHasWallet } from "@civic/auth-web3";
import { useUser } from "@civic/auth-web3/react";

export const afterLogin = async () => {
  const userContext = await useUser();

  // Check if the user exists and doesn't have a wallet
  if (userContext.user && !userHasWallet(userContext)) {
    // Create a wallet if one doesn't exist
    await userContext.createWallet();
  }
};
```

## `useUser` Hook and `UserContext`

*   The `useUser` hook returns a context object containing base user info and Web3-specific fields.
*   **If user has a wallet (`ExistingWeb3UserContext`):**
    *   Contains `solana.address` (base58 public key).
    *   Contains `solana.wallet` (a Solana Wallet object conforming to the Wallet Adapter standard).
*   **If user does NOT have a wallet (`NewWeb3UserContext`):**
    *   Contains `createWallet` function.
    *   Contains `walletCreationInProgress` boolean flag.
*   Use the `userHasWallet` type guard to differentiate between these states.

## Using the Wallet

### Sending a Transaction

```javascript
import { Connection, Transaction, SystemProgram, PublicKey } from '@solana/web3.js';

// Assuming 'userContext' is an ExistingWeb3UserContext
const connection = new Connection(/* your rpc endpoint */);
const { publicKey, sendTransaction } = userContext.solana.wallet;
const recipient = 'RECIPIENT_PUBLIC_KEY'; // Replace with actual recipient address

const transaction = new Transaction().add(
  SystemProgram.transfer({
    fromPubkey: publicKey,
    toPubkey: new PublicKey(recipient),
    lamports: 1000000, // Example: 0.001 SOL
  })
);

// Sign and send the transaction via the embedded wallet
const signature = await sendTransaction(transaction, connection);
console.log('Transaction signature:', signature);
```

### Checking Balance

```javascript
import { Connection } from '@solana/web3.js';

// Assuming 'userContext' is an ExistingWeb3UserContext
const connection = new Connection(/* your rpc endpoint */);
const { publicKey } = userContext.solana.wallet;

const balance = await connection.getBalance(publicKey);
console.log(`Balance: ${balance / 1e9} SOL`);
```

## Using with Solana Wallet Adapter

*   Civic Auth Web3 SDK integrates with the [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter).
*   The embedded wallet is automatically discovered by the adapter.
*   Allows using familiar hooks like `useWallet` and `useConnection`.

**Next.js (Webpack < 15.3) Configuration:**

*   In `next.config.js` or `next.config.mjs`, enable the flag within the `createCivicAuthPlugin`:

```javascript
// next.config.mjs (example)
import { createCivicAuthPlugin } from '@civic/auth-next';

const nextConfig = {
  // ... other Next.js config
};

export default createCivicAuthPlugin({
  clientId: '<your civic auth client ID>',
  // ensures Civic's Wallet Adapter integration works with Webpack:
  enableSolanaWalletAdapter: true,
})(nextConfig);
```

**Provider Setup (React Example):**

```jsx
import React, { FC } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { CivicAuthProvider } from '@civic/auth-web3/react';

// Default styles required for Wallet Adapter UI components
require('@solana/wallet-adapter-react-ui/styles.css');

export const Providers: FC = ({ children }) => { // Pass children
    const endpoint = "YOUR_RPC_ENDPOINT"; // Replace with your actual Solana RPC endpoint

    // You can add other wallets here if needed, e.g., [new PhantomWalletAdapter()]
    const wallets = [];

    return (
        <ConnectionProvider endpoint={endpoint}>
            {/* Provide the wallets array to WalletProvider */}
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    <CivicAuthProvider clientId="YOUR_CLIENT_ID"> {/* Replace with your Client ID */}
                        {/* Render children within the providers */}
                        {children}
                        {/* Example UI Button */}
                        {/* <WalletMultiButton /> */}
                    </CivicAuthProvider>
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

// Your main App component
const App = () => {
    return (
        <Providers>
            {/* Your application content goes here */}
            {/* Example: <AppContent /> */}
            <WalletMultiButton /> {/* Display the wallet button */}
        </Providers>
    );
};

export default App;
```

**Full Example:**

See below for a full minimal example of a Solana Adapter app using Civic Auth for an embedded wallet. 

```js
import { ConnectionProvider, WalletProvider, useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletModalProvider} from "@solana/wallet-adapter-react-ui";
import { CivicAuthProvider } from "@civic/auth-web3/react";

// Wrap the content with the necessary providers to give access to hooks: solana wallet adapter & civic auth provider
const App = () => {
    const endpoint = "YOUR RPC ENDPOINT";
    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={[]} autoConnect>
                <WalletModalProvider>
                    <CivicAuthProvider clientId="YOUR CLIENT ID">
                      <WalletMultiButton />
                      <AppContent/>
                    </CivicAuthProvider>
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

// A simple hook to get the wallet's balance in lamports
const useBalance = () => {
  const [balance, setBalance] = useState<number>();
  // The Solana Wallet Adapter hooks
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  if (publicKey) {
    connection.getBalance(publicKey).then(setBalance);
  }

  return balance;
};

// Separate component for the app content that needs access to hooks
const AppContent = () => {
  // Get the Solana wallet balance
  const balance = useBalance();
  // Get the Solana address
  const { publicKey } = useWallet();

  return (
    <>
      {publicKey && (
        <div>
          <p>Wallet address: {publicKey.toString()}</p>
          <p>Balance: {balance ? `${balance / 1e9} SOL` : "Loading..."}</p>
        </div>
      )}
    </>
  );
};

export default App;
```

Refer to the official Civic documentation for detailed integration steps for [React](https://docs.civic.com/auth/integration/react) and [Next.js](https://docs.civic.com/auth/integration/next.js). 