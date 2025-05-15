'use client';

import { useCallback } from 'react';
import { useCivicWallet } from './useCivicWallet';
import { useGameStore } from '@/store/gameStore';
import { useShallow } from 'zustand/shallow';

/**
 * @deprecated This hook is deprecated. Use the blueprint state from gameStore directly.
 * The blueprint loading logic has been moved to the game store for better architecture.
 * This hook now just forwards to the game store for backwards compatibility.
 */
export function useOwnedBlueprints() {
    const { publicKey, hasWallet } = useCivicWallet();
    const {
        ownedBlueprints,
        isBlueprintsLoading,
        blueprintsError,
        loadOwnedBlueprints
    } = useGameStore(
        useShallow(state => ({
            ownedBlueprints: state.ownedBlueprints,
            isBlueprintsLoading: state.isBlueprintsLoading,
            blueprintsError: state.blueprintsError,
            loadOwnedBlueprints: state.loadOwnedBlueprints
        }))
    );

    const refreshBlueprints = useCallback(() => {
        if (publicKey && hasWallet) {
            loadOwnedBlueprints(publicKey);
        }
    }, [publicKey, hasWallet, loadOwnedBlueprints]);

    return {
        blueprints: ownedBlueprints,
        isLoading: isBlueprintsLoading,
        error: blueprintsError,
        refreshBlueprints,
    };
}