'use client';

// Components
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Download, Star, TrendingDown } from 'lucide-react';

// Mock Data
const mockReviews = [
    {
        id: 1,
        user: 'Eleanor Rigby',
        district: 'District 4',
        time: '2 hours ago',
        rating: 4,
        comment: 'The new park lighting on Main Street is fantastic. I feel much safer walking home at night now. Thank you for addressing our concerns!',
        tags: ['Public Safety', 'Infrastructure'],
        avatar: 'https://ui-avatars.com/api/?name=Eleanor+Rigby&background=0ea5e9&color=fff'
    },
    {
        id: 2,
        user: 'John Harrison',
        district: 'District 2',
        time: '5 hours ago',
        rating: 2,
        comment: 'Waste collection has been delayed twice this week in our neighborhood. The smell is becoming an issue. Please update on the schedule.',
        tags: ['Waste Mgmt', 'Escalated'],
        avatar: 'https://ui-avatars.com/api/?name=John+Harrison&background=f43f5e&color=fff'
    },
    {
        id: 3,
        user: 'Sarah Connor',
        district: 'District 1',
        time: '1 day ago',
        rating: 5,
        comment: 'Super fast response to the water leak report. Technician arrived within 30 minutes!',
        tags: ['Response Time', 'Water'],
        avatar: 'https://ui-avatars.com/api/?name=Sarah+Connor&background=10b981&color=fff'
    }
];

