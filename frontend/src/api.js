/**
 * ThermoShell API Client
 * Seamless communication with FastAPI backend
 */
const API_BASE =
  'https://thermoshell-uap9-git-main-ace-3a40.vercel.app/api/';
export async function fetchMaterialsCatalog() {
  try {
    const res = await fetch(`${API_BASE}/materials`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, using fallback catalog', err);
    return null;
  }
}

export async function fetchHotspots() {
  try {
    const res = await fetch(`${API_BASE}/hotspots`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, using fallback hotspots', err);
    return null;
  }
}

export async function runSimulation(payload) {
  const res = await fetch(`${API_BASE}/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Simulation failed: ${errText}`);
  }
  return await res.json();
}

export async function runBudgetOptimization(payload) {
  const res = await fetch(`${API_BASE}/optimize-budget`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Optimization failed: ${errText}`);
  }
  return await res.json();
}

export async function runAutoOptimize(payload) {
  const res = await fetch(`${API_BASE}/auto-optimize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Auto-optimization failed: ${errText}`);
  }
  return await res.json();
}

export async function uploadMicroclimateCsv(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/upload-microclimate-csv`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`CSV Upload failed: ${errText}`);
  }
  return await res.json();
}

export async function downloadSpecsheetPdf(payload) {
  const res = await fetch(`${API_BASE}/generate-pdf-spec`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('PDF Generation failed');
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ThermoShell_SpecSheet_${payload.location?.location_name?.replace(/\s+/g, '_') || 'Deployment'}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
