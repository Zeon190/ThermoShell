import React, { useEffect, useRef } from 'react';
import { MapPin, Mountain, ThermometerSnowflake, Compass, Navigation } from 'lucide-react';
import L from 'leaflet';

export default function MapSelector({ location, setLocation, hotspots, onSelectHotspot }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerInstance = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstance.current) {
      // Initialize Leaflet map with CartoDB DarkMatter tiles for military tactical UI
      const map = L.map(mapRef.current, {
        center: [location.latitude, location.longitude],
        zoom: 7,
        zoomControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      // Custom pulsing tactical pin icon
      const customIcon = L.divIcon({
        className: 'custom-pin',
        html: `<div class="relative flex items-center justify-center">
                <div class="w-6 h-6 rounded-full bg-cyan-500/30 animate-ping absolute"></div>
                <div class="w-4 h-4 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 border-2 border-white shadow-md flex items-center justify-center">
                  <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
                </div>
               </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([location.latitude, location.longitude], { icon: customIcon }).addTo(map);
      markerInstance.current = marker;

      // Click to place
      map.on('click', (e) => {
        const lat = parseFloat(e.latlng.lat.toFixed(4));
        const lon = parseFloat(e.latlng.lng.toFixed(4));
        
        // Estimate rough high-altitude elevation for Himalayas
        let estElev = 3200;
        if (lat >= 32.0 && lon >= 75.0 && lon <= 80.0) estElev = 3600;
        if (lat >= 34.5) estElev = 4500;

        setLocation({
          latitude: lat,
          longitude: lon,
          location_name: `Tactical Grid (${lat}°, ${lon}°)`,
          elevation_m: estElev
        });
      });

      mapInstance.current = map;
    } else {
      mapInstance.current.setView([location.latitude, location.longitude], mapInstance.current.getZoom());
      if (markerInstance.current) {
        markerInstance.current.setLatLng([location.latitude, location.longitude]);
      }
    }
  }, [location.latitude, location.longitude]);

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col h-full">
      {/* Title & Coordinates Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              1. Deployment Location & Microclimate
            </h3>
            <p className="text-xs text-slate-400">
              Click anywhere on the map or select a strategic DRDO defense outpost
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono text-cyan-300">
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          <span>{location.latitude.toFixed(3)}°N, {location.longitude.toFixed(3)}°E</span>
          <span className="text-slate-600">|</span>
          <Mountain className="w-3.5 h-3.5 text-emerald-400" />
          <span>{location.elevation_m.toLocaleString()}m AMSL</span>
        </div>
      </div>

      {/* Preset Strategic Hotspots */}
      <div className="mb-3">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
          Strategic Defense Outposts & Cold Deserts:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {hotspots.map((h) => {
            const isSelected = Math.abs(location.latitude - h.latitude) < 0.05 && Math.abs(location.longitude - h.longitude) < 0.05;
            return (
              <button
                key={h.id}
                onClick={() => onSelectHotspot(h)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
                }`}
              >
                <ThermometerSnowflake className={`w-3 h-3 ${isSelected ? 'text-slate-950' : 'text-cyan-400'}`} />
                <span>{h.name.split(' (')[0]}</span>
                <span className={`text-[10px] ${isSelected ? 'text-slate-900' : 'text-slate-400'}`}>
                  {h.elevation_m}m
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Map Box */}
      <div className="flex-1 min-h-[260px] rounded-xl overflow-hidden border border-slate-700/80 relative shadow-inner">
        <div ref={mapRef} className="w-full h-full" />
        
        {/* Floating current location badge */}
        <div className="absolute bottom-3 left-3 z-20 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-xs shadow-lg max-w-[280px]">
          <span className="text-slate-400 block text-[10px]">Active Site:</span>
          <span className="font-semibold text-white truncate block">{location.location_name}</span>
        </div>
      </div>

      {/* Manual Lat/Lon Inputs */}
      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800 text-xs">
        <div>
          <label className="text-[11px] text-slate-400 block mb-1">Latitude (°N)</label>
          <input
            type="number"
            step="0.01"
            value={location.latitude}
            onChange={(e) => setLocation({ ...location, latitude: parseFloat(e.target.value) || 0 })}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-white focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div>
          <label className="text-[11px] text-slate-400 block mb-1">Longitude (°E)</label>
          <input
            type="number"
            step="0.01"
            value={location.longitude}
            onChange={(e) => setLocation({ ...location, longitude: parseFloat(e.target.value) || 0 })}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-white focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div>
          <label className="text-[11px] text-slate-400 block mb-1">Elevation (m)</label>
          <input
            type="number"
            step="50"
            value={location.elevation_m}
            onChange={(e) => setLocation({ ...location, elevation_m: parseFloat(e.target.value) || 0 })}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-white focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>
    </div>
  );
}