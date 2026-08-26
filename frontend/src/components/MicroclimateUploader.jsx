import React, { useState } from 'react';
import { UploadCloud, X, FileText, CheckCircle2, AlertTriangle, Download, ArrowRight, Loader2 } from 'lucide-react';
import { uploadMicroclimateCsv } from '../api';

export default function MicroclimateUploader({ isOpen, onClose, onApplyCustomWeather }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setErrorMsg(null);
    try {
      const res = await uploadMicroclimateCsv(file);
      setUploadResult(res);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadSample = () => {
    const lines = [
      'timestamp,temperature_degC,solar_irradiance_Wm2,wind_speed_ms,relative_humidity_pct'
    ];
    for (let day = 1; day <= 7; day++) {
      for (let hr = 0; hr < 24; hr++) {
        const temp = (-28.0 + Math.sin((hr - 6) * Math.PI / 12) * 12.0 + (day % 2) * 1.5).toFixed(1);
        const solar = (hr >= 7 && hr <= 17 ? Math.max(0, Math.sin((hr - 7) * Math.PI / 10) * 980.0) : 0).toFixed(0);
        const wind = (3.5 + Math.sin(hr * 0.5) * 2.0).toFixed(1);
        const rh = (35.0 - Math.sin((hr - 6) * Math.PI / 12) * 15.0).toFixed(0);
        lines.push(`2026-01-0${day} ${String(hr).padStart(2, '0')}:00,${temp},${solar},${wind},${rh}`);
      }
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'DRDO_Siachen_Sensor_Log_Sample.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleApplyOverride = () => {
    if (uploadResult && uploadResult.weather_records_8760) {
      onApplyCustomWeather(uploadResult.weather_records_8760, uploadResult.metadata);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Feature B: Local Microclimate CSV Overrides
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full">
                  Sensor Logger
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Override NASA satellite models with exact ground weather station & thermocouple logs
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4 text-xs">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-950/50 cursor-pointer transition-all"
            onClick={() => document.getElementById('csv-file-input').click()}
          >
            <input
              id="csv-file-input"
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={handleFileChange}
            />
            <UploadCloud className="w-10 h-10 text-cyan-400 mb-2 animate-bounce" />
            <p className="font-semibold text-slate-200 text-sm">
              {file ? file.name : 'Drag & Drop on-site CSV sensor log here'}
            </p>
            <p className="text-slate-400 text-xs mt-1">
              Supports columns: Temperature (°C), Solar Irradiance (W/m²), Wind Speed (m/s), RH (%)
            </p>
          </div>

          <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div>
              <span className="font-semibold text-slate-200 block">Need a template?</span>
              <span className="text-slate-400 text-[11px]">Download sample Siachen Forward Base Camp logger dataset</span>
            </div>
            <button
              onClick={handleDownloadSample}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-semibold text-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Sample CSV</span>
            </button>
          </div>

          {file && !uploadResult && (
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sanitizing & Validating Microclimate Data...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Process & Calibrate Sensor Data</span>
                </>
              )}
            </button>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {uploadResult && (
            <div className="bg-emerald-950/20 border border-emerald-500/40 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-emerald-300">
                <span className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Microclimate Sensor Data Calibrated!
                </span>
                <span className="font-mono text-[11px]">{uploadResult.metadata.raw_rows_detected} rows</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-slate-300 font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">Min Temp Recorded</span>
                  <span className="font-bold text-cyan-300">{uploadResult.metadata.min_temp_recorded}°C</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Avg Temp Recorded</span>
                  <span className="font-bold text-white">{uploadResult.metadata.avg_temp_recorded}°C</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Max Temp Recorded</span>
                  <span className="font-bold text-amber-300">{uploadResult.metadata.max_temp_recorded}°C</span>
                </div>
              </div>

              <button
                onClick={handleApplyOverride}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <span>Run Thermal Simulation with Overridden Climate</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
