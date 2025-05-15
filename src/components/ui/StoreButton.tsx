'use client';

import React from 'react';
import { useGameStore } from '@/store/gameStore';

export function StoreButton() {
    const { setIsStoreOpen } = useGameStore();

    return (
        <button
            onClick={() => setIsStoreOpen(true)}
            className="fixed left-0 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-700 to-cyan-600 text-white p-2 rounded-r-md border border-cyan-700/50 hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all duration-200 z-40"
            aria-label="Open Store"
        >
            <div className="flex items-center px-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="ml-2 font-medium">Store</span>
            </div>
        </button>
    );
} 