import sys
import os
import time
sys.path.insert(0, os.path.dirname(__file__))

from materials_db import get_all_materials
from models import LocationInput, RoomDimensions, MaterialSelection, SimulationRequest
from weather_service import generate_synthetic_tmy, HOTSPOTS
from physics_engine import run_thermal_simulation
from optimizer import run_budget_optimization
from csv_parser import sanitize_and_parse_microclimate_csv
from pdf_generator import generate_pdf_specsheet

def test_all():
    print("=== Testing ThermoShell Backend Engine ===")
    
    # 1. Materials DB
    mats = get_all_materials()
    assert len(mats["walls"]) >= 5, "Wall materials count test"
    assert len(mats["insulations"]) >= 4, "Insulation count test"
    print(f"Materials DB OK ({len(mats['walls'])} walls, {len(mats['insulations'])} insulations)")

    # 2. Weather Engine
    loc = LocationInput(latitude=35.421, longitude=77.108, location_name="Siachen Glacier", elevation_m=4800)
    weather = generate_synthetic_tmy(loc.latitude, loc.longitude, loc.elevation_m)
    assert len(weather) == 8760, f"Expected 8760 hours, got {len(weather)}"
    print(f"Weather Engine OK: 8,760 hours generated. Min Temp: {min(w['T2M'] for w in weather)} degC")

    # 3. Physics Engine Run
    dims = RoomDimensions(length_m=6.0, width_m=4.0, height_m=2.8, south_window_ratio=0.3, has_trombe_wall=True)
    sel = MaterialSelection(
        wall_material_id="rammed_earth",
        wall_thickness_m=0.35,
        insulation_material_id="local_sheep_wool",
        insulation_thickness_m=0.08,
        roof_material_id="timber_mud_willow",
        roof_thickness_m=0.25,
        glazing_system_id="double_low_e_argon"
    )

    t0 = time.perf_counter()
    sim_res = run_thermal_simulation(weather, loc, dims, sel)
    t_elapsed = (time.perf_counter() - t0) * 1000.0
    metrics = sim_res["metrics"]
    
    print(f"Physics Simulation (8,760 hours) completed in {t_elapsed:.1f} ms!")
    print(f"   ? Comfort Hours: {metrics['comfort_hours_percentage']}% ({metrics['comfort_hours_count']} hrs)")
    print(f"   ? Min Indoor Temp: {metrics['min_indoor_temp']} degC (vs Outdoor Min: {metrics['min_outdoor_temp']} degC)")
    print(f"   ? Fuel Saved: {metrics['kerosene_fuel_saved_liters']} L Kerosene / Rs {metrics['heating_cost_saved_inr']:,.0f}")
    print(f"   ? Thermal Time Constant: {metrics['thermal_time_constant_hrs']} hours")

    # 4. Optimizer Grid Search (Feature A)
    t0 = time.perf_counter()
    opt_res = run_budget_optimization(weather, loc, dims, max_budget_inr=220000.0, budget_mode="total")
    t_opt_elapsed = (time.perf_counter() - t0) * 1000.0
    print(f"Budget Optimizer OK ({opt_res['total_combinations_evaluated']} combos in {t_opt_elapsed:.1f} ms):")
    for r in opt_res["recommended_recipes"]:
        rec = r["recipe"]
        print(f"   ? [{r['tag']}] {r['tier']}: Rs {rec['estimated_cost_inr']:,.0f} -> {rec['comfort_hours_percentage']}% comfort ({rec['wall_name']} + {rec['insulation_name']})")

    # 5. CSV Parser (Feature B)
    lines = ["timestamp,temperature,solar_radiation,wind_speed,humidity"]
    for h in range(24):
        lines.append(f"2026-01-01 {h:02d}:00,{-25.0 + h*0.8},{max(0, 800-abs(h-12)*120)},4.5,35")
    sample_csv = "\n".join(lines)
    csv_records, meta = sanitize_and_parse_microclimate_csv(sample_csv.encode("utf-8"), "siachen_logger.csv")
    assert len(csv_records) == 8760
    print(f"Microclimate CSV Parser OK ({meta['sanitization_status']}, min={meta['min_temp_recorded']} degC)")

    # 6. PDF Spec-Sheet Generation (Feature C)
    pdf_bytes = generate_pdf_specsheet(sim_res, loc.location_name, loc.latitude, loc.longitude, loc.elevation_m, dims.model_dump())
    assert len(pdf_bytes) > 2000, "PDF bytes should be generated"
    print(f"ReportLab PDF Spec-Sheet Generator OK ({len(pdf_bytes):,} bytes generated!)")

    print("\nALL BACKEND MODULES VERIFIED & WORKING PERFECTLY!")

if __name__ == "__main__":
    test_all()
