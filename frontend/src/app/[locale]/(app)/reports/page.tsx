'use client';

import { usePerformanceStats, useSatisfactionStats } from '@/hooks/useAnalytics';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { generateKPIPDF } from '@/lib/pdfReport';
import { Complaint } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { saveAs } from 'file-saver';
import Link from 'next/link';
import { useState } from 'react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { BarChart, Plus, ThumbsUp, CheckCircle, Star, RefreshCw } from 'lucide-react';

// Types
type ReportFormat = 'PDF' | 'EXCEL' | 'CSV';
type ReportFrequency = 'MONTHLY' | 'ANNUAL' | 'CUSTOM';
type ReportStatus = 'ARCHIVED' | 'COLD_STORAGE' | 'COMPRESSED' | 'PROCESSING';

interface Report {
    id: string;
    name: string;
    description: string;
    date: string;
    format: ReportFormat;
    size: string;
    status: ReportStatus;
    icon: string;
    color: string;
}

// Mock Data
const mockReports: Report[] = [
    { id: '1', name: 'Annual_Summary_FY2023.pdf', description: 'Full year comprehensive', date: 'Oct 28, 2023', format: 'PDF', size: '4.2 MB', status: 'ARCHIVED', icon: 'picture_as_pdf', color: 'text-red-500' },
    { id: '2', name: 'Complaints_Data_Sept_2023.xlsx', description: 'Monthly raw data export', date: 'Oct 02, 2023', format: 'EXCEL', size: '1.8 MB', status: 'COLD_STORAGE', icon: 'table_view', color: 'text-emerald-500' },
    { id: '3', name: 'Intervention_Logs_Archive.csv', description: 'Historical archive backup', date: 'Aug 15, 2023', format: 'CSV', size: '28.4 MB', status: 'COMPRESSED', icon: 'csv', color: 'text-amber-500' },
    { id: '4', name: 'CSAT_Quarterly_Q3.pdf', description: 'In queue for generation', date: 'Processing...', format: 'PDF', size: '--', status: 'PROCESSING', icon: 'pending_actions', color: 'text-primary' }
];

