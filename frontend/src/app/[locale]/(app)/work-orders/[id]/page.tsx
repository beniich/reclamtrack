'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
    ArrowLeft, Wrench, Clock, CheckCircle2, 
    Calendar, Users, FileText, Camera, ShieldCheck, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InterventionTimer } from '@/components/work-orders/InterventionTimer';
export default function WorkOrderDetailsPage() {
    const params = useParams();
    
    // Mock Data for Phase 2 OT Detail
    const wo = {
        id: params?.id || '1',
        number: 'WO-2026-0001',
        title: 'Remplacement Roulement P1',
        type: 'corrective',
        status: 'in_progress',
        priority: 'high',
        asset: 'Pompe Hydraulique Principal (USINE-L1)',
        complaintRef: 'REC-20260414-9201',
        description: 'Le technicien a signalé un bruit anormal sur l\'arbre moteur. Inspection et remplacement du roulement principal requis.',
        scheduledDate: '2026-04-14',
        estimatedHours: 2.5,
        actualHours: 0,
        team: 'Équipe Mécanique B',
        technicians: ['Amine B.', 'Karim S.'],
        checklist: [
            { step: 'Consignation Électrique', done: true },
            { step: 'Démontage Carter', done: true },
            { step: 'Extraction du Roulement US', done: false },
            { step: 'Insertion Nouveau Roulement', done: false },
            { step: 'Test à vide & Validation', done: false }
        ]
    };

    return (
        <div className="p-6 space-y-8 bg-slate-50 dark:bg-background min-h-[calc(100vh-6rem)] relative overflow-hidden">
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-500/10 dark:bg-red-500/10 blur-[100px] rounded-full pointer-events-none"></div>

            {/* Back link & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <Link href="/work-orders" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-600 dark:hover:text-red-500 transition-colors bg-white dark:bg-background border border-slate-200 dark:border-border-dark px-4 py-2 rounded-xl w-fit shadow-sm">
                    <ArrowLeft className="w-4 h-4" /> Retour aux OTs
                </Link>

                <div className="flex gap-3">
                    <button type="button" className="px-5 py-3 rounded-xl bg-white dark:bg-background border border-slate-200 dark:border-border-dark text-[10px] font-black uppercase tracking-widest hover:border-red-300 dark:hover:border-red-500/50 flex items-center gap-2 transition-all shadow-sm">
                        <Download className="w-4 h-4 text-slate-400" /> Export PDF
                    </button>
                    <button type="button" className="px-5 py-3 rounded-xl bg-emerald-600 shadow-emerald-600/20 text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 flex items-center gap-2 transition-all shadow-lg">
                        <ShieldCheck className="w-4 h-4" /> Finaliser l'OT
                    </button>
                </div>
            </div>

            {/* Header Plate */}
            <div className="bg-white dark:bg-background rounded-[2.5rem] border border-slate-200 dark:border-border-dark p-8 shadow-sm relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-[12px] font-mono font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded">
                                {wo.number}
                            </span>
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20">
                                <Clock className="w-4 h-4 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest">En Cours</span>
                            </div>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                            {wo.title}
                        </h1>
                        <p className="text-sm font-bold text-slate-500 mt-2 flex items-center gap-2">
                            <Wrench className="w-4 h-4" /> Actif sur: <span className="text-slate-900 dark:text-white">{wo.asset}</span>
                        </p>
                    </div>

                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Origine</p>
                        <p className="text-sm font-bold text-red-500 underline cursor-pointer">{wo.complaintRef}</p>
                    </div>
                </div>

                <div className="border-t border-slate-100 dark:border-border-dark pt-6">
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                        "{wo.description}"
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
                {/* Left Col: Checklist & Execution */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-background rounded-[2rem] border border-slate-200 dark:border-border-dark p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-black uppercase italic tracking-tighter text-slate-900 dark:text-white flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-red-500" /> Plan d'Exécution
                            </h3>
                            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">2/5 Étapes</span>
                        </div>
                        
                        <div className="space-y-3">
                            {wo.checklist.map((item, idx) => (
                                <div key={idx} className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${item.done ? 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20 opacity-80' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50'}`}>
                                    <button type="button" className={`size-6 rounded-md flex items-center justify-center border-2 ${item.done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                                        {item.done && <CheckCircle2 className="w-4 h-4" />}
                                    </button>
                                    <span className={`text-sm font-bold ${item.done ? 'text-emerald-700 dark:text-emerald-400 line-through' : 'text-slate-700 dark:text-slate-300'}`}>
                                        {item.step}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-background rounded-[2rem] border border-slate-200 dark:border-border-dark p-8 shadow-sm">
                        <h3 className="text-sm font-black uppercase italic tracking-tighter text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                            <Camera className="w-4 h-4 text-red-500" /> Pièces Jointes & Preuves
                        </h3>
                        <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-primary/5 dark:hover:bg-violet-500/10 transition-colors cursor-pointer">
                            <Camera className="size-10 text-slate-300 dark:text-slate-600 mb-3" />
                            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Ajouter une photo de fin d'intervention</p>
                        </div>
                    </div>
                </div>

                {/* Right Col: Logistics & Timing */}
                <div className="space-y-6">
                    <InterventionTimer 
                        workOrderId={wo.id}
                        estimatedHours={wo.estimatedHours}
                    />

                    <div className="bg-white dark:bg-background rounded-[2rem] border border-slate-200 dark:border-border-dark p-6 shadow-sm">
                        <div className="pt-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Équipe Assignée</span>
                            <div className="flex items-center gap-2 mb-2">
                                <Users className="w-4 h-4 text-slate-300" />
                                <span className="text-sm font-black">{wo.team}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {wo.technicians.map((t, idx) => (
                                    <span key={idx} className="text-[10px] bg-slate-800 px-2 py-1 rounded font-bold">{t}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-background rounded-[2rem] border border-slate-200 dark:border-border-dark p-6 shadow-sm">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                            <Calendar className="w-3 h-3" /> Calendrier
                        </h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center border-b border-slate-100 dark:border-border-dark pb-2">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Planifié</span>
                                <span className="text-sm font-black text-slate-900 dark:text-white">{wo.scheduledDate}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Début Réel</span>
                                <span className="text-sm font-black text-amber-600 dark:text-amber-500">En attente</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
