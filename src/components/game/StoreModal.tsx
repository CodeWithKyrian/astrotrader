'use client';

import React, { useState, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useGalacticCredits } from '@/hooks/useGalacticCredits';
import { BlueprintDefinition } from '@/types/models';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { createPortal } from 'react-dom';
import { useShallow } from 'zustand/shallow';
import { useCivicWallet } from '@/hooks/useCivicWallet';
import { createTreasuryTransferTransaction } from '@/lib/spl-client';
import { connection } from '@/lib/solana-client';

export function StoreModal() {
    const {
        isStoreOpen,
        setIsStoreOpen,
        userData,
        blueprintDefinitions,
        planets,
        ownedBlueprints
    } = useGameStore(
        useShallow(state => ({
            isStoreOpen: state.isStoreOpen,
            setIsStoreOpen: state.setIsStoreOpen,
            userData: state.userData,
            blueprintDefinitions: state.blueprintDefinitions,
            planets: state.planets,
            ownedBlueprints: state.ownedBlueprints
        }))
    );

    const { balance: galacticCredits } = useGalacticCredits();
    const { publicKey, sendTransaction } = useCivicWallet();

    const [isProcessing, setIsProcessing] = useState(false);

    const currentPlanet = useMemo(() => {
        const currentPlanetId = userData?.currentPlanetId;
        if (!currentPlanetId || planets.length === 0) return null;
        return planets.find(p => p.id === currentPlanetId);
    }, [userData?.currentPlanetId, planets]);

    const isOwnedBlueprint = (blueprintId: string) => {
        if (!ownedBlueprints || ownedBlueprints.length === 0) return false;
        return ownedBlueprints.some(bp => bp.parsedAttributes.blueprintId === blueprintId);
    };

    const handleBlueprintPurchase = async (blueprint: BlueprintDefinition) => {
        if (isOwnedBlueprint(blueprint.id)) {
            toast.error("You already own this blueprint");
            return;
        }

        // TODO: Get price from blueprint definition
        const blueprintPrice = 2500;
        if (galacticCredits < blueprintPrice) {
            toast.error(`Not enough Galactic Credits. You need ${blueprintPrice} GC.`);
            return;
        }

        setIsProcessing(true);
        const toastId = toast.loading("Processing purchase...");

        try {
            if (!publicKey || !sendTransaction) {
                toast.error("Wallet not connected", { id: toastId });
                setIsProcessing(false);
                return;
            }

            const tokenAmount = blueprintPrice * Math.pow(10, 6);

            const transaction = await createTreasuryTransferTransaction(publicKey, tokenAmount);

            if (!transaction) {
                toast.error("Failed to create transaction", { id: toastId });
                setIsProcessing(false);
                return;
            }

            const txSignature = await sendTransaction(transaction, connection);

            if (!txSignature) {
                toast.error("Transaction failed or rejected", { id: toastId });
                setIsProcessing(false);
                return;
            }

            toast.loading("Payment confirmed. Minting blueprint...", { id: toastId });

            // Step 2: Call the server to mint the NFT
            const response = await fetch('/api/blueprints/mint', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    blueprintId: blueprint.id,
                    transactionSignature: txSignature,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message || "Blueprint purchased successfully!", { id: toastId });
                // Force a refetch of user blueprints
                if (publicKey) {
                    useGameStore.getState().loadOwnedBlueprints(publicKey);
                }
            } else {
                console.error("Mint error:", data);
                toast.error(data.error || "Failed to mint blueprint", { id: toastId });
            }
        } catch (error) {
            console.error("Error purchasing blueprint:", error);
            toast.error("An error occurred during purchase", { id: toastId });
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isStoreOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setIsStoreOpen(false)}
            />

            {/* Slide-in panel */}
            <div className="absolute inset-y-0 left-0 w-full sm:w-[470px] flex">
                <div className="relative w-full transform transition-transform duration-500 translate-x-0 animate-slideInLeft">
                    <div className="h-full flex flex-col overflow-hidden panel blueprint-grid-bg border-r border-cyan-600/40 shadow-[5px_0_30px_rgba(6,182,212,0.3)]">
                        {/* Star field background */}
                        <div className="absolute inset-0 stars-sm opacity-20 pointer-events-none"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-800/70 backdrop-blur-sm"></div>

                        {/* Corner decorations */}
                        <div className="corner-tl"></div>
                        <div className="corner-tr"></div>
                        <div className="corner-bl"></div>
                        <div className="corner-br"></div>

                        {/* Header */}
                        <div className="relative z-10 flex justify-between items-center p-4 border-b border-cyan-700/40">
                            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-cyan-100" style={{ textShadow: '0 0 15px rgba(6,182,212,0.5)' }}>
                                Ship Upgrades Marketplace
                            </h2>
                            <button
                                onClick={() => setIsStoreOpen(false)}
                                className="w-8 h-8 flex items-center justify-center text-cyan-400 hover:text-cyan-300 bg-slate-800/80 hover:bg-slate-700/80 rounded-full border border-cyan-700/40 hover:border-cyan-600/60 transition-all duration-200 shadow-[0_0_10px_rgba(6,182,212,0.1)] hover:shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Credit Balance */}
                        <div className="relative z-10 p-4 bg-slate-900/70 border-b border-cyan-800/30 flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-8 h-8 bg-amber-900/60 border border-amber-700/60 rounded-full flex items-center justify-center mr-2">
                                    <span className="text-amber-400">GC</span>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-400">Available Credits</div>
                                    <div className="text-lg font-semibold text-amber-300" style={{ textShadow: '0 0 10px rgba(217,119,6,0.3)' }}>
                                        {galacticCredits.toLocaleString()} GC
                                    </div>
                                </div>
                            </div>

                            <div className="text-xs text-gray-500">
                                Current Location: <span className="text-cyan-400">{currentPlanet?.name || 'Unknown'}</span>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="relative z-10 flex-grow overflow-y-auto custom-scrollbar">
                            <div className="p-4">
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-cyan-300 mb-2" style={{ textShadow: '0 0 10px rgba(6,182,212,0.3)' }}>
                                        Ship Upgrade Blueprints
                                    </h3>
                                    <p className="text-sm text-gray-300 mb-4">
                                        Enhance your ship with advanced technology
                                    </p>

                                    {blueprintDefinitions.length === 0 ? (
                                        <div className="flex items-center justify-center h-40 bg-slate-800/70 rounded-md border border-cyan-800/30">
                                            <div className="text-gray-400 text-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <p>No blueprints available at this location</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {blueprintDefinitions.map(bp => {
                                                const owned = isOwnedBlueprint(bp.id);

                                                return (
                                                    <div
                                                        key={bp.id}
                                                        className={`bg-slate-800/80 border ${owned ? 'border-emerald-700/60' : 'border-cyan-700/40'} rounded-md overflow-hidden shadow-lg
                                                            ${owned ? 'shadow-emerald-900/20' : 'hover:border-cyan-500/70 hover:shadow-cyan-800/30'} transition-all duration-300 group`}
                                                    >
                                                        <div className="flex items-start p-4">
                                                            <div className="relative bg-slate-900/80 rounded w-20 h-20 flex-shrink-0 mr-4 overflow-hidden">
                                                                {/* Grid background */}
                                                                <div className="absolute inset-0 opacity-[0.07]"
                                                                    style={{
                                                                        backgroundImage: `linear-gradient(rgba(8, 145, 178, 0.6) 1px, transparent 1px), 
                                                                                         linear-gradient(to right, rgba(8, 145, 178, 0.6) 1px, transparent 1px)`,
                                                                        backgroundSize: '5px 5px'
                                                                    }}>
                                                                </div>

                                                                {bp.imageUrl && (
                                                                    <Image
                                                                        src={bp.imageUrl}
                                                                        alt={bp.name}
                                                                        className="object-contain transition-transform duration-300 group-hover:scale-110"
                                                                        width={80}
                                                                        height={80}
                                                                        unoptimized={bp.imageUrl.startsWith('/')}
                                                                    />
                                                                )}

                                                                {/* Owned overlay badge */}
                                                                {owned && (
                                                                    <div className="absolute top-0 right-0 bg-emerald-600/90 text-xs text-white px-1.5 py-0.5 rounded-bl shadow-lg">
                                                                        Owned
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="flex-grow">
                                                                <div className="flex justify-between items-start mb-1">
                                                                    <h5 className={`font-medium ${owned ? 'text-emerald-300' : 'text-cyan-200 group-hover:text-cyan-100'}`}>
                                                                        {bp.name}
                                                                    </h5>
                                                                    <span className="text-xs font-semibold text-amber-400 bg-amber-900/50 px-1.5 py-0.5 rounded-sm">
                                                                        Tier {bp.tier}
                                                                    </span>
                                                                </div>

                                                                <p className="text-xs text-gray-400 group-hover:text-gray-300 mb-3">{bp.description}</p>

                                                                <div className="flex justify-between items-center">
                                                                    <div className="text-sm text-amber-300 font-semibold">2,500 GC</div>

                                                                    {owned ? (
                                                                        <div className="px-3 py-1.5 bg-emerald-900/40 border border-emerald-700/40 text-emerald-300 text-xs rounded flex items-center">
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                            </svg>
                                                                            Installed
                                                                        </div>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() => handleBlueprintPurchase(bp)}
                                                                            disabled={isProcessing || galacticCredits < 2500}
                                                                            className="px-3 py-1.5 bg-slate-700/90 hover:bg-cyan-900/80 border border-cyan-800/40 hover:border-cyan-700/60 text-cyan-300 text-xs rounded transition-colors disabled:opacity-50 disabled:hover:bg-slate-700/90 disabled:hover:border-cyan-800/40"
                                                                        >
                                                                            Purchase
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    <div className="bg-slate-800/50 rounded-md p-4 mt-6 border border-cyan-800/30">
                                        <h4 className="text-cyan-400 text-sm font-semibold mb-2">Blueprint Info</h4>
                                        <p className="text-gray-400 text-xs leading-relaxed">
                                            Blueprints are permanent ship upgrades that enhance your vessel&apos;s capabilities.
                                            Once purchased, they remain in your archive and automatically improve your ship&apos;s performance.
                                            Different planets may offer different blueprints.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}