export default function ReportsPage() {
    // State
    const [frequency, setFrequency] = useState<ReportFrequency>('MONTHLY');
    const [selectedFormat, setSelectedFormat] = useState<ReportFormat>('PDF');
    const [isGenerating, setIsGenerating] = useState(false);

    // Analytics Hooks
    const { data: satisfaction, isLoading: isLoadingSat } = useSatisfactionStats();
    const { data: performance, isLoading: isLoadingPerf } = usePerformanceStats();

    // Fetch All Complaints for Export
    const { data: response } = useQuery({
        queryKey: ['complaints', 'all-for-report'],
        queryFn: async () => {
            return await api.get('/complaints');
        }
    });

    const complaints = (response as { data: Complaint[] })?.data || [];

    // Handlers
    const handleGenerate = async () => {
        if (!complaints || complaints.length === 0) {
            toast.error('Aucune donnée à exporter');
            return;
        }

        setIsGenerating(true);

        try {
            if (selectedFormat === 'CSV') {
                exportCSV();
            } else if (selectedFormat === 'EXCEL') {
                exportExcel();
            } else if (selectedFormat === 'PDF') {
                exportPDF();
            }
            toast.success(`Rapport ${selectedFormat} généré`);
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Erreur lors de la génération');
        } finally {
            setIsGenerating(false);
        }
    };

    const exportCSV = () => {
        const headers = ['Numéro', 'Titre', 'Catégorie', 'Priorité', 'Statut', 'Date'];
        const rows = complaints.map((c) => [
            c.number,
            `"${c.title}"`,
            c.category,
            c.priority,
            c.status,
            `"${new Date(c.createdAt).toLocaleDateString()}"`
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `rapport_reclamations_${new Date().toISOString().slice(0, 10)}.csv`);
    };

    const exportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(complaints.map((c) => ({
            Numero: c.number,
            Titre: c.title,
            Categorie: c.category,
            Priorite: c.priority,
            Statut: c.status,
            Date: new Date(c.createdAt).toLocaleDateString()
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Reclamations");
        XLSX.writeFile(workbook, `rapport_reclamations_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    const exportPDF = async () => {
        const kpis = [
            { label: 'Total Complaints', value: complaints.length },
            { label: 'Resolved', value: complaints.filter((c: any) => c.status === 'résolue' || c.status === 'fermée').length },
            { label: 'Avg Rating', value: satisfaction?.averageRating || 'N/A', unit: '/5' },
            { label: 'SLA Compliance', value: performance?.slaCompliance || 'N/A', unit: '%' },
            { label: 'Open Tickets', value: complaints.filter((c: any) => c.status === 'ouverte' || c.status === 'en cours').length },
            { label: 'Report Period', value: frequency },
        ];

        const tableRows = complaints.map((c: any) => [
            c.number || '',
            (c.title || '').substring(0, 40),
            c.category || '',
            c.priority || '',
            c.status || '',
            new Date(c.createdAt).toLocaleDateString()
        ]);

        await generateKPIPDF({
            title: 'Complaints & KPI Report',
            period: `${frequency} - ${new Date().toLocaleDateString()}`,
            kpis,
            tableHeaders: ['Number', 'Title', 'Category', 'Priority', 'Status', 'Date'],
            tableRows,
        });
    };

    const getStatusBadge = (status: ReportStatus) => {
        switch (status) {
            case 'ARCHIVED': return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">ARCHIVED</span>;
            case 'COLD_STORAGE': return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 uppercase">COLD STORAGE</span>;
            case 'COMPRESSED': return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">COMPRESSED</span>;
            case 'PROCESSING': return <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-primary w-2/3 animate-[loading_1s_ease-in-out_infinite]"></div></div>;
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background-light text-slate-900 font-display">
            {/* Header */}
            <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 lg:px-10 sticky top-0 z-50">
                <div className="flex items-center gap-8">
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <div className="bg-primary text-white p-1.5 rounded-lg flex items-center justify-center">
                            <BarChart className="text-xl" />
                        </div>
                        <h2 className="text-lg font-bold leading-tight tracking-tight">ReclamTrack Portal</h2>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6">
                        <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors text-slate-500">Dashboard</Link>
                        <Link href="/complaints/list" className="text-sm font-medium hover:text-primary transition-colors text-slate-500">Complaints</Link>
                        <Link href="/reports" className="text-primary text-sm font-bold border-b-2 border-primary pb-1">Reporting</Link>
                        <Link href="/settings" className="text-sm font-medium hover:text-primary transition-colors text-slate-500">Settings</Link>
                    </nav>
                </div>
            </header>

            <main className="flex-1 px-6 py-8 max-w-[1400px] mx-auto w-full">
                {/* Title Section */}
                <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                            <span className="material-symbols-outlined text-[18px]">history_edu</span>
                            <span>Reporting Engine V10.0</span>
                        </div>
                        <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900">Analytics & Reports</h1>
                        <p className="text-slate-500 text-lg max-w-2xl">Real-time performance metrics and automated report generation.</p>
                    </div>
                    <div className="flex gap-3">
                        <button type="button" className="flex items-center gap-2 rounded-lg h-11 px-6 bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:brightness-110 transition-all">
                            <Plus className="text-[20px]" />
                            New Report Job
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Stats & Config */}
                    <div className="lg:col-span-12 flex flex-col gap-6">
                        {/* Real Analytics Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center gap-4 shadow-sm">
                                <div className="size-14 rounded-full bg-blue-100 text-primary flex items-center justify-center">
                                    <ThumbsUp className="text-2xl" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Satisfaction Rate</p>
                                    <p className="text-3xl font-black text-slate-900">
                                        {isLoadingSat ? '...' : `${satisfaction?.satisfactionRate}%`}
                                    </p>
                                    <p className="text-xs text-slate-400">Based on {satisfaction?.totalResponses} reviews</p>
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center gap-4 shadow-sm">
                                <div className="size-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                    <CheckCircle className="text-2xl" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completion Rate</p>
                                    <p className="text-3xl font-black text-slate-900">
                                        {isLoadingPerf ? '...' : `${performance?.completionRate}%`}
                                    </p>
                                    <p className="text-xs text-slate-400">Total tickets resolved</p>
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center gap-4 shadow-sm">
                                <div className="size-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                                    <Star className="text-2xl" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Rating</p>
                                    <p className="text-3xl font-black text-slate-900">
                                        {isLoadingSat ? '...' : satisfaction?.averageRating}
                                        <span className="text-sm text-slate-400 font-medium">/5.0</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Configuration Panel (Mocked functionality) */}
                            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                                <h2 className="text-slate-900 text-xl font-bold mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">settings_input_component</span>
                                    Report Generator
                                </h2>
                                <div className="flex flex-col gap-5">
                                    {/* Report Frequency */}
                                    <div>
                                        <label className="text-sm font-semibold text-slate-700 mb-2 block">Report Frequency</label>
                                        <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-lg">
                                            {(['MONTHLY', 'ANNUAL', 'CUSTOM'] as const).map(f => (
                                                <button type="button"
                                                    key={f}
                                                    onClick={() => setFrequency(f)}
                                                    className={cn(
                                                        "py-2 text-xs font-bold rounded-md transition-all",
                                                        frequency === f ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
                                                    )}
                                                >
                                                    {f}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Export Format */}
                                    <div>
                                        <label className="text-sm font-semibold text-slate-700 mb-2 block">Export Format</label>
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => setSelectedFormat('PDF')} className={cn("flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all", selectedFormat === 'PDF' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 hover:border-primary/30 text-slate-500')}>
                                                <span className="material-symbols-outlined text-[24px]">picture_as_pdf</span>
                                                <span className="text-[10px] font-black uppercase">PDF</span>
                                            </button>
                                            <button type="button" onClick={() => setSelectedFormat('EXCEL')} className={cn("flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all", selectedFormat === 'EXCEL' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 hover:border-primary/30 text-slate-500')}>
                                                <span className="material-symbols-outlined text-[24px]">table_view</span>
                                                <span className="text-[10px] font-black uppercase">Excel</span>
                                            </button>
                                            <button type="button" onClick={() => setSelectedFormat('CSV')} className={cn("flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all", selectedFormat === 'CSV' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 hover:border-primary/30 text-slate-500')}>
                                                <span className="material-symbols-outlined text-[24px]">csv</span>
                                                <span className="text-[10px] font-black uppercase">CSV</span>
                                            </button>
                                        </div>
                                    </div>

                                    <button type="button"
                                        onClick={handleGenerate}
                                        disabled={isGenerating}
                                        className="w-full mt-4 bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transform active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                                    >
                                        {isGenerating ? <><RefreshCw className="animate-spin" /> Generating...</> : <><span className="material-symbols-outlined">autostop</span> Generate Report Now</>}
                                    </button>
                                </div>
                            </div>

                            {/* Recent Feedback (Real Data) */}
                            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                                <h2 className="text-slate-900 text-xl font-bold mb-6">Recent Feedback</h2>
                                <div className="space-y-4">
                                    {satisfaction?.recentFeedback?.length ? (
                                        satisfaction.recentFeedback.map((feedback: { id: string; rating: number; date: string; comment: string; category: string }) => (
                                            <div key={feedback.id} className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-1 text-amber-500">
                                                        <span className="font-bold text-lg">{feedback.rating}</span>
                                                        <Star className="text-sm" />
                                                    </div>
                                                    <span className="text-xs text-slate-400">{feedback.date}</span>
                                                </div>
                                                <p className="text-sm text-slate-700 italic">&quot;{feedback.comment}&quot;</p>
                                                <span className="text-xs font-bold text-primary px-2 py-0.5 bg-primary/10 rounded mt-2 inline-block">{feedback.category}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-slate-500 text-center py-4">No feedback data available.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Archive Table (Mocked) */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100">
                                <h2 className="text-slate-900 text-xl font-bold">Historical Archive</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 text-slate-500 text-[11px] font-black uppercase tracking-widest border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4">Report Name</th>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Format</th>
                                            <th className="px-6 py-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {mockReports.map((report) => (
                                            <tr key={report.id} className="hover:bg-primary/5/50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-sm">{report.name}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600">{report.date}</td>
                                                <td className="px-6 py-4 text-xs font-bold text-slate-500">{report.format}</td>
                                                <td className="px-6 py-4">{getStatusBadge(report.status)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
