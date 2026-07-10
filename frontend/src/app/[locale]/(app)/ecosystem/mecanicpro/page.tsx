"use client";

import React from 'react';
import { motion } from 'framer-motion';
import JsonLd from '@/components/seo/JsonLd';
import { 
  WrenchScrewdriverIcon, 
  CpuChipIcon, 
  SignalIcon, 
  TruckIcon,
  ShieldCheckIcon,
  ArchiveBoxIcon,
  CommandLineIcon,
  CircleStackIcon,
  ChevronRightIcon,
  ChartPieIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  PresentationChartLineIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

// Metadata must be in a Server Component or exported from a separate file if using 'use client'
// For now, I will keep the component logic and the user can move metadata to a layout or page layout if needed.
// However, in Next.js App Router, you can't export metadata from a 'use client' file.
// I'll move the metadata to a separate file or just remove it from here for now to fix the build.

export default function MecanicProDashboard() {
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-300 p-6 md:p-10 font-mono selection:bg-primary/30 overflow-hidden">
      <JsonLd 
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "MecanicPro",
          "operatingSystem": "Web",
          "applicationCategory": "BusinessApplication",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "GBP"
          }
        }}
      />
      {/* Laser Sweep bar simulation */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-20 blur-sm pointer-events-none" />

      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8 border-l-4 border-primary pl-6 py-2">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-primary text-black flex items-center justify-center rounded-sm shadow-2xl shadow-orange-900/20">
            <WrenchScrewdriverIcon className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">Mecanic<span className="text-primary">Pro</span></h1>
            <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-slate-500">Workshop & Fleet Intelligence OS v3.8</p>
          </div>
        </div>
        
        <div className="flex gap-4">
           <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-sm flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-500 uppercase">System Integrity</span>
                <span className="text-xs font-bold text-emerald-500 font-mono">STABLE // 99.8%</span>
              </div>
              <SignalIcon className="w-6 h-6 text-primary" />
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
        {/* Main Telemetry Panel */}
        <div className="lg:col-span-8 flex flex-col gap-6">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Active Jobs", val: "12", trend: "+2", icon: ArchiveBoxIcon },
                { label: "Engine Uptime", val: "2,482h", trend: "Nominal", icon: CpuChipIcon },
                { label: "Fleet Load", val: "78%", trend: "Optimal", icon: TruckIcon },
              ].map((stat, i) => (
                <div key={i} className="bg-surface-dark/40 border border-border-dark p-6 relative group hover:border-primary/50 transition-colors">
                  <div className="absolute top-0 right-0 p-2 opacity-5">
                    <stat.icon className="w-12 h-12" />
                  </div>
                  <p className="text-[9px] uppercase tracking-widest text-slate-500 mb-2 font-black">{stat.label}</p>
                  <div className="flex justify-between items-end">
                    <h3 className="text-2xl font-black text-white font-mono tracking-tighter">{stat.val}</h3>
                    <span className="text-[9px] text-primary font-bold">{stat.trend}</span>
                  </div>
                  <div className="w-full h-[2px] bg-slate-800 mt-4 overflow-hidden">
                    <motion.div 
                      key={i}
                      initial={{ left: '-100%' }}
                      animate={{ left: '100%' }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="h-full w-1/3 bg-primary absolute" 
                    />
                  </div>
                </div>
              ))}
           </div>

           <div className="bg-surface-dark/20 border border-border-dark p-8 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <CommandLineIcon className="w-4 h-4 text-primary" />
                  Machine Learning Diagnostics
                </h2>
                <span className="text-[10px] text-slate-600 font-mono">REF: MEC-2024-X</span>
              </div>
              
              <div className="space-y-6">
                 {[
                   { part: "Transmission System A1", health: 92, status: "Healthy", color: "bg-emerald-500" },
                   { part: "Inclusion Sensor X-Ray", health: 18, status: "Critical", color: "bg-red-500" },
                   { part: "Hydraulic Pressure", health: 65, status: "Warning", color: "bg-amber-500" },
                 ].map((comp, i) => (
                   <div key={i} className="flex flex-col gap-2">
                      <div className="flex justify-between text-[11px]">
                         <span className="font-bold text-slate-300 uppercase italic">{comp.part}</span>
                         <span className={comp.health < 20 ? 'text-red-500' : 'text-slate-500'}>{comp.status} | {comp.health}%</span>
                      </div>
                      <div className="h-1 w-full bg-slate-800">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${comp.health}%` }}
                          transition={{ duration: 1 }}
                          className={`h-full ${comp.color}`} 
                        />
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* System Terminal (Sidebar) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
           <div className="bg-black/40 border border-border-dark p-8 flex flex-col h-full relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest">IO_LOGS_TERMINAL</h3>
              </div>
              
              <div className="space-y-4 font-mono text-[10px] mb-8 text-slate-500">
                 <p className="border-l border-border-dark pl-2"><span className="text-orange-900">14:02:44</span> {">"} INIT_SEQUENCE_SUCCESS</p>
                 <p className="border-l border-border-dark pl-2"><span className="text-orange-900">14:05:12</span> {">"} GATEWAY_PULL_TELEMETRY</p>
                 <p className="border-l border-border-dark pl-2 text-red-900"><span className="text-red-950">14:08:01</span> {">"} ERR_SENSOR_B4_TIMEOUT</p>
                 <p className="border-l border-orange-900 pl-2 text-primary/80"><span className="text-orange-900">14:10:33</span> {">"} AI_ACTION: RETRY_CONN</p>
              </div>

              <div className="mt-auto space-y-4">
                 <Button variant="ghost" className="w-full py-4 bg-primary text-black font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-orange-900/20 hover:bg-primary transition-colors">Emergency Reset</Button>
                 <Button variant="ghost" className="w-full py-4 bg-transparent border border-white/10 text-white font-black uppercase text-xs tracking-[0.2em] hover:bg-white/5 transition-colors">Export Analysis</Button>
              </div>
           </div>

           <div className="bg-surface-dark/10 border border-border-dark p-6 flex items-center justify-between group cursor-pointer hover:bg-violet-500/15/30 transition-all">
              <div className="flex items-center gap-3">
                <ShieldCheckIcon className="w-5 h-5 text-emerald-500" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Secured Node</span>
              </div>
              <ChevronRightIcon className="w-4 h-4 text-slate-600 group-hover:translate-x-1 transition-transform" />
           </div>
        </div>
      </div>
    </div>
  );
}