export default function SatisfactionDashboard() {
    return (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white dark:bg-background border-b border-slate-200 dark:border-border-dark px-6 py-3">
                <div className="max-w-[1600px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/dashboard" className="flex items-center gap-3">
                            <div className="bg-primary p-2 rounded-lg">
                                <span className="material-symbols-outlined text-white">sentiment_satisfied</span>
                            </div>
                            <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Citizen Satisfaction</h1>
                        </Link>
                        <nav className="hidden lg:flex items-center gap-6">
                            <Link href="/reports" className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">General Reports</Link>
                            <Link href="/analytics/satisfaction" className="text-sm font-bold text-primary border-b-2 border-primary py-4">Satisfaction</Link>
                            <Link href="/analytics/heatmap" className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">Heatmap</Link>
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <button type="button" className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                            <Download className="text-sm" /> Export Reports
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-[1600px] mx-auto w-full px-6 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Satisfaction Dashboard</h2>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live
                            </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Real-time sentiment analysis and intervention feedback across all city zones.</p>
                    </div>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-background p-6 rounded-xl border border-slate-200 dark:border-border-dark shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Average CSAT Score</p>
                            <span className="text-emerald-500 text-xs font-bold bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">+3.2%</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-4xl font-black text-slate-900 dark:text-white">4.2</h3>
                            <span className="text-slate-400 text-lg">/ 5.0</span>
                        </div>
                        <div className="mt-4 flex gap-1">
                            {[1, 2, 3, 4].map(i => <Star key={i} className="text-amber-400 text-xl" />)}
                            <Star className="text-slate-200 dark:text-slate-700 text-xl" />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-background p-6 rounded-xl border border-slate-200 dark:border-border-dark shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Feedback Entries</p>
                            <span className="text-emerald-500 text-xs font-bold bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">+12%</span>
                        </div>
                        <h3 className="text-4xl font-black text-slate-900 dark:text-white">1,240</h3>
                        <p className="text-xs text-slate-400 mt-2">from 842 unique citizens</p>
                    </div>
                    <div className="bg-white dark:bg-background p-6 rounded-xl border border-slate-200 dark:border-border-dark shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Resolution Rate</p>
                            <span className="text-rose-500 text-xs font-bold bg-rose-50 dark:bg-rose-900/20 px-2 py-0.5 rounded-full">-0.5%</span>
                        </div>
                        <h3 className="text-4xl font-black text-slate-900 dark:text-white">88%</h3>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
                            <div className="bg-primary h-full rounded-full" style={{ width: '88%' }}></div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Data Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Chart Section */}
                        <section className="bg-white dark:bg-background p-6 rounded-xl border border-slate-200 dark:border-border-dark shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="font-bold text-lg text-slate-900 dark:text-white">Satisfaction Trends</h4>
                                <div className="flex gap-2">
                                    <Button variant="secondary" className="px-3 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 font-medium text-slate-600 dark:text-slate-300">Weekly</Button>
                                    <Button variant="primary" className="px-3 py-1 text-xs rounded-lg bg-primary text-white font-medium">Monthly</Button>
                                </div>
                            </div>
                            <div className="h-64 relative w-full">
                                {/* Simulated Chart SVG */}
                                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 240">
                                    <defs>
                                        <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                                            <stop offset="0%" stopColor="#2424eb" stopOpacity="0.2"></stop>
                                            <stop offset="100%" stopColor="#2424eb" stopOpacity="0"></stop>
                                        </linearGradient>
                                    </defs>
                                    <path d="M0,180 C50,160 100,190 150,140 C200,90 250,110 300,70 C350,30 400,60 450,50 C500,40 550,90 600,60 C650,30 700,50 800,20 L800,240 L0,240 Z" fill="url(#chartGradient)"></path>
                                    <path d="M0,180 C50,160 100,190 150,140 C200,90 250,110 300,70 C350,30 400,60 450,50 C500,40 550,90 600,60 C650,30 700,50 800,20" fill="none" stroke="#2424eb" strokeLinecap="round" strokeWidth="3"></path>
                                </svg>
                                <div className="absolute bottom-0 w-full flex justify-between text-[10px] text-slate-400 font-bold px-2 pt-2 border-t border-slate-100 dark:border-border-dark">
                                    <span>JAN</span><span>FEB</span><span>MAR</span><span>APR</span><span>MAY</span><span>JUN</span><span>JUL</span><span>AUG</span>
                                </div>
                            </div>
                        </section>

                        {/* Recent Feedback */}
                        <section className="bg-white dark:bg-background p-6 rounded-xl border border-slate-200 dark:border-border-dark shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="font-bold text-lg text-slate-900 dark:text-white">Recent Citizen Feedback</h4>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500">Filter:</span>
                                    <select className="text-xs border-slate-200 dark:border-border-dark bg-transparent rounded-lg py-1 px-2 focus:ring-primary text-slate-600 dark:text-slate-300">
                                        <option>All Ratings</option>
                                        <option>Negative (1-2 Stars)</option>
                                        <option>Positive (4-5 Stars)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-6">
                                {mockReviews.map(review => (
                                    <div key={review.id} className="flex gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-transparent hover:border-primary/30 dark:hover:border-primary/40 transition-all">
                                        <div className="size-10 rounded-full overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 relative">
                                            <Image src={review.avatar} alt="Avatar" fill className="object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <div>
                                                    <h5 className="text-sm font-bold text-slate-900 dark:text-white">{review.user}</h5>
                                                    <p className="text-[10px] text-slate-500">{review.time} • <span className="font-semibold text-primary">{review.district}</span></p>
                                                </div>
                                                <div className="flex text-amber-400">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <span key={star} className={`material-symbols-outlined text-sm ${star <= review.rating ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3 leading-relaxed">{review.comment}</p>
                                            <div className="flex gap-2">
                                                {review.tags.map(tag => (
                                                    <span key={tag} className={`px-2 py-1 rounded text-[10px] font-bold ${tag === 'Escalated' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button variant="primary" className="w-full mt-6 py-2 text-sm font-semibold text-primary hover:bg-primary/5 rounded-lg border border-primary/20 transition-colors">View All 1,240 Reviews</Button>
                        </section>
                    </div>

                    {/* Right Column / Sidebar Metrics */}
                    <div className="space-y-8">
                        {/* Top Performing */}
                        <section className="bg-white dark:bg-background p-6 rounded-xl border border-slate-200 dark:border-border-dark shadow-sm">
                            <h4 className="font-bold text-base mb-4 text-slate-900 dark:text-white">Top Departments</h4>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-bold text-slate-400">01</span>
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Parks & Recreation</p>
                                        </div>
                                        <span className="text-emerald-500 font-bold text-sm">4.8</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                                        <div className="bg-emerald-500 h-full" style={{ width: '96%' }}></div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-bold text-slate-400">02</span>
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Public Library</p>
                                        </div>
                                        <span className="text-emerald-500 font-bold text-sm">4.6</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                                        <div className="bg-emerald-500 h-full" style={{ width: '92%' }}></div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-bold text-slate-400">03</span>
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">City Planning</p>
                                        </div>
                                        <span className="text-amber-500 font-bold text-sm">3.9</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                                        <div className="bg-amber-500 h-full" style={{ width: '78%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Common Keywords */}
                        <section className="bg-white dark:bg-background p-6 rounded-xl border border-slate-200 dark:border-border-dark shadow-sm">
                            <h4 className="font-bold text-base mb-4 text-slate-900 dark:text-white">Sentiment Keywords</h4>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold">Safety (+14%)</span>
                                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-xs font-bold">Potholes</span>
                                <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold">Parks (+8%)</span>
                                <span className="px-3 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full text-xs font-bold">Traffic (-5%)</span>
                                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-xs font-bold">Collection</span>
                            </div>
                        </section>

                        {/* Intervention Status */}
                        <section className="bg-primary p-6 rounded-xl text-white shadow-lg shadow-primary/20 relative overflow-hidden">
                            <div className="relative z-10">
                                <h4 className="font-bold text-base mb-2">Resolution Efficiency</h4>
                                <p className="text-xs text-white/80 mb-6">You have resolved 12 more complaints this week than last.</p>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <p className="text-2xl font-black">2.4 days</p>
                                        <p className="text-[10px] uppercase font-bold text-white/60">Avg. Response Time</p>
                                    </div>
                                    <div className="size-12 rounded-full border-4 border-white/20 flex items-center justify-center">
                                        <TrendingDown />
                                    </div>
                                </div>
                            </div>
                            {/* Abstract Background Decoration */}
                            <div className="absolute -right-4 -bottom-4 size-32 bg-white/10 rounded-full blur-2xl"></div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}

