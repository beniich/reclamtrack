'use client';

import { toast } from 'sonner';

import React from 'react';
import {
    Activity,
    Server,
    Database,
    Globe,
    Cpu,
    Zap,
    AlertCircle,
    CheckCircle,
    RefreshCcw,
    ArrowRight,
    TrendingUp,
    TrendingDown,
    LayoutGrid,
    List,
    MapPin,
    Clock,
    ShieldCheck,
    MousePointer2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SystemHealthDashboard() {
    return (
        <div className="flex h-full min-h-screen flex-col bg-background-dark font-sans text-slate-100 selection:bg-cyan-500/30">

            {/* Header */}
            <header className="px-6 py-4 bg-surface-dark/50 border-b border-border-dark flex items-center justify-between backdrop-blur-sm sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <div className="size-10 bg-cyan-500/10 text-cyan-400 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                        <Activity className="size-6" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight text-white">System Health <span className="text-slate-500 font-normal">Topology</span></h1>
                        <p className="text-xs text-slate-400 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            All systems operational
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-4 text-xs font-mono text-slate-400 border-r border-border-dark pr-4">
                        <div className="flex items-center gap-2">
                            <Clock className="size-3" />
                            <span>Uptime: 99.998%</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Zap className="size-3" />
                            <span>Latency: 42ms</span>
                        </div>
                    </div>
                    <button type="button" onClick={() => toast.info('Fonctionnalité en cours de déploiement')}  className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors border border-slate-700">
                        <RefreshCcw className="size-4" /> <span className="hidden sm:inline">Refresh</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 p-6 overflow-hidden relative">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.3)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] z-0 pointer-events-none"></div>

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">

                    {/* Topology Map (Center) */}
                    <div className="lg:col-span-2 bg-surface-dark/40 border border-border-dark rounded-2xl p-6 relative min-h-[500px] flex items-center justify-center overflow-hidden group">
                        <div className="absolute top-4 left-4 z-20 flex gap-2">
                            <button type="button" onClick={() => toast.info('Fonctionnalité en cours de déploiement')}  className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg backdrop-blur-sm border border-slate-700"><LayoutGrid className="size-4" /></button>
                            <button type="button" onClick={() => toast.info('Fonctionnalité en cours de déploiement')}  className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg backdrop-blur-sm border border-slate-700"><List className="size-4" /></button>
                        </div>

                        {/* Simulated Topology Graph */}
                        <div className="relative w-full h-full max-w-2xl mx-auto flex items-center justify-center">

                            {/* Load Balancer */}
                            <div className="absolute top-1/2 left-10 -translate-y-1/2 flex flex-col items-center gap-2 group/node">
                                <div className="size-16 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center shadow-lg transition-all group-hover/node:border-cyan-400 group-hover/node:shadow-[0_0_20px_rgba(34,211,238,0.3)] z-10">
                                    <Globe className="size-8 text-slate-300 group-hover/node:text-cyan-400" />
                                </div>
                                <div className="text-center">
                                    <p className="text-xs font-bold text-slate-300">Load Balancer</p>
                                    <p className="text-[10px] text-slate-500">1.2m req/s</p>
                                </div>
                            </div>

                            {/* Connecting Lines (Simulated with absolute divs for now) */}
                            <div className="absolute top-1/2 left-28 w-24 h-0.5 bg-slate-700 -translate-y-1/2">
                                <div className="absolute top-0 left-0 h-full w-1/3 bg-cyan-500 shadow-[0_0_10px_#22d3ee] animate-[shimmer_2s_infinite]"></div>
                            </div>

                            {/* API Gateway */}
                            <div className="absolute top-1/2 left-52 -translate-y-1/2 flex flex-col items-center gap-2 group/node">
                                <div className="size-20 rounded-hexagon bg-slate-800 border-2 border-emerald-500/50 flex items-center justify-center shadow-lg transition-all group-hover/node:border-emerald-500 group-hover/node:shadow-[0_0_20px_rgba(16,185,129,0.3)] z-10">
                                    <Server className="size-8 text-emerald-400" />
                                </div>
                                <div className="text-center">
                                    <p className="text-xs font-bold text-slate-300">API Gateway</p>
                                    <p className="text-[10px] text-emerald-500">Healthy</p>
                                </div>

                                {/* Badge */}
                                <div className="absolute -top-1 -right-1 size-5 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-950 border-2 border-slate-900">
                                    <CheckCircle className="size-3" />
                                </div>
                            </div>

                            {/* Fan out lines */}
                            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                                <path d="M 288 250 C 350 250, 350 120, 450 120" stroke="#334155" strokeWidth="2" fill="none" />
                                <path d="M 288 250 C 350 250, 350 250, 450 250" stroke="#334155" strokeWidth="2" fill="none" />
                                <path d="M 288 250 C 350 250, 350 380, 450 380" stroke="#334155" strokeWidth="2" fill="none" />
                                {/* Animated Packets */}
                                <circle r="3" fill="#22d3ee">
                                    <animateMotion repeatCount="indefinite" dur="2s" path="M 288 250 C 350 250, 350 120, 450 120" />
                                </circle>
                                <circle r="3" fill="#22d3ee">
                                    <animateMotion repeatCount="indefinite" dur="2.5s" path="M 288 250 C 350 250, 350 250, 450 250" />
                                </circle>
                                <circle r="3" fill="#fb923c">
                                    <animateMotion repeatCount="indefinite" dur="3s" path="M 288 250 C 350 250, 350 380, 450 380" />
                                </circle>
                            </svg>

                            {/* Services Column */}
                            <div className="absolute right-32 top-10 flex flex-col gap-12">

                                {/* Auth Service */}
                                <div className="flex items-center gap-3">
                                    <div className="size-14 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                                        <ShieldCheck className="size-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-300">Auth Service</p>
                                        <p className="text-[10px] text-slate-500">v2.4.0</p>
                                    </div>
                                </div>

                                {/* Checkout Service */}
                                <div className="flex items-center gap-3">
                                    <div className="size-14 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                                        <Zap className="size-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-300">Checkout</p>
                                        <p className="text-[10px] text-slate-500">v1.2.1</p>
                                    </div>
                                </div>

                                {/* Inventory Service (Warning) */}
                                <div className="flex items-center gap-3">
                                    <div className="size-14 rounded-xl bg-slate-800 border border-amber-500/50 flex items-center justify-center text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                                        <Database className="size-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-amber-500">Inventory</p>
                                        <p className="text-[10px] text-amber-600 font-bold">Latency High</p>
                                    </div>
                                </div>

                            </div>

                        </div>
                    </div>

                    {/* Metrics Sidebar */}
                    <div className="flex flex-col gap-6">
                        {/* Global Status Card */}
                        <div className="bg-surface-dark/50 border border-border-dark rounded-2xl p-6 backdrop-blur-sm">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Global Health Score</h3>
                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-5xl font-black text-white">98</span>
                                <span className="text-xl font-bold text-slate-500 mb-1">/100</span>
                            </div>
                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-4">
                                <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full rounded-full w-[98%] shadow-[0_0_10px_#10b981]"></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-slate-800/50 rounded-lg">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">CPU Load</p>
                                    <p className="text-lg font-mono font-bold text-white mt-1">42%</p>
                                </div>
                                <div className="p-3 bg-slate-800/50 rounded-lg">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">Memory</p>
                                    <p className="text-lg font-mono font-bold text-white mt-1">64%</p>
                                </div>
                            </div>
                        </div>

                        {/* Active Incidents */}
                        <div className="flex-1 bg-surface-dark/50 border border-border-dark rounded-2xl p-6 backdrop-blur-sm overflow-hidden flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Active Alerts</h3>
                                <span className="bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-500/20">1 Active</span>
                            </div>

                            <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
                                <div className="p-3 bg-amber-500/5 border-l-2 border-amber-500 rounded-r-lg group hover:bg-amber-500/10 transition-colors cursor-pointer">
                                    <div className="flex justify-between items-start">
                                        <p className="text-xs font-bold text-amber-500 mb-1">Inventory Service Latency</p>
                                        <span className="text-[10px] text-slate-500">2m ago</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mb-2">p99 latency exceeded 500ms threshold (current: 820ms)</p>
                                    <div className="hidden group-hover:flex gap-2">
                                        <Button variant="secondary" className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-xs rounded text-slate-300">Investigate</Button>
                                        <Button variant="secondary" className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-xs rounded text-slate-300">Ack</Button>
                                    </div>
                                </div>

                                <div className="p-3 bg-slate-800/30 border-l-2 border-slate-600 rounded-r-lg opacity-60">
                                    <div className="flex justify-between items-start">
                                        <p className="text-xs font-bold text-slate-400 mb-1">Payment Webhook Failure</p>
                                        <span className="text-[10px] text-slate-600">Resolved</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500">Instance i-0x99281 recovered automatically.</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </main>
        </div>
    );
}
