'use client';

import { useGalacticCredits } from "@/hooks/useGalacticCredits";
import { useGameStore } from "@/store/gameStore";
import { useShallow } from "zustand/react/shallow";
import { useUser } from "@civic/auth-web3/react";
import { useCallback, useEffect, useRef, useState } from "react";

export const Header = () => {
    const ship = useGameStore(useShallow(state => state.userData?.ship));
    const { balance: galacticCredits, isLoading: creditsLoading } = useGalacticCredits();
    const { user, signOut, authStatus } = useUser();

    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const cargoDisplay = ship ? `${ship.currentCargo.reduce((sum, item) => sum + item.quantity, 0)}/${ship.cargoCapacity}` : '-/-';
    const fuelDisplay = ship ? `${ship.fuel}/${ship.maxFuel}` : '-/-';

    const handleClickOutside = useCallback((event: MouseEvent) => {
        if (
            buttonRef.current &&
            dropdownRef.current &&
            !buttonRef.current.contains(event.target as Node) &&
            !dropdownRef.current.contains(event.target as Node)
        ) {
            setIsOpen(false);
        }
    }, []);

    const handleEscape = useCallback((event: KeyboardEvent) => {
        if (event.key === "Escape") {
            setIsOpen(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            window.addEventListener("click", handleClickOutside);
            window.addEventListener("keydown", handleEscape);
        }
        return () => {
            window.removeEventListener("click", handleClickOutside);
            window.removeEventListener("keydown", handleEscape);
        };
    }, [handleClickOutside, handleEscape, isOpen]);

    const handleSignOut = useCallback(async () => {
        setIsOpen(false);
        await signOut();
    }, [signOut]);

    const isLoading = authStatus ? authStatus.toLowerCase().includes('signing_') : false;

    if (!user) return null;

    return (
        <header className="relative z-40 w-full border-b border-cyan-800/40 backdrop-blur-sm bg-transparent">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                {/* Logo and Title */}
                <div className="flex items-center">
                    <svg
                        className="w-8 h-8 mr-2 text-cyan-400"
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
                        <rect
                            x="10"
                            y="12"
                            width="4"
                            height="3"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinejoin="round"
                        />
                        <circle
                            cx="19"
                            cy="5"
                            r="1"
                            fill="currentColor"
                        />
                    </svg>
                    <h1 className="text-2xl font-bold cursor-default">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-300 to-sky-400 hover:opacity-90 transition-opacity" style={{ textShadow: '0 0 15px rgba(6,182,212,0.5)' }}>
                            AstroTrader
                        </span>
                    </h1>
                </div>

                {/* HUD Elements  */}
                <div className="flex items-center space-x-4 md:space-x-6 text-sm">
                    {/* Galactic Credits */}
                    <div className="flex items-center px-3 py-1.5 bg-slate-900/90 border border-yellow-600/40 rounded-md shadow-[0_0_10px_rgba(202,138,4,0.15)] backdrop-blur-md" title="Galactic Credits">
                        <span className="text-yellow-400 text-lg mr-1.5">◈</span>
                        <span className="font-semibold text-yellow-400">
                            {creditsLoading ? "---" : galacticCredits.toLocaleString()}
                        </span>
                        <span className="ml-1 text-gray-400 text-xs">GC</span>
                    </div>

                    {/* Cargo */}
                    <div className="hidden sm:flex items-center px-3 py-1.5 bg-slate-900/90 border border-cyan-600/40 rounded-md shadow-[0_0_10px_rgba(8,145,178,0.15)] backdrop-blur-md" title="Cargo Hold">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                        <span className="font-medium text-gray-200">{cargoDisplay}</span>
                        <span className="ml-1 text-gray-400 text-xs">Units</span>
                    </div>

                    {/* Fuel */}
                    <div className="hidden sm:flex items-center px-3 py-1.5 bg-slate-900/90 border border-lime-600/40 rounded-md shadow-[0_0_10px_rgba(132,204,22,0.15)] backdrop-blur-md" title="Fuel Level">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-lime-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="font-medium text-gray-200">{fuelDisplay}</span>
                        <span className="ml-1 text-gray-400 text-xs">Fuel</span>
                    </div>
                </div>

                {/* User Button */}
                <div className="relative">
                    <button
                        ref={buttonRef}
                        onClick={() => !isLoading && setIsOpen(!isOpen)}
                        className="flex items-center gap-2.5 px-3.5 py-2 bg-slate-900/90 border border-cyan-700/40 rounded-md text-cyan-300 hover:border-cyan-500/70 shadow-[0_0_10px_rgba(8,145,178,0.15)] hover:shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all backdrop-blur-md whitespace-nowrap"
                    >
                        {user?.picture ? (
                            <span className="relative flex h-6 w-6 shrink-0 overflow-hidden rounded-full">
                                <img
                                    className="h-full w-full object-cover"
                                    src={user.picture}
                                    alt={user?.name || user?.email || 'User'}
                                />
                            </span>
                        ) : (
                            <span className="flex items-center justify-center h-6 w-6 shrink-0 rounded-full bg-cyan-600/20 border border-cyan-600/30">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-300" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                            </span>
                        )}
                        <span className="font-medium text-sm hidden md:block">
                            {isLoading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-cyan-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </span>
                            ) : (
                                user?.name || user?.email || 'User'
                            )}
                        </span>
                        {!isLoading && (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className={`h-4 w-4 text-cyan-300 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        )}
                    </button>

                    {/* Dropdown menu */}
                    {isOpen && (
                        <div
                            ref={dropdownRef}
                            className="absolute right-0 mt-2 w-48 bg-slate-900/90 border border-cyan-700/40 rounded-md shadow-[0_0_15px_rgba(8,145,178,0.2)] backdrop-blur-md z-50 overflow-hidden animate-fadeIn origin-top-right"
                        >
                            <button
                                onClick={handleSignOut}
                                disabled={isLoading}
                                className="w-full px-4 py-2.5 text-left text-sm text-gray-200 hover:bg-slate-800 hover:text-cyan-300 transition-colors flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}; 