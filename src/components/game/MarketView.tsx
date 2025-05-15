'use client';

import { useGameStore } from '@/store/gameStore';
import { useCivicWallet } from '@/hooks/useCivicWallet';
import { useState, useMemo } from 'react';
import { createTreasuryTransferTransaction } from '@/lib/spl-client';
import { connection } from '@/lib/solana-client';
import { useShallow } from 'zustand/react/shallow';
import { toast } from 'react-hot-toast';

interface MarketViewProps {
    galacticCredits: number;
    refreshGalacticCredits: () => Promise<void>;
}

interface TradingState {
    isTrading: boolean;
    commodityId: string | null;
    action: 'buy' | 'sell' | null;
}

export function MarketView({ galacticCredits, refreshGalacticCredits }: MarketViewProps) {
    const {
        userData,
        planets,
        commodities,
        isGameDataLoaded,
        canBuyCommodity,
        updateCargoOnBuy,
        canSellCommodity,
        updateCargoOnSell,
        setIsTrading,
    } = useGameStore(
        useShallow(state => ({
            userData: state.userData,
            planets: state.planets,
            commodities: state.commodities,
            isGameDataLoaded: state.isGameDataLoaded,
            canBuyCommodity: state.canBuyCommodity,
            updateCargoOnBuy: state.updateCargoOnBuy,
            canSellCommodity: state.canSellCommodity,
            updateCargoOnSell: state.updateCargoOnSell,
            setIsTrading: state.setIsTrading,
            isTrading: state.isTrading,
        }))
    );

    const { publicKey: userPublicKey, sendTransaction } = useCivicWallet();
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [tradingState, setTradingState] = useState<TradingState>({
        isTrading: false,
        commodityId: null,
        action: null
    });

    const currentPlanet = useMemo(() => {
        if (!userData?.currentPlanetId || planets.length === 0) return null;
        return planets.find(p => p.id === userData.currentPlanetId);
    }, [userData?.currentPlanetId, planets]);

    const handleQuantityChange = (commodityId: string, value: string) => {
        const numValue = parseInt(value, 10);
        setQuantities(prev => ({ ...prev, [commodityId]: isNaN(numValue) || numValue < 0 ? 0 : numValue }));
    };

    const handleTrade = async (
        commodityId: string,
        tradeType: 'buy' | 'sell',
        price: number,
    ) => {
        if (!currentPlanet || !userPublicKey || !sendTransaction || !userData || !userData.ship) {
            toast.error("Wallet not connected, user data missing, or planet data missing.");
            return;
        }

        setTradingState({
            isTrading: true,
            commodityId,
            action: tradeType
        });
        setIsTrading(true);

        const quantity = quantities[commodityId] || 0;
        if (quantity <= 0) {
            toast.error("Please enter a valid quantity.");
            setTradingState({
                isTrading: false,
                commodityId: null,
                action: null
            });
            setIsTrading(false);
            return;
        }

        try {
            if (tradeType === 'buy') {
                const check = canBuyCommodity(commodityId, quantity, price, galacticCredits);
                if (!check.canAfford || !check.hasSpace) {
                    toast.error(check.reason || "Cannot complete purchase.");
                    setTradingState({
                        isTrading: false,
                        commodityId: null,
                        action: null
                    });
                    setIsTrading(false);
                    return;
                }

                const tokenAmount = quantity * price * Math.pow(10, 6);
                const transaction = await createTreasuryTransferTransaction(userPublicKey, tokenAmount);

                if (!transaction) {
                    toast.error("Failed to create transaction");
                    setTradingState({
                        isTrading: false,
                        commodityId: null,
                        action: null
                    });
                    setIsTrading(false);
                    return;
                }

                const signature = await sendTransaction(transaction, connection);
                console.log('Buy transaction sent:', signature);
                toast.success(`Purchased ${quantity} units of ${commodities.find(c => c.id === commodityId)?.name}! Signature: ${signature.substring(0, 10)}...`);

                updateCargoOnBuy(commodityId, quantity);
                await refreshGalacticCredits();
            } else { // Sell
                if (!canSellCommodity(commodityId, quantity)) {
                    toast.error("Cannot sell: Not enough items in cargo.");
                    setTradingState({
                        isTrading: false,
                        commodityId: null,
                        action: null
                    });
                    setIsTrading(false);
                    return;
                }

                console.log(`Initiating sell for ${quantity} of ${commodityId} from planet ${currentPlanet.id}`);

                const response = await fetch('/api/trade/execute-sell', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        commodityId,
                        quantity,
                        planetId: currentPlanet.id,
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.details || data.error || "Sell transaction failed on server.");
                }

                toast.success(data.message || `Successfully sold! ${data.creditsAwarded} GC added.`);

                updateCargoOnSell(commodityId, quantity);

                await refreshGalacticCredits();
            }

            setQuantities(prev => ({ ...prev, [commodityId]: 0 }));
        } catch (e) {
            console.error("Trade failed:", e);
            toast.error(e instanceof Error ? e.message : "An unknown error occurred during trade.");
        } finally {
            setTradingState({
                isTrading: false,
                commodityId: null,
                action: null
            });
            setIsTrading(false);
        }
    };

    if (!isGameDataLoaded || !userData) return (
        <div className="h-full flex items-center justify-center">
            <div className="text-cyan-400 animate-pulse flex items-center">
                <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading Market Data...
            </div>
        </div>
    );

    if (!currentPlanet) return (
        <div className="h-full flex items-center justify-center">
            <div className="text-cyan-400 animate-pulse flex items-center">
                <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Traveling to planet market...
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-transparent">
            {/* Market Header */}
            <div className="flex-shrink-0 mb-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-semibold text-cyan-300" style={{ textShadow: '0 0 10px rgba(6,182,212,0.3)' }}>
                            <span className="opacity-70 mr-2">Market:</span> {currentPlanet.name}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">Available commodities for trade on this planet.</p>
                    </div>

                    <div className="flex items-center space-x-3">
                        {/* Market Legend */}
                        <div className="flex items-center space-x-3 text-xs">
                            <div className="flex items-center">
                                <span className="w-2 h-2 bg-red-400 rounded-full mr-1"></span>
                                <span className="text-gray-400">Buy</span>
                            </div>
                            <div className="flex items-center">
                                <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                                <span className="text-gray-400">Sell</span>
                            </div>
                        </div>

                        {/* Market Status Indicator */}
                        <div className="bg-slate-800/80 px-3 py-1.5 rounded-md border border-cyan-700/40 flex items-center shadow-[0_0_10px_rgba(8,145,178,0.15)]">
                            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                            <span className="text-xs text-cyan-100">Trading Active</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scrollable Commodity List - Direct Children */}
            <div className="flex-grow overflow-y-auto custom-scrollbar">
                <div className="space-y-3">
                    {commodities.map(commodityItem => {
                        const marketInfo = currentPlanet.marketListings.find(c => c.commodityId === commodityItem.id);
                        const itemInCargo = userData.ship.currentCargo.find(c => c.commodityId === commodityItem.id);
                        const cargoQty = itemInCargo ? itemInCargo.quantity : 0;
                        const isTradable = marketInfo?.buyPrice || marketInfo?.sellPrice;

                        return (
                            <div key={commodityItem.id}
                                className={`bg-slate-900/60 border rounded-md overflow-hidden shadow-[0_0_15px_rgba(8,145,178,0.1)] backdrop-blur-sm transition-all duration-200
                                ${isTradable
                                        ? 'border-cyan-700/50 hover:border-cyan-500/70 hover:shadow-[0_0_15px_rgba(8,145,178,0.25)]'
                                        : 'border-gray-700/50 opacity-70'}`}>

                                {/* Commodity Header */}
                                <div className="px-4 py-3 bg-gradient-to-r from-slate-800/70 via-slate-900/70 to-slate-800/70 border-b border-cyan-800/30 flex justify-between items-center">
                                    <h5 className="font-medium text-base text-cyan-300" style={{ textShadow: '0 0 8px rgba(6,182,212,0.3)' }}>{commodityItem.name}</h5>
                                    <div className="bg-slate-800/80 px-2 py-0.5 rounded text-xs text-gray-300 shadow-[0_0_8px_rgba(8,145,178,0.1)] flex items-center border border-slate-700/70">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                        </svg>
                                        In Cargo: <span className="font-medium ml-1 text-cyan-300">{cargoQty}</span>
                                    </div>
                                </div>

                                {/* Commodity Content */}
                                <div className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    {/* Commodity Info */}
                                    <div className="space-y-1">
                                        <p className="text-xs text-gray-400">{commodityItem.description || "No description available."}</p>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {marketInfo?.buyPrice && (
                                                <div className="bg-red-900/40 border border-red-700/40 rounded-md shadow-[0_0_8px_rgba(225,29,72,0.1)] px-2 py-0.5 text-xs text-red-300 backdrop-blur-sm">
                                                    Buy At: <span className="font-medium text-red-200">{marketInfo.buyPrice} GC</span>
                                                </div>
                                            )}
                                            {marketInfo?.sellPrice && (
                                                <div className="bg-green-900/40 border border-green-700/40 rounded-md shadow-[0_0_8px_rgba(22,163,74,0.1)] px-2 py-0.5 text-xs text-green-300 backdrop-blur-sm">
                                                    Sell At: <span className="font-medium text-green-200">{marketInfo.sellPrice} GC</span>
                                                </div>
                                            )}
                                            {!isTradable && (
                                                <div className="bg-gray-800/30 border border-gray-700/30 rounded px-2 py-0.5 text-xs text-gray-500">
                                                    Not Traded Here
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Trading Actions */}
                                    {isTradable && (
                                        <div className="flex flex-col sm:flex-row items-center gap-2 sm:ml-auto">
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={quantities[commodityItem.id] || ''}
                                                    onChange={(e) => handleQuantityChange(commodityItem.id, e.target.value)}
                                                    className="bg-slate-900/80 border border-cyan-900/50 rounded-md w-24 py-1.5 px-3 text-sm text-cyan-100 placeholder-gray-500 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                                                    disabled={tradingState.isTrading}
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">QTY</span>
                                            </div>
                                            <div className="flex gap-2">
                                                {marketInfo?.buyPrice && (
                                                    <button
                                                        disabled={tradingState.isTrading}
                                                        onClick={() => handleTrade(commodityItem.id, 'buy', marketInfo.buyPrice!)}
                                                        className="flex items-center justify-center rounded-md bg-gradient-to-r from-red-900/80 to-red-700/80 hover:from-red-800 hover:to-red-600 border border-red-700/50 px-3 py-1.5 text-sm font-medium text-white shadow-[0_0_10px_rgba(225,29,72,0.15)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        {tradingState.isTrading && tradingState.commodityId === commodityItem.id && tradingState.action === 'buy' ? (
                                                            <svg className="animate-spin h-3.5 w-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                        ) : (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                            </svg>
                                                        )}
                                                        Buy
                                                    </button>
                                                )}
                                                {marketInfo?.sellPrice && (
                                                    <button
                                                        disabled={tradingState.isTrading || cargoQty <= 0}
                                                        onClick={() => handleTrade(commodityItem.id, 'sell', marketInfo.sellPrice!)}
                                                        className="flex items-center justify-center rounded-md bg-gradient-to-r from-green-900/80 to-green-700/80 hover:from-green-800 hover:to-green-600 border border-green-700/50 px-3 py-1.5 text-sm font-medium text-white shadow-[0_0_10px_rgba(22,163,74,0.15)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        {tradingState.isTrading && tradingState.commodityId === commodityItem.id && tradingState.action === 'sell' ? (
                                                            <svg className="animate-spin h-3.5 w-3.5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                        ) : (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                        Sell
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}