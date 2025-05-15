'use client';

import React, { useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose?: () => void;
    title: string;
    children: React.ReactNode;
    footerContent?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footerContent }: ModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-fadeIn">
            {/* Cosmic backdrop with stars */}
            <div className="absolute inset-0 backdrop-blur-sm bg-slate-900/80">
                <div className="absolute inset-0 opacity-30">
                    <div className="stars-sm"></div>
                    <div className="stars-md"></div>
                </div>
                {/* Background glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-r from-cyan-500/10 to-purple-500/10 filter blur-3xl"></div>
            </div>

            {/* Modal panel */}
            <div className="panel relative bg-slate-900/90 border border-cyan-700/40 rounded-lg shadow-[0_0_30px_rgba(6,182,212,0.25)] backdrop-blur-sm w-full max-w-md animate-scaleIn">
                {/* Corner decorations */}
                <div className="corner-tl"></div>
                <div className="corner-tr"></div>
                <div className="corner-bl"></div>
                <div className="corner-br"></div>

                {/* Blueprint grid background */}
                <div className="absolute inset-0 rounded-lg opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(8, 145, 178, 0.6) 1px, transparent 1px), 
                                         linear-gradient(to right, rgba(8, 145, 178, 0.6) 1px, transparent 1px)`,
                        backgroundSize: '20px 20px'
                    }}>
                </div>

                <div className="relative z-10 p-6">
                    {/* Close button */}
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-cyan-400 hover:text-cyan-300 bg-slate-800/80 hover:bg-slate-700/80 rounded-full border border-cyan-700/40 hover:border-cyan-600/60 transition-all duration-200 shadow-[0_0_10px_rgba(6,182,212,0.1)] hover:shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                            aria-label="Close modal"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}

                    {/* Title with glow effect */}
                    <h3 className="text-xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-cyan-100" style={{ textShadow: '0 0 15px rgba(6,182,212,0.5)' }}>
                        {title}
                    </h3>

                    {/* Modal content */}
                    <div className="mb-6 text-gray-300 space-y-4">
                        {children}
                    </div>

                    {/* Footer */}
                    {footerContent && (
                        <div className="flex justify-end space-x-3 border-t border-cyan-800/30 pt-4 mt-2">
                            {footerContent}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Add these animations to your globals.css
/*
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.animate-fadeIn {
  animation: fadeIn 0.2s ease-out forwards;
}

.animate-scaleIn {
  animation: scaleIn 0.3s ease-out forwards;
}
*/