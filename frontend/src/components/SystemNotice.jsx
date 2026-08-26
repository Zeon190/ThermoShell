import React from 'react';
import { AlertTriangle, MapPin, RefreshCw } from 'lucide-react';

export default function SystemNotice({ warning, location, onReposition }) {
  if (!warning) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-rose-500/60 bg-rose-950/40 shadow-lg shadow-rose-900/20 mb-4">
      <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 via-transparent to-rose-500/5 pointer-events-none" />
      <div className="relative p-4 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-400 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-extrabold text-rose-300 uppercase tracking-wider mb-1">
            ⚠️ Climate Profile Critical Overheating Notice
          </h3>
          <div className="border-t border-rose-500/30 pt-2 mb-2">
            <p className="text-xs text-slate-300 leading-relaxed">
              Selected deployment coordinates fall into a tropical/warm-humid zone. ThermoShell&apos;s default
              high-insulation military envelope acts as a thermal trap here. External ambient heat is retained,
              causing <span className="text-rose-400 font-bold">100% overheating failure</span>.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onReposition}
              className="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <MapPin className="w-3.5 h-3.5" />
              Reposition to Cold Region (HAA/SHAA)
            </button>
            <span className="text-[10px] text-slate-500 font-mono">
              Current: {location?.latitude?.toFixed(2)}°N, {location?.longitude?.toFixed(2)}°E, {location?.elevation_m}m
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
