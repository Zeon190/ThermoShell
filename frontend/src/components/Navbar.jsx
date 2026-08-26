import React from 'react';
import { Shield, Sun, Sparkles, FileText, UploadCloud, Sliders, Flame, Compass, BookOpen } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenOptimizer, onOpenUploader, onOpenPdf, onOpenUserGuide, isOptimizing }) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Military Badge */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Sun className="w-6 h-6 text-slate-950 font-bold animate-spin-slow" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                <Shield className="w-2.5 h-2.5 text-slate-950" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-cyan-400 via-emerald-300 to-white bg-clip-text text-transparent">
                  ThermoShell
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 rounded-full">
                  DRDO SIH 2026
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Passive Solar Architecture Matchmaker for High-Altitude Extreme Cold
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'simulator'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Map & Simulation Core
            </button>

            <button
              onClick={() => setActiveTab('3d')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === '3d'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              2.5D Solar Blueprint
            </button>
          </div>

          {/* Top-3 Next-Level Features Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Feature A: Budget Optimizer */}
            <button
              onClick={onOpenOptimizer}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/40 text-amber-300 hover:border-amber-400 hover:bg-amber-500/20 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm group"
              title="Auto-Match optimal materials within strict ₹ budget"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
              <span>Budget Optimizer</span>
            </button>

            {/* Feature B: Microclimate CSV */}
            <button
              onClick={onOpenUploader}
              className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Upload on-site sensor CSV logger data"
            >
              <UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Sensor CSV</span>
            </button>

            {/* Feature C: User Guide */}
            <button
              onClick={onOpenUserGuide}
              className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="ThermoShell Interactive User Guide"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">User Guide</span>
            </button>

            {/* Feature D: Download PDF Spec */}
            <button
              onClick={onOpenPdf}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
              title="Download official DRDO Engineering PDF Spec Sheet"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export PDF Spec</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}