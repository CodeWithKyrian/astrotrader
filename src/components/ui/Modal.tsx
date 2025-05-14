'use client';

import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose?: () => void;
    title: string;
    children: React.ReactNode;
    footerContent?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footerContent }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md relative">
                {onClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 text-gray-400 hover:text-gray-200 text-2xl"
                        aria-label="Close modal"
                    >
                        ×
                    </button>
                )}
                <h3 className="text-xl font-semibold mb-4 text-cyan-400">{title}</h3>
                <div className="mb-6 text-gray-300">
                    {children}
                </div>
                {footerContent && (
                    <div className="flex justify-end space-x-3 border-t border-gray-700 pt-4">
                        {footerContent}
                    </div>
                )}
            </div>
        </div>
    );
}