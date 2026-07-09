'use client';

import { toast } from 'sonner';

import { RoleGuard } from '@/components/security/RoleGuard'
import { MetricCard } from '@/components/ui/MetricCard'
import { Button } from '@/components/ui/button'
import { Role } from '@/lib/rbac/permissions'
import { Search, Bell, Settings, Plus, AlertTriangle, MapPin, Edit2, MoreVertical, CheckCircle } from 'lucide-react';

export default function EdgeRoutePage() {
    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen">
            {/* Top Navigation */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-border-dark bg-background-light dark:bg-background-dark px-6 py-3 sticky top-0 z-50">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3 text-primary">
                        <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
                            <span className="material-symbols-outlined">hub</span>
                        </div>
                        <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">
                            EdgeRoute GSLB
                        </h2>
                    </div>
                    <nav className="hidden lg:flex items-center gap-6">
                        <a
                            className="text-primary text-sm font-semibold border-b-2 border-primary pb-4 -mb-4 mt-4"
                            href="#"
                        >
                            Dashboard
                        </a>
                        <a
                            className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-primary transition-colors"
                            href="#"
                        >
                            Routing Policies
                        </a>
                        <a
                            className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-primary transition-colors"
                            href="#"
                        >
                            Health Checks
                        </a>
                        <a
                            className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-primary transition-colors"
                            href="#"
                        >
                            Logs
                        </a>
                        <a
                            className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-primary transition-colors"
                            href="#"
                        >
                            Security
                        </a>
                    </nav>
                </div>
                <div className="flex flex-1 justify-end gap-4 items-center">
                    <label className="hidden md:flex flex-col min-w-40 max-w-64">
                        <div className="flex w-full items-stretch rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 h-9">
                            <div className="text-slate-400 flex items-center justify-center pl-3">
                                <Search />
                            </div>
                            <input
                                className="w-full bg-transparent border-none focus:ring-0 text-sm placeholder:text-slate-500 text-white px-3"
                                placeholder="Search rules or IPs..."
                            />
                        </div>
                    </label>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => toast.info('Fonctionnalité en cours de déploiement')}  className="flex size-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            <Bell />
                        </button>
                        <button type="button" onClick={() => toast.info('Fonctionnalité en cours de déploiement')}  className="flex size-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            <Settings />
                        </button>
                    </div>
                </div>
            </header>

            <main className="p-6 max-w-[1600px] mx-auto space-y-6">
                {/* Interactive Traffic Map Section */}
                <section className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                    <div className="xl:col-span-3 bg-white dark:bg-background border border-slate-200 dark:border-border-dark rounded-xl overflow-hidden relative shadow-sm">
                        <div className="p-4 border-b border-slate-200 dark:border-border-dark flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">public</span>
                                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Global Traffic Distribution</h3>
                            </div>
                            <div className="flex gap-2">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-500">
                                    <span className="flex size-2 rounded-full bg-green-500 animate-pulse"></span> US-East:
                                    Active
                                </span>
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-500 ml-4">
                                    <span className="flex size-2 rounded-full bg-green-500 animate-pulse"></span> EU-West:
                                    Active
                                </span>
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-500 ml-4">
                                    <span className="flex size-2 rounded-full bg-amber-500 animate-pulse"></span>{' '}
                                    ASIA-South: Degraded
                                </span>
                            </div>
                        </div>
                        <div className="h-[400px] relative bg-[#0a0f18] flex items-center justify-center">
                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#135bec_1px,transparent_1px)] [background-size:20px_20px]"></div>
                            <div className="relative w-full h-full flex items-center justify-center">
                                <div className="absolute top-[25%] left-[25%] size-3 bg-primary rounded-full shadow-[0_0_15px_#135bec] ring-4 ring-primary/20"></div>
                                <div className="absolute top-[33%] left-[50%] size-3 bg-primary rounded-full shadow-[0_0_15px_#135bec] ring-4 ring-primary/20"></div>
                                <div className="absolute top-[50%] right-[25%] size-3 bg-amber-500 rounded-full shadow-[0_0_15px_#f59e0b] ring-4 ring-amber-500/20"></div>
                                {/* Connecting Lines (SVG) */}
                                <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        className="opacity-40"
                                        d="M 250 150 Q 375 120, 500 200"
                                        fill="none"
                                        stroke="#135bec"
                                        strokeDasharray="5,5"
                                        strokeWidth="1.5"
                                    />
                                </svg>
                                <div className="z-10 text-center">
                                    <div className="text-slate-500 text-xs font-mono uppercase mb-2">
                                        Live Edge Nodes
                                    </div>
                                </div>
                            </div>
                            {/* Zoom Controls */}
                            <div className="absolute bottom-4 right-4 flex flex-col gap-1">
                                <button type="button" onClick={() => toast.info('Fonctionnalité en cours de déploiement')}  className="size-8 bg-slate-800 hover:bg-slate-700 rounded-t-lg flex items-center justify-center border border-slate-700 text-white">
                                    <Plus className="text-xs" />
                                </button>
                                <button type="button" onClick={() => toast.info('Fonctionnalité en cours de déploiement')}  className="size-8 bg-slate-800 hover:bg-slate-700 rounded-b-lg flex items-center justify-center border border-slate-700 border-t-0 text-white">
                                    <span className="material-symbols-outlined text-xs">remove</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Summary KPIs */}
                    <div className="grid grid-cols-1 gap-4">
                        <MetricCard
                            title="Total Traffic"
                            value="1.48M"
                            subtitle="RPS"
                            trend={{ value: '+12.4%', direction: 'up' }}
                        />
                        <MetricCard
                            title="Global Health"
                            value="99.98%"
                            subtitle="UPTIME"
                            trend={{ value: '-0.02%', direction: 'down' }}
                        />
                        <div className="bg-white dark:bg-background border border-slate-200 dark:border-border-dark rounded-xl p-5 shadow-sm">
                            <div className="flex justify-between items-start">
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                                    Active Failovers
                                </p>
                                <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                    STABLE
                                </span>
                            </div>
                            <div className="mt-2 flex items-baseline gap-2">
                                <h4 className="text-2xl font-bold dark:text-white">02</h4>
                                <span className="text-slate-500 text-xs font-medium">EVENTS</span>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-amber-500 text-xs font-medium">
                                <AlertTriangle className="text-sm" />
                                <span>Region: ASIA-South (Retrying...)</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Main Content Area: Rules & Policy Table */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Policy Table (Left 2/3) */}
                    <div className="lg:col-span-2 bg-white dark:bg-background border border-slate-200 dark:border-border-dark rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-200 dark:border-border-dark flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="font-bold text-lg dark:text-white">Routing Policies</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Manage global traffic distribution and failover priorities
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <RoleGuard minRole={Role.ADMIN}>
                                    <Button type="button" variant="ghost" size="sm">
                                        Export Config
                                    </Button>
                                </RoleGuard>
                                <RoleGuard minRole={Role.ADMIN}>
                                    <Button type="button" variant="primary" size="sm">
                                        <Plus className="text-sm" /> Add New Rule
                                    </Button>
                                </RoleGuard>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                        <th className="px-6 py-4">Rule Name</th>
                                        <th className="px-6 py-4">Routing Type</th>
                                        <th className="px-6 py-4">Regions</th>
                                        <th className="px-6 py-4">Priority</th>
                                        <th className="px-6 py-4">Health Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    <tr className="hover:bg-primary/5 dark:hover:bg-violet-500/8 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-sm dark:text-white">EU Latency Optimizer</span>
                                                <span className="text-xs text-slate-500">api.edgeroute.global</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-blue-100 dark:bg-primary/10 text-primary dark:text-blue-400 text-[11px] font-bold">
                                                <MapPin className="text-xs" />{' '}
                                                GEOLOCATION
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-mono dark:text-slate-300">EU, ASIA, US-East</td>
                                        <td className="px-6 py-4 text-xs">
                                            <span className="font-bold dark:text-white">01</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="size-2 rounded-full bg-green-500"></span>
                                                <span className="text-xs font-medium text-green-500">Healthy</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <RoleGuard minRole={Role.ADMIN}>
                                                <button type="button" onClick={() => toast.info('Fonctionnalité en cours de déploiement')}  className="p-1 text-slate-400 hover:text-primary transition-colors">
                                                    <Edit2 />
                                                </button>
                                                <button type="button" onClick={() => toast.info('Fonctionnalité en cours de déploiement')}  className="p-1 text-slate-400 hover:text-primary transition-colors ml-2">
                                                    <MoreVertical />
                                                </button>
                                            </RoleGuard>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Health Checks & Quick Config (Right 1/3) */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-background border border-slate-200 dark:border-border-dark rounded-xl shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-slate-200 dark:border-border-dark">
                                <h3 className="font-bold text-sm dark:text-white">Regional Health Status</h3>
                            </div>
                            <div className="p-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="text-green-500" />
                                        <div>
                                            <p className="text-xs font-bold dark:text-white">US-East (Virginia)</p>
                                            <p className="text-[10px] text-slate-500">HTTP/2 Status: 200 OK</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-400">22ms</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="text-green-500" />
                                        <div>
                                            <p className="text-xs font-bold dark:text-white">EU-Central (Frankfurt)</p>
                                            <p className="text-[10px] text-slate-500">HTTP/2 Status: 200 OK</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-400">84ms</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle className="text-amber-500" />
                                        <div>
                                            <p className="text-xs font-bold dark:text-white">ASIA-South (Mumbai)</p>
                                            <p className="text-[10px] text-slate-500">Timeout: 504 Gateway</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-400">---</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}
