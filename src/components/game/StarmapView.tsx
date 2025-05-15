import { useGameStore } from "@/store/gameStore";
import { useShallow } from "zustand/shallow";
import { useMemo } from "react";

// Utility function to calculate distance between two planets
const calculateDistance = (p1: { x: number, y: number }, p2: { x: number, y: number }) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};

export function StarmapView() {
    const { planets, currentPlanetId, travelToPlanet, isTraveling } = useGameStore(
        useShallow(state => ({
            planets: state.planets,
            currentPlanetId: state.userData?.currentPlanetId,
            travelToPlanet: state.travelToPlanet,
            isTraveling: state.isTraveling,
        }))
    );

    const hyperlanes = useMemo(() => {
        const connections: { from: number, to: number, distance: number }[] = [];

        // For each planet, connect to 2-3 nearest neighbors
        planets.forEach((planet, i) => {
            const distances = planets
                .map((p, idx) => ({
                    index: idx,
                    distance: calculateDistance(
                        planet.coordinates,
                        p.coordinates
                    )
                }))
                .filter(d => d.index !== i) // Don't connect to self
                .sort((a, b) => a.distance - b.distance);

            // Connect to 2-3 nearest planets
            const connectCount = Math.min(3, distances.length);
            for (let j = 0; j < connectCount; j++) {
                // Avoid duplicate connections (only add if i < targetIdx)
                if (i < distances[j].index) {
                    connections.push({
                        from: i,
                        to: distances[j].index,
                        distance: distances[j].distance
                    });
                }
            }
        });

        return connections;
    }, [planets]);

    if (planets.length === 0) {
        return (
            <div className="h-full relative p-4 overflow-hidden">
                {/* Space background with stars */}
                <div className="absolute inset-0 bg-black/50 z-0 overflow-hidden">
                    <div className="absolute inset-0 opacity-70">
                        <div className="stars-sm"></div>
                        <div className="stars-md"></div>
                    </div>
                </div>

                <div className="h-full flex flex-col items-center justify-center">
                    <div className="w-20 h-20 relative mb-4">
                        <div className="absolute inset-0 rounded-full border-2 border-t-transparent border-cyan-400 animate-slow-spin"></div>
                        <div className="absolute inset-4 rounded-full border border-t-transparent border-cyan-400/50 animate-spin"></div>
                    </div>
                    <p className="text-cyan-300 animate-pulse text-lg">Loading Starmap Data...</p>
                    <p className="text-gray-400 text-sm mt-2">Initializing galaxy coordinates</p>
                </div>
            </div>
        );
    }

    if (!currentPlanetId) {
        return (
            <div className="h-full relative p-4 overflow-hidden">
                {/* Space background with stars */}
                <div className="absolute inset-0 bg-black/50 z-0 overflow-hidden">
                    <div className="absolute inset-0 opacity-70">
                        <div className="stars-sm"></div>
                    </div>
                </div>

                <div className="h-full flex flex-col items-center justify-center">
                    <div className="w-16 h-16 relative mb-3">
                        <div className="absolute inset-0 rounded-full border-2 border-t-transparent border-amber-400 animate-slow-spin"></div>
                    </div>
                    <p className="text-amber-300 animate-pulse">Locating your ship...</p>
                </div>
            </div>
        );
    }

    const currentPlanet = planets.find(p => p.id === currentPlanetId);

    return (
        <div className="h-full relative p-4 overflow-hidden">
            {/* Space background with stars */}
            <div className="absolute inset-0 bg-black/50 z-0 overflow-hidden">
                <div className="absolute inset-0 opacity-70">
                    <div className="stars-sm"></div>
                    <div className="stars-md"></div>
                    <div className="stars-lg"></div>
                </div>

                {/* Cosmic nebula effect */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.15),rgba(0,0,0,0)_70%)]"></div>
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-[radial-gradient(ellipse_at_bottom,rgba(124,58,237,0.1),rgba(0,0,0,0)_70%)]"></div>
            </div>

            <h3 className="panel-title text-center !mb-4 relative z-10">Starmap</h3>

            {isTraveling &&
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
                    <div className="text-center">
                        <div className="inline-block w-16 h-16 relative mb-3">
                            <div className="absolute inset-0 rounded-full border-2 border-t-transparent border-cyan-400 animate-slow-spin"></div>
                            <div className="absolute inset-1 rounded-full border border-t-transparent border-cyan-400/50 animate-slow-spin" style={{ animationDuration: '10s' }}></div>
                        </div>
                        <p className="text-xl animate-pulse">Traveling to {planets.find(p => p.id === currentPlanetId)?.name}...</p>
                    </div>
                </div>
            }
            <div className="w-full h-[calc(100%-3rem)] relative z-10">
                {/* Hyperlanes */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none"
                    style={{ zIndex: 1 }}>
                    {hyperlanes.map((connection, idx) => {
                        const fromPlanet = planets[connection.from];
                        const toPlanet = planets[connection.to];

                        const x1 = (fromPlanet.coordinates.x / 300) * 100;
                        const y1 = (fromPlanet.coordinates.y / 350) * 100;
                        const x2 = (toPlanet.coordinates.x / 300) * 100;
                        const y2 = (toPlanet.coordinates.y / 350) * 100;

                        // Check if this hyperlane connects to the current planet
                        const isActive = fromPlanet.id === currentPlanetId || toPlanet.id === currentPlanetId;

                        return (
                            <g key={`lane-${idx}`}>
                                {/* Glow effect for hyperlane */}
                                <line
                                    x1={`${x1}%`}
                                    y1={`${y1}%`}
                                    x2={`${x2}%`}
                                    y2={`${y2}%`}
                                    stroke={isActive ? "#60a5fa40" : "#2563eb15"}
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    style={{ filter: 'blur(3px)' }}
                                />
                                {/* Main hyperlane line */}
                                <line
                                    x1={`${x1}%`}
                                    y1={`${y1}%`}
                                    x2={`${x2}%`}
                                    y2={`${y2}%`}
                                    stroke={isActive ? "#60a5fa80" : "#2563eb30"}
                                    strokeWidth="1.5"
                                    strokeDasharray={isActive ? "3,2" : "2,2"}
                                    strokeLinecap="round"
                                />
                            </g>
                        );
                    })}
                </svg>

                {/* Planets */}
                {planets.map((p, index) => {
                    const isCurrentPlanet = p.id === currentPlanetId;

                    // Determine planet type colors - this would ideally come from your data
                    const planetTypes = [
                        { color: "emerald", glow: "#10b981" },   // Lush
                        { color: "red", glow: "#ef4444" },       // Desert/Hot
                        { color: "cyan", glow: "#06b6d4" },      // Ocean
                        { color: "amber", glow: "#f59e0b" },     // Gas giant
                        { color: "purple", glow: "#8b5cf6" },    // Exotic
                    ];

                    // Determine planet type based on index for demo purposes
                    const planetType = planetTypes[index % planetTypes.length];
                    const planetColor = isCurrentPlanet ? "green" : planetType.color;
                    const glowColor = isCurrentPlanet ? "#22c55e" : planetType.glow;

                    return (
                        <div key={p.id}
                            style={{
                                position: 'absolute',
                                left: `calc(${(p.coordinates.x / 300) * 100}% - 1.25rem)`, // Offset by half the width (w-10 = 2.5rem)
                                top: `calc(${(p.coordinates.y / 350) * 100}% - 1.25rem)`, // Offset by half the height
                                zIndex: 2,
                            }}
                            className="absolute w-10 h-10 md:w-12 md:h-12 transition-all duration-300 hover:scale-150 group cursor-pointer flex items-center justify-center"
                            title={p.name}
                            onClick={() => !isTraveling && travelToPlanet(p.id)}
                        >
                            {/* Planet glow effect - positioned under the dot */}
                            <div
                                className={`absolute inset-0 rounded-full blur-sm opacity-60
                                    ${isCurrentPlanet ? 'bg-green-500 animate-pulse' : `bg-${planetColor}-500 group-hover:bg-${planetColor}-400`}`}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    zIndex: 1,
                                    boxShadow: `0 0 10px ${glowColor}`,
                                    animationDuration: '2s'
                                }}>
                            </div>

                            {/* Outer ring */}
                            <div className={`absolute rounded-full border-2
                                ${isCurrentPlanet
                                    ? 'w-9 h-9 md:w-10 md:h-10 border-green-300 animate-ping opacity-30'
                                    : `w-7 h-7 md:w-9 md:h-9 border-${planetColor}-400 opacity-0 group-hover:opacity-30`}`}
                                style={{ zIndex: 2, animationDuration: '1.5s' }}>
                            </div>

                            {/* Secondary ring for effect */}
                            <div className={`absolute rounded-full border
                                ${isCurrentPlanet
                                    ? 'w-7 h-7 md:w-8 md:h-8 border-green-300/70'
                                    : `w-5 h-5 md:w-7 md:h-7 border-${planetColor}-500/50 opacity-0 group-hover:opacity-100`}`}
                                style={{ zIndex: 2 }}>
                            </div>

                            {/* Planet dot */}
                            <div className={`rounded-full shadow-lg ${isCurrentPlanet ? 'w-4 h-4 md:w-5 md:h-5' : 'w-3 h-3 md:w-4 md:h-4'}
                                ${isCurrentPlanet
                                    ? 'bg-green-400 ring-2 ring-green-300/50'
                                    : `bg-${planetColor}-500 group-hover:bg-${planetColor}-300 ring-1 ring-${planetColor}-400/30 group-hover:ring-${planetColor}-300/50`}`}
                                style={{ zIndex: 3 }}>
                            </div>

                            {/* Planet name on hover */}
                            <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-gray-800/90 px-2 py-1 
                                rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-gray-700/50"
                                style={{ zIndex: 4 }}>
                                {p.name}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="absolute bottom-2 right-4 z-10 bg-gray-800/70 rounded-md px-2 py-1 border border-gray-700/50">
                <p className="text-[0.7rem] text-gray-300">
                    Current: <span className="text-cyan-300">{currentPlanet?.name}</span>
                </p>
            </div>
        </div>
    );
}
