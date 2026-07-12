'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GitBranch, GitCommit, GitMerge, RefreshCw, Cpu, HardDrive, Server, Activity, Terminal, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import api from '@/lib/api';

interface SystemMetrics {
    cpu: number;
    memory: { total: number; free: number; used: number; usagePct: number };
    uptime: { os: number; process: number };
    node: string;
    platform: string;
    arch: string;
    cpuCount: number;
    loadAvg: number[];
}

interface ServiceHealth {
    id: string;
    name: string;
    status: 'operational' | 'degraded' | 'down';
    uptime: number;
    latency: number;
    type: string;
}

interface LogEntry {
    level: string;
    source: string;
    message: string;
    timestamp: string;
}

export default function DevOpsPage() {
    const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
    const [services, setServices] = useState<ServiceHealth[]>([]);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [logFilter, setLogFilter] = useState('all');

    const loadAll = useCallback(async () => {
        setLoading(true);
        try {
            const [metricsRes, healthRes, logsRes] = await Promise.allSettled([
                api.get('/api/devops/metrics'),
                api.get('/api/devops/services/health'),
                api.get('/api/devops/logs?limit=50'),
            ]);
            if (metricsRes.status === 'fulfilled') setMetrics(metricsRes.value.data.data);
            if (healthRes.status === 'fulfilled')  setServices(healthRes.value.data.data?.services || []);
            if (logsRes.status === 'fulfilled')    setLogs(logsRes.value.data.data || []);
        } catch (err) {
            console.error('DevOps load error', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadAll(); }, [loadAll]);

    const formatUptime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
    };

    const statusIcon = (s: string) => {
        if (s === 'operational') return <CheckCircle2 className="h-4 w-4 text-green-500" />;
        if (s === 'degraded')    return <AlertCircle className="h-4 w-4 text-yellow-500" />;
        return <XCircle className="h-4 w-4 text-red-500" />;
    };

    const logLevelColor = (level: string) => {
        switch (level) {
            case 'ERROR': return 'text-red-400';
            case 'WARN':  return 'text-yellow-400';
            case 'INFO':  return 'text-blue-400';
            case 'DEBUG': return 'text-slate-500';
            default:      return 'text-slate-300';
        }
    };

    const filteredLogs = logFilter === 'all' ? logs : logs.filter(l => l.level === logFilter);

    return (
        <div className="p-6 space-y-6 bg-slate-50 dark:bg-background-dark min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-border-dark">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">DevOps Panel</h1>
                    <p className="text-slate-500 mt-1">Real-time system health, metrics, and application logs</p>
                </div>
                <Button onClick={loadAll} disabled={loading} variant="outline" className="flex items-center gap-2">
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* System Metrics */}
            {metrics && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* CPU */}
                    <Card>
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Cpu className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">CPU Load</span>
                                </div>
                                <span className={`text-sm font-bold ${metrics.cpu > 70 ? 'text-red-500' : metrics.cpu > 40 ? 'text-yellow-500' : 'text-green-500'}`}>{metrics.cpu}%</span>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full transition-all ${metrics.cpu > 70 ? 'bg-red-500' : metrics.cpu > 40 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${metrics.cpu}%` }} />
                            </div>
                            <p className="text-xs text-slate-400 mt-2">{metrics.cpuCount} cores · {metrics.arch}</p>
                        </CardContent>
                    </Card>

                    {/* RAM */}
                    <Card>
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <HardDrive className="h-4 w-4 text-purple-500" />
                                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Memory</span>
                                </div>
                                <span className={`text-sm font-bold ${metrics.memory.usagePct > 80 ? 'text-red-500' : 'text-purple-500'}`}>{metrics.memory.usagePct}%</span>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${metrics.memory.usagePct}%` }} />
                            </div>
                            <p className="text-xs text-slate-400 mt-2">{metrics.memory.used} / {metrics.memory.total} MB</p>
                        </CardContent>
                    </Card>

                    {/* Uptime */}
                    <Card>
                        <CardContent className="p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <Activity className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Uptime</span>
                            </div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatUptime(metrics.uptime.process)}</p>
                            <p className="text-xs text-slate-400 mt-2">Process · OS: {formatUptime(metrics.uptime.os)}</p>
                        </CardContent>
                    </Card>

                    {/* Node */}
                    <Card>
                        <CardContent className="p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <Server className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Runtime</span>
                            </div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{metrics.node}</p>
                            <p className="text-xs text-slate-400 mt-2">Node.js · {metrics.platform}</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Services Health */}
            {services.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-primary" /> Services Health
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {services.map((svc) => (
                                <div key={svc.id} className="flex items-center justify-between py-3">
                                    <div className="flex items-center gap-3">
                                        {statusIcon(svc.status)}
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{svc.name}</p>
                                            <p className="text-xs text-slate-400 capitalize">{svc.type}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{svc.latency}ms</p>
                                        <p className="text-xs text-slate-400">{svc.uptime}% uptime</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Application Logs */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Terminal className="h-5 w-5 text-slate-500" /> Application Logs
                        </CardTitle>
                        <div className="flex gap-1">
                            {['all', 'INFO', 'WARN', 'ERROR', 'DEBUG'].map(l => (
                                <button
                                    key={l}
                                    type="button"
                                    onClick={() => setLogFilter(l)}
                                    className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-colors ${logFilter === l ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'}`}
                                >
                                    {l}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs overflow-auto max-h-96 space-y-1">
                        {loading ? (
                            <p className="text-slate-500 animate-pulse">Loading logs...</p>
                        ) : filteredLogs.length === 0 ? (
                            <p className="text-slate-500">No logs found for filter: {logFilter}</p>
                        ) : filteredLogs.map((log, i) => (
                            <div key={i} className="flex gap-3">
                                <span className="text-slate-600 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                <span className={`font-bold w-12 shrink-0 ${logLevelColor(log.level)}`}>{log.level}</span>
                                <span className="text-slate-400 w-28 shrink-0 truncate">{log.source}</span>
                                <span className="text-slate-300">{log.message}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
