import React from 'react';
import { Box, Sun, Users, Wind, ShieldCheck, HelpCircle } from 'lucide-react';

export default function BlueprintDesigner({ dimensions, setDimensions }) {
  const floorArea = (dimensions.length_m * dimensions.width_m).toFixed(1);
  const volume = (dimensions.length_m * dimensions.width_m * dimensions.height_m).toFixed(1);

  const handleChange = (field, value) => {
    setDimensions(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <Box className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">
              2. Shelter Geometry & Passive Solar Blueprint
            </h3>
            <p className="text-xs text-slate-400">
              Configure room size, window orientation, and passive Trombe wall
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-950/80 px-2.5 py-1 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-400">
          <span>{floorArea} m² Area</span>
          <span className="text-slate-600">|</span>
          <span>{volume} m³ Vol</span>
        </div>
      </div>

      <div className="space-y-4 text-xs">
        {/* Dimensions Sliders */}
        <div className="grid grid-cols-3 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Length (E-W)</span>
              <span className="font-mono text-cyan-400 font-bold">{dimensions.length_m} m</span>
            </div>
            <input
              type="range"
              min="3.0"
              max="15.0"
              step="0.5"
              value={dimensions.length_m}
              onChange={(e) => handleChange('length_m', parseFloat(e.target.value))}
              className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Width (N-S)</span>
              <span className="font-mono text-cyan-400 font-bold">{dimensions.width_m} m</span>
            </div>
            <input
              type="range"
              min="2.5"
              max="10.0"
              step="0.5"
              value={dimensions.width_m}
              onChange={(e) => handleChange('width_m', parseFloat(e.target.value))}
              className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Height</span>
              <span className="font-mono text-cyan-400 font-bold">{dimensions.height_m} m</span>
            </div>
            <input
              type="range"
              min="2.2"
              max="4.5"
              step="0.1"
              value={dimensions.height_m}
              onChange={(e) => handleChange('height_m', parseFloat(e.target.value))}
              className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* South Glazing Ratio Slider */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-300 mb-1">
            <span className="flex items-center gap-1.5 font-semibold text-amber-300">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              South-Facing Solar Glazing Ratio
            </span>
            <span className="font-mono text-amber-400 font-bold">
              {(dimensions.south_window_ratio * 100).toFixed(0)}% of South Wall
            </span>
          </div>
          <input
            type="range"
            min="0.05"
            max="0.60"
            step="0.05"
            value={dimensions.south_window_ratio}
            onChange={(e) => handleChange('south_window_ratio', parseFloat(e.target.value))}
            className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            South orientation traps up to 850 W/m² solar heat during freezing Himalayan winters.
          </p>
        </div>

        {/* Trombe Wall Toggle Card */}
        <div
          onClick={() => handleChange('has_trombe_wall', !dimensions.has_trombe_wall)}
          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
            dimensions.has_trombe_wall
              ? 'bg-amber-950/30 border-amber-500/60 text-amber-200 shadow-md shadow-amber-950/20'
              : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <input
            type="checkbox"
            checked={dimensions.has_trombe_wall}
            onChange={() => {}}
            className="mt-0.5 accent-amber-500 cursor-pointer"
          />
          <div>
            <div className="flex items-center gap-1.5 font-bold text-xs text-white">
              <span>Integrated Passive Trombe Wall Thermal Storage</span>
              <span className="px-1.5 py-0.2 text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded font-semibold uppercase">
                High-Impact
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
              Absorbs high-altitude UV solar radiation in a dark heavy core during daytime, and radiates heat inward with a 7–8 hour delay to keep troops warm at -25°C midnight.
            </p>
          </div>
        </div>

        {/* Occupancy & Air Tightness */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="flex justify-between text-slate-300 mb-1">
              <span className="flex items-center gap-1 text-[11px]">
                <Users className="w-3 h-3 text-cyan-400" />
                Active Occupants
              </span>
              <span className="font-mono text-cyan-400 font-bold">{dimensions.occupants_count}</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={dimensions.occupants_count}
              onChange={(e) => handleChange('occupants_count', parseInt(e.target.value) || 1)}
              className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block mt-1">
              +{(dimensions.occupants_count * 85)}W body heat gain
            </span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <div className="flex justify-between text-slate-300 mb-1">
              <span className="flex items-center gap-1 text-[11px]">
                <Wind className="w-3 h-3 text-emerald-400" />
                Infiltration (ACH)
              </span>
              <span className="font-mono text-emerald-400 font-bold">{dimensions.air_change_rate} /hr</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.0"
              step="0.1"
              value={dimensions.air_change_rate}
              onChange={(e) => handleChange('air_change_rate', parseFloat(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block mt-1">
              {dimensions.air_change_rate <= 0.5 ? 'Military airtight seal' : 'Moderate ventilation'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}