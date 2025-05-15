'use client';

import { useGameStore } from '@/store/gameStore';
import { BlueprintEffectType } from '@/types/blueprints';
import Image from 'next/image';
import { useCivicWallet } from '@/hooks/useCivicWallet';
import toast from 'react-hot-toast';
import { useShallow } from 'zustand/shallow';

export function ShipyardView() {
    const { publicKey } = useCivicWallet();

    const {
        ship,
        ownedBlueprints,
        isBlueprintsLoading,
        blueprintsError,
        loadOwnedBlueprints
    } = useGameStore(
        useShallow(state => ({
            ship: state.userData?.ship,
            ownedBlueprints: state.ownedBlueprints,
            isBlueprintsLoading: state.isBlueprintsLoading,
            blueprintsError: state.blueprintsError,
            loadOwnedBlueprints: state.loadOwnedBlueprints
        }))
    );

    const refreshBlueprints = () => {
        if (publicKey) {
            loadOwnedBlueprints(publicKey);
        }
    };

    const handleAwardPlaceholderBlueprint = async () => {
        try {
            const response = await fetch('/api/blueprints/award-placeholder', { method: 'POST' });
            const data = await response.json();
            if (response.ok) {
                toast.success(data.message || "Blueprint awarded! Refreshing...");
                refreshBlueprints(); // Refresh the list
            } else {
                toast.error(`Error: ${data.error || data.message || "Could not award blueprint."}`);
            }
        } catch (e) {
            toast.error("Failed to request blueprint award.");
            console.error(e);
        }
    };

    if (!ship) {
        return <div className="p-6 text-center text-gray-400 animate-pulse">Initializing Ship Systems...</div>;
    }

    return (
        <div className="h-full flex flex-col space-y-4">
            {/* Ship Integrity Report - Fixed at top */}
            <div className="flex-shrink-0 p-4 bg-slate-900/80 border border-amber-500/30 rounded-lg shadow-[0_0_15px_rgba(217,119,6,0.15)]">
                <h3 className="text-lg font-semibold text-amber-300 mb-3" style={{ textShadow: '0 0 10px rgba(217,119,6,0.3)' }}>
                    Ship Integrity Report: <span className="text-white font-normal">{ship.name}</span>
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-800/80 rounded-md border border-slate-700/50">
                        <div className="text-sm text-gray-400">Cargo Capacity:</div>
                        <div className="flex items-baseline">
                            <span className="text-xl font-medium text-cyan-300">{ship.cargoCapacity}</span>
                            <span className="ml-1 text-gray-400 text-sm">units</span>
                        </div>
                    </div>
                    <div className="p-3 bg-slate-800/80 rounded-md border border-slate-700/50">
                        <div className="text-sm text-gray-400">Max Fuel:</div>
                        <div className="flex items-baseline">
                            <span className="text-xl font-medium text-lime-400">{ship.maxFuel}</span>
                            <span className="ml-1 text-gray-400 text-sm">units</span>
                        </div>
                    </div>
                    <div className="col-span-2 p-3 bg-slate-800/80 rounded-md border border-slate-700/50">
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-400">Status:</div>
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-green-400 rounded-full mr-1.5 animate-pulse"></div>
                                <span className="text-green-400 font-medium">All Systems Nominal</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Archived Schematics Section - Takes remaining space */}
            <div className="flex-grow flex flex-col min-h-0 bg-slate-900/50 border border-cyan-800/40 rounded-lg overflow-hidden">
                <div className="flex-shrink-0 p-3 border-b border-cyan-800/30 flex justify-between items-center">
                    <h4 className="text-md font-semibold text-cyan-300 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Archived Schematics
                    </h4>
                    <button
                        onClick={refreshBlueprints}
                        className="flex items-center px-2.5 py-1 bg-cyan-900/40 hover:bg-cyan-800/50 rounded text-xs text-cyan-300 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </div>

                {/* Loading State */}
                {isBlueprintsLoading && (
                    <div className="flex-grow flex items-center justify-center p-6">
                        <div className="text-cyan-400 animate-pulse flex items-center">
                            <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Scanning Archives...
                        </div>
                    </div>
                )}

                {/* Error State */}
                {blueprintsError && (
                    <div className="flex-grow flex items-center justify-center p-6">
                        <div className="text-red-400 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Error: {blueprintsError}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!isBlueprintsLoading && !blueprintsError && ownedBlueprints.length === 0 && (
                    <div className="flex-grow flex items-center justify-center p-6">
                        <div className="text-gray-500 text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p>No schematics found in guild archives.</p>
                            <p className="text-sm mt-1">Acquire blueprints to upgrade your ship.</p>
                        </div>
                    </div>
                )}

                {/* Blueprint List - Updated to match horizontal layout in StoreModal */}
                {!isBlueprintsLoading && !blueprintsError && ownedBlueprints.length > 0 && (
                    <div className="flex-grow overflow-y-auto custom-scrollbar p-4 min-h-0">
                        <div className="space-y-3">
                            {ownedBlueprints.map(bp => (
                                <div
                                    key={bp.mintAddress}
                                    className="bg-slate-900/80 border border-cyan-800/40 rounded-md overflow-hidden shadow-lg transition-all duration-300 group flex"
                                >
                                    {/* Image container - aspect ratio 1:1 that adapts to parent height */}
                                    <div className="relative bg-[#0c1521] h-full aspect-square flex-shrink-0 overflow-hidden">
                                        {/* Grid background */}
                                        <div className="absolute inset-0 opacity-[0.07]"
                                            style={{
                                                backgroundImage: `linear-gradient(rgba(8, 145, 178, 0.6) 1px, transparent 1px), 
                                                                    linear-gradient(to right, rgba(8, 145, 178, 0.6) 1px, transparent 1px)`,
                                                backgroundSize: '5px 5px'
                                            }}>
                                        </div>

                                        {bp.imageUrl && (
                                            <div className="flex items-center justify-center h-full w-full">
                                                <Image
                                                    src={bp.imageUrl}
                                                    alt={bp.name}
                                                    className="w-full object-contain transition-transform duration-300 group-hover:scale-110"
                                                    width={96}
                                                    height={96}
                                                    unoptimized={bp.imageUrl.startsWith('/')}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Content - padding only on this side */}
                                    <div className="flex-grow p-4">
                                        <div className="flex justify-between items-start mb-1">
                                            <h5 className="font-medium text-cyan-300">
                                                {bp.name}
                                            </h5>
                                            <span className="text-xs font-semibold text-amber-400 bg-amber-900/50 px-1.5 py-0.5 rounded-sm">
                                                Tier {bp.parsedAttributes.tier}
                                            </span>
                                        </div>

                                        <p className="text-xs text-gray-400 group-hover:text-gray-300 mb-3">
                                            {bp.parsedAttributes.description}
                                        </p>

                                        <div className="flex justify-between items-center">
                                            <div className="text-sm">
                                                {bp.parsedAttributes.effectType === BlueprintEffectType.INCREASE_CARGO_CAPACITY && (
                                                    <span className="text-cyan-400">+{bp.parsedAttributes.effectValue} Cargo Capacity</span>
                                                )}
                                                {bp.parsedAttributes.effectType === BlueprintEffectType.INCREASE_MAX_FUEL && (
                                                    <span className="text-lime-400">+{bp.parsedAttributes.effectValue} Fuel Capacity</span>
                                                )}
                                            </div>

                                            <div className="px-3 py-1.5 bg-cyan-900/30 border border-cyan-700/40 text-cyan-300 text-xs rounded flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Installed
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}