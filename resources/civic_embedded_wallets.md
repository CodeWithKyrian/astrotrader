# Civic Embedded Wallets Documentation Summary

**Source:** [Civic Docs](https://docs.civic.com/auth/web3/embedded-wallets)

## Overview

The **Civic Auth Web3 SDK** (`@civic/auth-web3`) extends the base **Civic Auth SDK** to include the ability to provision a Web3 wallet for users. This helps onboard users to Web3 without requiring prior crypto knowledge.

## Quick Start

1.  Sign up for Civic Auth at [auth.civic.com](https://auth.civic.com) and select the "Web3 wallet" option.
2.  If you already have an account, log in and enable the Web3 wallet option in the configuration.

## Installation

Install the SDK using your preferred package manager:

```bash
npm install @civic/auth-web3
# or
yarn add @civic/auth-web3
# or
pnpm install @civic/auth-web3
# or
bun add @civic/auth-web3
```

## Integration

*   Web3 wallets are currently available for **React** and **Next.js** environments.
*   Integration guides are provided for these frameworks in the documentation.
*   If you need support for other environments, you should [contact Civic](https://docs.civic.com/contact-us). (Note: Link derived from context, may need verification).

## Using the Wallet

Guides are available for setting up wallets for specific blockchains:

*   [Ethereum & EVMs](https://docs.civic.com/auth/web3/ethereum-evm)
*   [Solana](https://docs.civic.com/auth/web3/solana)

## About Embedded Wallets

### What are Embedded Wallets?

*   Cryptocurrency wallets provided directly by an app/website.
*   Removes the need for users to bring their own wallet or manage seed phrases.
*   Helps onboard non-crypto users to Web3 applications.

### Civic's Embedded Wallets

*   **Non-custodial:** Neither Civic nor the app developers have control over user wallets or assets.
*   **SSO Linked:** Wallets are linked to the user's Single Sign-On (e.g., Google) provider for authentication.
*   **EOA Type:** They are Externally Owned Account (EOA) wallets, offering simplicity and lower gas costs compared to smart contract/account abstraction (AA) wallets.
*   **Upgradeable:** Can be upgraded to support account abstraction features like gas sponsorship (contact Civic if interested).

### Recovery

*   A recovery feature is included via the wallet provider.
*   Ensures funds are not lost if there's a service interruption with Civic.
*   Refer to the service provider's documentation for more details on security and recovery. 