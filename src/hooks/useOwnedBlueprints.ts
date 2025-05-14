'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCivicWallet } from './useCivicWallet';
import { fetchAndProcessOwnedBlueprints } from '@/lib/metaplex-client';
import type { ProcessedBlueprint } from '@/types/blueprints';

export function useOwnedBlueprints() {
    const { publicKey, hasWallet } = useCivicWallet();
    const [blueprints, setBlueprints] = useState<ProcessedBlueprint[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBlueprints = useCallback(async () => {
        if (publicKey && hasWallet) {
            setIsLoading(true);
            setError(null);
            try {
                const fetched = await fetchAndProcessOwnedBlueprints(publicKey);
                setBlueprints(fetched);
            } catch (err: any) {
                console.error("Error in fetchBlueprints hook:", err);
                setError(err.message || "Failed to fetch blueprints");
            } finally {
                setIsLoading(false);
            }
        } else {
            setBlueprints([]); // Clear if no wallet/publicKey
        }
    }, [publicKey, hasWallet]);

    useEffect(() => {
        fetchBlueprints();
    }, [fetchBlueprints]); // Re-fetch if publicKey or hasWallet changes

    return {
        blueprints,
        isLoading,
        error,
        refreshBlueprints: fetchBlueprints,
    };
}