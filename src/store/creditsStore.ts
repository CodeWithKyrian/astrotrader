import { create } from 'zustand';
import { GALACTIC_CREDITS_MINT, getSplBalance } from '@/lib/spl-client';
import { PublicKey } from '@solana/web3.js';

interface CreditsState {
    balance: number;
    isLoading: boolean;
    error: string | null;
    isInitialized: boolean;
    
    // Actions
    refreshBalance: (publicKey: PublicKey | undefined) => Promise<void>;
    setBalance: (balance: number) => void;
}

export const useCreditsStore = create<CreditsState>((set, get) => ({
    balance: 0,
    isLoading: false,
    error: null,
    isInitialized: false,
    
    refreshBalance: async (publicKey: PublicKey | undefined) => {
        const { isInitialized, isLoading } = get();
        
        // Return early if already loading to prevent duplicate requests
        if (isLoading) return;
        
        if (!publicKey) {
            set({ balance: 0, error: null, isInitialized: true });
            return;
        }
        
        set({ isLoading: true, error: null });
        
        try {
            const fetchedBalance = await getSplBalance(publicKey, GALACTIC_CREDITS_MINT);
            set({ balance: fetchedBalance, isLoading: false, isInitialized: true });
        } catch (err) {
            console.error("Error fetching Galactic Credits balance:", err);
            set({ 
                balance: 0, 
                error: err instanceof Error ? err.message : "Failed to fetch balance",
                isLoading: false,
                isInitialized: true
            });
        }
    },
    
    setBalance: (balance: number) => {
        set({ balance });
    }
})); 