'use client';

import { useState, useEffect } from 'react';

interface StartScreenProps {
    onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
    const [showTitle, setShowTitle] = useState(false);
    const [showButton, setShowButton] = useState(false);

    // Staggered animation
    useEffect(() => {
        const titleTimer = setTimeout(() => setShowTitle(true), 300);
        const buttonTimer = setTimeout(() => setShowButton(true), 1000);

        return () => {
            clearTimeout(titleTimer);
            clearTimeout(buttonTimer);
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 relative">
            {/* Animated stars in background */}
            <div className="absolute inset-0 opacity-70 z-0">
                <div className="stars-sm"></div>
                <div className="stars-md"></div>
                <div className="stars-lg"></div>
            </div>

            {/* Cosmic glow effects */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-purple-500/10 to-cyan-500/10 filter blur-3xl"></div>
            <div className="absolute top-2/3 left-1/3 w-[400px] h-[400px] rounded-full bg-gradient-to-r from-cyan-500/5 to-blue-500/5 filter blur-3xl"></div>

            {/* Game content */}
            <div className="relative z-10 flex flex-col items-center">
                {/* Logo & Title */}
                <div className={`flex flex-col items-center mb-12 transition-all duration-1000 ${showTitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    {/* Logo Icon */}
                    <div className="relative w-36 h-36 mb-6">
                        <div className="absolute inset-0 rounded-full bg-cyan-600/10 animate-pulse"></div>
                        <div className="absolute inset-[3px] rounded-full border border-cyan-500/30"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            {/* <svg
                                className="w-20 h-20 text-cyan-400"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M12 3L4 10L4 20L20 20L20 10L12 3Z"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M12 8L16 11V16H8V11L12 8Z"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinejoin="round"
                                />
                                <circle cx="19" cy="5" r="1.5" fill="currentColor" className="animate-pulse" />
                                <circle cx="5" cy="19" r="1" fill="currentColor" className="animate-pulse" />
                                <circle cx="19" cy="19" r="1" fill="currentColor" className="animate-pulse" />
                            </svg> */}
                            <svg
                                className="w-20 h-20 text-cyan-400"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                {/* Space Ship / Trading Vessel */}
                                <path
                                    d="M12 3L4 10L4 20L20 20L20 10L12 3Z"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinejoin="round"
                                />
                                {/* Cockpit */}
                                <path
                                    d="M12 8L16 11V16H8V11L12 8Z"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinejoin="round"
                                />
                                {/* Wings */}
                                <path
                                    d="M4 13L1 15V18L4 17"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M20 13L23 15V18L20 17"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinejoin="round"
                                />
                                {/* Engines */}
                                <rect
                                    x="7"
                                    y="16"
                                    width="2"
                                    height="4"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinejoin="round"
                                />
                                <rect
                                    x="15"
                                    y="16"
                                    width="2"
                                    height="4"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinejoin="round"
                                />
                                {/* Cargo */}
                                <rect
                                    x="10"
                                    y="12"
                                    width="4"
                                    height="3"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinejoin="round"
                                />
                                {/* Star */}
                                <circle
                                    cx="19"
                                    cy="5"
                                    r="1"
                                    fill="currentColor"
                                    className="animate-pulse"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-300 to-purple-400"
                        style={{ textShadow: '0 0 25px rgba(6,182,212,0.6)' }}>
                        AstroTrader
                    </h1>

                    <p className="mt-4 text-xl text-center text-cyan-200/80" style={{ textShadow: '0 0 10px rgba(6,182,212,0.3)' }}>
                        Galactic Trading Adventure
                    </p>
                </div>

                {/* Start Button */}
                <div className={`transition-all duration-700 ${showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <button
                        onClick={onStart}
                        className="relative group"
                    >
                        {/* Button glow and background */}
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/50 to-blue-600/50 blur-lg transform group-hover:scale-110 transition-all duration-500 opacity-70"></div>

                        {/* Button content */}
                        <div className="relative py-4 px-10 bg-gradient-to-r from-slate-900/90 to-slate-800/90 border border-cyan-500/70 rounded-lg shadow-lg backdrop-blur-sm hover:shadow-cyan-500/30 transition-all duration-300 overflow-hidden group">
                            {/* Subtle starfield inside button */}
                            <div className="absolute inset-0 opacity-20">
                                <div className="stars-sm"></div>
                            </div>

                            {/* Button corners */}
                            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400/70"></div>
                            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-400/70"></div>
                            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-400/70"></div>
                            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400/70"></div>

                            <div className="relative flex items-center space-x-2">
                                <span className="text-xl font-bold text-cyan-300 tracking-wider">BEGIN ADVENTURE</span>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 text-cyan-300 transform translate-x-0 group-hover:translate-x-1 transition-transform"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Game version */}
                <div className="mt-8 text-gray-500 text-sm">
                    <div className="flex items-center">
                        <span className="mr-2">v0.1</span>
                        <span className="text-cyan-500/50">|</span>
                        <span className="ml-2">Powered by <span className="text-cyan-400">Civic</span> Auth</span>
                    </div>
                </div>
            </div>
        </div>
    );
} 