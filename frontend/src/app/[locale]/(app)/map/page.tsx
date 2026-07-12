'use client';

import React, { useState, useEffect } from 'react';
import { 
    MapPin, Truck, Filter, 
    Navigation, AlertCircle, Activity, Layout
} from 'lucide-react';
import dynamic from 'next/dynamic';

import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import { Skeleton } from '@chakra-ui/react';
import { Button } from '@/components/ui/button';

// Import dynamique de la carte pour éviter les erreurs SSR (window is not defined)
const LeafletMap = dynamic(() => import('@/components/maps/LeafletMap'), { 
    ssr: false,
    loading: () => <Skeleton height="100%" width="100%" borderRadius="2rem" />
});

export default function FleetMapPage() {
    const [complaints, setComplaints] = useState<any[]>([]);
    const [teams, setTeams] = useState<any[]>([]);
    const [simulating, setSimulating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [aiStatus, setAiStatus] = useState<any>(null);

    const fetchData = async () => {
        try {
            const [cRes, tRes, aiRes] = await Promise.all([
                apiClient.get('/complaints'),
                apiClient.get('/admin/teams'),
                apiClient.get('/fleet/traffic-status').catch(() => null)
            ]);
            setComplaints(cRes.data || []);
            setTeams(tRes.data || []);
            if (aiRes?.data) setAiStatus(aiRes.data.data);
        } catch (err) {
            console.error("Erreur de chargement des données map", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000); // Poll every 10s for live tracking
        return () => clearInterval(interval);
    }, []);

    const toggleSimulation = async () => {
        try {
            if (simulating) {
                await apiClient.post('/simulation/stop');
                toast.success("Simulation terminée");
            } else {
                await apiClient.post('/simulation/start');
                toast.success("Simulation activée ! Synchronisation des flux...");
            }
            setSimulating(!simulating);
        } catch (err) {
            // Fallback pour le mode demo si les routes n'existent pas encore
            setSimulating(!simulating);
            toast.success(simulating ? "Simulation arrêtée (Mode Démo)" : "Simulation active (Mode Démo)");
        }
    };

    // Calculer le centre de la carte basé sur la moyenne des points ou défaut sur Casablanca
    const defaultCenter: [number, number] = [33.5731, -7.5898];

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col bg-slate-50 dark:bg-background overflow-hidden font-display">
            {/* Header Control Bar */}
            <div className="px-6 py-4 bg-white dark:bg-background border-b border-slate-100 dark:border-border-dark flex items-center justify-between z-20">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-indigo-50 dark:bg-primary/10 rounded-2xl border border-indigo-100 dark:border-primary/20">
                        <Navigation className="w-5 h-5 text-primary dark:text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-sm font-black uppercase tracking-tighter italic text-slate-900 dark:text-white flex items-center gap-2">
                            Grid Intelligence <span className="text-primary dark:text-indigo-400">|</span> Fleet Tracker V3
                        </h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                {teams.filter(t => t.status === 'intervention').length} Unités en opération
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button type="button" className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-200 transition-all">
                        <Filter className="w-3.5 h-3.5" /> Filtres
                    </button>
                    <button type="button" className="px-5 py-2.5 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-indigo-600/30 hover:brightness-110 active:scale-95 transition-all">
                        <Activity className="w-3.5 h-3.5" /> IA Optimization
                    </button>
                </div>
            </div>

            <div className="flex-1 flex relative">
                {/* Side Info Panel */}
                <div className="w-[22rem] bg-white dark:bg-background border-r border-slate-100 dark:border-border-dark p-6 space-y-8 overflow-y-auto hidden xl:block relative z-10 shadow-2xl">
                    <div>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Interventions Actives</h3>
                            <span className="bg-indigo-100 dark:bg-primary/20 text-primary dark:text-indigo-400 px-2 py-0.5 rounded text-[9px] font-black">{complaints.length}</span>
                        </div>
                        <div className="space-y-3">
                            {complaints.filter(c => c.status !== 'fermée' && c.status !== 'résolue').slice(0, 5).map(complaint => (
                                <div key={complaint._id} className="p-4 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-border-dark hover:border-indigo-400 dark:hover:border-primary transition-all cursor-pointer group shadow-sm">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                            complaint.priority === 'urgent' ? 'bg-red-500 text-white' : 'bg-primary text-white'
                                        }`}>{complaint.priority}</div>
                                        <span className="text-[9px] font-black text-slate-400 font-mono tracking-tighter">#{complaint.number || complaint._id.slice(-6)}</span>
                                    </div>
                                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 group-hover:text-primary truncate uppercase mt-1 tracking-tight">{complaint.title}</h4>
                                    <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                        <MapPin className="w-3 h-3 text-primary" /> 
                                        {complaint.city || 'Secteur Alpha'}
                                    </div>
                                </div>
                            ))}
                            {complaints.length > 5 && (
                                <button type="button" className="w-full py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors">
                                    + {complaints.length - 5} autres signalements
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="p-5 rounded-[2rem] bg-primary/5 dark:bg-white/5 border border-indigo-100 dark:border-white/10">
                        <h3 className="text-[10px] font-black text-primary dark:text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <AlertCircle className="w-3.5 h-3.5" /> Radar IA Operatif
                        </h3>
                        {aiStatus ? (
                            <div className="space-y-2">
                                {aiStatus.recommendations.map((rec: string, idx: number) => (
                                    <p key={idx} className="text-[10px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed italic">
                                        &quot;{rec}&quot;
                                    </p>
                                ))}
                            </div>
                        ) : (
                            <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed italic">
                                &quot;Optimalisation suggérée : L'unité **{teams[0]?.name || 'Alpha 1'}** est la plus proche de l'alerte **#{complaints[0]?.number || 'REQ-01'}**. Gain de temps estimé : **9 minutes**.&quot;
                            </p>
                        )}
                    </div>

                    <div>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5">Statut de la Flotte</h3>
                        <div className="space-y-3">
                            {teams.slice(0, 4).map(team => (
                                <div key={team._id} className="p-4 rounded-[1.5rem] bg-white dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-700 flex items-center gap-4 hover:border-indigo-100 transition-all">
                                    <div className="size-11 rounded-2xl flex items-center justify-center shadow-lg text-white" style={{ backgroundColor: team.color }}>
                                        <Truck className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[11px] font-black text-slate-900 dark:text-white uppercase truncate tracking-tight">{team.name}</div>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <div className={`size-1.5 rounded-full ${team.status === 'intervention' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-slate-400'}`}></div>
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter truncate">{team.status}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Real Map Component */}
                <div className="flex-1 bg-slate-200 dark:bg-slate-800 relative group overflow-hidden">
                    <LeafletMap 
                        teams={teams} 
                        complaints={complaints} 
                        center={defaultCenter}
                        zoom={11}
                    />
                    
                    {/* Control Panel Integration UI */}
                    <div className="absolute bottom-10 left-10 z-[500] max-w-sm pointer-events-none">
                        <div className={`p-8 rounded-[3rem] bg-indigo-950/40 backdrop-blur-xl border border-white/10 pointer-events-auto shadow-2xl transition-all ${simulating ? 'opacity-40 scale-95 blur-sm' : 'opacity-100 hover:scale-[1.02]'}`}>
                             <div className="size-16 rounded-3xl bg-white/10 flex items-center justify-center mb-6 border border-white/10">
                                <Layout className="w-8 h-8 text-indigo-400" />
                             </div>
                             <h2 className="text-xl font-black text-white uppercase italic tracking-tighter mb-4">Command Center Live</h2>
                             <p className="text-[11px] text-indigo-100/70 font-medium mb-8 leading-relaxed">
                                Synchronisez les flux GPS temps réel et activez l'IA de routage pour vos techniciens de terrain.
                             </p>
                             <button type="button" 
                                onClick={toggleSimulation}
                                className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl
                                    ${simulating ? 'bg-emerald-500 text-white' : 'bg-white text-primary hover:bg-primary/5'}
                                `}
                            >
                                {simulating ? 'Flux Synchronisé Active' : 'Activer le Tracking Live'}
                             </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
