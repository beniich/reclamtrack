'use client';

import { motion } from 'framer-motion';

interface AnimatedLogoProps {
  className?: string;
  size?: number;
}

export function AnimatedLogo({ className = "", size = 40 }: AnimatedLogoProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      
      {/* 1. Global Electric Aura */}
      <motion.div
        className="absolute inset-0 bg-violet-600/20 rounded-full blur-[60px]"
        animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.1, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      
      {/* 2. Main Logo Container */}
      <motion.div
        className="relative z-10 w-full h-full flex items-center justify-center"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Base Logo Image (The new one we just copied) */}
        <img 
          src="/logo.svg" 
          alt="ReclamTrack Logo" 
          className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]"
        />

        {/* ⚡ ELECTRIC GLOW NODES ⚡ */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Top Node Glow - Industrial Orange */}
            <motion.div 
               className="w-[20%] h-[15%] bg-primary/50 rounded-full blur-md"
               animate={{ opacity: [0.3, 0.9, 0.3], scale: [1, 1.3, 1] }}
               transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
               style={{ position: 'absolute', top: '10%', left: '40%', mixBlendMode: 'screen' }}
            />
            {/* Side Node Glow - Electric Violet */}
            <motion.div 
               className="w-[15%] h-[15%] bg-violet-400/50 rounded-full blur-md"
               animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.2, 1] }}
               transition={{ duration: 3, repeat: Infinity }}
               style={{ position: 'absolute', top: '30%', right: '15%', mixBlendMode: 'screen' }}
            />
            
            {/* Scanning Laser Line (Electric Violet) */}
            <motion.div 
              className="absolute w-full h-[3%] bg-gradient-to-r from-transparent via-violet-400 to-transparent blur-sm"
              animate={{ translateY: ['-150%', '350%'], opacity: [0, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
              style={{ top: '20%', rotate: '-5deg' }}
            />
        </div>

        {/* ⚡ THE VIOLET BOLT EFFECT ⚡ */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="absolute overflow-visible filter drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]">
                <defs>
                    <linearGradient id="bolt-grad-violet" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#fff" />
                        <stop offset="60%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#fff" />
                    </linearGradient>
                </defs>
                <motion.path
                    d="M 52 35 L 43 51 L 54 49 L 46 68"
                    fill="none"
                    stroke="url(#bolt-grad-violet)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    animate={{ opacity: [0, 1, 0.3, 1, 0, 0] }}
                    transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 2 }}
                />
            </svg>
            <motion.div 
               className="w-[12%] h-[12%] bg-violet-400 rounded-full blur-[12px] opacity-60"
               animate={{ opacity: [0.2, 0.7, 0.2] }}
               transition={{ duration: 1.5, repeat: Infinity }}
               style={{ position: 'absolute', top: '50%', left: '48%', mixBlendMode: 'screen' }}
            />
        </div>
      </motion.div>
    </div>
  );
}

