import React from 'react';
import { Flame, Droplet, DollarSign, CloudRain, Clock, ShieldCheck, TrendingUp, Zap } from 'lucide-react';
import SystemNotice from './SystemNotice';
import DiagnosticEngine from './DiagnosticEngine';

export default function SimulationDashboard({ simData, isSimulating, location, onReposition, materials, dimensions, catalog }) {
  const metrics = simData?.metrics || {};
  const rec = simData?.recipe_recommendation || {};

  const comfortPct = metrics.comfort_hours_percentage ?? 0;
  const comfortHours = metrics.comfort_hours_count ?? 0;

  // Determine badge color based on comfort
  let badgeColor = 'from-amber-500 to-orange-500';
  if (comfortPct >= 70) badgeColor = 'from-emerald-400 to-cyan-500';
  if (comfortPct < 40) badgeColor = 'from-rose-500 to-amber-500';

  return (
    <div className="space-y-4">
      {simData?.climate_profile_warning && (
        <SystemNotice
          warning={simData.climate_profile_warning}
          location={location}
          onReposition={onReposition}
        />
      )}

      <DiagnosticEngine
        simData={simData}
        location={location}
        materials={materials}
        dimensions={dimensions}
        catalog={catalog}
      />

      {/* Top Headline Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 rounded-2xl border border-slate-800 p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                DRDO RC-Network Simulation Output
              </span>
              <span className="text-xs text-slate-400 font-mono">
                8,760 Hourly Time Steps Evaluated
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white">
              {rec.headline || `High-Altitude Natural Thermal Comfort Analysis`}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {rec.summary || 'Thermal network calculation running across annual solar radiation, wind speed, and ambient temperature cycles.'}
            </p>
          </div>

          {/* Large Circular Comfort Gauge */}
          <div className="flex items-center gap-3 bg-slate-950/80 p-3 rounded-2xl border border-slate-800 shrink-0">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-16 h-16 -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke="currentColor"
                  strokeWidth="5"
                  className="text-slate-800"
                  fill="transparent"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeDasharray="163.3"
                  strokeDashoffset={163.3 - (163.3 * comfortPct) / 100}
                  className={`transition-all duration-1000 ${
                    comfortPct >= 70 ? 'text-emerald-400' : comfortPct >= 40 ? 'text-amber-400' : 'text-rose-400'
                  }`}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-black text-white">{comfortPct}%</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Natural Comfort
              </span>
              <span className="text-xs font-bold text-emerald-300">
                {comfortHours.toLocaleString()} hrs / yr
              </span>
              <span className="text-[10px] text-slate-500 block">
                Target: 18°C–24°C
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* High Impact Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        {/* Metric 1: Kerosene Saved */}
        <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium">Kerosene Saved</span>
            <Droplet className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <span className="text-lg font-black text-cyan-300 block font-mono">
              {(metrics.kerosene_fuel_saved_liters || 0).toLocaleString()} L
            </span>
            <span className="text-[10px] text-slate-400">Heating fuel avoided/yr</span>
          </div>
        </div>

        {/* Metric 2: Fuel Logistics Cost Saved */}
        <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium">Logistics Saved</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <span className="text-lg font-black text-emerald-300 block font-mono">
              ₹{(metrics.heating_cost_saved_inr || 0).toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400">High-altitude airlift budget</span>
          </div>
        </div>

        {/* Metric 3: Peak Cold Day Indoor Temp */}
        <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium">Min Indoor Temp</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <span className="text-lg font-black text-amber-300 block font-mono">
               {metrics.min_indoor_temp ?? '--'}°C
            </span>
            <span className="text-[10px] text-slate-400">
               vs Outdoor {metrics.min_outdoor_temp ?? '--'}°C
            </span>
          </div>
        </div>

        {/* Metric 4: Thermal Lag Time Constant */}
        <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
             <span className="text-[11px] font-medium">Thermal Lag (τ)</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <span className="text-lg font-black text-purple-300 block font-mono">
              {metrics.thermal_time_constant_hrs ?? '--'} hrs
            </span>
            <span className="text-[10px] text-slate-400">Daytime heat delay</span>
          </div>
        </div>

        {/* Metric 5: CO2 Emissions Avoided */}
        <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
             <span className="text-[11px] font-medium">CO₂ Avoided</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <span className="text-lg font-black text-emerald-300 block font-mono">
              {(metrics.co2_emissions_avoided_kg || 0).toLocaleString()} kg
            </span>
            <span className="text-[10px] text-slate-400">Green defense footprint</span>
          </div>
        </div>

        {/* Metric 6: Total Shelter Envelope Cost */}
        <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium">Envelope Budget</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <span className="text-lg font-black text-white block font-mono">
               ₹{(metrics.total_envelope_cost_inr || 0).toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400">
              ₹{metrics.cost_per_sqm_inr ?? 0}/m² floor
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}