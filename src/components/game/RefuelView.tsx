'use client';

import { useState, useEffect, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useGalacticCredits } from '@/hooks/useGalacticCredits';
import { toast } from 'react-hot-toast';
import { useShallow } from 'zustand/shallow';
import { useCivicWallet } from '@/hooks/useCivicWallet';
import { createTreasuryTransferTransaction } from '@/lib/spl-client';
import { connection } from '@/lib/solana-client';

export function RefuelView() {
    const {
        userData,
        planets,
        refuelShip
    } = useGameStore(
        useShallow(state => ({
            userData: state.userData,
            planets: state.planets,
            refuelShip: state.refuelShip
        }))
    );

    const { balance: galacticCredits, refreshBalance: refreshCredits } = useGalacticCredits();
    const { publicKey: userPublicKey, sendTransaction } = useCivicWallet();

    const [fuelAmount, setFuelAmount] = useState(10);
    const [isProcessing, setIsProcessing] = useState(false);

    const currentPlanetId = userData?.currentPlanetId || '';

    const currentPlanet = useMemo(() => {
        if (!currentPlanetId || planets.length === 0) return null;
        return planets.find(p => p.id === currentPlanetId);
    }, [currentPlanetId, planets]);

    const fuelPrice = currentPlanet?.fuelPrice || 5;
    const totalFuelCost = fuelAmount * fuelPrice;
    const currentFuel = userData?.ship?.fuel || 0;
    const maxFuel = userData?.ship?.maxFuel || 100;
    const fuelNeeded = maxFuel - currentFuel;

    useEffect(() => {
        setFuelAmount(Math.min(10, fuelNeeded));
    }, [fuelNeeded]);

    const maxAffordableFuel = Math.floor(galacticCredits / fuelPrice);

    const handleFuelPurchase = async () => {
        if (fuelAmount <= 0) {
            toast.error("Please select a valid fuel amount");
            return;
        }

        if (!currentPlanet || !userPublicKey || !sendTransaction || !userData) {
            toast.error("Wallet not connected, user data missing, or planet data missing.");
            return;
        }

        setIsProcessing(true);

        try {
            if (fuelAmount > fuelNeeded) {
                toast.error("Your fuel tank can't hold that much additional fuel.");
                setIsProcessing(false);
                return;
            }

            if (totalFuelCost > galacticCredits) {
                toast.error("Insufficient credits for this fuel purchase.");
                setIsProcessing(false);
                return;
            }

            const tokenAmount = fuelAmount * fuelPrice * Math.pow(10, 6);
            const transaction = await createTreasuryTransferTransaction(userPublicKey, tokenAmount);

            if (!transaction) {
                toast.error("Failed to create transaction");
                setIsProcessing(false);
                return;
            }

            const signature = await sendTransaction(transaction, connection);
            console.log('Refuel transaction sent:', signature);

            const result = refuelShip(fuelAmount, totalFuelCost, galacticCredits);

            if (result.success) {
                toast.success(`Successfully refueled with ${fuelAmount} units! Signature: ${signature.substring(0, 10)}...`);
                await refreshCredits();
                setFuelAmount(Math.min(10, maxFuel - result.newFuel));
            } else {
                toast.error(result.reason || "Failed to update fuel state after transaction");
            }
        } catch (error) {
            console.error("Error purchasing fuel:", error);
            toast.error(error instanceof Error ? error.message : "An error occurred during the fuel purchase");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFuelInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value)) {
            setFuelAmount(Math.min(value, Math.min(fuelNeeded, maxAffordableFuel)));
        }
    };

    const handleMaxFuel = () => {
        setFuelAmount(Math.min(fuelNeeded, maxAffordableFuel));
    };

    return (
        <div className="h-full flex flex-col bg-transparent">
            {/* Refuel Station Header */}
            <div className="flex-shrink-0 mb-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-semibold text-cyan-300" style={{ textShadow: '0 0 10px rgba(6,182,212,0.3)' }}>
                            <span className="opacity-70 mr-2">Refuel Station:</span> {currentPlanet?.name || 'Unknown Location'}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">Purchase fuel to power your interstellar travels.</p>
                    </div>

                    <div className="bg-slate-800/80 px-3 py-1.5 rounded-md border border-cyan-700/40 flex items-center shadow-[0_0_10px_rgba(8,145,178,0.15)]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="text-xs text-cyan-100">Fuel Price: <span className="text-amber-400">{fuelPrice} GC</span> per unit</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-grow overflow-y-auto custom-scrollbar">
                <div className="md:grid md:grid-cols-2 gap-6">
                    {/* Left Column - Fuel Gauge & Purchase Controls */}
                    <div className="flex flex-col bg-slate-900/60 rounded-md border border-cyan-700/40 p-5 backdrop-blur-sm shadow-[0_0_15px_rgba(8,145,178,0.1)]">
                        <h4 className="text-cyan-200 font-medium mb-4">Ship Fuel Status</h4>

                        {/* Current fuel display */}
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-400">Current Fuel:</span>
                            <span className="text-lime-400 font-semibold">{currentFuel}/{maxFuel} units</span>
                        </div>

                        {/* Fuel gauge */}
                        <div className="w-full h-6 bg-slate-800/80 rounded-full border border-cyan-900/40 mb-6 overflow-hidden">
                            <div
                                className="h-full flex items-center justify-end px-2 bg-gradient-to-r from-red-500 via-amber-500 to-lime-500 rounded-full transition-all duration-300 text-xs text-white font-bold"
                                style={{ width: `${(currentFuel / maxFuel) * 100}%` }}
                            >
                                {currentFuel > 10 && `${Math.round((currentFuel / maxFuel) * 100)}%`}
                            </div>
                        </div>

                        {fuelNeeded <= 0 ? (
                            <div className="bg-slate-800/70 p-4 rounded-md border border-cyan-700/30 text-center mb-6">
                                <div className="text-green-400 font-semibold mb-1">Fuel Tank Full</div>
                                <div className="text-gray-400 text-sm">Your ship&apos;s fuel tank is already at maximum capacity.</div>
                            </div>
                        ) : (
                            <>
                                <h4 className="text-cyan-200 font-medium mb-3 mt-2">Purchase Fuel</h4>

                                <div className="mb-4">
                                    <label className="block text-gray-400 text-sm mb-1">Amount to Purchase</label>
                                    <div className="flex">
                                        <input
                                            type="number"
                                            min="1"
                                            max={Math.min(fuelNeeded, maxAffordableFuel)}
                                            value={fuelAmount}
                                            onChange={handleFuelInputChange}
                                            className="flex-grow bg-slate-900/70 text-cyan-300 border border-cyan-800/50 rounded-l-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                            disabled={isProcessing}
                                        />
                                        <button
                                            className="bg-slate-700/90 text-gray-300 px-3 rounded-r-md border border-l-0 border-cyan-800/50 hover:bg-slate-600/90 transition-colors"
                                            onClick={handleMaxFuel}
                                            disabled={isProcessing}
                                        >
                                            MAX
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mb-4 p-3 bg-cyan-900/20 rounded-md border border-cyan-900/40">
                                    <span className="text-gray-300">Total Cost:</span>
                                    <span className="text-lg font-semibold text-amber-300">{totalFuelCost} GC</span>
                                </div>

                                <button
                                    onClick={handleFuelPurchase}
                                    disabled={isProcessing || fuelAmount <= 0 || totalFuelCost > galacticCredits || fuelNeeded <= 0}
                                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-600 hover:to-cyan-500 text-white font-semibold rounded-md shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-700 disabled:hover:to-cyan-600 flex items-center justify-center"
                                >
                                    {isProcessing ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </>
                                    ) : (
                                        <>Purchase Fuel</>
                                    )}
                                </button>
                            </>
                        )}
                    </div>

                    {/* Right Column - Fuel Info & Tips */}
                    <div className="mt-6 md:mt-0 flex flex-col">
                        {/* Credits Info */}
                        <div className="bg-slate-900/60 rounded-md border border-amber-700/20 p-5 backdrop-blur-sm shadow-[0_0_15px_rgba(217,119,6,0.1)] mb-5">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-amber-900/60 border border-amber-700/60 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-amber-400 font-semibold">GC</span>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-400">Available Credits</div>
                                    <div className="text-xl font-semibold text-amber-300" style={{ textShadow: '0 0 10px rgba(217,119,6,0.3)' }}>
                                        {galacticCredits.toLocaleString()} GC
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Fuel Info Card */}
                        <div className="bg-slate-900/60 rounded-md border border-cyan-700/40 p-5 backdrop-blur-sm shadow-[0_0_15px_rgba(8,145,178,0.1)] flex-grow">
                            <h4 className="text-cyan-300 font-semibold mb-3 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Fuel Information
                            </h4>

                            <p className="text-gray-300 text-sm leading-relaxed mb-4">
                                Fuel is essential for interstellar travel. The cost varies by location -
                                industrial planets tend to have cheaper fuel, while luxury destinations
                                charge premium rates.
                            </p>

                            {/* Fuel tips */}
                            <div className="space-y-3 mt-5">
                                <h5 className="text-cyan-200 font-medium text-sm">Travel Tips</h5>

                                <div className="flex items-start space-x-2 text-xs">
                                    <div className="bg-cyan-900/30 rounded-full p-1 mt-0.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-400 flex-1">Always ensure you have enough fuel for your return journey.</p>
                                </div>

                                <div className="flex items-start space-x-2 text-xs">
                                    <div className="bg-cyan-900/30 rounded-full p-1 mt-0.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-400 flex-1">Fuel prices vary between planets. Mining planets often offer lower prices.</p>
                                </div>

                                <div className="flex items-start space-x-2 text-xs">
                                    <div className="bg-cyan-900/30 rounded-full p-1 mt-0.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-400 flex-1">Upgrading your ship may increase fuel efficiency for long-distance travel.</p>
                                </div>
                            </div>

                            {/* Fuel usage explanation */}
                            <div className="mt-6 bg-slate-800/80 rounded p-3 border border-cyan-900/30">
                                <h5 className="text-cyan-200 font-medium text-xs mb-1">Fuel Consumption</h5>
                                <p className="text-gray-400 text-xs">
                                    Travel distance and your ship&apos;s fuel efficiency determine consumption.
                                    Engine upgrades from the Trading Guild can reduce your ship&apos;s fuel usage.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 