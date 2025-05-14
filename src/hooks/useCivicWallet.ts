'use client';

import { useMemo } from 'react';
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

    const walletState = useMemo(() => {
        const isLoggedIn = !!user;
        let publicKey: PublicKey | undefined = undefined;
        let publicKeyString: string | undefined = undefined;
        let createWalletFn: (() => Promise<void>) | undefined = undefined;
        let sendTransactionFn: SolanaWallet['sendTransaction'] | undefined = undefined;
        let signMessageFn: SolanaWallet['signMessage'] | undefined = undefined;
        let signTransactionFn: SolanaWallet['signTransaction'] | undefined = undefined;
        let signAllTransactionsFn: SolanaWallet['signAllTransactions'] | undefined = undefined;

        if (isLoggedIn) {
            if (hasWallet) {
                const walletInstance = userContext.solana.wallet;

                publicKeyString = userContext.solana.address;
                publicKey = new PublicKey(publicKeyString);

                sendTransactionFn = walletInstance.sendTransaction.bind(walletInstance);
                signMessageFn = walletInstance.signMessage.bind(walletInstance);
                signTransactionFn = walletInstance.signTransaction.bind(walletInstance);
                signAllTransactionsFn = walletInstance.signAllTransactions.bind(walletInstance);
            } else {
                createWalletFn = (userContext as NewWeb3UserContext).createWallet;
            }
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
            createWallet: createWalletFn,
            sendTransaction: sendTransactionFn,
            signMessage: signMessageFn,
        };
    }, [userContext, user, isUserContextLoading, hasWallet, walletCreationInProgress, signIn, signOut]);

    return walletState;
}