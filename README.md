# ThermoShell
### Passive Solar Architecture Matchmaker & High-Altitude Thermal Simulation Engine
**Sponsored by DRDO for Smart India Hackathon 2026**

---

## ?? Executive Problem Statement & Defense/Civilian Impact
In extreme sub-zero high-altitude battlefields (such as **Siachen Glacier (4,800m - 5,400m)**, **Dras (-42?C)**, **Leh (3,524m)**, and **Nyoma LAC Forward Airbase**), soldiers and remote Himalayan communities face severe frostbite, hypothermia, and extreme operational fatigue due to uninsulated shelters. Conventional heating relies on fuel-guzzling diesel/kerosene *Bukhari* stoves, which emit toxic indoor carbon monoxide, require high-risk mountain airlift logistics costing over **?160/liter**, and generate heavy carbon footprints.

**ThermoShell** replaces heavy CAD software with a **rapid, science-backed Passive Solar Architecture Matchmaker**:
1. An engineer clicks an interactive map location (or selects a strategic DRDO defense outpost).
2. Sets shelter rectangular dimensions (Length, Width, Height) and window/Trombe wall layout.
3. Instantly receives an optimized, vernacular/military material recipe (e.g. *35cm Rammed Earth + 8cm Local Changthangi Sheep Wool Batt + Integrated Trombe Wall*) that keeps the room naturally comfortable at **18?C?24?C** without burning fossil fuel!

---

## ??? Architecture & MVP Blueprint

```text
[ Frontend: React 18 + Leaflet Map + Tailwind CSS + Lucide + Recharts ]
                             ?  (Sends Lat/Long, Dimensions, Material Selections)
                             ?
[ Backend: Python FastAPI Core (http://127.0.0.1:8000) ]
       ?                     ?
       ?                     ?
[ NASA POWER Weather API ] [ RC-Network Physics Formula Engine ]
 (Hourly Solar GHI, T2M,   (2R2C Lumped Multi-Zone ODE Solver,
  WS10M, Relative Humidity) 8,760 Hourly Time Steps in < 200 ms)
                             ?
                             ?
[ Outputs: Comfort Score % + Kerosene Saved + INR Saved + CO2 Offset ]
```

---

## ?? Top 3 Next-Level Features Built for SIH 2026

### ?? Feature A: "The Budget-Optimizer Toggle" & Grid Search Matchmaker
- **What it does:** Allows field engineers or NGO relief planners to specify a strict financial ceiling (e.g. *Max ?2,20,000 Total Shelter* or *Max ?4,500/m?*).
- **The Tech:** Runs a high-speed Two-Stage Pareto Grid Search algorithm evaluating thousands of material combinations across walls, insulations, roofs, and glazings. Generates 3 curated packages:
  1. **Budget Optimized Champion**: Peak comfort strictly within budget.
  2. **DRDO Arctic Fortress**: Maximum military thermal retention and insulation thickness for high-risk survival.
  3. **Himalayan Zero-Carbon Vernacular**: 100% locally sourced Ladakhi Rammed Earth + Changthangi Sheep Wool.

### ?? Feature B: Local Microclimate CSV Overrides & Sanitizer
- **What it does:** NASA satellite data can occasionally smooth out deep valley mountain shadows or glacier microclimates. Users can drag & drop raw on-site thermocouple/weather logger CSV files.
- **The Tech:** Automatically detects temperature, solar, wind, and humidity columns, sanitizes physical sensor anomalies, interpolates gaps, and overrides the simulation timeline instantaneously.

### ?? Feature C: Automated Engineering PDF Spec-Sheet Engine
- **What it does:** Remote soldiers and engineers deployed on high glaciers operate without internet connectivity.
- **The Tech:** Utilizes Python `reportlab` vector compilation to build an official, downloadable **DRDO-Compliant Engineering Blueprint PDF Spec Sheet** complete with 2D architectural blueprint drawings, full Bill of Materials (BOM), thermal R-values, annual fuel savings metrics, and verification seals.

---

## ?? Comprehensive Material Catalog (Materials Database)
- **Walls:** Ladakh Rammed Earth (k=0.85, 8?10h thermal lag), Compressed Stabilized Earth Blocks (CSEB), DRDO Modular PUF Sandwich Panels (k=0.024), AAC Blocks, Granite Masonry, Straw Bale.
- **Insulation:** Changthangi Indigenous Sheep Wool Batts (k=0.038, 100% bio-sustainable), Expanded Polystyrene (EPS), Extruded Polystyrene (XPS), High-Density Rockwool, Military Aerogel Blankets (k=0.015).
- **Roofs:** Ladakhi Timber Beam + Willow + Mud Layer, Sloped Insulated CGI Panels, DRDO PUF Roof Panels, Over-Slab Insulated RCC.
- **Glazing & Passive Solar:** Double Low-E Argon (U=1.4), Triple Low-E Krypton (U=0.75), Multiwall Polycarbonate, Integrated South Trombe Storage Walls.

---

## ?? How to Run ThermoShell

### 1. One-Click Automated Launcher
Run the master startup script from the project root:
```bash
python run_app.py
```
This starts both the FastAPI backend (`http://127.0.0.1:8000`) and the Vite React frontend (`http://localhost:5173`) and automatically opens the dashboard in your default browser.

### 2. Manual Startup (Optional)

**Backend:**
```bash
cd backend
python main.py
```

**Frontend:**
```bash
cd frontend
npm.cmd run dev
```

---

## ?? Repository Structure
```text
ThermoShell/
??? run_app.py                     # Single-command launcher
??? README.md                      # Comprehensive technical & pitch documentation
??? sample_data/                   # Realistic test logger CSV datasets
?   ??? siachen_base_camp_logger.csv
?   ??? dras_valley_extreme_cold_logger.csv
?   ??? leh_solar_high_altitude_logger.csv
??? backend/
?   ??? main.py                    # FastAPI routes & endpoints
?   ??? models.py                  # Pydantic models for simulation & optimization
?   ??? materials_db.py            # Comprehensive high-altitude materials database
?   ??? weather_service.py         # NASA POWER API integration + TMY synthesizer
?   ??? physics_engine.py          # 8,760h Lumped RC-network thermodynamic solver
?   ??? optimizer.py               # Feature A: Grid Search budget optimizer
?   ??? csv_parser.py              # Feature B: Microclimate CSV sanitizer
?   ??? pdf_generator.py           # Feature C: ReportLab vector PDF spec sheet generator
?   ??? test_run.py                # Unit test verification suite
??? frontend/
    ??? package.json
    ??? vite.config.js
    ??? tailwind.config.js
    ??? index.html
    ??? src/
        ??? api.js                 # API communication layer
        ??? App.jsx                # Main interface & state container
        ??? components/
            ??? Navbar.jsx
            ??? MapSelector.jsx     # Leaflet interactive map & defense hotspots
            ??? BlueprintDesigner.jsx # Room geometry & Trombe wall settings
            ??? MaterialPicker.jsx  # Envelope layer selectors & thermal properties
            ??? SimulationDashboard.jsx # Comfort score gauge & impact metrics
            ??? ThermalChart.jsx    # Dynamic Recharts thermal curves & diurnal cycles
            ??? BudgetOptimizerModal.jsx # Feature A modal
            ??? MicroclimateUploader.jsx # Feature B modal
            ??? PdfExportModal.jsx  # Feature C modal
            ??? Shelter3DViewer.jsx # 2.5D Isometric solar simulation visualizer
```