'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface LogoProps {
    className?: string;
    size?: number;
    showText?: boolean;
    variant?: 'white' | 'violet';
}

export function Logo({ className = "", size = 36, showText = false, variant = 'violet' }: LogoProps) {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <motion.div
                className="relative flex-shrink-0"
                style={{ width: size, height: size }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
            >
                {/* Glow background */}
                <div
                    className="absolute inset-0 rounded-xl bg-violet-500/10 border border-violet-500/20"
                    style={{ transform: 'rotate(3deg)' }}
                />

                {/* Logo Image — prend tout l'espace dispo */}
                <img
                    src="/logo.svg"
                    alt="ReclamTrack Pro Logo"
                    className="relative z-10 w-full h-full object-contain drop-shadow-[0_0_10px_rgba(139,92,246,0.45)]"
                    style={{ display: 'block' }}
                />

                {/* Subtle ambient glow */}
                <div className="absolute inset-0 bg-violet-600/10 blur-xl rounded-full pointer-events-none" />
            </motion.div>

            {showText && (
                <div className="flex flex-col leading-none">
                    <span className="text-[17px] font-display font-black tracking-tighter uppercase italic text-slate-900 dark:text-white">
                        RECLAMTRACK
                        <span className="text-violet-500 ml-1.5 not-italic text-[15px]">PRO</span>
                    </span>
                </div>
            )}
        </div>
    );
}
