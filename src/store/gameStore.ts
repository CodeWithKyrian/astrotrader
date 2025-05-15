import { create } from 'zustand';
import type { UserData, ShipState, Planet, Commodity, BlueprintDefinition } from '@/types/models';
import { toast } from 'react-hot-toast';
import { fetchAndProcessOwnedBlueprints } from '@/lib/metaplex-client';
import { ProcessedBlueprint, BlueprintEffectType } from '@/types/blueprints';
import { PublicKey } from '@solana/web3.js';

export const BASE_CARGO_CAPACITY = 20;
export const BASE_MAX_FUEL = 100;

interface GameDataState {
    planets: Planet[];
    commodities: Commodity[];
    blueprintDefinitions: BlueprintDefinition[];
    isGameDataLoaded: boolean;
    fetchGameData: () => Promise<void>;
}

interface UserSessionState {
    userData: UserData | null;
    isUserDataLoaded: boolean;
    loadUserData: () => Promise<void>;
    saveUserData: () => Promise<void>;
}

interface BlueprintState {
    ownedBlueprints: ProcessedBlueprint[];
    isBlueprintsLoading: boolean;
    blueprintsError: string | null;
    loadOwnedBlueprints: (publicKey: PublicKey) => Promise<void>;
    applyBlueprintEffectsToShip: () => void;
}

interface ShipActions {
    updateShipCargo: (newCargo: Array<{ commodityId: string; quantity: number }>) => void;
    updateShipFuel: (newFuel: number) => void;
    updateShipCoreStats: (newCoreStats: Pick<ShipState, 'cargoCapacity' | 'maxFuel'>) => void; // For blueprint effects
}

interface NavigationActions {
    travelToPlanet: (planetId: string) => void;
}

interface MarketActions {
    canBuyCommodity: (commodityId: string, quantity: number, price: number, currentGalacticCredits: number) => { canAfford: boolean; hasSpace: boolean; reason?: string };
    canSellCommodity: (commodityId: string, quantity: number) => boolean;
    updateCargoOnBuy: (commodityId: string, quantity: number) => void; // Assumes credits are handled by on-chain TX
    updateCargoOnSell: (commodityId: string, quantity: number) => void; // Assumes credits are handled by on-chain TX (or API for payout)
}

interface UIActionsState {
    isTraveling: boolean;
    isTrading: boolean;
    setIsTraveling: (traveling: boolean) => void;
    setIsTrading: (trading: boolean) => void;
}

interface StoreState {
    isStoreOpen: boolean;
    setIsStoreOpen: (open: boolean) => void;
}

interface RefuelingActions {
    refuelShip: (amount: number, cost: number, currentGalacticCredits: number) => 
        { success: boolean; newFuel: number; reason?: string };
}

type GameState = GameDataState & UserSessionState & UIActionsState & ShipActions & NavigationActions & MarketActions & StoreState & RefuelingActions & BlueprintState;

