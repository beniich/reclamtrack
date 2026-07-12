'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Search, Phone, ChevronRight, Download, Plus, MoreVertical, History, Timer, AlertTriangle, BookOpen } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

// Types
type SOPStatus = 'ACTIVE' | 'DRAFT' | 'REVIEW' | 'ARCHIVED';
type SOPPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

interface SOP {
    _id: string;
    id?: string;
    title: string;
    description?: string;
    content: string;
    category: string;
    status?: SOPStatus;
    priority?: SOPPriority;
    version: string;
    tags: string[];
    views: number;
    author: string;
    createdAt: string;
}

export default function KnowledgeBasePage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sops, setSOPs] = useState<SOP[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadSOPs(); }, [selectedCategory]);

    const loadSOPs = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (selectedCategory !== 'All') params.category = selectedCategory;
            const res = await api.get('/api/knowledge/sops', { params });
            setSOPs(res.data.data || []);
        } catch (err) {
            console.error('Failed to load SOPs', err);
        } finally {
            setLoading(false);
        }
    };

    // Client-side filter by search query on top of category filter
    const filteredSOPs = useMemo(() => {
        if (!searchQuery) return sops;
        return sops.filter(sop =>
            sop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (sop.content || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (sop.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [searchQuery, sops]);

    const categories = ['All', ...Array.from(new Set(sops.map(sop => sop.category)))];

    const getPriorityBadge = (tags: string[] = []) => {
        if (tags.includes('urgent') || tags.includes('critical')) return <div className="px-2 py-1 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-[10px] font-black uppercase rounded tracking-wider">Critical</div>;
        if (tags.includes('high') || tags.includes('important')) return <div className="px-2 py-1 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase rounded tracking-wider">High Priority</div>;
        return <div className="px-2 py-1 bg-blue-100 dark:bg-primary/20 text-primary dark:text-blue-400 text-[10px] font-black uppercase rounded tracking-wider">Standard</div>;
    };

    return (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
            {/* Header */}
            <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 dark:border-border-dark bg-white dark:bg-background px-6 py-3">
                <div className="flex items-center gap-8">
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <div className="p-2 bg-primary rounded-lg text-white">
                            <span className="material-symbols-outlined text-2xl">account_tree</span>
                        </div>
                        <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">OpsCenter <span className="text-primary font-medium">KB</span></h2>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6">
                        <Link href="/dashboard" className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Dashboard</Link>
                        <Link href="/knowledge" className="text-sm font-semibold text-primary">SOP Library</Link>
                        <Link href="/complaints/list" className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Interventions</Link>
                        <Link href="/reports" className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Analytics</Link>
                    </nav>
                </div>
                <div className="flex items-center gap-4 flex-1 max-w-md mx-8">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                        <input
                            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-400"
                            placeholder="Search procedures, codes, or keywords..."
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1"></div>
                    <div className="size-9 rounded-full bg-slate-200 overflow-hidden border border-slate-300 dark:border-slate-700">
                        <img className="w-full h-full object-cover" src="https://ui-avatars.com/api/?name=John+Operator&background=2424eb&color=fff" alt="Profile" />
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar */}
                <aside className="w-64 border-r border-slate-200 dark:border-border-dark bg-white dark:bg-background hidden lg:flex flex-col p-4 shrink-0">
                    <div className="mb-6">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Main Categories</p>
                        <div className="space-y-1">
                            {categories.map(category => (
                                <button type="button"
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${selectedCategory === category
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-primary/5 dark:hover:bg-violet-500/15'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-lg">
                                        {category === 'All' ? 'description' :
                                            category === 'Maintenance' ? 'build' :
                                                category === 'Emergency Response' ? 'warning' :
                                                    category === 'Compliance' ? 'shield' : 'folder'}
                                    </span>
                                    {category === 'All' ? 'All Protocols' : category}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-border-dark">
                        <p className="text-xs font-bold mb-2 text-slate-700 dark:text-slate-300">Need Live Support?</p>
                        <p className="text-[11px] text-slate-500 mb-3">Direct line to Central Dispatch for urgent clarifications.</p>
                        <button type="button" className="w-full py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-primary/5 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300">
                            <Phone className="text-sm" />
                            Call Supervisor
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-background-dark/50 overflow-y-auto">
                    {/* Breadcrumbs & Header */}
                    <div className="px-8 pt-6">
                        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-4">
                            <Link href="/knowledge" className="hover:text-primary transition-colors">Knowledge Base</Link>
                            <ChevronRight className="text-[10px]" />
                            <span className="text-slate-900 dark:text-slate-200">{selectedCategory}</span>
                        </nav>
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-border-dark pb-6">
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Standard Operating Procedures</h1>
                                <p className="text-slate-500 mt-1 max-w-2xl font-medium">Technical guides and step-by-step intervention protocols for field operators and customer service desk.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button type="button" className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-bold bg-white dark:bg-background hover:bg-primary/5 dark:hover:bg-violet-500/15 text-slate-700 dark:text-slate-300 transition-colors">
                                    <Download className="text-lg" />
                                    Export All
                                </button>
                                <Link href="/knowledge/create">
                                    <button type="button" className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:brightness-110 transition-all">
                                        <Plus className="text-lg" />
                                        Create SOP
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Filters & Controls */}
                    <div className="px-8 py-4 flex flex-wrap items-center gap-3 sticky top-0 z-40">
                        <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                            Showing <strong>{filteredSOPs.length}</strong> protocols
                        </div>
                    </div>

                    <div className="px-8 pb-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {loading ? (
                            <div className="col-span-3 text-center py-16 text-slate-400">Loading protocols...</div>
                        ) : filteredSOPs.length === 0 ? (
                            <div className="col-span-3 text-center py-16">
                                <BookOpen className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                                <p className="font-bold text-slate-600">No protocols found</p>
                                <p className="text-sm text-slate-400 mt-1">Create your first SOP to get started.</p>
                            </div>
                        ) : filteredSOPs.map(sop => (
                            <div key={sop._id || sop.id} className="group bg-white dark:bg-background border-2 border-transparent hover:border-primary/50 rounded-xl p-5 shadow-sm transition-all flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    {getPriorityBadge(sop.tags)}
                                    <MoreVertical className="text-slate-400 group-hover:text-primary cursor-pointer" />
                                </div>
                                <h3 className="text-lg font-bold leading-tight mb-2 group-hover:text-primary transition-colors text-slate-900 dark:text-white">{sop.title}</h3>
                                <p className="text-sm text-slate-500 line-clamp-2 mb-6">{sop.content?.replace(/<[^>]+>/g, '').substring(0, 100)}...</p>
                                <div className="mt-auto space-y-4">
                                    <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                                        <span className="flex items-center gap-1.5"><History className="text-sm" /> v{sop.version}</span>
                                        <span className="flex items-center gap-1.5">{sop.views} views</span>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-border-dark">
                                        <div className="flex gap-1 flex-wrap">
                                            {(sop.tags || []).slice(0,2).map((tag, i) => (
                                                <span key={i} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">{tag}</span>
                                            ))}
                                        </div>
                                        <button type="button" className="text-primary text-xs font-bold hover:underline">View Protocol</button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Add New Card Placeholder */}
                        <Link href="/knowledge/create" className="block">
                            <div className="border-2 border-dashed border-slate-300 dark:border-border-dark hover:border-primary/50 hover:bg-primary/5 transition-all rounded-xl p-6 flex flex-col items-center justify-center text-center group cursor-pointer h-full min-h-[250px]">
                                <div className="size-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                                    <Plus className="text-2xl text-slate-500 group-hover:text-white" />
                                </div>
                                <p className="font-bold text-slate-700 dark:text-slate-300">Draft New SOP</p>
                                <p className="text-xs text-slate-500 mt-1">Start from scratch with the WYSIWYG editor.</p>
                            </div>
                        </Link>
                    </div>
                </main>

                {/* Right Sidebar (Contextual) */}
                <aside className="w-80 border-l border-slate-200 dark:border-border-dark bg-white dark:bg-background hidden xl:flex flex-col shrink-0">
                    <div className="p-6">
                        <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">Recently Viewed</h4>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="size-10 shrink-0 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                                    <span className="material-symbols-outlined">gas_meter</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold leading-tight text-slate-900 dark:text-white">Gas Meter Calibration</p>
                                    <p className="text-[11px] text-slate-500 mt-1">Viewed 12m ago • By You</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="size-10 shrink-0 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-lg flex items-center justify-center">
                                    <AlertTriangle />
                                </div>
                                <div>
                                    <p className="text-sm font-bold leading-tight text-slate-900 dark:text-white">Spill Response Kit Log</p>
                                    <p className="text-[11px] text-slate-500 mt-1">Viewed 4h ago • By Admin</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 border-t border-slate-200 dark:border-border-dark">
                        <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Quick Stats</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <p className="text-[10px] font-bold text-slate-500 uppercase leading-none mb-1">Total SOPs</p>
                                <p className="text-xl font-black text-slate-900 dark:text-white">124</p>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <p className="text-[10px] font-bold text-slate-500 uppercase leading-none mb-1">Archived</p>
                                <p className="text-xl font-black text-slate-900 dark:text-white">18</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-auto p-6 border-t border-slate-200 dark:border-border-dark">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold text-slate-500">System Status</span>
                            <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase">
                                <span className="size-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                Healthy
                            </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full w-[94%] bg-primary rounded-full"></div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 font-medium">Last synced: 3 minutes ago</p>
                    </div>
                </aside>
            </div>
        </div>
    );
}

