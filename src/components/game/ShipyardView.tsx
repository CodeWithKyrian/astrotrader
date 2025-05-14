'use client';

import { useOwnedBlueprints } from '@/hooks/useOwnedBlueprints';
import { useGameStore } from '@/store/gameStore'; // Assuming base stats are in gameStore
import { BlueprintEffectType, type ProcessedBlueprint } from '@/types/blueprints';
import Image from 'next/image';
import { useEffect, useMemo } from 'react';
import { useShallow } from 'zustand/shallow';

const BASE_CARGO_CAPACITY = 20;
const BASE_MAX_FUEL = 100;

export function ShipyardView() {
    const { blueprints, isLoading, error, refreshBlueprints } = useOwnedBlueprints();
    const { currentShipCargoCapacity, currentShipMaxFuel, updateShipCoreStats } = useGameStore(
        useShallow(state => ({
            currentShipCargoCapacity: state.ship.cargoCapacity,
            currentShipMaxFuel: state.ship.maxFuel,
            updateShipCoreStats: state.updateShipCoreStats,
        }))
    );

    // Calculate derived stats based on owned blueprints
    const derivedStats = useMemo(() => {
        let newCargo = BASE_CARGO_CAPACITY;
        let newFuel = BASE_MAX_FUEL;

        if (blueprints && blueprints.length > 0) {
            blueprints.forEach(bp => {
                if (bp.parsedAttributes.effectType === BlueprintEffectType.INCREASE_CARGO_CAPACITY) {
                    newCargo += bp.parsedAttributes.effectValue;
                }
                if (bp.parsedAttributes.effectType === BlueprintEffectType.INCREASE_MAX_FUEL) {
                    newFuel += bp.parsedAttributes.effectValue;
                }
                // Add more effect types here
            });
        }
        return { cargoCapacity: newCargo, maxFuel: newFuel };
    }, [blueprints]);

    // Update the Zustand store when derivedStats change
    useEffect(() => {
        if (derivedStats.cargoCapacity !== currentShipCargoCapacity || derivedStats.maxFuel !== currentShipMaxFuel) {
            console.log("Applying blueprint effects to game store:", derivedStats);
            updateShipCoreStats({
                cargoCapacity: derivedStats.cargoCapacity,
                maxFuel: derivedStats.maxFuel,
            });
        }
    }, [derivedStats, currentShipCargoCapacity, currentShipMaxFuel, updateShipCoreStats]);


    const handleAwardPlaceholderBlueprint = async () => {
        try {
            const response = await fetch('/api/blueprints/award-placeholder', { method: 'POST' });
            const data = await response.json();
            if (response.ok) {
                alert(data.message || "Blueprint awarded! Refreshing...");
                refreshBlueprints(); // Refresh the list
            } else {
                alert(`Error: ${data.error || data.message || "Could not award blueprint."}`);
            }
        } catch (e) {
            alert("Failed to request blueprint award.");
            console.error(e);
        }
    };


    return (
        <div className="space-y-4">
            <div>
                <h4 className="text-md font-semibold text-amber-400">Current Ship Stats:</h4>
                <p className="text-sm">Cargo Capacity: {currentShipCargoCapacity} units</p>
                <p className="text-sm">Max Fuel: {currentShipMaxFuel} units</p>
            </div>

            <div className="flex justify-between items-center">
                <h4 className="text-md font-semibold text-amber-400">Owned Blueprints:</h4>
                <button onClick={refreshBlueprints} className="text-xs px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded">Refresh List</button>
            </div>

            {isLoading && <p className="text-gray-400">Loading blueprints...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}

            {!isLoading && blueprints.length === 0 && (
                <p className="text-gray-500">No blueprints found in your guild wallet.</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {blueprints.map(bp => (
                    <div key={bp.mintAddress} className="border border-cyan-700 p-3 rounded-md bg-cyan-900/30">
                        <h5 className="font-semibold text-cyan-300">{bp.name}</h5>
                        {bp.imageUrl && (
                            <div className="my-2 w-full h-24 relative">
                                <Image src={bp.imageUrl} alt={bp.name} layout="fill" objectFit="contain" unoptimized={bp.imageUrl.startsWith('/')} />
                            </div>
                        )}
                        <p className="text-xs text-gray-300">{bp.parsedAttributes.description}</p>
                        <p className="text-xs mt-1">Tier: <span className="text-cyan-400">{bp.parsedAttributes.tier}</span></p>
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700">
                <button
                    onClick={handleAwardPlaceholderBlueprint}
                    className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-sm rounded-md"
                >
                    Debug: Get Placeholder Cargo Blueprint
                </button>
                <p className="text-xs text-gray-500 mt-1 text-center">This will mint an NFT to your wallet (server pays fees).</p>
            </div>
        </div>
    );
}