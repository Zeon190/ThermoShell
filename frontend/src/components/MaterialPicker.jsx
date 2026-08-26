import React, { useState } from 'react';
import { Layers, ShieldAlert, Sparkles, Feather, DollarSign, CheckCircle2 } from 'lucide-react';

export default function MaterialPicker({ catalog, materials, setMaterials }) {
  const [activeCategory, setActiveCategory] = useState('wall');

  const walls = catalog?.walls || [];
  const insulations = catalog?.insulations || [];
  const roofs = catalog?.roofs || [];
  const glazings = catalog?.glazings || [];

  const handleSelect = (field, id) => {
    setMaterials(prev => ({ ...prev, [field]: id }));
  };

  const handleThicknessChange = (field, val) => {
    setMaterials(prev => ({ ...prev, [field]: val }));
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">
              3. Envelope Material Recipe & Insulation Layers
            </h3>
            <p className="text-xs text-slate-400">
              Select wall core, bio-insulation, roofing, and multi-glazed thermal breaks
            </p>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 mb-3 text-xs">
        <button
          onClick={() => setActiveCategory('wall')}
          className={`flex-1 py-1.5 px-2 rounded-lg font-semibold transition-all ${
            activeCategory === 'wall'
              ? 'bg-slate-800 text-cyan-400 border border-slate-700 shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Wall Core
        </button>
        <button
          onClick={() => setActiveCategory('insulation')}
          className={`flex-1 py-1.5 px-2 rounded-lg font-semibold transition-all ${
            activeCategory === 'insulation'
              ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Insulation Batt
        </button>
        <button
          onClick={() => setActiveCategory('roof')}
          className={`flex-1 py-1.5 px-2 rounded-lg font-semibold transition-all ${
            activeCategory === 'roof'
              ? 'bg-slate-800 text-amber-400 border border-slate-700 shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Roof Assembly
        </button>
        <button
          onClick={() => setActiveCategory('glazing')}
          className={`flex-1 py-1.5 px-2 rounded-lg font-semibold transition-all ${
            activeCategory === 'glazing'
              ? 'bg-slate-800 text-blue-400 border border-slate-700 shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Glazing
        </button>
      </div>

      {/* Thickness Sliders depending on Active Category */}
      {activeCategory === 'wall' && (
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 mb-3 text-xs">
          <div className="flex justify-between text-slate-300 mb-1">
            <span>Wall Core Thickness</span>
            <span className="font-mono text-cyan-400 font-bold">{(materials.wall_thickness_m * 100).toFixed(0)} cm</span>
          </div>
          <input
            type="range"
            min="0.10"
            max="0.60"
            step="0.05"
            value={materials.wall_thickness_m}
            onChange={(e) => handleThicknessChange('wall_thickness_m', parseFloat(e.target.value))}
            className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>
      )}

      {activeCategory === 'insulation' && (
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 mb-3 text-xs">
          <div className="flex justify-between text-slate-300 mb-1">
            <span>Insulation Layer Thickness</span>
            <span className="font-mono text-emerald-400 font-bold">{(materials.insulation_thickness_m * 100).toFixed(0)} cm</span>
          </div>
          <input
            type="range"
            min="0.02"
            max="0.20"
            step="0.01"
            value={materials.insulation_thickness_m}
            onChange={(e) => handleThicknessChange('insulation_thickness_m', parseFloat(e.target.value))}
            className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>
      )}

      {/* Materials Cards List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[320px] text-xs">
        {activeCategory === 'wall' &&
          walls.map(w => {
            const isSel = materials.wall_material_id === w.id;
            return (
              <div
                key={w.id}
                onClick={() => handleSelect('wall_material_id', w.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isSel
                    ? 'bg-cyan-950/40 border-cyan-500/80 text-white shadow-md shadow-cyan-950/30'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-100 flex items-center gap-1.5">
                    {isSel && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                    {w.name}
                  </span>
                  <span className="font-mono font-bold text-cyan-300">₹{w.cost_per_m2_default}/m²</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-2">{w.description}</p>
                <div className="flex flex-wrap gap-2 text-[10px] text-slate-300">
                  <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    k = {w.conductivity} W/m·K
                  </span>
                  <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    ρ = {w.density} kg/m³
                  </span>
                  <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-emerald-400">
                    Local: {w.local_availability}/10
                  </span>
                </div>
              </div>
            );
          })}

        {activeCategory === 'insulation' &&
          insulations.map(ins => {
            const isSel = materials.insulation_material_id === ins.id;
            return (
              <div
                key={ins.id}
                onClick={() => handleSelect('insulation_material_id', ins.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isSel
                    ? 'bg-emerald-950/40 border-emerald-500/80 text-white shadow-md shadow-emerald-950/30'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-100 flex items-center gap-1.5">
                    {isSel && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    {ins.name}
                  </span>
                  <span className="font-mono font-bold text-emerald-300">₹{ins.cost_per_m2_default}/m²</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-2">{ins.description}</p>
                <div className="flex flex-wrap gap-2 text-[10px] text-slate-300">
                  <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    k = {ins.conductivity} W/m·K
                  </span>
                  <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-emerald-400">
                    Local: {ins.local_availability}/10
                  </span>
                </div>
              </div>
            );
          })}

        {activeCategory === 'roof' &&
          roofs.map(r => {
            const isSel = materials.roof_material_id === r.id;
            return (
              <div
                key={r.id}
                onClick={() => handleSelect('roof_material_id', r.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isSel
                    ? 'bg-amber-950/40 border-amber-500/80 text-white shadow-md shadow-amber-950/30'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-100 flex items-center gap-1.5">
                    {isSel && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                    {r.name}
                  </span>
                  <span className="font-mono font-bold text-amber-300">₹{r.cost_per_m2_default}/m²</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{r.description}</p>
              </div>
            );
          })}

        {activeCategory === 'glazing' &&
          glazings.map(g => {
            const isSel = materials.glazing_system_id === g.id;
            return (
              <div
                key={g.id}
                onClick={() => handleSelect('glazing_system_id', g.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isSel
                    ? 'bg-blue-950/40 border-blue-500/80 text-white shadow-md shadow-blue-950/30'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-100 flex items-center gap-1.5">
                    {isSel && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                    {g.name}
                  </span>
                  <span className="font-mono font-bold text-blue-300">₹{g.cost_per_m2}/m²</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-1">{g.description}</p>
                <div className="flex gap-3 text-[10px] text-slate-300 font-mono">
                  <span>U = {g.u_value} W/m·K</span>
                  <span>SHGC = {g.shgc}</span>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}