'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
    className?: string;
    size?: number;
    showText?: boolean;
    variant?: 'white' | 'violet';
}

export function Logo({ className = "", size = 32, showText = false, variant = 'violet' }: LogoProps) {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <motion.div 
                className="relative flex items-center justify-center p-1"
                style={{ width: size, height: size }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                {/* Branding Icon Container with Electric Glow */}
                <div className="absolute inset-0 bg-violet-500/10 rounded-xl border border-violet-500/20 rotate-3 group-hover:rotate-6 transition-transform"></div>
                
                {/* Updated Logo Image */}
                <img 
                    src="/logo.svg" 
                    alt="ReclamTrack Pro Logo"
                    className="relative z-10 w-full h-full object-contain drop-shadow-[0_0_12px_rgba(139,92,246,0.5)]"
                />

                {/* Intense Violet Glow */}
                <div className="absolute inset-0 bg-violet-600/15 blur-2xl rounded-full animate-pulse"></div>
            </motion.div>

            {showText && (
                <div className="flex flex-col">
                    <h1 className="text-xl font-display font-black tracking-tighter uppercase italic leading-none">
                        <span className="text-slate-900 dark:text-white">RECLAMTRACK</span>
                        <span className="text-violet-500 ml-1.5 not-italic">PRO</span>
                    </h1>
                </div>
            )}
        </div>
    );
}

