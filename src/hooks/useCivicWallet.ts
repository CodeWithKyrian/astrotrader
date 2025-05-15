'use client';

import { useEffect, useMemo } from 'react';
import { useUser } from '@civic/auth-web3/react';
import { PublicKey } from '@solana/web3.js';
import type { Adapter } from '@solana/wallet-adapter-base';
import type { ExistingWeb3UserContext, NewWeb3UserContext, SolanaWallet, Web3UserContextType } from '@civic/auth-web3';

/**
 * Type guard to check if the context is an ExistingWeb3UserContext with a Solana wallet
 */
function isExistingWeb3UserContext(
    context: Web3UserContextType
): context is ExistingWeb3UserContext {
    return 'solana' in context && !!context.solana;
}

export function useCivicWallet() {
    const userContext = useUser();
    const { user, isLoading: isUserContextLoading, walletCreationInProgress, signIn, signOut } = userContext;

    const hasWallet = !!user && isExistingWeb3UserContext(userContext);

    // Automatically create wallet if user is logged in but doesn't have a wallet
    useEffect(() => {
        const autoCreateWallet = async () => {
            if (user && !hasWallet && !walletCreationInProgress && userContext) {
                try {
                    console.log("Auto-creating wallet for user...");
                    await (userContext as NewWeb3UserContext).createWallet();
                    console.log("Wallet created successfully!");
                } catch (error) {
                    console.error("Failed to auto-create wallet:", error);
                }
            }
        };

        autoCreateWallet();
    }, [user, hasWallet, walletCreationInProgress, userContext]);

    const walletState = useMemo(() => {
        const isLoggedIn = !!user;
        let publicKey: PublicKey | undefined = undefined;
        let publicKeyString: string | undefined = undefined;
        let sendTransactionFn: SolanaWallet['sendTransaction'] | undefined = undefined;
        let signMessageFn: SolanaWallet['signMessage'] | undefined = undefined;
        let signTransactionFn: SolanaWallet['signTransaction'] | undefined = undefined;
        let signAllTransactionsFn: SolanaWallet['signAllTransactions'] | undefined = undefined;

        if (isLoggedIn && hasWallet) {
            const walletInstance = userContext.solana.wallet;

                publicKeyString = userContext.solana.address;
                publicKey = new PublicKey(publicKeyString);

                sendTransactionFn = walletInstance.sendTransaction.bind(walletInstance);
                signMessageFn = walletInstance.signMessage.bind(walletInstance);
                signTransactionFn = walletInstance.signTransaction.bind(walletInstance);
                signAllTransactionsFn = walletInstance.signAllTransactions.bind(walletInstance);
        }

        return {
            isLoggedIn,
            isLoading: isUserContextLoading || (isLoggedIn && walletCreationInProgress),
            hasWallet,
            isCreatingWallet: isLoggedIn && !hasWallet && walletCreationInProgress,
            publicKey,
            publicKeyString,
            user,
            signIn,
            signOut,
            sendTransaction: sendTransactionFn,
            signMessage: signMessageFn,
        };
    }, [userContext, user, isUserContextLoading, hasWallet, walletCreationInProgress, signIn, signOut]);

    return walletState;
}