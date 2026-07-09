'use client';

import { toast } from 'sonner';

import { KPICard } from '@/components/shared/KPICard';
import { Database, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { usePIIData } from '@/lib/hooks/usePIIData';
import { Button } from '@/components/ui/button';

export default function PIIDiscoveryPage() {
    const { metrics, assets, loading } = usePIIData();

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        PII Discovery Results
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Last full scan completed 2 hours ago
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-sm font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Export CSV</Button>
                    <button type="button" onClick={() => toast.info('Fonctionnalité en cours de déploiement')}  className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        New Discovery Scan
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics && (
                    <>
                        <KPICard
                            title="Total Sources"
                            value={metrics.totalSources.toLocaleString()}
                            change={4}
                            trend="up"
                            changeLabel="4 new sources"
                            icon={<Database className="w-5 h-5" />}
                            loading={loading}
                        />

                        <KPICard
                            title="PII Findings"
                            value={`${(metrics.piiFindings / 1000).toFixed(1)}k`}
                            change={12}
                            trend="up"
                            changeLabel="Increased detection"
                            icon={<AlertTriangle className="w-5 h-5" />}
                            loading={loading}
                            className="border-l-4 border-l-amber-500"
                        />

                        <KPICard
                            title="Critical Risks"
                            value={metrics.criticalRisks.toString()}
                            change={-5.2}
                            trend="down"
                            changeLabel="Remediation progress"
                            icon={<Shield className="w-5 h-5" />}
                            loading={loading}
                            className="border-l-4 border-l-red-500"
                        />

                        <KPICard
                            title="GDPR Violations"
                            value={metrics.gdprViolations.toString()}
                            changeLabel="Stable"
                            icon={<CheckCircle className="w-5 h-5" />}
                            loading={loading}
                        />
                    </>
                )}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Heatmap - 2/3 */}
                <div className="lg:col-span-2 dashboard-card overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-slate-200 dark:border-border-dark flex justify-between items-center">
                        <h3 className="font-bold">Data Sensitivity Heatmap</h3>
                        <div className="flex gap-4 text-xs">
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded bg-slate-800"></span> Critical
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded bg-red-500"></span> High
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded bg-amber-500"></span> Med
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded bg-primary"></span> Low
                            </div>
                        </div>
                    </div>
                    <div className="p-6 flex-1">
                        <div className="grid grid-cols-[auto_1fr] gap-4">
                            <div className="flex flex-col justify-between py-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">
                                <span>S3 Buckets</span>
                                <span>Relational DB</span>
                                <span>NoSQL Docs</span>
                                <span>Log Streams</span>
                            </div>
                            <div className="grid grid-cols-12 gap-1">
                                {/* Row 1 - S3 Buckets */}
                                {[
                                    'bg-primary', 'bg-primary/40', 'bg-amber-500', 'bg-red-500',
                                    'bg-slate-800', 'bg-red-500', 'bg-primary', 'bg-primary',
                                    'bg-amber-500', 'bg-primary', 'bg-primary/40', 'bg-primary'
                                ].map((color, i) => (
                                    <div key={`s3-${i}`} className={`aspect-square ${color} rounded`}></div>
                                ))}
                                {/* Row 2 - Relational DB */}
                                {[
                                    'bg-slate-800', 'bg-red-500', 'bg-amber-500', 'bg-primary',
                                    'bg-primary', 'bg-primary', 'bg-red-500', 'bg-red-500',
                                    'bg-primary', 'bg-primary/40', 'bg-primary', 'bg-primary'
                                ].map((color, i) => (
                                    <div key={`db-${i}`} className={`aspect-square ${color} rounded`}></div>
                                ))}
                                {/* Row 3 - NoSQL */}
                                {[
                                    'bg-primary', 'bg-primary', 'bg-primary', 'bg-amber-500',
                                    'bg-amber-500', 'bg-red-500', 'bg-slate-800', 'bg-primary',
                                    'bg-primary', 'bg-primary', 'bg-primary/40', 'bg-primary'
                                ].map((color, i) => (
                                    <div key={`nosql-${i}`} className={`aspect-square ${color} rounded`}></div>
                                ))}
                                {/* Row 4 - Logs */}
                                {[
                                    'bg-primary/40', 'bg-primary/40', 'bg-primary', 'bg-primary',
                                    'bg-primary', 'bg-primary', 'bg-primary', 'bg-amber-500',
                                    'bg-amber-500', 'bg-primary', 'bg-primary', 'bg-primary'
                                ].map((color, i) => (
                                    <div key={`log-${i}`} className={`aspect-square ${color} rounded`}></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Compliance Sidebar - 1/3 */}
                <div className="dashboard-card p-5 flex flex-col">
                    <h3 className="font-bold mb-6">Compliance Alignment</h3>
                    <div className="flex-1 flex flex-col justify-around">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-semibold">
                                <span>GDPR Baseline</span>
                                <span>84%</span>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: '84%' }}></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-semibold">
                                <span>HIPAA Compliance</span>
                                <span>92%</span>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: '92%' }}></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-semibold">
                                <span>CCPA Alignment</span>
                                <span>65%</span>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500" style={{ width: '65%' }}></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-semibold">
                                <span>SOC2 Type II</span>
                                <span>100%</span>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: '100%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Assets Inventory Table */}
            <div className="dashboard-card overflow-hidden">
                <div className="p-5 border-b border-slate-200 dark:border-border-dark flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <h3 className="font-bold">Sensitive Assets Inventory</h3>
                        <span className="bg-slate-100 dark:bg-slate-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase text-slate-500">
                            GDPR Audit
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => toast.info('Fonctionnalité en cours de déploiement')}  className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-border-dark hover:bg-primary/5 dark:hover:bg-violet-500/15">
                            <span>🔽</span> Filter
                        </button>
                        <button type="button" onClick={() => toast.info('Fonctionnalité en cours de déploiement')}  className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-border-dark hover:bg-primary/5 dark:hover:bg-violet-500/15 text-primary">
                            <span>📥</span> Export CSV
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                                <th className="px-6 py-4">Asset Name</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Found PII</th>
                                <th className="px-6 py-4 text-center">Sensitivity Score</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-border-dark text-sm">
                            {assets?.map((asset) => (
                                <tr key={asset.id} className="hover:bg-primary/5 dark:hover:bg-violet-500/10 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-semibold">{asset.name}</span>
                                            <span className="text-xs text-slate-500 italic">{asset.id}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Database className="w-4 h-4 text-blue-400" />
                                            {asset.type}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {asset.piiTypes.map((type, index) => (
                                                <span key={index} className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-medium">{type}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-block px-3 py-1 rounded font-bold text-xs uppercase tracking-tight ${asset.sensitivityScore > 80 ? 'bg-red-500/20 text-red-500' :
                                            asset.sensitivityScore > 50 ? 'bg-amber-500/20 text-amber-500' :
                                                'bg-primary/20 text-primary'
                                            }`}>
                                            {asset.sensitivityScore} / 100
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`flex items-center gap-1.5 text-xs font-bold ${asset.status === 'open' ? 'text-red-500' :
                                            asset.status === 'pending' ? 'text-amber-500' :
                                                'text-emerald-500'
                                            }`}>
                                            <span className={`w-2 h-2 rounded-full ${asset.status === 'open' ? 'bg-red-500 animate-pulse' :
                                                asset.status === 'pending' ? 'bg-amber-500' :
                                                    'bg-emerald-500'
                                                }`}></span> {asset.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Button variant="ghost" className="text-primary font-bold text-xs hover:underline">Inspect</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-slate-200 dark:border-border-dark flex justify-between items-center text-xs text-slate-500 font-medium">
                    <p>Showing 1 to 3 of 892 assets</p>
                    <div className="flex gap-1">
                        <Button variant="primary" className="p-1.5 px-3 rounded-md bg-primary text-white">1</Button>
                        <Button variant="secondary" className="p-1.5 px-3 rounded-md hover:bg-primary/8 dark:hover:bg-violet-500/15">2</Button>
                        <Button variant="secondary" className="p-1.5 px-3 rounded-md hover:bg-primary/8 dark:hover:bg-violet-500/15">3</Button>
                    </div>
                </div>
            </div>

            {/* Active Scan Indicator */}
            <div className="fixed bottom-6 right-6 dashboard-card p-4 w-72 flex items-center gap-4 z-50 shadow-2xl">
                <div className="relative w-12 h-12 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                        <circle className="text-slate-200 dark:text-slate-800" cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" strokeWidth="4"></circle>
                        <circle className="text-primary transition-all" cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" strokeDasharray="125" strokeDashoffset="40" strokeWidth="4"></circle>
                    </svg>
                    <span className="absolute text-[10px] font-bold">68%</span>
                </div>
                <div className="flex-1">
                    <h4 className="text-xs font-bold">Incremental Scan</h4>
                    <p className="text-[10px] text-slate-500">Checking S3 Bucket logs...</p>
                </div>
                <button type="button" onClick={() => toast.info('Fonctionnalité en cours de déploiement')}  className="text-slate-400 hover:text-slate-200">✕</button>
            </div>
        </div>
    );
}
