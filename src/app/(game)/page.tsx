'use client';

import { useCivicWallet } from '@/hooks/useCivicWallet';
import { useGameStore, PLANETS_DATA, Ship } from '@/store/gameStore';
import { useGalacticCredits } from '@/hooks/useGalacticCredits';
import { MarketView } from '@/components/game/MarketView';
import { useCallback, useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useShallow } from 'zustand/shallow';
import { connection } from '@/lib/solana-client';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { ShipyardView } from '@/components/game/ShipyardView';

function StarmapView({ planets, currentPlanetId, travelToPlanet, isTraveling }: {
    planets: typeof PLANETS_DATA,
    currentPlanetId: string,
    travelToPlanet: (planetId: string) => void,
    isTraveling: boolean
}) {
    return (
        <div className="p-4 border border-gray-700 rounded-lg bg-gray-800/50 h-[300px] relative overflow-hidden">
            <h3 className="text-lg font-semibold mb-2 text-cyan-400">Starmap</h3>
            {isTraveling && <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10"><p className="text-xl animate-pulse">Traveling...</p></div>}
            {planets.map(p => (
                <div key={p.id}
                    style={{ position: 'absolute', left: `${p.x / 4}%`, top: `${p.y / 4}%` }}
                    className={`w-5 h-5 rounded-full cursor-pointer transition-all
                        ${p.id === currentPlanetId ? 'bg-green-500 ring-2 ring-green-300' : 'bg-blue-500 hover:bg-blue-400'}
                    `}
                    title={p.name}
                    onClick={() => !isTraveling && travelToPlanet(p.id)} // Prevent travel while already traveling
                />
            ))}
            <p className="absolute bottom-2 right-2 text-xs text-gray-400">Current: {planets.find(p => p.id === currentPlanetId)?.name}</p>
        </div>
    );
}

function HudView({ ship, galacticCredits, creditsLoading }: { ship: Ship, galacticCredits: number, creditsLoading: boolean }) {
    return (
        <div className="p-3 border border-gray-700 rounded-lg bg-gray-800/50 mb-4 text-sm">
            <div className="flex justify-between">
                <span>Credits:
                    {creditsLoading ? <span className="text-gray-400"> Loading...</span> : <span className="text-yellow-400"> {galacticCredits.toLocaleString()} GC</span>}
                </span>
                <span>Ship: {ship.name}</span>
            </div>
            <div className="flex justify-between mt-1">
                <span>Cargo: {ship.currentCargo.reduce((sum, item) => sum + item.quantity, 0)} / {ship.cargoCapacity} units</span>
                <span>Fuel: {ship.fuel} / {ship.maxFuel}</span>
            </div>
        </div>
    );
}

// More components (MarketView, ShipyardView) will be added in Phase 2

export default function AstroTraderPage() {
    const {
        isLoggedIn,
        isLoading: isWalletLoading,
        hasWallet,
        isCreatingWallet,
        user,
        createWallet,
        signIn,
        signOut,
        publicKey: userPublicKey
    } = useCivicWallet();

    const {
        balance: galacticCredits,
        isLoading: creditsLoading,
        refreshBalance: refreshCredits
    } = useGalacticCredits();

    const [isClaiming, setIsClaiming] = useState(false);
    const [showClaimModal, setShowClaimModal] = useState(false);
    const [claimError, setClaimError] = useState<string | null>(null);
    const [initialCreditsClaimed, setInitialCreditsClaimed] = useState(false);

    const { currentPlanetId, travelToPlanet, isTraveling, ship } = useGameStore(useShallow(state => ({
        currentPlanetId: state.currentPlanetId,
        travelToPlanet: state.travelToPlanet,
        isTraveling: state.isTraveling,
        ship: state.ship,
    })));

    const checkClaimStatus = useCallback(async () => {
        if (hasWallet && isLoggedIn) {
            try {
                const response = await fetch('/api/faucet/check-claim-status');
                const data = await response.json();
                if (response.ok) {
                    setInitialCreditsClaimed(data.hasClaimed);
                    if (!data.hasClaimed) {
                        setShowClaimModal(true);
                    }
                } else {
                    console.error("Failed to check claim status:", data.error);
                    setInitialCreditsClaimed(false);
                    setShowClaimModal(true);
                }
            } catch (error) {
                console.error("Error checking claim status API:", error);
                setInitialCreditsClaimed(false);
                setShowClaimModal(true);
            }
        }
    }, [hasWallet, isLoggedIn]);

    useEffect(() => {
        checkClaimStatus();
    }, [checkClaimStatus]);

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
                    alert("You've already claimed your initial credits!");
                } else {
                    alert(`Successfully claimed ${data.amount} Galactic Credits!`);
                }

                await refreshCredits();
                setInitialCreditsClaimed(true);
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

    if (isWalletLoading || initialCreditsClaimed === null && isLoggedIn && hasWallet) {
        return <div className="text-center p-8">Loading AstroTrader Guild Systems...</div>;
    }

    const renderContent = () => {
        if (!isLoggedIn) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen p-8">
                    <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">AstroTrader</h1>
                    <p className="mb-8 text-gray-400">Embark on your galactic trading adventure!</p>
                    <button onClick={() => signIn()} className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg transition-transform transform hover:scale-105">
                        Sign In & Initialize Guild Wallet
                    </button>
                </div>
            );
        }

        if (!hasWallet) {
            return (
                <div className="text-center p-8 space-y-4">
                    <h2 className="text-2xl font-semibold">Welcome, {user?.name || 'Trader'}!</h2>
                    <p>You need a secure Solana wallet for your Trading Guild.</p>
                    <button
                        onClick={createWallet}
                        disabled={isCreatingWallet}
                        className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-md disabled:opacity-50"
                    >
                        {isCreatingWallet ? 'Initializing Wallet...' : '✨ Initialize Guild Wallet ✨'}
                    </button>
                </div>
            );
        }

        if (userPublicKey) {
            connection.getBalance(userPublicKey).then(balance => {
                console.log(`User ${userPublicKey.toBase58()} SOL balance: ${balance / LAMPORTS_PER_SOL} SOL`);
                if (balance === 0) {
                    console.warn("WARNING: User wallet has 0 SOL. Transactions will fail due to insufficient funds for fees.");
                    // TODO: Prompt user to get some Devnet SOL
                }
            });
        }

        // --- User is logged in and has a wallet ---
        return (
            <div className="max-w-5xl mx-auto p-4 space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">AstroTrader Command</h1>
                    <button onClick={signOut} className="text-sm text-red-500 hover:text-red-400">Sign Out</button>
                </div>

                <HudView ship={ship} galacticCredits={galacticCredits} creditsLoading={creditsLoading} />

                <div className="grid md:grid-cols-2 gap-6">
                    <StarmapView planets={PLANETS_DATA} currentPlanetId={currentPlanetId!} travelToPlanet={travelToPlanet} isTraveling={isTraveling} />
                    <div className="p-4 border border-gray-700 rounded-lg bg-gray-800/50">
                        <h3 className="text-lg font-semibold mb-2 text-cyan-400">
                            Market: {PLANETS_DATA.find(p => p.id === currentPlanetId)?.name || 'Unknown'}
                        </h3>
                        <MarketView galacticCredits={galacticCredits} refreshGalacticCredits={refreshCredits} />
                    </div>
                </div>

                {/* Shipyard Section */}
                <div className="p-4 border border-gray-700 rounded-lg bg-gray-800/50 mt-6">
                    <h3 className="text-lg font-semibold mb-4 text-cyan-400">Shipyard & Blueprints</h3>
                    <ShipyardView />
                </div>

                {/* Claim Credits Modal */}
                <Modal
                    isOpen={showClaimModal && !initialCreditsClaimed}
                    title="Welcome, AstroTrader!"
                // onClose={() => setShowClaimModal(false)} // Optional: Allow closing modal
                >
                    <p className="mb-4">Your Trading Guild has awarded you initial Galactic Credits to start your journey!</p>
                    {claimError && <p className="text-red-400 text-sm mb-2">{claimError}</p>}
                    <div className="flex justify-end">
                        <button
                            onClick={handleClaimCredits}
                            disabled={isClaiming}
                            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md disabled:opacity-50"
                        >
                            {isClaiming ? 'Claiming...' : 'Claim 1000 GC'}
                        </button>
                    </div>
                </Modal>
            </div>
        );
    };
    return <div>{renderContent()}</div>;
}