'use client';

import { toast } from 'sonner';

import React from 'react';
import {
    GitPullRequest,
    GitCommit,
    CheckCircle,
    Plus,
    Minus,
    Edit2,
    Cloud,
    Server,
    Database,
    ArrowRight,
    ChevronDown,
    ChevronRight,
    Terminal,
    Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function IacDiffDashboard() {
    return (
        <div className="flex h-[calc(100vh-4rem)] bg-slate-50 dark:bg-background font-sans text-slate-900 dark:text-white">

            {/* Sidebar: Deployment History */}
            <aside className="w-80 border-r border-slate-200 dark:border-border-dark bg-white dark:bg-background flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-border-dark">
                    <h2 className="font-bold text-lg mb-1">Deployments</h2>
                    <p className="text-xs text-slate-500">Select a run to view diff</p>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {/* Item 1 - Active */}
                    <div className="p-4 border-b border-slate-100 dark:border-border-dark bg-purple-50 dark:bg-purple-900/10 border-l-4 border-l-purple-600 cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-sm">#8821: Add Redis Cluster</span>
                            <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500 px-1.5 py-0.5 rounded font-bold uppercase">Plan</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                            <GitCommit className="size-3" />
                            <span className="font-mono">7f3a2b</span>
                            <span>•</span>
                            <span>2 mins ago</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold">
                            <span className="text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">+4</span>
                            <span className="text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">~2</span>
                            <span className="text-rose-600 bg-rose-100 dark:bg-rose-900/30 px-1.5 py-0.5 rounded">-0</span>
                        </div>
                    </div>

                    {/* Item 2 */}
                    <div className="p-4 border-b border-slate-100 dark:border-border-dark hover:bg-primary/5 dark:hover:bg-surface-dark transition-colors cursor-pointer border-l-4 border-l-transparent">
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-sm">#8820: Scale Worker Nodes</span>
                            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-500 px-1.5 py-0.5 rounded font-bold uppercase">Applied</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                            <GitCommit className="size-3" />
                            <span className="font-mono">a2b4c1</span>
                            <span>•</span>
                            <span>2 hours ago</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold">
                            <span className="text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">~12</span>
                        </div>
                    </div>

                    {/* Item 3 */}
                    <div className="p-4 border-b border-slate-100 dark:border-border-dark hover:bg-primary/5 dark:hover:bg-surface-dark transition-colors cursor-pointer border-l-4 border-l-transparent">
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-sm">#8819: Network Policy Fix</span>
                            <span className="text-[10px] bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-500 px-1.5 py-0.5 rounded font-bold uppercase">Failed</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                            <GitCommit className="size-3" />
                            <span className="font-mono">e5d4c3</span>
                            <span>•</span>
                            <span>5 hours ago</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Diff Area */}
            <main className="flex-1 flex flex-col min-w-0">

                {/* Run Header */}
                <header className="px-8 py-6 border-b border-slate-200 dark:border-border-dark bg-white dark:bg-background flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-black tracking-tight">Add Redis Cluster</h1>
                            <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500 text-xs font-bold uppercase rounded-full tracking-wide">
                                Plan Phase
                            </span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-slate-500">
                            <span className="flex items-center gap-2"><GitPullRequest className="size-4" /> Triggered by PR #412</span>
                            <span className="flex items-center gap-2"><Terminal className="size-4" /> Terraform v1.5.7</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="secondary" className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg transition-colors">Discard</Button>
                        <button type="button" onClick={() => toast.info('Fonctionnalité en cours de déploiement')}  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-lg shadow-purple-200 dark:shadow-none transition-all flex items-center gap-2">
                            <Play className="size-4 fill-current" />
                            Apply Changes
                        </button>
                    </div>
                </header>

                {/* Diff Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50 dark:bg-background">

                    <div className="flex items-center justify-between text-sm font-bold text-slate-500">
                        <span>Resources to change: 6</span>
                        <div className="flex gap-4">
                            <span className="flex items-center gap-1 text-emerald-600"><Plus className="size-4" /> 4 to add</span>
                            <span className="flex items-center gap-1 text-amber-600"><Edit2 className="size-4" /> 2 to change</span>
                            <span className="flex items-center gap-1 text-rose-600"><Minus className="size-4" /> 0 to destroy</span>
                        </div>
                    </div>

                    {/* Resource Diff Block: Add */}
                    <div className="rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-background overflow-hidden shadow-sm">
                        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-border-dark flex items-center gap-3 cursor-pointer">
                            <ChevronDown className="size-4 text-slate-400" />
                            <div className="size-8 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                                <Database className="size-4" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">aws_elasticache_cluster.redis_main</h3>
                                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 px-1.5 py-0.5 rounded font-bold border border-emerald-200 dark:border-emerald-900/50">create</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 font-mono text-xs overflow-x-auto bg-[#0d1117] text-slate-300">
                            <div className="space-y-1">
                                <div className="flex gap-4">
                                    <span className="text-slate-600 select-none">1</span>
                                    <span>resource "aws_elasticache_cluster" "redis_main" {'{'}</span>
                                </div>
                                <div className="flex gap-4 bg-emerald-500/10">
                                    <span className="text-slate-600 select-none">2</span>
                                    <span className="text-emerald-400">+   cluster_id           = "production-redis"</span>
                                </div>
                                <div className="flex gap-4 bg-emerald-500/10">
                                    <span className="text-slate-600 select-none">3</span>
                                    <span className="text-emerald-400">+   engine               = "redis"</span>
                                </div>
                                <div className="flex gap-4 bg-emerald-500/10">
                                    <span className="text-slate-600 select-none">4</span>
                                    <span className="text-emerald-400">+   node_type            = "cache.t3.medium"</span>
                                </div>
                                <div className="flex gap-4 bg-emerald-500/10">
                                    <span className="text-slate-600 select-none">5</span>
                                    <span className="text-emerald-400">+   num_cache_nodes      = 1</span>
                                </div>
                                <div className="flex gap-4 bg-emerald-500/10">
                                    <span className="text-slate-600 select-none">6</span>
                                    <span className="text-emerald-400">+   parameter_group_name = "default.redis6.x"</span>
                                </div>
                                <div className="flex gap-4 bg-emerald-500/10">
                                    <span className="text-slate-600 select-none">7</span>
                                    <span className="text-emerald-400">+   port                 = 6379</span>
                                </div>
                                <div className="flex gap-4">
                                    <span className="text-slate-600 select-none">8</span>
                                    <span>{'}'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Resource Diff Block: Modify */}
                    <div className="rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-background overflow-hidden shadow-sm">
                        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-border-dark flex items-center gap-3 cursor-pointer">
                            <ChevronDown className="size-4 text-slate-400" />
                            <div className="size-8 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center">
                                <Server className="size-4" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">aws_security_group.app_sg</h3>
                                    <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-600 px-1.5 py-0.5 rounded font-bold border border-amber-200 dark:border-amber-900/50">update</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 font-mono text-xs overflow-x-auto bg-[#0d1117] text-slate-300">
                            <div className="space-y-1">
                                <div className="gap-4 pl-8 text-slate-500 italic">... (unchanged attributes hidden)</div>
                                <div className="flex gap-4">
                                    <span className="text-slate-600 select-none">24</span>
                                    <span>  ingress {'{'}</span>
                                </div>
                                <div className="flex gap-4">
                                    <span className="text-slate-600 select-none">25</span>
                                    <span>    from_port = 80</span>
                                </div>
                                <div className="flex gap-4">
                                    <span className="text-slate-600 select-none">26</span>
                                    <span>    to_port   = 80</span>
                                </div>
                                <div className="flex gap-4 bg-rose-500/10">
                                    <span className="text-slate-600 select-none">27</span>
                                    <span className="text-rose-400">-   cidr_blocks = ["0.0.0.0/0"]</span>
                                </div>
                                <div className="flex gap-4 bg-emerald-500/10">
                                    <span className="text-slate-600 select-none">28</span>
                                    <span className="text-emerald-400">+   cidr_blocks = ["10.0.0.0/16"]</span>
                                </div>
                                <div className="flex gap-4">
                                    <span className="text-slate-600 select-none">29</span>
                                    <span>  {'}'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
