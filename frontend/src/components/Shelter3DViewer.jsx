import React, { useState } from 'react';
import { Sun, Wind, Flame, Shield, ArrowUp, Layers } from 'lucide-react';

export default function Shelter3DViewer({ dimensions, materials, simData }) {
  const [season, setSeason] = useState('winter');

  const metrics = simData?.metrics || {};
  const mb = simData?.materials_breakdown || {};

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
            <Sun className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">
              2.5D Isometric Passive Solar Shelter Architecture
            </h3>
            <p className="text-xs text-slate-400">
              Visualizes solar angles, Trombe thermo-siphon convective loops, and envelope insulation barriers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setSeason('winter')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              season === 'winter'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ☀ Winter Solar Angle (32° Alt)
          </button>
          <button
            onClick={() => setSeason('summer')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              season === 'summer'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ☀ Summer Solar Angle (78° Alt)
          </button>
        </div>
      </div>

      <div className="relative w-full h-[380px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-slate-800 p-4 flex items-center justify-center overflow-hidden">
        <div
          className={`absolute transition-all duration-700 flex flex-col items-center ${
            season === 'winter' ? 'top-10 left-12' : 'top-4 left-1/2 -translate-x-1/2'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 shadow-2xl shadow-orange-500/50 flex items-center justify-center animate-pulse">
            <Sun className="w-8 h-8 text-slate-950" />
          </div>
          <span className="text-[10px] font-bold text-amber-300 mt-1">
            {season === 'winter' ? 'Low Winter Sun (32°)' : 'High Summer Sun (78°)'}
          </span>
        </div>

        <svg viewBox="0 0 700 320" className="w-full h-full max-w-2xl">
          <line x1="20" y1="270" x2="680" y2="270" stroke="#475569" strokeWidth="3" />
          <text x="30" y="290" fill="#64748b" fontSize="10" fontFamily="sans-serif">Frozen Sub-zero Ground (Permafrost)</text>

          <rect x="180" y="260" width="340" height="12" fill="#047857" opacity="0.8" rx="2" />
          <text x="260" y="269" fill="#d1fae5" fontSize="8" fontWeight="bold">Sub-Slab XPS Insulation Layer</text>

          <rect x="180" y="100" width="28" height="160" fill="#475569" stroke="#334155" strokeWidth="1.5" />
          <rect x="156" y="100" width="22" height="160" fill="#10b981" opacity="0.85" />
          <text x="110" y="180" fill="#34d399" fontSize="9" fontWeight="bold" transform="rotate(-90 140 180)">
            Wool Batt (R-2.4)
          </text>

          <polygon points="150,100 550,70 550,88 150,118" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="300" y="85" fill="#38bdf8" fontSize="9" fontWeight="bold">
            Insulated Sloped Roof (Snow Shedding)
          </text>

          <rect x="208" y="100" width="285" height="160" fill="#0284c7" fillOpacity="0.08" stroke="#0ea5e9" strokeDasharray="3 3" strokeWidth="0.5" />
          <text x="300" y="175" fill="#22d3ee" fontSize="12" fontWeight="extrabold" textAnchor="middle">
             Thermal Comfort Zone ({metrics.avg_indoor_temp || 20}°C)
          </text>
          <text x="300" y="195" fill="#94a3b8" fontSize="9" textAnchor="middle">
            {dimensions.occupants_count} Occupants ({(dimensions.occupants_count * 85)}W body heat)
          </text>

          <rect x="495" y="100" width="28" height="160" fill="#b45309" stroke="#d97706" strokeWidth="1.5" />
          <rect x="532" y="100" width="8" height="160" fill="#38bdf8" opacity="0.6" rx="1" />
          <line x1="536" y1="100" x2="536" y2="260" stroke="#bae6fd" strokeWidth="2" />

          <text x="500" y="285" fill="#f59e0b" fontSize="10" fontWeight="bold">
            ► SOUTH SOLAR FACADE ◄
          </text>

          {season === 'winter' ? (
            <g>
              <line x1="80" y1="60" x2="520" y2="200" stroke="#f59e0b" strokeWidth="3" strokeDasharray="6 3" />
              <line x1="100" y1="50" x2="532" y2="130" stroke="#f59e0b" strokeWidth="3" strokeDasharray="6 3" />
              <polygon points="520,200 500,195 510,185" fill="#f59e0b" />
              <text x="440" y="140" fill="#fef08a" fontSize="9" fontWeight="bold">
                Deep Solar Penetration
              </text>
            </g>
          ) : (
            <g>
              <line x1="350" y1="40" x2="540" y2="160" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4" opacity="0.5" />
              <text x="460" y="60" fill="#94a3b8" fontSize="8">
                Overhang Blocks Summer Overheating
              </text>
            </g>
          )}

          <g>
            <path d="M 524 240 Q 515 250 500 250" fill="none" stroke="#38bdf8" strokeWidth="2" />
            <path d="M 500 115 Q 515 115 524 125" fill="none" stroke="#ea580c" strokeWidth="2" />
            <polygon points="500,115 508,111 508,119" fill="#ea580c" />
            <text x="440" y="112" fill="#fb923c" fontSize="8" fontWeight="bold">Hot Air Out (Night)</text>
            <text x="435" y="255" fill="#38bdf8" fontSize="8" fontWeight="bold">Cool Air In (Cycle)</text>
          </g>
        </svg>

        <div className="absolute bottom-4 right-4 bg-slate-950/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 text-xs shadow-xl space-y-1">
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Wall Core:</span>
            <span className="font-bold text-white">{mb.wall?.name?.split(' (')[0] || 'Rammed Earth'}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Insulation:</span>
            <span className="font-bold text-emerald-400">{mb.insulation?.name?.split(' (')[0] || 'Sheep Wool'}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Thermal Lag:</span>
            <span className="font-bold text-purple-400">{metrics.thermal_time_constant_hrs || 32} hrs</span>
          </div>
        </div>
      </div>
    </div>
  );
}
