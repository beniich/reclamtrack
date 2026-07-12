'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Scan, Keyboard, Camera, ArrowRight, ScanLine } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ScannerPage() {
    const router = useRouter();
    const [manualCode, setManualCode] = useState('');
    const [isScanning, setIsScanning] = useState(true);

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (manualCode.trim()) {
            router.push(`/scan/${manualCode.trim()}`);
        }
    };

    // Simulate a successful scan after 5 seconds if the user stays on the camera view
    // (This is just for demo purposes to simulate the real scanner behavior)
    useEffect(() => {
        if (!isScanning) return;
        
        const timer = setTimeout(() => {
            // Simulated scanned asset code
            router.push(`/scan/USINE-L1-POMPE-001`);
        }, 5000);

        return () => clearTimeout(timer);
    }, [isScanning, router]);

    return (
        <div className="min-h-[calc(100vh-6rem)] bg-slate-50 dark:bg-background p-6 font-display flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-border-dark shadow-2xl overflow-hidden relative z-10">
                <div className="p-8 pb-0">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-50 dark:bg-primary/10 rounded-xl text-primary">
                            <Scan className="size-5" />
                        </div>
                        <h1 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Scanner Équipement</h1>
                    </div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-8">Alignez le QR Code avec le cadre ci-dessous</p>
                </div>

                {isScanning ? (
                    <div className="relative aspect-square w-full bg-slate-900 overflow-hidden flex items-center justify-center cursor-pointer" onClick={() => setIsScanning(false)}>
                        <div className="absolute inset-0 bg-black/40"></div>
                        
                        {/* Scanning frame */}
                        <div className="relative size-64 border-2 border-white/20 rounded-3xl">
                            <div className="absolute top-0 left-0 size-8 border-t-4 border-l-4 border-primary rounded-tl-3xl"></div>
                            <div className="absolute top-0 right-0 size-8 border-t-4 border-r-4 border-primary rounded-tr-3xl"></div>
                            <div className="absolute bottom-0 left-0 size-8 border-b-4 border-l-4 border-primary rounded-bl-3xl"></div>
                            <div className="absolute bottom-0 right-0 size-8 border-b-4 border-r-4 border-primary rounded-br-3xl"></div>
                            
                            {/* Scanning line animation */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-primary shadow-[0_0_15px_rgba(99,102,241,1)] animate-[scan_2s_ease-in-out_infinite]"></div>
                        </div>

                        <div className="absolute bottom-6 flex items-center gap-2 text-white/70 text-[10px] font-black uppercase tracking-widest">
                            <Camera className="size-4" /> 
                            Recherche de marqueur optique...
                        </div>
                    </div>
                ) : (
                    <div className="aspect-square w-full bg-slate-100 dark:bg-slate-800 p-8 flex flex-col justify-center">
                        <form onSubmit={handleManualSubmit} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Code de l'actif (Manuel)</label>
                                <input 
                                    type="text" 
                                    value={manualCode}
                                    onChange={(e) => setManualCode(e.target.value)}
                                    placeholder="Ex: USINE-L1-POMPE-001"
                                    className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm font-black text-slate-900 dark:text-white uppercase focus:border-primary focus:ring-0 transition-colors placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                />
                            </div>
                            <Button type="submit" className="w-full py-6 rounded-2xl bg-primary hover:brightness-110 text-white font-black uppercase tracking-widest text-xs flex items-center gap-2 transition-all shadow-xl shadow-indigo-500/20">
                                Poursuivre <ArrowRight className="size-4" />
                            </Button>
                        </form>
                    </div>
                )}

                <div className="p-6 border-t border-slate-100 dark:border-border-dark flex justify-center">
                    <button 
                        onClick={() => setIsScanning(!isScanning)}
                        className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors flex items-center gap-2"
                    >
                        {isScanning ? (
                            <><Keyboard className="size-4" /> Saisie manuelle</>
                        ) : (
                            <><ScanLine className="size-4" /> Retour à la caméra</>
                        )}
                    </button>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                @keyframes scan {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
            `}} />
        </div>
    );
}
