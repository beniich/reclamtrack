'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, ThumbsUp, ThumbsDown, Minus, Star, Download, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

interface NPSData {
    nps: number;
    total: number;
    promoters: number;
    passives: number;
    detractors: number;
    avgRating: number;
    distribution: { rating: number; count: number }[];
}

interface FeedbackItem {
    _id: string;
    rating: number;
    comment: string;
    category: string;
    source: string;
    createdAt: string;
}

export default function NPSAnalyticsPage() {
    const [nps, setNPS] = useState<NPSData | null>(null);
    const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [npsRes, fbRes] = await Promise.all([
                api.get('/api/feedback/nps'),
                api.get('/api/feedback'),
            ]);
            setNPS(npsRes.data);
            setFeedbacks(fbRes.data.data || []);
        } catch (err) {
            toast.error('Failed to load NPS data');
        } finally {
            setLoading(false);
        }
    };

    const getNPSColor = (score: number) => {
        if (score >= 50) return 'text-green-500';
        if (score >= 0)  return 'text-yellow-500';
        return 'text-red-500';
    };

    const getNPSLabel = (score: number) => {
        if (score >= 70) return 'Excellent';
        if (score >= 50) return 'Great';
        if (score >= 30) return 'Good';
        if (score >= 0)  return 'Needs Improvement';
        return 'Critical';
    };

    const handleExport = async () => {
        try {
            const res = await api.get('/api/reports/complaints', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `report_${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Report downloaded!');
        } catch (err) {
            toast.error('Export failed. Admin access required.');
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen text-slate-400">Loading analytics...</div>;
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Satisfaction & NPS</h1>
                    <p className="text-slate-500 mt-1">Net Promoter Score and customer feedback analytics</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={loadData}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
                    <Button className="bg-primary hover:brightness-110" onClick={handleExport}><Download className="h-4 w-4 mr-2" />Export Excel</Button>
                </div>
            </div>

            {/* NPS Score Hero */}
            {nps && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Main NPS Card */}
                    <Card className="md:col-span-1 bg-gradient-to-br from-slate-900 to-slate-700 text-white border-0">
                        <CardContent className="p-6 text-center">
                            <p className="text-slate-400 text-sm font-semibold uppercase tracking-widest mb-2">NPS Score</p>
                            <p className={`text-7xl font-black ${getNPSColor(nps.nps)}`}>{nps.nps}</p>
                            <p className="text-slate-300 text-sm mt-2 font-medium">{getNPSLabel(nps.nps)}</p>
                            <div className="mt-4 text-xs text-slate-400">{nps.total} responses</div>
                        </CardContent>
                    </Card>

                    {/* Breakdown */}
                    <Card>
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-full">
                                <ThumbsUp className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-green-600">{nps.promoters}</p>
                                <p className="text-sm text-slate-500">Promoters (5★)</p>
                                <p className="text-xs text-slate-400">{nps.total > 0 ? Math.round((nps.promoters / nps.total) * 100) : 0}% of responses</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 bg-yellow-100 rounded-full">
                                <Minus className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-yellow-600">{nps.passives}</p>
                                <p className="text-sm text-slate-500">Passives (3-4★)</p>
                                <p className="text-xs text-slate-400">{nps.total > 0 ? Math.round((nps.passives / nps.total) * 100) : 0}% of responses</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-3 bg-red-100 rounded-full">
                                <ThumbsDown className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-red-600">{nps.detractors}</p>
                                <p className="text-sm text-slate-500">Detractors (1-2★)</p>
                                <p className="text-xs text-slate-400">{nps.total > 0 ? Math.round((nps.detractors / nps.total) * 100) : 0}% of responses</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Rating Distribution */}
            {nps && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Star className="h-5 w-5 text-yellow-500" /> Rating Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {[5, 4, 3, 2, 1].map((r) => {
                                const d = nps.distribution.find(x => x.rating === r);
                                const count = d?.count || 0;
                                const pct = nps.total > 0 ? Math.round((count / nps.total) * 100) : 0;
                                return (
                                    <div key={r} className="flex items-center gap-3">
                                        <div className="flex items-center gap-1 w-16 shrink-0">
                                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                                            <span className="text-sm font-medium text-slate-600">{r}</span>
                                        </div>
                                        <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${r >= 4 ? 'bg-green-500' : r === 3 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                        <span className="text-sm text-slate-500 w-16 text-right">{count} ({pct}%)</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-4 pt-4 border-t flex items-center gap-2">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-semibold text-slate-700">Average: {nps.avgRating}/5</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Recent Feedbacks */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Recent Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                    {feedbacks.length === 0 ? (
                        <p className="text-center text-slate-400 py-8">No feedback yet. <a href="/feedback" className="text-primary hover:underline">Collect feedback →</a></p>
                    ) : (
                        <div className="space-y-4">
                            {feedbacks.slice(0, 10).map((fb) => (
                                <div key={fb._id} className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                    <div className="flex items-center">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star key={i} className={`h-4 w-4 ${i < fb.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
                                        ))}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-700 dark:text-slate-300 font-medium truncate">{fb.comment}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs text-slate-400 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">{fb.category}</span>
                                            <span className="text-xs text-slate-400">{new Date(fb.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
