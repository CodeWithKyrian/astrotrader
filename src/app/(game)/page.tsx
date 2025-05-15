'use client';

import { useCivicWallet } from '@/hooks/useCivicWallet';
import { useGameStore } from '@/store/gameStore';
import { useGalacticCredits } from '@/hooks/useGalacticCredits';
import { MarketView } from '@/components/game/MarketView';
import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useShallow } from 'zustand/shallow';
import { ShipyardView } from '@/components/game/ShipyardView';
import { StarmapView } from '@/components/game/StarmapView';
import { RefuelView } from '@/components/game/RefuelView';
import { TabPanel } from 'react-tabs';
import { Tab } from 'react-tabs';
import { TabList } from 'react-tabs';
import { Tabs } from 'react-tabs';
import { toast } from 'react-hot-toast';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { StoreButton } from '@/components/ui/StoreButton';
import { StoreModal } from '@/components/ui/StoreModal';
import { StartScreen } from '@/components/ui/StartScreen';

import 'react-tabs/style/react-tabs.css';

export default function AstroTraderPage() {
    const {
        isLoggedIn,
        isLoading: isWalletLoading,
        hasWallet,
        isCreatingWallet,
        user,
        createWallet,
        signIn,
        publicKey,
    } = useCivicWallet();

    const {
        balance: galacticCredits,
        isLoading: creditsLoading,
        refreshBalance: refreshCredits
    } = useGalacticCredits();

    const [tabIndex, setTabIndex] = useState(0);
    const [isClaiming, setIsClaiming] = useState(false);
    const [showClaimModal, setShowClaimModal] = useState(false);
    const [claimError, setClaimError] = useState<string | null>(null);

    const {
        fetchGameData,
        loadUserData,
        isGameDataLoaded,
        isUserDataLoaded,
        userData,
        loadOwnedBlueprints,
    } = useGameStore(
        useShallow(state => ({
            fetchGameData: state.fetchGameData,
            loadUserData: state.loadUserData,
            isGameDataLoaded: state.isGameDataLoaded,
            isUserDataLoaded: state.isUserDataLoaded,
            userData: state.userData,
            loadOwnedBlueprints: state.loadOwnedBlueprints,
        }))
    );

    // 1. Fetch static game definitions on initial app load (or when this page mounts)
    useEffect(() => {
        if (!isGameDataLoaded) {
            fetchGameData();
        }
    }, [isGameDataLoaded, fetchGameData]);

    // 2. Load user-specific game state after login, wallet ready, and static defs loaded
    useEffect(() => {
        if (isLoggedIn && hasWallet && isGameDataLoaded && !isUserDataLoaded && userData === null) {
            loadUserData();
        }
    }, [isLoggedIn, hasWallet, isGameDataLoaded, isUserDataLoaded, loadUserData, userData]);

    // 3. Load blueprints after user data is loaded
    useEffect(() => {
        if (isLoggedIn && hasWallet && publicKey && isUserDataLoaded && userData) {
            const loadUserBlueprints = async () => {
                try {
                    // This will load blueprints into game store and apply effects to ship stats
                    await loadOwnedBlueprints(publicKey);
                } catch (error) {
                    console.error("Failed to load user blueprints:", error);
                }
            };

            loadUserBlueprints();
        }
    }, [isLoggedIn, hasWallet, publicKey, isUserDataLoaded, userData, loadOwnedBlueprints]);

    // 4. Check if user needs to claim initial credits when user data is loaded
    useEffect(() => {
        if (isUserDataLoaded && userData) {
            if (!userData.hasClaimedInitialCredits) {
                setShowClaimModal(true);
            }
        }
    }, [isUserDataLoaded, userData]);

    const handleClaimCredits = async () => {
        setIsClaiming(true);
        setClaimError(null);

        try {
            const response = await fetch('/api/faucet/claim-initial-credits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            });

            const data = await response.json();

            if (response.ok) {
                if (data.alreadyClaimed) {
                    toast.error("You've already claimed your initial credits!");
                } else {
                    toast.success(`Successfully claimed ${data.amount} Galactic Credits!`);
                }

                await refreshCredits();
                // Update the local user data after successful claim
                if (userData) {
                    userData.hasClaimedInitialCredits = true;
                }
                setShowClaimModal(false);
            } else {
                throw new Error(data.error || "Failed to claim credits.");
            }
        } catch (error: any) {
            console.error("Error claiming credits:", error);
            setClaimError(error.message);
        } finally {
            setIsClaiming(false);
        }
    };

    // Modify loading conditions to show UI earlier
    // Only show loading screen for wallet loading and login state
    // Let components handle their own loading states
    const isInitialLoading = isWalletLoading;

    if (isInitialLoading) {
        return <LoadingScreen />;
    }

    if (!isLoggedIn) {
        return <StartScreen onStart={signIn} />;
    }

    if (!hasWallet) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-8 relative">
                {/* Animated stars in background */}
                <div className="absolute inset-0 opacity-70 z-0">
                    <div className="stars-sm"></div>
                    <div className="stars-md"></div>
                    <div className="stars-lg"></div>
                </div>

                {/* Cosmic glow */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-r from-purple-500/10 to-cyan-500/10 filter blur-3xl"></div>

                {/* Main content */}
                <div className="relative z-10 flex flex-col items-center max-w-md text-center">
                    <div className="flex items-center mb-6">
                        <svg className="w-10 h-10 mr-3 text-cyan-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4"></path>
                            <path d="M5 19.5C5.5 18 6 15 6 12c0-.7.12-1.37.34-2"></path>
                            <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"></path>
                            <path d="M12 10a2 2 0 0 0-2 2"></path>
                            <path d="M12 10V2"></path>
                            <path d="M12 22v-3"></path>
                            <path d="M12 18a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"></path>
                            <path d="M10 10a2 2 0 0 1 4 0c0 1.87.376 5.162-.536 8.13-1.59-.505-1.74-5.13-1.74-5.13"></path>
                            <path d="M13.73 15.437c-1.784 1.148-5.475 1.148-6.265.505"></path>
                        </svg>
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-300 to-purple-400" style={{ textShadow: '0 0 15px rgba(6,182,212,0.5)' }}>
                            Trading Guild
                        </h1>
                    </div>

                    <div className="panel p-8 mb-8 w-full backdrop-blur-md">
                        <div className="corner-bl"></div>
                        <div className="corner-br"></div>

                        <h2 className="text-xl font-semibold text-cyan-200 mb-2">
                            Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400">{user?.name || 'Trader'}</span>!
                        </h2>

                        <p className="mb-6 text-gray-300 text-center">
                            To begin your trading journey, you need to initialize a secure Solana wallet for your Trading Guild.
                        </p>

                        <div className="flex justify-center">
                            <button
                                onClick={createWallet}
                                disabled={isCreatingWallet}
                                className="py-3 px-6 bg-slate-900/80 border border-cyan-700/40 rounded-md text-cyan-300 hover:border-cyan-500/70 hover:shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all shadow-[0_0_10px_rgba(8,145,178,0.15)] backdrop-blur-md flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCreatingWallet ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-cyan-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Initializing Wallet...
                                    </>
                                ) : (
                                    <>
                                        <span className="text-lg">✨</span>
                                        Initialize Guild Wallet
                                        <span className="text-lg">✨</span>
                                    </>
                                )}
                            </button>
                        </div>

                        <p className="mt-4 text-gray-500 text-sm">
                            Your Guild Wallet will be securely stored and managed.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // --- User is logged in and has a wallet ---
    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
            {/* Show indicator if game data is still loading */}
            {!isGameDataLoaded && (
                <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600 animate-gradient overflow-hidden z-50"></div>
            )}

            {/* Show indicator if user data is still loading */}
            {!isUserDataLoaded && isGameDataLoaded && (
                <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-600 via-teal-400 to-emerald-600 animate-gradient overflow-hidden z-50"></div>
            )}

            {/* Main two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="col-span-1">
                    <div className="panel p-0 h-[calc(100vh-10rem)] sm:h-[calc(100vh-12rem)] overflow-hidden shadow-[0_0_25px_-5px_rgba(6,182,212,0.2)] border-cyan-700/30">
                        <StarmapView />
                        <div className="corner-bl"></div>
                        <div className="corner-br"></div>
                    </div>
                </div>

                {/* Right Column - Tabbed Interface */}
                <div className="lg:col-span-2 panel blueprint-grid-bg relative shadow-[0_0_35px_-5px_rgba(6,182,212,0.35)] border-cyan-600/40 overflow-hidden">
                    {/* Subtle star field in background */}
                    <div className="absolute inset-0 stars-sm opacity-20 pointer-events-none"></div>

                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-800/70 backdrop-blur-sm"></div>

                    {/* Enhanced corners with stronger glow */}
                    <div className="corner-tl"></div>
                    <div className="corner-tr"></div>
                    <div className="corner-bl"></div>
                    <div className="corner-br"></div>

                    {/* Show indicator if tab data is still loading */}
                    {!isGameDataLoaded || !isUserDataLoaded ? (
                        <div className="absolute inset-0 z-20 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center">
                            <div className="text-center">
                                <div className="inline-block w-16 h-16 relative mb-3">
                                    <div className="absolute inset-0 rounded-full border-2 border-t-transparent border-cyan-400 animate-slow-spin"></div>
                                    <div className="absolute inset-1 rounded-full border border-t-transparent border-cyan-400/50 animate-slow-spin" style={{ animationDuration: '10s' }}></div>
                                </div>
                                <p className="text-lg text-cyan-300 animate-pulse">Loading Ship Systems...</p>
                            </div>
                        </div>
                    ) : null}

                    <Tabs selectedIndex={tabIndex} onSelect={(index) => setTabIndex(index)}
                        className="flex flex-col h-full relative z-10">
                        <TabList className="flex border-b border-cyan-600/50 bg-slate-900/50 backdrop-blur-md">
                            <Tab className="px-4 py-3 -mb-px border-b-2 border-transparent text-gray-400 hover:text-cyan-300 focus:outline-none cursor-pointer transition-all duration-200 hover:bg-cyan-900/20 group"
                                selectedClassName="!border-cyan-400 !text-cyan-300 !bg-cyan-900/30" style={{ textShadow: 'var(--glow-text-cyan-sm)' }}>
                                <span className="relative flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Market
                                    <span className="absolute -bottom-1 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                </span>
                            </Tab>
                            <Tab className="px-4 py-3 -mb-px border-b-2 border-transparent text-gray-400 hover:text-cyan-300 focus:outline-none cursor-pointer transition-all duration-200 hover:bg-cyan-900/20 group"
                                selectedClassName="!border-cyan-400 !text-cyan-300 !bg-cyan-900/30" style={{ textShadow: 'var(--glow-text-cyan-sm)' }}>
                                <span className="relative flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    Refuel
                                    <span className="absolute -bottom-1 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                </span>
                            </Tab>
                            <Tab className="px-4 py-3 -mb-px border-b-2 border-transparent text-gray-400 hover:text-cyan-300 focus:outline-none cursor-pointer transition-all duration-200 hover:bg-cyan-900/20 group"
                                selectedClassName="!border-cyan-400 !text-cyan-300 !bg-cyan-900/30" style={{ textShadow: 'var(--glow-text-cyan-sm)' }}>
                                <span className="relative flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11.063V8.75m0 2.313l-6-3.125v7.5l6-3.125zm-6 4.375v-7.5m0 7.5l-6-3.125v-7.5l6 3.125m12-3.125l-6 3.125" />
                                    </svg>
                                    Shipyard
                                    <span className="absolute -bottom-1 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                </span>
                            </Tab>
                        </TabList>

                        <TabPanel className="react-tabs__tab-panel p-1 sm:p-4 overflow-y-auto flex-grow focus:outline-none bg-transparent relative">
                            {/* Subtle cosmic glow */}
                            <div className="absolute top-20 right-1/4 w-40 h-40 rounded-full bg-cyan-500/5 filter blur-3xl pointer-events-none"></div>
                            <div className="relative z-10">
                                <MarketView galacticCredits={galacticCredits} refreshGalacticCredits={refreshCredits} />
                            </div>
                        </TabPanel>
                        <TabPanel className="react-tabs__tab-panel p-1 sm:p-4 overflow-y-auto flex-grow focus:outline-none bg-transparent relative">
                            {/* Subtle cosmic glow */}
                            <div className="absolute top-20 right-1/3 w-40 h-40 rounded-full bg-cyan-500/5 filter blur-3xl pointer-events-none"></div>
                            <div className="relative z-10">
                                <RefuelView />
                            </div>
                        </TabPanel>
                        <TabPanel className="react-tabs__tab-panel p-1 sm:p-4 overflow-y-auto flex-grow focus:outline-none bg-transparent relative">
                            {/* Subtle cosmic glow */}
                            <div className="absolute top-20 left-1/3 w-40 h-40 rounded-full bg-cyan-500/5 filter blur-3xl pointer-events-none"></div>
                            <div className="relative z-10">
                                <ShipyardView />
                            </div>
                        </TabPanel>
                    </Tabs>
                </div>
            </div>

            {/* Claim Credits Modal */}
            <Modal
                isOpen={showClaimModal}
                title="Welcome to AstroTrader"
                onClose={() => setShowClaimModal(false)}
            >
                <div className="text-cyan-100 leading-relaxed">
                    <p className="mb-4">Your Trading Guild has awarded you initial Galactic Credits to begin your interstellar journey!</p>

                    <div className="flex items-center my-5 p-4 bg-blue-900/30 border border-cyan-700/40 rounded-md shadow-[0_0_15px_rgba(8,145,178,0.1)]">
                        <div className="mr-4 text-amber-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-xl font-bold text-amber-300" style={{ textShadow: '0 0 10px rgba(217,119,6,0.3)' }}>1,000 GC</div>
                            <div className="text-sm text-gray-300">Initial funds for trade and exploration</div>
                        </div>
                    </div>

                    {claimError && (
                        <div className="p-3 bg-red-900/40 border border-red-700/40 rounded-md mb-4 text-red-300 text-sm">
                            <div className="flex items-center">
                                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 9v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z" stroke="currentColor" strokeWidth="2" />
                                </svg>
                                {claimError}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={handleClaimCredits}
                        disabled={isClaiming}
                        className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-cyan-700 hover:from-emerald-500 hover:to-cyan-600 text-white font-medium rounded-md transition-all duration-200 shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:pointer-events-none flex items-center"
                    >
                        {isClaiming ? (
                            <>
                                <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Claiming...
                            </>
                        ) : (
                            <>
                                <span className="mr-2">Claim 1000 GC</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </>
                        )}
                    </button>
                </div>
            </Modal>

            {/* Store Button and Modal */}
            <StoreButton />
            <StoreModal />
        </div>
    );
}