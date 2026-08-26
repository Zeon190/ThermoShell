import React from 'react';
import { AlertTriangle, Snowflake, Sun, Thermometer, Layers, Wind, Zap } from 'lucide-react';
import { runAutoOptimize } from '../api';

export default function DiagnosticEngine({ simData, location, materials, dimensions, catalog }) {
  if (!simData?.metrics || !location || !materials || !catalog) return null;

  const metrics = simData.metrics;
  const comfortPct = metrics.comfort_hours_percentage ?? 0;
  const thermalLag = metrics.thermal_time_constant_hrs ?? 0;
  const wallU = metrics.overall_wall_u_value ?? 0;
  const roofU = metrics.overall_roof_u_value ?? 0;

  const walls = catalog?.walls || [];
  const insulations = catalog?.insulations || [];
  const roofs = catalog?.roofs || [];
  const glazings = catalog?.glazings || [];

  const wall = walls.find(w => w.id === materials.wall_material_id);
  const insulation = insulations.find(i => i.id === materials.insulation_material_id);
  const roof = roofs.find(r => r.id === materials.roof_material_id);
  const glazing = glazings.find(g => g.id === materials.glazing_system_id);

  const isTropical = location.latitude < 25.0 || location.elevation_m < 1000 || simData.climate_profile_warning === 'tropical_overheating';
  const isCold = location.latitude >= 25.0 && location.elevation_m >= 1000;

  if (comfortPct >= 70) {
    return (
      <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 shrink-0">
            <Thermometer className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-emerald-300 uppercase tracking-wider mb-1">
              ✅ OPTIMAL THERMAL ENVELOPE
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Material stack is performing at {comfortPct}% natural comfort. Current composite R-value and thermal lag of {thermalLag}h are well-calibrated for this altitude. Maintain current configuration.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (comfortPct < 40) {
    if (isCold) {
      const isHighConductivityWall = wall && (wall.conductivity > 0.5 || ['stone_granite_masonry', 'rammed_earth', 'cseb_blocks'].includes(wall.id));
      const isInsufficientInsulation = !insulation || materials.insulation_thickness_m < 0.06;

      if (isHighConductivityWall && isInsufficientInsulation) {
        return (
          <div className="rounded-2xl border border-rose-500/60 bg-rose-950/40 p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-400 shrink-0">
                <Snowflake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-rose-300 uppercase tracking-wider mb-1">
                  ❄️ UNDERHEAT / COLD COGNIZANCE
                </h3>
                <div className="border-t border-rose-500/30 pt-2 mb-2">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Selected <span className="text-rose-400 font-bold">{wall?.name}</span> (k = {wall?.conductivity} W/m·K) has high thermal conductivity. Without a high-resistance thermal barrier, sub-zero Himalayan ambient heat is leaking instantly through the envelope. {insulation ? `Current insulation (${insulation.name}) at ${(materials.insulation_thickness_m * 100).toFixed(0)}cm is insufficient.` : 'No insulation layer detected.'}
                  </p>
                </div>
                <div className="bg-slate-900/60 rounded-lg p-2.5 border border-slate-700/60">
                  <p className="text-[11px] text-rose-200 font-bold mb-1">🚨 IMMEDIATE ACTION REQUIRED:</p>
                  <ul className="text-[11px] text-slate-300 list-disc list-inside space-y-0.5">
                    <li>Inject a high-resistance thermal barrier: <span className="text-cyan-300 font-bold">DRDO Modular PUF Sandwich Wall</span> or <span className="text-cyan-300 font-bold">Compressed Straw-Bale</span></li>
                    <li>Increase insulation thickness to minimum <span className="text-white font-bold">120mm</span> (0.12m)</li>
                    <li>Upgrade glazing to <span className="text-white font-bold">Triple Low-E + Krypton</span> for extreme cold stops</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="rounded-2xl border border-rose-500/60 bg-rose-950/40 p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-400 shrink-0">
              <Snowflake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-rose-300 uppercase tracking-wider mb-1">
                ❄️ UNDERHEAT / COLD COGNIZANCE
              </h3>
              <div className="border-t border-rose-500/30 pt-2 mb-2">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Extreme cold region detected with {comfortPct}% comfort. Current U-value of {wallU.toFixed(3)} W/m²K is too permeable for {location.elevation_m}m altitude. Heat is escaping faster than metabolic + solar gain can replenish interior temperature.
                </p>
              </div>
              <div className="bg-slate-900/60 rounded-lg p-2.5 border border-slate-700/60">
                <p className="text-[11px] text-rose-200 font-bold mb-1">🚨 IMMEDIATE ACTION REQUIRED:</p>
                <ul className="text-[11px] text-slate-300 list-disc list-inside space-y-0.5">
                  <li>Increase wall insulation thickness by <span className="text-white font-bold">50%</span></li>
                  <li>Seal all air-change infiltration paths (current ACH: {dimensions.air_change_rate}/hr)</li>
                  <li>Activate Trombe wall thermal storage for daytime solar banking</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (isTropical) {
      const isHighInsulation = wall && wall.conductivity < 0.1;
      const hasTrombe = dimensions.has_trombe_wall;
      const hasPuf = wall?.id === 'drdo_puf_panel' || (insulation && insulation.conductivity < 0.03);

      if (hasPuf || hasTrombe) {
        return (
          <div className="rounded-2xl border border-amber-500/60 bg-amber-950/40 p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400 shrink-0">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-amber-300 uppercase tracking-wider mb-1">
                  🔥 OVERHEAT / TROPICAL COGNIZANCE
                </h3>
                <div className="border-t border-amber-500/30 pt-2 mb-2">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Tropical coordinates detected. <span className="text-amber-400 font-bold">{wall?.name}</span> + {insulation?.name || 'high insulation'} + {hasTrombe ? 'Active Trombe Wall' : 'thermal mass'} creates a <span className="text-amber-400 font-bold">thermal trap</span>. External ambient heat (avg {metrics.avg_outdoor_temp}°C) is retained inside with no escape vector. Indoor temperature is locked at {metrics.avg_indoor_temp}°C — causing 100% overheating failure.
                  </p>
                </div>
                <div className="bg-slate-900/60 rounded-lg p-2.5 border border-slate-700/60">
                  <p className="text-[11px] text-amber-200 font-bold mb-1">🚨 CRITICAL RE-TUNE REQUIRED:</p>
                  <ul className="text-[11px] text-slate-300 list-disc list-inside space-y-0.5">
                    <li>Swap insulation to breathable low-R material: <span className="text-white font-bold">Reduce PUF thickness to near-zero</span></li>
                    <li>Remove Trombe wall immediately — it is baking the interior</li>
                    <li>Switch to <span className="text-white font-bold">Passive Cooling Mode</span>: ventilated roof + high SHGC shading glazing</li>
                    <li>Increase air change rate to minimum <span className="text-white font-bold">4.0 ACH</span> for convective heat purge</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="rounded-2xl border border-amber-500/60 bg-amber-950/40 p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400 shrink-0">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-amber-300 uppercase tracking-wider mb-1">
                🔥 OVERHEAT / TROPICAL COGNIZANCE
              </h3>
              <div className="border-t border-amber-500/30 pt-2 mb-2">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Tropical zone with {comfortPct}% comfort. Envelope is retaining external heat. Current U-value of {wallU.toFixed(3)} W/m²K is too tight for hot-humid climate. Nighttime ventilation purge is blocked.
                </p>
              </div>
              <div className="bg-slate-900/60 rounded-lg p-2.5 border border-slate-700/60">
                <p className="text-[11px] text-amber-200 font-bold mb-1">🚨 ADAPTATION REQUIRED:</p>
                <ul className="text-[11px] text-slate-300 list-disc list-inside space-y-0.5">
                  <li>Increase ACH to <span className="text-white font-bold">4.0+</span> for night-flush cooling</li>
                  <li>Switch to ventilated roof assembly or reflective barrier</li>
                  <li>Reduce glazing SHGC or add external shading fins</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  if (comfortPct >= 30 && comfortPct < 70) {
    const weakLinks = [];

    if (wallU > 0.5) {
      weakLinks.push({ component: 'Wall', issue: `U-value ${wallU.toFixed(3)} W/m²K is too leaky`, fix: wall?.name || 'upgrade wall material' });
    }
    if (roofU > 0.4) {
      weakLinks.push({ component: 'Roof', issue: `U-value ${roofU.toFixed(3)} W/m²K allows heat escape`, fix: roof?.name || 'upgrade roof assembly' });
    }
    if (glazing && glazing.u_value > 1.8) {
      weakLinks.push({ component: 'Glazing', issue: `U-value ${glazing.u_value} W/m²K is single-pane grade`, fix: 'Triple Low-E + Krypton' });
    }
    if (materials.insulation_thickness_m < 0.08) {
      weakLinks.push({ component: 'Insulation', issue: `Only ${(materials.insulation_thickness_m * 100).toFixed(0)}mm thickness`, fix: 'Increase to 120mm+ mineral wool or PUF' });
    }
    if (dimensions.has_trombe_wall && thermalLag < 6) {
      weakLinks.push({ component: 'Trombe', issue: 'Thermal lag below 6h means inadequate storage mass', fix: 'Increase wall thickness or add internal thermal mass' });
    }
    if (dimensions.air_change_rate > 1.5) {
      weakLinks.push({ component: 'Infiltration', issue: `ACH ${dimensions.air_change_rate}/hr is too drafty`, fix: 'Seal gaps, reduce to 0.5 ACH' });
    }

    const primaryWeakLink = weakLinks[0];

    return (
      <div className="rounded-2xl border border-cyan-500/40 bg-cyan-950/30 p-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-cyan-300 uppercase tracking-wider mb-1">
              ⚙️ OPTIMIZATION INTERPOLATION
            </h3>
            <div className="border-t border-cyan-500/30 pt-2 mb-2">
              <p className="text-xs text-slate-300 leading-relaxed">
                Comfort score of <span className="text-cyan-400 font-bold">{comfortPct}%</span> indicates a composite envelope that is close but not yet optimized. Current thermal lag is {thermalLag}h. The weak link is in the <span className="text-white font-bold">{primaryWeakLink?.component || 'envelope composite'}</span> layer.
              </p>
            </div>
            <div className="bg-slate-900/60 rounded-lg p-2.5 border border-slate-700/60">
              <p className="text-[11px] text-cyan-200 font-bold mb-1">🔧 UPGRADE PATHWAY TO 70%+ COMFORT:</p>
              <ul className="text-[11px] text-slate-300 list-disc list-inside space-y-0.5">
                {weakLinks.slice(0, 3).map((link, idx) => (
                  <li key={idx}>
                    <span className="text-white font-bold">{link.component}:</span> {link.issue}. Fix: <span className="text-cyan-300">{link.fix}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
