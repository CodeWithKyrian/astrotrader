'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCivicWallet } from './useCivicWallet';
import { getSplBalance, GALACTIC_CREDITS_MINT } from '@/lib/spl-client';

export function useGalacticCredits() {
    const { publicKey, hasWallet } = useCivicWallet();
    const [balance, setBalance] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBalance = useCallback(async () => {
        if (publicKey && hasWallet) {
            setIsLoading(true);
            setError(null);
            
            try {
                const fetchedBalance = await getSplBalance(publicKey, GALACTIC_CREDITS_MINT);
                setBalance(fetchedBalance);
            } catch (err) {
                console.error("Error fetching Galactic Credits balance:", err);
                setError("Failed to fetch balance");
                setBalance(0);
            } finally {
                setIsLoading(false);
            }
        } else {
            setBalance(0);
        }
    }, [publicKey, hasWallet]);

    useEffect(() => {
        fetchBalance();
    }, [fetchBalance]);

    return {
        balance,
        isLoading,
        error,
        refreshBalance: fetchBalance,
    };
}