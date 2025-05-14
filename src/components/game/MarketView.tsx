'use client';

import { useGameStore, COMMODITIES_DATA } from '@/store/gameStore';
import { useGalacticCredits } from '@/hooks/useGalacticCredits';
import { useCivicWallet } from '@/hooks/useCivicWallet';
import { useState, useMemo } from 'react';
import { GALACTIC_CREDITS_MINT } from '@/lib/spl-client';
import { getPublicEnv } from '@/config/environment';
import { PublicKey, Transaction } from '@solana/web3.js';
import { createTransferInstruction, getAssociatedTokenAddress } from '@solana/spl-token';
import { connection } from '@/lib/solana-client';

const env = getPublicEnv();
const TREASURY_PUBLIC_KEY = new PublicKey(env.TREASURY_PUBLIC_KEY);

export function MarketView({ galacticCredits, refreshGalacticCredits }: { galacticCredits: number, refreshGalacticCredits: () => void }) {
    const { currentPlanetId, planets, ship, canBuyCommodity, updateCargoOnBuy, canSellCommodity, updateCargoOnSell, setIsTrading, isTrading } = useGameStore();
    const { publicKey: userPublicKey, sendTransaction } = useCivicWallet();

    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [error, setError] = useState<string | null>(null);

    const currentPlanet = useMemo(() => planets.find(p => p.id === currentPlanetId), [currentPlanetId, planets]);

    const handleQuantityChange = (commodityId: string, value: string) => {
        const numValue = parseInt(value, 10);
        setQuantities(prev => ({ ...prev, [commodityId]: isNaN(numValue) || numValue < 0 ? 0 : numValue }));
    };

    const handleTrade = async (
        commodityId: string,
        tradeType: 'buy' | 'sell',
        price: number,
        maxAvailable?: number
    ) => {
        if (!currentPlanet || !userPublicKey || !sendTransaction) {
            setError("Wallet not connected or planet data missing.");
            return;
        }
        setIsTrading(true);
        setError(null);

        const quantity = quantities[commodityId] || 0;
        if (quantity <= 0) {
            setError("Please enter a valid quantity.");
            setIsTrading(false);
            return;
        }

        let transaction: Transaction | null = null;
        const transactionLamports = BigInt(Math.round(quantity * price * Math.pow(10, 6)));

        try {
            if (tradeType === 'buy') {
                const userGalacticCreditsAta = await getAssociatedTokenAddress(GALACTIC_CREDITS_MINT, userPublicKey, true);
                const treasuryGalacticCreditsAta = await getAssociatedTokenAddress(GALACTIC_CREDITS_MINT, TREASURY_PUBLIC_KEY, true);

                if (!canBuyCommodity(currentPlanet.id, commodityId, quantity, price)) {
                    setError("Cannot buy: Not enough cargo space.");
                    setIsTrading(false);
                    return;
                }
                if (galacticCredits < quantity * price) {
                    setError("Not enough Galactic Credits to buy.");
                    setIsTrading(false);
                    return;
                }

                transaction = new Transaction().add(
                    createTransferInstruction(
                        userGalacticCreditsAta,
                        treasuryGalacticCreditsAta,
                        userPublicKey,
                        transactionLamports
                    )
                );

                if (!transaction) {
                    setError("Failed to prepare transaction.");
                    setIsTrading(false);
                    return;
                }

                const signature = await sendTransaction(transaction, connection);
                console.log('Trade transaction sent:', signature);

                updateCargoOnBuy(commodityId, quantity);
                await refreshGalacticCredits();
                setQuantities(prev => ({ ...prev, [commodityId]: 0 }));
            } else { // Sell
                if (!canSellCommodity(currentPlanet.id, commodityId, quantity)) {
                    setError("Cannot sell: Not enough items in cargo or invalid quantity.");
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

                updateCargoOnSell(commodityId, quantity);

                await refreshGalacticCredits();
                setQuantities(prev => ({ ...prev, [commodityId]: 0 }));
                // fluctuatePrices(currentPlanet.id);
                // alert(data.message || `Successfully sold items! ${data.creditsAwarded} GC added.`);
            }
        } catch (e: any) {
            console.error("Trade failed:", e);
            setError(e.message || "An unknown error occurred during trade.");
        } finally {
            setIsTrading(false);
        }
    };

    if (!currentPlanet) return <p className="text-gray-500">Select a planet to see market data.</p>;

    const commodity = COMMODITIES_DATA.find(c => c.id === (Object.keys(quantities)[0] ?? '')); // A bit hacky for alert, improve if needed

    return (
        <div className="space-y-3">
            {error && <p className="text-red-500 bg-red-900/30 p-2 rounded text-sm">{error}</p>}
            {COMMODITIES_DATA.map(commodityItem => { // Renamed to avoid conflict
                const marketInfo = currentPlanet.commodities.find(c => c.commodityId === commodityItem.id);
                const itemInCargo = ship.currentCargo.find(c => c.commodityId === commodityItem.id);
                const cargoQty = itemInCargo ? itemInCargo.quantity : 0;

                return (
                    <div key={commodityItem.id} className="p-3 border border-gray-700 rounded-md bg-gray-800 flex items-center justify-between space-x-2">
                        <div className="flex-1">
                            <p className="font-semibold">{commodityItem.name} <span className="text-xs text-gray-400">(In Cargo: {cargoQty})</span></p>
                            <div className="text-xs space-x-3">
                                {marketInfo?.buyPrice && <span className="text-red-400">Buy: {marketInfo.buyPrice} GC</span>}
                                {marketInfo?.sellPrice && <span className="text-green-400">Sell: {marketInfo.sellPrice} GC</span>}
                                {!marketInfo?.buyPrice && !marketInfo?.sellPrice && <span className="text-gray-500">Not Traded Here</span>}
                            </div>
                        </div>
                        <input
                            type="number"
                            min="0"
                            value={quantities[commodityItem.id] || ''}
                            onChange={(e) => handleQuantityChange(commodityItem.id, e.target.value)}
                            className="w-16 p-1.5 bg-gray-900 border border-gray-600 rounded-md text-center text-sm"
                            placeholder="Qty"
                            disabled={isTrading}
                        />
                        <div className="flex flex-col space-y-1 sm:flex-row sm:space-y-0 sm:space-x-1">
                            {marketInfo?.buyPrice && (
                                <button
                                    onClick={() => handleTrade(commodityItem.id, 'buy', marketInfo.buyPrice!)}
                                    className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-xs rounded-md disabled:opacity-50"
                                    disabled={isTrading || (quantities[commodityItem.id] || 0) === 0}
                                >
                                    Buy
                                </button>
                            )}
                            {marketInfo?.sellPrice && (
                                <button
                                    onClick={() => handleTrade(commodityItem.id, 'sell', marketInfo.sellPrice!, cargoQty)}
                                    className="px-2.5 py-1.5 bg-green-600 hover:bg-green-700 text-xs rounded-md disabled:opacity-50"
                                    disabled={isTrading || (quantities[commodityItem.id] || 0) === 0 || cargoQty < (quantities[commodityItem.id] || 0)}
                                >
                                    Sell
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}