export const useGameStore = create<GameState>((set, get) => ({
    planets: [],
    commodities: [],
    blueprintDefinitions: [],
    isGameDataLoaded: false,

    // Blueprint State
    ownedBlueprints: [],
    isBlueprintsLoading: false,
    blueprintsError: null,

    fetchGameData: async () => {
        if (get().isGameDataLoaded) return;
        
        try {
            console.log("Fetching game definitions...");
            const [planetsRes, commoditiesRes, blueprintsRes] = await Promise.all([
                fetch('/api/game/planets'),
                fetch('/api/game/commodities'),
                fetch('/api/game/blueprint-definitions')
            ]);

            if (!planetsRes.ok || !commoditiesRes.ok || !blueprintsRes.ok) {
                throw new Error('Failed to fetch one or more game definitions');
            }

            const planets = await planetsRes.json();
            const commodities = await commoditiesRes.json();
            const blueprintDefinitions = await blueprintsRes.json();

            set({
                planets,
                commodities,
                blueprintDefinitions,
                isGameDataLoaded: true,
            });
            console.log("Game definitions loaded successfully.");
        } catch (error) {
            console.error("Error in fetchGameData:", error);
        }
    },

    // User Session State
    userData: null,
    isUserDataLoaded: false,

    loadUserData: async () => {
        if (get().isUserDataLoaded && get().userData) return;
        
        try {
            const response = await fetch('/api/game/user-data');
            if (!response.ok) throw new Error('Failed to load user data from server');
            
            const data = await response.json();
            set({ userData: data.userData, isUserDataLoaded: true });
            console.log("Userdata loaded successfully");
            
            // Once user data is loaded, we can attempt to load blueprints if the wallet is connected
            // This will be called by the parent component that manages wallet state
        } catch (error) {
            console.error("Error in loadUserData action:", error);
            set({ isUserDataLoaded: true });
        }
    },

    saveUserData: async () => {
        const { userData } = get();
        if (!userData) {
            console.warn("No user data to save.");
            return;
        }

        try {
            const payload = {
                currentPlanetId: userData.currentPlanetId,
                ship: userData.ship,
                hasClaimedInitialCredits: userData.hasClaimedInitialCredits,
            };

            const response = await fetch('/api/game/user-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) throw new Error('Failed to save user data to server');

            const result = await response.json();
            set(state => ({ userData: state.userData ? { ...state.userData, lastSaved: result.savedAt } : null }));
        } catch (error) {
            console.error("Error in saveUserData action:", error);
        }
    },

    // --- Ship Actions ---
    updateShipCargo: (newCargo) => {
        set(state => {
            if (!state.userData) return {};
            return {
                userData: {
                    ...state.userData,
                    ship: { ...state.userData.ship, currentCargo: newCargo }
                }
            };
        });
        get().saveUserData();
    },
    updateShipFuel: (newFuel) => {
        set(state => {
            if (!state.userData) return {};
            return {
                userData: {
                    ...state.userData,
                    ship: { ...state.userData.ship, fuel: Math.max(0, newFuel) }
                }
            };
        });
        get().saveUserData();
    },
    updateShipCoreStats: (newCoreStats) => {
        set(state => {
            if (!state.userData) return {};
            return {
                userData: {
                    ...state.userData,
                    ship: {
                        ...state.userData.ship,
                        cargoCapacity: newCoreStats.cargoCapacity ?? state.userData.ship.cargoCapacity,
                        maxFuel: newCoreStats.maxFuel ?? state.userData.ship.maxFuel,
                        // Also update current fuel if maxFuel decreased below current fuel
                        fuel: (newCoreStats.maxFuel && newCoreStats.maxFuel < state.userData.ship.fuel)
                            ? newCoreStats.maxFuel
                            : state.userData.ship.fuel,
                    }
                }
            };
        });
        get().saveUserData();
    },
    
    // --- Navigation Actions ---
    travelToPlanet: (planetId) => {
        const { planets, userData, isTraveling } = get();
        if (!userData || !userData.ship || isTraveling) return;

        const currentPlanet = planets.find(p => p.id === userData.currentPlanetId);
        const targetPlanet = planets.find(p => p.id === planetId);

        if (!currentPlanet || !targetPlanet || currentPlanet.id === targetPlanet.id) return;

        const distance = Math.sqrt(
            Math.pow(targetPlanet.coordinates.x - currentPlanet.coordinates.x, 2) +
            Math.pow(targetPlanet.coordinates.y - currentPlanet.coordinates.y, 2)
        );
        const fuelNeeded = Math.ceil(distance / 10);

        if (userData.ship.fuel >= fuelNeeded) {
            set({ isTraveling: true });
            setTimeout(() => {
                set(state => {
                    if (!state.userData) return {};
                    return {
                        userData: {
                            ...state.userData,
                            currentPlanetId: planetId,
                            ship: {
                                ...state.userData.ship,
                                fuel: state.userData.ship.fuel - fuelNeeded
                            }
                        },
                        isTraveling: false,
                    };
                });
                get().saveUserData();
            }, 1000);
        } else {
            toast.error("Not enough fuel for travel! Refuel at a station.");
        }
    },

     // --- Market Actions ---
     canBuyCommodity: (commodityId, quantity, price, currentGalacticCredits) => {
        const ship = get().userData?.ship;
        if (!ship) return { canAfford: false, hasSpace: false, reason: "Ship data not loaded." };

        const totalCost = quantity * price;
        const currentCargoAmount = ship.currentCargo.reduce((sum, item) => sum + item.quantity, 0);
        const hasSpace = (currentCargoAmount + quantity) <= ship.cargoCapacity;
        const canAfford = currentGalacticCredits >= totalCost;

        let reason = "";
        if (!canAfford) reason += "Not enough Galactic Credits. ";
        if (!hasSpace) reason += "Not enough cargo space.";

        return { canAfford, hasSpace, reason: reason.trim() || undefined };
    },
    updateCargoOnBuy: (commodityId, quantity) => {
        const { userData } = get();
        if (!userData || !userData.ship) return;

        const existingItem = userData.ship.currentCargo.find(item => item.commodityId === commodityId);
        let newCargo;
        if (existingItem) {
            newCargo = userData.ship.currentCargo.map(item =>
                item.commodityId === commodityId ? { ...item, quantity: item.quantity + quantity } : item
            );
        } else {
            newCargo = [...userData.ship.currentCargo, { commodityId, quantity }];
        }
        get().updateShipCargo(newCargo);
    },
    canSellCommodity: (commodityId, quantity) => {
        const ship = get().userData?.ship;
        if (!ship) return false;
        const itemInCargo = ship.currentCargo.find(item => item.commodityId === commodityId);
        return !!(itemInCargo && itemInCargo.quantity >= quantity);
    },
    updateCargoOnSell: (commodityId, quantity) => {
        const { userData } = get();
        if (!userData || !userData.ship) return;

        const newCargo = userData.ship.currentCargo.map(item =>
            item.commodityId === commodityId ? { ...item, quantity: item.quantity - quantity } : item
        ).filter(item => item.quantity > 0);

        get().updateShipCargo(newCargo);
    },

    // UI Actions State
    isTraveling: false,
    isTrading: false,
    setIsTraveling: (traveling) => set({ isTraveling: traveling }),
    setIsTrading: (trading) => set({ isTrading: trading }),

    // --- Store State ---
    isStoreOpen: false,
    setIsStoreOpen: (open) => set({ isStoreOpen: open }),
    
    // --- Refueling Actions ---
    refuelShip: (amount, cost, currentGalacticCredits) => {
        const { userData } = get();
        if (!userData || !userData.ship) {
            return { success: false, newFuel: 0, reason: "Ship data not loaded." };
        }
        
        const { ship } = userData;
        
        if (currentGalacticCredits < cost) {
            return { success: false, newFuel: ship.fuel, reason: "Not enough Galactic Credits." };
        }
        
        if (ship.fuel >= ship.maxFuel) {
            return { success: false, newFuel: ship.fuel, reason: "Fuel tank already full." };
        }
        
        const newFuel = Math.min(ship.fuel + amount, ship.maxFuel);
        
        get().updateShipFuel(newFuel);
        
        return { success: true, newFuel };
    },

    // Blueprint actions
    loadOwnedBlueprints: async (publicKey: PublicKey) => {
        const { isBlueprintsLoading } = get();
        if (isBlueprintsLoading) return;

        set({ isBlueprintsLoading: true, blueprintsError: null });
        try {
            const blueprints = await fetchAndProcessOwnedBlueprints(publicKey);
            set({ ownedBlueprints: blueprints, isBlueprintsLoading: false });
            
            // Apply effects immediately after loading
            get().applyBlueprintEffectsToShip();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load blueprints';
            set({ 
                blueprintsError: errorMessage,
                isBlueprintsLoading: false
            });
            console.error("Error loading blueprints:", error);
        }
    },
    
    applyBlueprintEffectsToShip: () => {
        const { ownedBlueprints, userData } = get();
        if (!userData?.ship) return;
        
        let newCargo = BASE_CARGO_CAPACITY;
        let newFuel = BASE_MAX_FUEL;
        
        if (ownedBlueprints && ownedBlueprints.length > 0) {
            ownedBlueprints.forEach(bp => {
                if (bp.parsedAttributes.effectType === BlueprintEffectType.INCREASE_CARGO_CAPACITY) {
                    newCargo += bp.parsedAttributes.effectValue;
                }
                if (bp.parsedAttributes.effectType === BlueprintEffectType.INCREASE_MAX_FUEL) {
                    newFuel += bp.parsedAttributes.effectValue;
                }
                // Add more effect types here as needed
            });
        }
        
        // Only update if values changed
        if (newCargo !== userData.ship.cargoCapacity || newFuel !== userData.ship.maxFuel) {
            console.log("Applying blueprint effects to ship:", { cargoCapacity: newCargo, maxFuel: newFuel });
            get().updateShipCoreStats({
                cargoCapacity: newCargo,
                maxFuel: newFuel
            });
        }
    },
}));