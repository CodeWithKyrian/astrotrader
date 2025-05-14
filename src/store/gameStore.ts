import { create } from 'zustand';

interface Commodity {
    id: string;
    name: string;
    // basePrice: number; // For dynamic pricing later
}

interface Planet {
    id: string;
    name: string;
    commodities: Array<{ commodityId: string; buyPrice?: number; sellPrice?: number; stock?: number }>; // Price can be undefined if not sold/bought
    x: number;
    y: number;
}

export interface Ship {
    name: string;
    cargoCapacity: number;
    currentCargo: Array<{ commodityId: string; quantity: number }>;
    fuel: number;
    maxFuel: number;
    // speed: number; // For later
}

export interface ShipStats {
    cargoCapacity?: number;
    maxFuel?: number;
    // Add other stats like speed here later
}

interface GameState {
    currentPlanetId: string | null;
    ship: Ship;
    planets: Planet[];
    commodities: Commodity[];
    isTraveling: boolean;
    isTrading: boolean;

    initializeGameState: (initialCredits: number) => void;
    travelToPlanet: (planetId: string) => void;
    canBuyCommodity: (planetId: string, commodityId: string, quantity: number, price: number) => boolean;
    updateCargoOnBuy: (commodityId: string, quantity: number) => void;
    canSellCommodity: (planetId: string, commodityId: string, quantity: number) => boolean;
    updateCargoOnSell: (commodityId: string, quantity: number) => void;
    setIsTrading: (isTrading: boolean) => void;
    updateShipCoreStats: (newStats: ShipStats) => void;
    fluctuatePrices: (planetId?: string) => void;
}

// --- Initial Static Game Data ---
export const COMMODITIES_DATA: Commodity[] = [
    { id: 'water', name: 'Purified Water' },
    { id: 'food', name: 'Nutri-Paste' },
    { id: 'ore', name: 'Raw Minerals' },
    { id: 'tech', name: 'Tech Components' },
];

export const PLANETS_DATA: Planet[] = [
    { id: 'terra', name: 'Terra Prime', x: 100, y: 100, commodities: [
        { commodityId: 'water', buyPrice: 10, sellPrice: 8 },
        { commodityId: 'food', buyPrice: 20, sellPrice: 18 },
        { commodityId: 'ore', sellPrice: 50 }, // Only sells ore
    ]},
    { id: 'mars', name: 'Mars Colony', x: 250, y: 150, commodities: [
        { commodityId: 'water', sellPrice: 15 },
        { commodityId: 'food', sellPrice: 25 },
        { commodityId: 'ore', buyPrice: 40 }, // Only buys ore
        { commodityId: 'tech', buyPrice: 200, sellPrice: 180 },
    ]},
    { id: 'europa', name: 'Europa Outpost', x: 150, y: 300, commodities: [
        { commodityId: 'water', buyPrice: 5, sellPrice: 3 }, // Cheap water
        { commodityId: 'tech', sellPrice: 220 }, // Sells tech expensively
    ]},
];

export const useGameStore = create<GameState>((set, get) => ({
    currentPlanetId: PLANETS_DATA[0].id,
    ship: {
        name: 'Stardust Hopper',
        cargoCapacity: 20,
        currentCargo: [],
        fuel: 100,
        maxFuel: 100,
    },
    planets: PLANETS_DATA,
    commodities: COMMODITIES_DATA,
    isTraveling: false,
    isTrading: false,

    initializeGameState: (initialCredits) => {
        console.log("Game state initialized (credits will be from on-chain).");
    },

    setIsTrading: (isTrading) => set({ isTrading }),

    travelToPlanet: (planetId) => {
        const currentPlanet = get().planets.find(p => p.id === get().currentPlanetId);
        const targetPlanet = get().planets.find(p => p.id === planetId);
        if (!currentPlanet || !targetPlanet) return;

        const distance = Math.sqrt(Math.pow(targetPlanet.x - currentPlanet.x, 2) + Math.pow(targetPlanet.y - currentPlanet.y, 2));
        const fuelNeeded = Math.ceil(distance / 10);

        if (get().ship.fuel >= fuelNeeded) {
            set({ isTraveling: true });
            setTimeout(() => {
                set(state => ({
                    currentPlanetId: planetId,
                    ship: { ...state.ship, fuel: state.ship.fuel - fuelNeeded },
                    isTraveling: false,
                }));
                
                get().fluctuatePrices(planetId);
            }, 1000);
        } else {
            console.warn("Not enough fuel!");
            // TODO: Show UI message
        }
    },

    canBuyCommodity: (planetId, commodityId, quantity, price) => {
        const { ship } = get();
        const currentCargoAmount = ship.currentCargo.reduce((sum, item) => sum + item.quantity, 0);
        // Check if cargo capacity is sufficient
        return (currentCargoAmount + quantity) <= ship.cargoCapacity;
    },

    updateCargoOnBuy: (commodityId, quantity) => {
        set(state => {
            const existingItem = state.ship.currentCargo.find(item => item.commodityId === commodityId);
            let newCargo;
            if (existingItem) {
                newCargo = state.ship.currentCargo.map(item =>
                    item.commodityId === commodityId ? { ...item, quantity: item.quantity + quantity } : item
                );
            } else {
                newCargo = [...state.ship.currentCargo, { commodityId, quantity }];
            }
            return { ship: { ...state.ship, currentCargo: newCargo } };
        });
    },

    canSellCommodity: (planetId, commodityId, quantity) => {
        const { ship } = get();
        const itemInCargo = ship.currentCargo.find(item => item.commodityId === commodityId);
        return !!(itemInCargo && itemInCargo.quantity >= quantity);
    },

    updateCargoOnSell: (commodityId, quantity) => {
        set(state => {
            const newCargo = state.ship.currentCargo.map(item =>
                item.commodityId === commodityId ? { ...item, quantity: item.quantity - quantity } : item
            ).filter(item => item.quantity > 0);
            return { ship: { ...state.ship, currentCargo: newCargo } };
        });
    },

    updateShipCoreStats: (newStatsToUpdate) => {
        set(state => ({
            ship: {
                ...state.ship,
                ...newStatsToUpdate, // Merge new stats
            }
        }));
    },

    fluctuatePrices: (planetIdToUpdate?: string) => {
        set(state => {
            const newPlanets = state.planets.map(planet => {
                // Fluctuate only for the specified planet or all if none specified
                if (!planetIdToUpdate || planet.id === planetIdToUpdate || Math.random() < 0.3) { // Or all planets with a chance
                    const newCommodities = planet.commodities.map(com => {
                        let newBuyPrice = com.buyPrice;
                        let newSellPrice = com.sellPrice;
                        const fluctuation = Math.floor(Math.random() * 5) - 2; // -2 to +2 change

                        if (newBuyPrice) {
                            newBuyPrice = Math.max(1, newBuyPrice + fluctuation); // Ensure price > 0
                        }
                        if (newSellPrice) {
                            newSellPrice = Math.max(1, newSellPrice + fluctuation);
                        }

                        // Ensure buy price is generally higher than sell price for a given commodity on a planet if both exist
                        if (newBuyPrice && newSellPrice && newBuyPrice <= newSellPrice) {
                            newBuyPrice = newSellPrice + Math.floor(Math.random() * 2) + 1;
                        }


                        return { ...com, buyPrice: newBuyPrice, sellPrice: newSellPrice };
                    });
                    return { ...planet, commodities: newCommodities };
                }
                return planet;
            });
            console.log("Prices fluctuated for:", planetIdToUpdate || "several planets");
            return { planets: newPlanets };
        });
    },
}));