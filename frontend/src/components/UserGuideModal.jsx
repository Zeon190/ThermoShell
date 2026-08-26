import React, { useState } from 'react';
import { X, BookOpen } from 'lucide-react';

export default function UserGuideModal({ isOpen, onClose }) {
  const [activeStep, setActiveStep] = useState(null);

  if (!isOpen) return null;

  const details = {
    site: {
      title: "📍 1. Deployment Location & Microclimate",
      desc: "Click anywhere on the map component or select a pre-configured strategic asset like Siachen Glacier Base Camp or Nyoma Military Airbase. The platform auto-loads localized high-altitude climate records to map precise environmental constraints."
    },
    geometry: {
      title: "📐 2. Shelter Geometry & Passive Solar Blueprint",
      desc: "Fine-tune length, width, and height configurations. Balance the South-Facing Solar Glazing Ratio to capture solar heat indices up to 850 W/m² while evaluating occupant loads and infiltration control configurations."
    },
    material: {
      title: "🧱 3. Envelope Material Recipe & Insulation Layers",
      desc: "Layer thermal materials to maximize your thermal lag window. Choose between high thermal mass options like localized Compressed Stabilized Earth Blocks (CSEB) or rapid-deployment military-grade PUF Sandwich walls."
    },
    simulation: {
      title: "⚡ 4. DRDO RC-Network Simulation Engine",
      desc: "Processes localized climate constraints against structural mass matrices to output exact internal temperature curves over 8,760 annual hours without active fuel reliance."
    },
    dashboard: {
      title: "📊 5. Downstream Action Items & Iteration",
      desc: "Analyze your metrics across the Budget Optimizer, download raw Sensor CSV matrices, or bundle layouts into an official PDF spec sheet. If performance metrics drop below design objectives, use the interactive loop to dynamically balance material choices."
    }
  };

  const handleShowDetails = (key) => {
    setActiveStep(key);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <div className="bg-[#111C40] border border-[#1E2D5A] rounded-2xl w-full max-w-5xl p-6 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-4 border-b border-[#1E2D5A]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                ThermoShell Interactive User Guide
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full" style={{marginLeft: '8px'}}>
                  Feature C: Onboarding
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Passive Solar Architecture Matchmaker for High-Altitude Extreme Cold
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="flow-grid">
            <div className="flow-card" onClick={() => handleShowDetails('site')}>
              <div className="step-num">Step 1</div>
              <h3>📍 Deployment Site</h3>
              <ul>
                <li>Select strategic defense outposts</li>
                <li>Interactive tactical grid map</li>
                <li>Automatic microclimate fetching</li>
              </ul>
            </div>

            <div className="flow-card" onClick={() => handleShowDetails('geometry')}>
              <div className="step-num">Step 2</div>
              <h3>📐 Shelter Geometry</h3>
              <ul>
                <li>Configure footprint area & volume</li>
                <li>Set window ratios & orientation</li>
                <li>Integrate Passive Trombe Walls</li>
              </ul>
            </div>

            <div className="flow-card" onClick={() => handleShowDetails('material')}>
              <div className="step-num">Step 3</div>
              <h3>🧱 Material Recipe</h3>
              <ul>
                <li>Select vernacular Ladakh Rammed Earth</li>
                <li>Configure insulation layers & batt</li>
                <li>Optimize glazing & thermal breaks</li>
              </ul>
            </div>

            <div className="flow-card" onClick={() => handleShowDetails('simulation')}>
              <div className="step-num">Step 4</div>
              <h3>⚡ Run Simulation</h3>
              <ul>
                <li>8,760-hour hourly time steps</li>
                <li>RC-Network core analysis engine</li>
                <li>Calculates natural comfort hours</li>
              </ul>
            </div>

            <div className="flow-card" onClick={() => handleShowDetails('dashboard')}>
              <div className="step-num">Step 5</div>
              <h3>📊 Results & Branching</h3>
              <ul>
                <li>Review fuel & logistics savings</li>
                <li>Export 2.5D solar blueprints</li>
                <li>Download sensor CSV & PDF spec</li>
              </ul>
            </div>
          </div>

          <div className="interactive-viewer" id="viewer">
            {activeStep && details[activeStep] ? (
              <div>
                <h3 style={{ color: '#00B4D8', marginTop: 0, fontSize: '16px', fontWeight: 'bold' }}>{details[activeStep].title}</h3>
                <p style={{ color: '#FFFFFF', fontSize: '14px', lineHeight: 1.6, marginBottom: 0 }}>{details[activeStep].desc}</p>
              </div>
            ) : (
              <div className="viewer-placeholder">
                💡 Click on any step above to inspect interactive module features and workflow directions.
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .flow-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          position: relative;
        }
        .flow-card {
          background: rgba(11, 19, 43, 0.6);
          border: 1px solid #1E2D5A;
          border-radius: 8px;
          padding: 16px;
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
        }
        .flow-card:hover {
          border-color: #00B4D8;
          box-shadow: 0 0 15px rgba(0, 180, 216, 0.2);
          transform: translateY(-2px);
        }
        .flow-card.active {
          border-color: #00B4D8;
          background: #162554;
          box-shadow: 0 0 20px rgba(0, 180, 216, 0.4);
        }
        .step-num {
          position: absolute;
          top: 12px;
          right: 12px;
          font-size: 12px;
          font-weight: bold;
          color: #00B4D8;
          background: rgba(0, 180, 216, 0.1);
          padding: 2px 8px;
          border-radius: 12px;
        }
        .flow-card h3 {
          margin: 0 0 10px 0;
          font-size: 15px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .flow-card ul {
          margin: 0;
          padding-left: 20px;
          color: #8FA0C4;
          font-size: 12px;
          line-height: 1.6;
        }
        .interactive-viewer {
          margin-top: 24px;
          background: rgba(11, 19, 43, 0.8);
          border: 1px solid #1E2D5A;
          border-radius: 8px;
          padding: 20px;
          min-height: 120px;
        }
        .viewer-placeholder {
          color: #8FA0C4;
          text-align: center;
          padding: 40px;
        }
        .loop-badge {
          background: rgba(255, 159, 28, 0.1);
          border: 1px dashed #FF9F1C;
          color: #FF9F1C;
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 12px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
      `}</style>
    </div>
  );
}
