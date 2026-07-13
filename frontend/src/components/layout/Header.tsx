'use client';
import { useTranslations } from 'next-intl';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Bell, Search, Settings, User, LogOut, Bot, Sparkles } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Button } from '@/components/ui/button';

interface HeaderProps {
    showSearch?: boolean;
    breadcrumbs?: { label: string; href: string }[];
}

export function Header({ showSearch = true, breadcrumbs }: HeaderProps) {
    const tCommon = useTranslations('Common');
    const tNav = useTranslations('Navbar');
    const { user, logout } = useAuthStore();
    const { toggleAISidekick } = useUIStore();
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <header className="h-20 border-b border-slate-200 dark:border-primary/10 bg-white/80 dark:bg-[#0f0125]/80 backdrop-blur-xl px-8 flex items-center justify-between sticky top-0 z-50">
            {/* Logo & Breadcrumbs */}
            <div className="flex items-center gap-10">
                <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                    <Logo size={48} showText={true} />
                </Link>

                {breadcrumbs && (
                    <nav className="hidden lg:flex items-center gap-2 text-sm">
                        {breadcrumbs.map((crumb, i) => (
                            <div key={i} className="flex items-center gap-2">
                                {i > 0 && <span className="text-slate-400 dark:text-slate-600">/</span>}
                                <Link
                                    href={crumb.href}
                                    className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-orange-400 transition-colors font-medium"
                                >
                                    {crumb.label}
                                </Link>
                            </div>
                        ))}
                    </nav>
                )}
            </div>

            {/* AI Enhanced Search Bar */}
            {showSearch && (
                <div className="hidden md:flex flex-1 max-w-md mx-8">
                    <div className="relative w-full group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
                        <div className={cn(
                            "relative flex items-center bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-primary/20 rounded-2xl px-4 py-2.5 transition-all duration-300",
                            "group-focus-within:bg-white dark:group-focus-within:bg-[#1a0b3a] group-focus-within:animate-electric-border"
                        )}>
                            <Search className="text-slate-400 w-4 h-4 mr-3 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none text-slate-900 dark:text-white"
                                placeholder={tCommon('loading') === 'Loading...' ? "Ask AI Assistant..." : "Rechercher avec l'IA..."} 
                            />
                            {/* AI Agent Interaction Point */}
                            <div className="flex items-center pl-3 border-l border-slate-200 dark:border-slate-700 ml-2">
                                <motion.div 
                                    className="p-1.5 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary dark:text-orange-400 cursor-pointer"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={toggleAISidekick}
                                >
                                    <Bot className="w-4 h-4 animate-agent-point" />
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Actions & Premium Profile */}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 pr-4 border-r border-slate-200 dark:border-border-dark">
                    <ThemeToggle />
                    
                    <Button variant="transparent" size="icon" className="rounded-xl relative group" aria-label="Notifications">
                        <Bell className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-primary" />
                        <span className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full border-2 border-white dark:border-[#0f0125] group-hover:scale-110 transition-transform" />
                    </Button>

                    <Link href="/settings" className="p-2.5 hover:bg-primary/8 dark:hover:bg-violet-500/15 rounded-xl transition-all group">
                        <Settings className="w-5 h-5 text-slate-500 dark:text-slate-400 group-hover:text-primary" />
                    </Link>
                </div>

                {/* Premium Profile Section */}
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                            {user?.name || 'Admin Reclam'}
                        </p>
                        <div className="flex items-center justify-end gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            <p className="text-[10px] font-black text-primary/80 uppercase tracking-widest italic">
                                {user?.role || 'Super Admin'}
                            </p>
                        </div>
                    </div>
                    
                    <motion.div 
                        className="relative p-0.5 rounded-full bg-gradient-to-tr from-orange-500 to-purple-600 shadow-lg"
                        whileHover={{ scale: 1.05 }}
                    >
                        <div className="h-10 w-10 rounded-full bg-surface-dark border-2 border-white dark:border-[#0f0125] flex items-center justify-center overflow-hidden">
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="bg-primary/10 w-full h-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-primary" />
                                </div>
                            )}
                        </div>
                    </motion.div>

                    <Button variant="transparent" size="icon"
                        onClick={() => {
                            logout();
                        }} 
                        className="text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl"
                        title={tNav('logout')}
                        aria-label={tNav('logout')}
                    >
                        <LogOut className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </header>
    );
}
