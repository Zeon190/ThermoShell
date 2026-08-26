import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceArea,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';
import { Calendar, Sun, Activity, BarChart2 } from 'lucide-react';

export default function ThermalChart({ simData }) {
  const [viewMode, setViewMode] = useState('diurnal_winter'); // 'diurnal_winter', 'yearly', 'monthly'

  const hourlyData = simData?.hourly_sample_profile || [];
  const winterDiurnal = simData?.diurnal_winter_day || [];
  const springDiurnal = simData?.diurnal_spring_day || [];
  const monthlyData = simData?.monthly_summary || [];

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-cyan-400" />
            Thermal Performance Curves & Solar Heat Balance
          </h3>
          <p className="text-xs text-slate-400">
            Simulated indoor room temperature vs extreme outdoor weather profile
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setViewMode('diurnal_winter')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              viewMode === 'diurnal_winter'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            24h Peak Cold Day
          </button>
          <button
            onClick={() => setViewMode('yearly')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              viewMode === 'yearly'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            8,760h Year Timeline
          </button>
          <button
            onClick={() => setViewMode('monthly')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              viewMode === 'monthly'
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Monthly Comfort %
          </button>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="w-full h-[320px] text-xs">
        {viewMode === 'diurnal_winter' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={winterDiurnal} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="hour_label" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                domain={['auto', 'auto']}
                unit="°C"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  color: '#f8fafc'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              
              {/* Comfort Zone Reference Area (18°C to 24°C) */}
              <ReferenceArea y1={18} y2={24} fill="#10b981" fillOpacity={0.12}                 label={{ value: 'Target Comfort Zone (18–24°C)', fill: '#34d399', fontSize: 10, position: 'insideTopRight' }} />

              <Line
                type="monotone"
                dataKey="indoor_temp"
                name="Indoor Temperature (°C)"
                stroke="#22d3ee"
                strokeWidth={3}
                dot={{ r: 3, fill: '#22d3ee' }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="outdoor_temp"
                name="Outdoor Ambient Temp (°C)"
                stroke="#64748b"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="solair_south"
                name="South Sol-Air Temp (°C)"
                stroke="#f59e0b"
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {viewMode === 'yearly' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIndoor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11 }} label={{ value: 'Day of Year (1 - 365)', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 10 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit="°C" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <ReferenceArea y1={18} y2={24} fill="#10b981" fillOpacity={0.15} />
               <Area
                 type="monotone"
                 dataKey="indoor_temp"
                 name="Indoor Temperature (°C)"
                 stroke="#22d3ee"
                 strokeWidth={2}
                 fillOpacity={1}
                 fill="url(#colorIndoor)"
               />
               <Line
                 type="monotone"
                 dataKey="outdoor_temp"
                 name="Outdoor Temperature (°C)"
                 stroke="#475569"
                 strokeWidth={1}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {viewMode === 'monthly' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar
                dataKey="comfort_percent"
                name="Natural Comfort Hours (%)"
                fill="#10b981"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}