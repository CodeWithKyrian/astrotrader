'use client';

import { useEffect, useState } from 'react';

export function LoadingScreen() {
    const [dots, setDots] = useState(1);

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => prev < 3 ? prev + 1 : 1);
        }, 500);

        return () => clearInterval(interval);
    }, []);

    const loadingDots = '.'.repeat(dots);

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center">
            {/* Center glow */}
            <div className="absolute h-64 w-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>

            {/* Logo */}
            <div className="mb-8 relative">
                <svg
                    className="w-24 h-24 text-cyan-400 animate-float"
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
                    {/* Engines with animated glow */}
                    <g className="animate-thrust">
                        <rect
                            x="7"
                            y="20"
                            width="2"
                            height="3"
                            fill="rgba(56, 189, 248, 0.6)"
                        />
                        <rect
                            x="15"
                            y="20"
                            width="2"
                            height="3"
                            fill="rgba(56, 189, 248, 0.6)"
                        />
                    </g>
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

            {/* Loading text */}
            <div className="text-center z-10">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 mb-2">
                    AstroTrader
                </h2>
                <div className="text-cyan-300 text-lg mb-8 font-light tracking-wide">
                    Initializing Galactic Network{loadingDots}
                </div>

                {/* Spinner */}
                <div className="inline-block h-8 w-8 relative">
                    <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30"></div>
                    <div className="absolute inset-0 rounded-full border-t-2 border-cyan-400 animate-spin"></div>
                </div>
            </div>

            {/* Small orbital particles */}
            <div className="absolute h-48 w-48 animate-slow-spin" style={{ animationDuration: '20s' }}>
                {Array.from({ length: 3 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full bg-cyan-400/60 w-2 h-2"
                        style={{
                            top: '50%',
                            left: '50%',
                            transform: `rotate(${i * 120}deg) translateX(${60 + i * 5}px)`,
                        }}
                    />
                ))}
            </div>
        </div>
    );
} 