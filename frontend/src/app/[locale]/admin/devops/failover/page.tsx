'use client';

import { toast } from 'sonner';

import React from 'react';
import {
    Globe,
    ShieldCheck,
    AlertOctagon,
    SwitchCamera,
    Server,
    Database,
    CheckCircle,
    XCircle,
    Activity,
    ArrowLeftRight,
    Clock,
    Play,
    Lock,
    RefreshCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DrFailoverDashboard() {
    return (
        <div className="flex h-full min-h-screen flex-col bg-slate-50 dark:bg-background font-sans text-slate-900 dark:text-slate-100">

            {/* Critical Header */}
            <header className="px-6 py-4 bg-rose-600 text-white flex items-center justify-between sticky top-0 z-50 shadow-lg shadow-rose-900/20">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                        <AlertOctagon className="size-6 animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black tracking-tight uppercase">Disaster Recovery Console</h1>
                        <p className="text-xs text-rose-100 font-medium">Authorized Personnel Only • Level 5 Access Required</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-[10px] uppercase font-bold text-rose-200">Current State</span>
                        <span className="text-sm font-bold flex items-center gap-2">
                            <span className="size-2 rounded-full bg-emerald-400"></span>
                            Healthy (Active-Passive)
                        </span>
                    </div>
                    <div className="h-8 w-px bg-white/20"></div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-mono bg-black/20 px-2 py-1 rounded">RTO: 15m</span>
                        <span className="text-xs font-mono bg-black/20 px-2 py-1 rounded">RPO: 30s</span>
                    </div>
                </div>
            </header>

            <main className="p-6 md:p-10 max-w-7xl mx-auto w-full space-y-10">

                {/* Region Status Cards */}
                <div className="flex gap-4 md:gap-12 items-center justify-center relative">

                    {/* Connection Line */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 dark:bg-slate-800 -z-10 transform -translate-y-1/2"></div>

                    {/* Primary Region */}
                    <div className="flex-1 max-w-sm bg-white dark:bg-background rounded-2xl border-2 border-emerald-500 shadow-xl shadow-emerald-500/10 p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">PRIMARY</div>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="size-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                                <Globe className="size-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">US-East-1</h2>
                                <p className="text-xs text-slate-500">N. Virginia</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 flex items-center gap-2"><Server className="size-4" /> Compute</span>
                                <span className="text-emerald-500 font-bold flex items-center gap-1"><CheckCircle className="size-3" /> Operational</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 flex items-center gap-2"><Database className="size-4" /> Database</span>
                                <span className="text-emerald-500 font-bold flex items-center gap-1"><CheckCircle className="size-3" /> Synced</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 flex items-center gap-2"><Activity className="size-4" /> Traffic</span>
                                <span className="text-slate-900 dark:text-white font-mono font-bold">100%</span>
                            </div>
                        </div>
                    </div>

                    {/* Sync Status Badge (Center) */}
                    <div className="size-20 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-950 flex flex-col items-center justify-center z-10 shadow-lg">
                        <ArrowLeftRight className="size-6 text-primary" />
                        <span className="text-[10px] font-bold text-slate-500 mt-1">SYNC</span>
                    </div>

                    {/* Secondary Region */}
                    <div className="flex-1 max-w-sm bg-white dark:bg-background rounded-2xl border-2 border-slate-200 dark:border-border-dark p-6 relative opacity-80 hover:opacity-100 transition-opacity">
                        <div className="absolute top-0 right-0 bg-slate-200 dark:bg-slate-800 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-bl-xl">STANDBY</div>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="size-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center">
                                <Globe className="size-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">EU-West-1</h2>
                                <p className="text-xs text-slate-500">Ireland</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 flex items-center gap-2"><Server className="size-4" /> Compute</span>
                                <span className="text-primary font-bold flex items-center gap-1">Warm Standby</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 flex items-center gap-2"><Database className="size-4" /> Replication</span>
                                <span className="text-emerald-500 font-bold flex items-center gap-1"><Clock className="size-3" /> -24ms Lag</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 flex items-center gap-2"><Activity className="size-4" /> Traffic</span>
                                <span className="text-slate-900 dark:text-white font-mono font-bold">0%</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Action Console */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Failover Controls */}
                    <div className="bg-white dark:bg-background rounded-2xl border border-slate-200 dark:border-border-dark overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-background/50 flex justify-between items-center">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <SwitchCamera className="size-5 text-slate-500" /> Failover Controls
                            </h3>
                            <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                                <Lock className="size-3" /> Controls Locked
                            </span>
                        </div>
                        <div className="p-8 flex flex-col items-center justify-center gap-6">
                            <p className="text-sm text-slate-500 text-center max-w-md">
                                Initiating a failover will update global DNS records and promote the standby database. This process typically takes <span className="font-bold text-slate-900 dark:text-white">15 minutes</span>.
                            </p>

                            <div className="w-full max-w-sm p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-xl flex flex-col gap-3">
                                <label className="flex items-start gap-3">
                                    <input type="checkbox" className="mt-1 rounded border-rose-300 text-rose-600 focus:ring-rose-500" />
                                    <span className="text-xs text-rose-800 dark:text-rose-300 font-medium">I understand that this action will disrupt active connections in the primary region.</span>
                                </label>
                                <label className="flex items-start gap-3">
                                    <input type="checkbox" className="mt-1 rounded border-rose-300 text-rose-600 focus:ring-rose-500" />
                                    <span className="text-xs text-rose-800 dark:text-rose-300 font-medium">I have verified the standby database replication lag is acceptable.</span>
                                </label>
                            </div>

                            <button type="button" onClick={() => toast.info('Fonctionnalité en cours de déploiement')}  className="w-full max-w-sm py-3 bg-slate-200 dark:bg-slate-800 text-slate-400 font-bold rounded-lg cursor-not-allowed flex items-center justify-center gap-2" disabled>
                                <SwitchCamera className="size-5" /> Initiate Regional Failover
                            </button>
                        </div>
                    </div>

                    {/* Drill History */}
                    <div className="bg-white dark:bg-background rounded-2xl border border-slate-200 dark:border-border-dark overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-border-dark bg-slate-50 dark:bg-background/50 flex justify-between items-center">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <RefreshCcw className="size-5 text-slate-500" /> Recent Drills
                            </h3>
                            <Button variant="ghost" className="text-xs text-primary hover:underline">View Audit Logs</Button>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            <div className="p-4 flex items-center gap-4 hover:bg-primary/5 dark:hover:bg-surface-dark/50 transition-colors">
                                <div className="size-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                                    <Play className="size-5" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-sm">Scheduled Chaos Drill</h4>
                                    <p className="text-xs text-slate-500">Oct 12, 2023 • Duration: 45m</p>
                                </div>
                                <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-500 text-xs font-bold rounded">Pass</span>
                            </div>
                            <div className="p-4 flex items-center gap-4 hover:bg-primary/5 dark:hover:bg-surface-dark/50 transition-colors">
                                <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center">
                                    <Play className="size-5" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-sm">Database Switchover Test</h4>
                                    <p className="text-xs text-slate-500">Sep 28, 2023 • Duration: 12m</p>
                                </div>
                                <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-500 text-xs font-bold rounded">Pass</span>
                            </div>
                            <div className="p-4 flex items-center gap-4 hover:bg-primary/5 dark:hover:bg-surface-dark/50 transition-colors opacity-75">
                                <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center">
                                    <Play className="size-5" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-sm">Full Region Evacuation</h4>
                                    <p className="text-xs text-slate-500">Aug 05, 2023 • Duration: 1h 20m</p>
                                </div>
                                <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500 text-xs font-bold rounded">Partial</span>
                            </div>
                        </div>
                    </div>

                </div>

            </main>
        </div>
    );
}
