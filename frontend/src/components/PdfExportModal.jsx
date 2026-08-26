import React, { useState } from 'react';
import { FileText, X, Download, CheckCircle2, ShieldCheck, Printer, Loader2 } from 'lucide-react';
import { downloadSpecsheetPdf } from '../api';

export default function PdfExportModal({ isOpen, onClose, location, dimensions, materials, simData }) {
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const metrics = simData?.metrics || {};
  const mb = simData?.materials_breakdown || {};

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      await downloadSpecsheetPdf({
        location,
        dimensions,
        materials,
        comfort_temp_min: 18.0,
        comfort_temp_max: 24.0,
        auxiliary_heating_setpoint: 16.0
      });
      onClose();
    } catch (err) {
      alert('PDF generation failed: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                   Feature D: Automated PDF Spec-Sheet Generation
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full">
                  ReportLab Vector Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Generates offline engineering spec sheets for forward defense deployment without internet
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4 text-xs font-sans">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 tracking-widest block uppercase">
                  DRDO SIH 2026 // TACTICAL ARCHITECTURE
                </span>
                <h4 className="text-base font-black text-white">THERMOSHELL PASSIVE SPEC SHEET</h4>
                <p className="text-[11px] text-slate-400">
                  Target: {location.location_name} ({location.latitude.toFixed(2)}°N, {location.longitude.toFixed(2)}°E, {location.elevation_m}m)
                </p>
              </div>
              <div className="text-right">
                <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 rounded">
                  DOC ID: TS-2026-DRDO
                </span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-2">
                1. Bill of Materials (BOM) & Envelope Layers
              </span>
              <table className="w-full text-left text-xs border border-slate-800">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 text-[11px]">
                    <th className="p-2">Component</th>
                    <th className="p-2">Material Specification</th>
                    <th className="p-2">Thickness</th>
                    <th className="p-2">Est. Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr>
                    <td className="p-2 text-slate-300 font-semibold">Wall Core</td>
                    <td className="p-2 text-white">{mb.wall?.name || 'Rammed Earth'}</td>
                    <td className="p-2 text-cyan-400 font-mono">{mb.wall?.thickness_cm} cm</td>
                    <td className="p-2 text-white font-mono">₹{mb.wall?.cost_inr?.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-slate-300 font-semibold">Insulation</td>
                    <td className="p-2 text-white">{mb.insulation?.name || 'Sheep Wool'}</td>
                    <td className="p-2 text-emerald-400 font-mono">{mb.insulation?.thickness_cm} cm</td>
                    <td className="p-2 text-white font-mono">₹{mb.insulation?.cost_inr?.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-slate-300 font-semibold">Roof</td>
                    <td className="p-2 text-white">{mb.roof?.name || 'Timber Mud Willow'}</td>
                    <td className="p-2 text-amber-400 font-mono">{mb.roof?.thickness_cm} cm</td>
                    <td className="p-2 text-white font-mono">₹{mb.roof?.cost_inr?.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-slate-300 font-semibold">Glazing</td>
                    <td className="p-2 text-white">{mb.glazing?.name || 'Double Low-E Argon'}</td>
                    <td className="p-2 text-blue-400 font-mono">{mb.glazing?.area_m2} m²</td>
                    <td className="p-2 text-white font-mono">₹{mb.glazing?.cost_inr?.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800 font-mono text-center">
              <div>
                <span className="text-[10px] text-slate-400 block">Annual Natural Comfort</span>
                <span className="text-sm font-extrabold text-emerald-400">
                  {metrics.comfort_hours_percentage}% ({metrics.comfort_hours_count} hrs)
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Kerosene Fuel Saved</span>
                <span className="text-sm font-extrabold text-cyan-400">
                  {metrics.kerosene_fuel_saved_liters?.toLocaleString()} L / yr
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Total Envelope Budget</span>
                  <span className="text-sm font-extrabold text-white">
                    ₹{metrics.total_envelope_cost_inr?.toLocaleString()}
                  </span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Vector graphics & blueprints compiled directly via ReportLab Python engine
          </span>

          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Compiling PDF Document...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Vector PDF Spec Sheet</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
