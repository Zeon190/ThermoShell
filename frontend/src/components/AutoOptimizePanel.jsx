import React, { useState } from 'react';
import { Zap, Loader2, CheckCircle2, X } from 'lucide-react';
import { runAutoOptimize } from '../api';

export default function AutoOptimizePanel({ simData, location, dimensions, materials, catalog, onApplyFix }) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [applied, setApplied] = useState(false);

  if (!simData?.metrics || !location || !dimensions || !materials) return null;

  const comfortPct = simData.metrics.comfort_hours_percentage ?? 0;
  if (comfortPct >= 30) return null;

  const handleAutoOptimize = async () => {
    setIsOptimizing(true);
    setError(null);
    setResult(null);
    setApplied(false);
    try {
      const payload = {
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          location_name: location.location_name,
          elevation_m: location.elevation_m
        },
        dimensions: {
          length_m: dimensions.length_m,
          width_m: dimensions.width_m,
          height_m: dimensions.height_m,
          south_window_ratio: dimensions.south_window_ratio,
          north_window_ratio: dimensions.north_window_ratio,
          east_window_ratio: dimensions.east_window_ratio,
          west_window_ratio: dimensions.west_window_ratio,
          has_trombe_wall: dimensions.has_trombe_wall,
          occupants_count: dimensions.occupants_count,
          air_change_rate: dimensions.air_change_rate
        },
        materials: {
          wall_material_id: materials.wall_material_id,
          wall_thickness_m: materials.wall_thickness_m,
          insulation_material_id: materials.insulation_material_id,
          insulation_thickness_m: materials.insulation_thickness_m,
          roof_material_id: materials.roof_material_id,
          roof_thickness_m: materials.roof_thickness_m,
          glazing_system_id: materials.glazing_system_id
        }
      };
      const res = await runAutoOptimize(payload);
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleApply = () => {
    if (result?.updated_configuration && onApplyFix) {
      onApplyFix(result.updated_configuration);
      setApplied(true);
    }
  };

  if (applied) {
    return (
      <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-extrabold text-emerald-300 uppercase tracking-wider mb-1">
              ✅ CHANGES APPLIED
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              The optimized configuration has been applied successfully. The simulation will recalculate with the new material stack and structural parameters.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-cyan-500/40 bg-cyan-950/30 p-4 mb-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 shrink-0">
          <Zap className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-extrabold text-cyan-300 uppercase tracking-wider mb-2">
            ⚡ AUTOMATED OPTIMIZATION ROUTINE
          </h3>

          {!result && !error && (
            <div className="border-t border-cyan-500/30 pt-2 mb-2">
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                Current comfort score is <span className="text-rose-400 font-bold">{comfortPct}%</span>. 
                The automated routine will parse the failing envelope recipe and generate a corrected 
                high-performance material configuration optimized for this climate zone.
              </p>
              <button
                onClick={handleAutoOptimize}
                disabled={isOptimizing}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
              >
                {isOptimizing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Optimizing Envelope...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Run Auto-Optimization
                  </>
                )}
              </button>
            </div>
          )}

          {error && (
            <div className="border-t border-rose-500/30 pt-2 mb-2">
              <p className="text-xs text-rose-300">Optimization failed: {error}</p>
              <button
                onClick={() => { setError(null); setResult(null); }}
                className="mt-2 text-xs text-slate-400 hover:text-white underline"
              >
                Retry
              </button>
            </div>
          )}

          {result && (
            <div className="border-t border-cyan-500/30 pt-2">
              <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-700/60 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-300">
                    Optimization Complete: {comfortPct}% → {result.optimized_comfort_pct}% comfort
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
                  {result.engineering_summary}
                </p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {result.modifications_applied.map((mod, idx) => (
                    <span key={idx} className="text-[10px] bg-slate-800 px-2 py-1 rounded border border-slate-700 text-cyan-300">
                      ✓ {mod}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleApply}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Apply Optimized Fix
                </button>
                <button
                  onClick={() => { setResult(null); setError(null); }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-all"
                >
                  <X className="w-4 h-4" />
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
