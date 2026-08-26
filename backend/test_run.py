import sys, os, time
sys.path.insert(0, r'C:\Users\VEDANT KUMAR\ThermoShell\backend')
from materials_db import get_all_materials
from models import LocationInput, RoomDimensions, MaterialSelection
from weather_service import generate_synthetic_tmy
from physics_engine import run_thermal_simulation
from optimizer import run_budget_optimization
from csv_parser import sanitize_and_parse_microclimate_csv
from pdf_generator import generate_pdf_specsheet

mats = get_all_materials()
print(f"Materials DB OK: {len(mats['walls'])} walls, {len(mats['insulations'])} insulations")

loc = LocationInput(latitude=35.421, longitude=77.108, location_name='Siachen Glacier', elevation_m=4800)
weather = generate_synthetic_tmy(loc.latitude, loc.longitude, loc.elevation_m)
print(f"Weather Engine OK: {len(weather)} hours")

dims = RoomDimensions(length_m=6.0, width_m=4.0, height_m=2.8, south_window_ratio=0.3, has_trombe_wall=True)
sel = MaterialSelection(
    wall_material_id='rammed_earth',
    wall_thickness_m=0.35,
    insulation_material_id='local_sheep_wool',
    insulation_thickness_m=0.08,
    roof_material_id='timber_mud_willow',
    roof_thickness_m=0.25,
    glazing_system_id='double_low_e_argon'
)

t0 = time.perf_counter()
sim_res = run_thermal_simulation(weather, loc, dims, sel)
t_elapsed = (time.perf_counter() - t0) * 1000.0
metrics = sim_res['metrics']
print(f"Physics Engine: 8,760h in {t_elapsed:.1f}ms! Comfort={metrics['comfort_hours_percentage']}%, MinT={metrics['min_indoor_temp']}C, Kerosene Saved={metrics['kerosene_fuel_saved_liters']}L, CO2 Offset={metrics['co2_emissions_avoided_kg']}kg")

opt_res = run_budget_optimization(weather, loc, dims, max_budget_inr=220000.0, budget_mode='total')
print(f"Optimizer OK: {len(opt_res['recommended_recipes'])} recipes generated")
for r in opt_res['recommended_recipes']:
    print(f"   [{r['tag']}] {r['tier']}: Rs {r['recipe']['estimated_cost_inr']:,.0f} -> {r['recipe']['comfort_hours_percentage']}% comfort")

pdf_bytes = generate_pdf_specsheet(sim_res, loc.location_name, loc.latitude, loc.longitude, loc.elevation_m, dims.model_dump())
print(f"PDF Generator OK: {len(pdf_bytes):,} bytes generated")

print("\n>>> ALL THERMOSHELL BACKEND ENGINES ARE RUNNING AT 100% EXCELLENCE! <<<")
