'use client';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { cn } from '@/lib/utils';
import {
    BarChart3,
    Briefcase,
    Calendar,
    FileText,
    HelpCircle,
    LayoutDashboard,
    Map,
    Package,
    Plane,
    Settings,
    Users,
    AlertTriangle,
    Wrench,
    Truck,
    ClipboardList,
    MessageSquare,
    ShieldCheck,
    ChevronRight,
    Shapes,
    Box,
    ArchiveRestore,
    FileBarChart,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Button } from '@/components/ui/button';

// Type definitions
interface MenuItem {
    label: string;
    href: string;
    icon: React.ElementType;
    badge?: number | string;
    badgeColor?: string;
}

interface MenuGroup {
    title: string;
    items: MenuItem[];
}

export function Sidebar() {
    const t = useTranslations('Sidebar');
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    const menuGroups: MenuGroup[] = useMemo(() => [
        {
            title: t('main'),
            items: [
                { label: t('dashboard'),     href: '/dashboard',          icon: LayoutDashboard },
                { label: t('complaints'),    href: '/complaints',         icon: FileText,   badge: 'live', badgeColor: 'bg-cyan-500' },
                { label: t('ecosystem'),     href: '/ecosystem',          icon: Shapes,     badge: 'Alpha', badgeColor: 'bg-purple-500' },
                { label: t('map'),           href: '/map',                icon: Map },
                { label: t('analytics'),     href: '/analytics',          icon: BarChart3 },
                { label: 'Rapports GMAO',    href: '/reports/maintenance', icon: FileBarChart, badge: 'KPI', badgeColor: 'bg-primary' },
            ],
        },
        {
            title: t('ops'),
            items: [
                { label: t('teams'),       href: '/teams',              icon: Users },
                { label: t('planning'),    href: '/planning',           icon: Calendar },
                { label: t('roster'),      href: '/roster',             icon: ClipboardList },
                { label: t('fleet'),       href: '/fleet',              icon: Truck },
                { label: t('inventory'),   href: '/inventory',          icon: Package },
                { label: 'Magasin MRO',    href: '/inventory/mro',      icon: ArchiveRestore, badge: 'Stock', badgeColor: 'bg-primary' },
                { label: 'Équipements',    href: '/assets',             icon: Box, badge: 'GMAO', badgeColor: 'bg-emerald-500' },
                { label: 'Ordres Travail', href: '/work-orders',        icon: Wrench, badge: 'OT', badgeColor: 'bg-red-500' },
                { label: 'Maintenance PM', href: '/maintenance',        icon: Calendar, badge: 'PM', badgeColor: 'bg-amber-500' },
                { label: t('designStudio'), href: '/technical-design',   icon: Shapes, badge: 'CAD', badgeColor: 'bg-primary' },
            ],
        },
        {
            title: t('hr'),
            items: [
                { label: t('staff'),       href: '/staff',              icon: Briefcase },
                { label: t('leave'),       href: '/staff/leave',        icon: Plane },
                { label: t('technicians'), href: '/technician',         icon: Wrench },
                { label: t('messages'),    href: '/messages',           icon: MessageSquare },
            ],
        },
        {
            title: t('admin'),
            items: [
                { label: 'Prospection (CRM)', href: '/marketing/prospects', icon: Briefcase, badge: 'HubSpot', badgeColor: 'bg-orange-500' },
                { label: t('auditLogs'),    href: '/audit-logs',         icon: ShieldCheck },
                { label: t('satisfaction'), href: '/feedback/satisfaction', icon: AlertTriangle },
                { label: t('settings'),     href: '/settings',           icon: Settings },
            ],
        },
    ], [t]);

    const isActive = (href: string) => {
        // Remove locale prefix for comparison
        const clean = pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, '');
        return clean === href || clean.startsWith(href + '/');
    };

    return (
        <aside
            className={cn(
                'relative flex flex-col h-screen sticky top-0 hidden lg:flex transition-all duration-500 ease-in-out z-40',
                // Sharp borders + intense electric violet glow on the edge
                'bg-white/90 dark:bg-[#25084a]/95 backdrop-blur-3xl border-r-2 border-slate-200 dark:border-violet-500/30 group/sidebar',
                'shadow-[4px_0_24px_-4px_rgba(139,92,246,0.1)] dark:shadow-[10px_0_40px_-10px_rgba(139,92,246,0.5)]',
                collapsed ? 'w-20' : 'w-72'
            )}
        >
            {/* Collapse Toggle - High contrast electric effect - Moved to top right */}
            <Button variant="transparent" size="icon"
                onClick={() => setCollapsed((c) => !c)}
                aria-label={collapsed ? 'Ouvrir le menu' : 'Fermer le menu'}
                className={cn(
                    'absolute top-6 z-50 w-10 h-10 rounded-xl flex items-center justify-center shadow-2xl',
                    'bg-white dark:bg-[#1a0b2e] border-2 border-violet-500 text-violet-500',
                    'hover:scale-110 active:scale-95 hover:bg-violet-500 hover:text-white',
                    'shadow-[0_0_20px_rgba(139,92,246,0.5)]',
                    collapsed ? 'left-1/2 -translate-x-1/2' : 'right-4'
                )}
            >
                <ChevronRight className={cn('w-6 h-6 transition-transform duration-500', collapsed ? '' : 'rotate-180')} />
            </Button>

            {/* Ambient glows for the premium look */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute bottom-10 left-0 w-32 h-32 bg-purple-600/10 rounded-full blur-[60px] pointer-events-none" />

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto overflow-x-hidden py-8 space-y-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-violet-500/20">
                {menuGroups.map((group) => (
                    <div key={group.title} className="mb-6">
                        {/* Group Label */}
                        {!collapsed && (
                            <p className="px-6 pt-3 pb-2 text-[10px] font-black text-slate-400 dark:text-violet-400/50 uppercase tracking-[0.3em] font-display">
                                {group.title}
                            </p>
                        )}
                        {collapsed && <div className="mx-4 my-4 h-px bg-slate-100 dark:bg-violet-500/10" />}

                        {group.items.map((item) => {
                            const active = isActive(item.href);
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    title={collapsed ? item.label : undefined}
                                    className={cn(
                                        'relative flex items-center gap-4 mx-3 px-4 py-3 rounded-lg transition-all duration-300 group/item select-none overflow-hidden',
                                        active
                                            ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20'
                                            : 'text-slate-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-500/5'
                                    )}
                                >
                                    {/* Active shadow glow */}
                                    {active && (
                                        <div className="absolute inset-0 bg-violet-500/5 blur-xl pointer-events-none" />
                                    )}
                                    
                                    <Icon className={cn(
                                        'w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover/item:scale-110',
                                        active ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400 group-hover/item:text-violet-500'
                                    )} />

                                    {/* Label */}
                                    {!collapsed && (
                                        <span className={cn(
                                            'text-sm font-bold tracking-tight whitespace-nowrap truncate',
                                            active ? 'text-slate-900 dark:text-white' : 'text-slate-500 group-hover/item:text-slate-900 dark:group-hover/item:text-slate-200'
                                        )}>
                                            {item.label}
                                        </span>
                                    )}

                                    {/* Badge */}
                                    {item.badge && !collapsed && (
                                        <span className={cn(
                                            'ml-auto px-2 py-0.5 rounded-full text-[9px] font-black text-white uppercase tracking-tighter',
                                            item.badgeColor ?? 'bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]'
                                        )}>
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* Footer - No theme toggle */}
            <div className="shrink-0 border-t border-slate-200 dark:border-violet-500/10 p-4 space-y-2 bg-white/50 dark:bg-[#1a0b2e]/30 backdrop-blur-sm">
                {/* System status */}
                <div className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-lg transition-all',
                    !collapsed && 'bg-violet-500/5 border border-violet-500/10 shadow-inner'
                )}>
                    <span className="relative flex-shrink-0">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping opacity-50" />
                    </span>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black text-slate-400 dark:text-violet-400/60 uppercase tracking-widest leading-none mb-1.5">{t('system')}</p>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-1 bg-slate-200 dark:bg-violet-900/40 rounded-full overflow-hidden">
                                    <div className="h-full w-[94%] bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.3)]" />
                                </div>
                                <span className="text-[10px] font-black text-slate-400 dark:text-violet-400">94%</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Help */}
                <Link
                    href="/settings"
                    className={cn(
                        'flex items-center gap-4 px-4 py-3 rounded-lg text-slate-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-all group/item',
                    )}
                >
                    <HelpCircle className="w-5 h-5 transition-transform group-hover/item:rotate-12" />
                    {!collapsed && <span className="text-sm font-bold tracking-tight">{t('help') || 'Help'}</span>}
                </Link>
            </div>
        </aside>
    );
}
