'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface InterventionTimerProps {
    workOrderId: string;
    initialStatus?: 'pending' | 'in_progress' | 'paused' | 'completed';
    initialSeconds?: number;
    estimatedHours?: number;
    onStatusChange?: (status: string, elapsedSeconds: number) => void;
}

export function InterventionTimer({
    workOrderId,
    initialStatus = 'pending',
    initialSeconds = 0,
    estimatedHours = 0,
    onStatusChange
}: InterventionTimerProps) {
    const [status, setStatus] = useState(initialStatus);
    const [seconds, setSeconds] = useState(initialSeconds);
    const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

    // Format seconds to HH:MM:SS
    const formatTime = (totalSeconds: number) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleStart = async () => {
        try {
            // TODO: API Call -> PUT /api/work-orders/:id/timer { action: 'start' }
            setStatus('in_progress');
            toast.success('Intervention démarrée');
            onStatusChange?.('in_progress', seconds);
        } catch (error) {
            toast.error('Erreur lors du démarrage');
        }
    };

    const handlePause = async () => {
        try {
            // TODO: API Call -> PUT /api/work-orders/:id/timer { action: 'pause' }
            setStatus('paused');
            toast.success('Intervention en pause');
            onStatusChange?.('paused', seconds);
        } catch (error) {
            toast.error('Erreur lors de la mise en pause');
        }
    };

    const handleStop = async () => {
        try {
            // TODO: API Call -> PUT /api/work-orders/:id/timer { action: 'stop' }
            setStatus('completed');
            toast.success('Intervention terminée');
            onStatusChange?.('completed', seconds);
        } catch (error) {
            toast.error('Erreur lors de la fin d\\'intervention');
        }
    };

    useEffect(() => {
        if (status === 'in_progress') {
            const id = setInterval(() => {
                setSeconds((prev) => prev + 1);
            }, 1000);
            setIntervalId(id);
        } else {
            if (intervalId) {
                clearInterval(intervalId);
                setIntervalId(null);
            }
        }
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [status, intervalId]);

    const progressPercentage = estimatedHours > 0 ? Math.min((seconds / (estimatedHours * 3600)) * 100, 100) : 0;

    return (
        <div className="bg-black text-white rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl -mr-10 -mt-10 transition-colors duration-1000 ${
                status === 'in_progress' ? 'bg-emerald-600/20' : 
                status === 'paused' ? 'bg-amber-600/20' : 
                status === 'completed' ? 'bg-blue-600/20' : 'bg-red-600/20'
            }`}></div>
            
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center justify-between relative z-10">
                <span className="flex items-center gap-2"><Clock className="w-3 h-3" /> Temps & Main d'Œuvre</span>
                <span className={`px-2 py-0.5 rounded-full text-[8px] border ${
                    status === 'in_progress' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                    status === 'paused' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                    status === 'completed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                }`}>
                    {status === 'in_progress' ? 'EN COURS' : status === 'paused' ? 'EN PAUSE' : status === 'completed' ? 'TERMINÉ' : 'EN ATTENTE'}
                </span>
            </h4>
            
            <div className="space-y-4 relative z-10">
                <div className="text-center py-4">
                    <span className="text-4xl font-black font-mono tracking-wider tabular-nums">{formatTime(seconds)}</span>
                </div>

                <div>
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-1.5">
                        <span className="text-slate-400">Progression estimée</span>
                        <span className="text-emerald-400">{Math.round(progressPercentage)}%</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                </div>
                
                <div className="flex justify-center gap-3 pt-4 border-t border-slate-800">
                    {(status === 'pending' || status === 'paused') && (
                        <button onClick={handleStart} className="size-12 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-500 transition-colors">
                            <Play className="w-5 h-5 ml-1" />
                        </button>
                    )}
                    
                    {status === 'in_progress' && (
                        <button onClick={handlePause} className="size-12 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-500 transition-colors">
                            <Pause className="w-5 h-5" />
                        </button>
                    )}
                    
                    {(status === 'in_progress' || status === 'paused') && (
                        <button onClick={handleStop} className="size-12 rounded-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-500 transition-colors">
                            <Square className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
