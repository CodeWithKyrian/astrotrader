'use client';

import { useEffect } from 'react';
import { useCivicWallet } from './useCivicWallet';
import { useCreditsStore } from '@/store/creditsStore';

export function useGalacticCredits() {
    const { publicKey, hasWallet } = useCivicWallet();
    const { balance, isLoading, error, refreshBalance, isInitialized } = useCreditsStore();

    useEffect(() => {
        if (publicKey && hasWallet && !isInitialized) {
            refreshBalance(publicKey);
        }
    }, [publicKey, hasWallet, refreshBalance, isInitialized]);

    return {
        balance,
        isLoading,
        error,
        refreshBalance: () => refreshBalance(publicKey),
    };
}