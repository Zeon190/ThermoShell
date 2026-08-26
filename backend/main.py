"""
ThermoShell FastAPI Application
Passive Solar Architecture Matchmaker & High-Altitude Thermal Simulation Engine (DRDO / SIH 2026)
"""

import io
from fastapi import FastAPI, HTTPException, UploadFile, File, Response, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from models import (
    SimulationRequest,
    SimulationResponse,
    BudgetOptimizationRequest,
    LocationInput,
    RoomDimensions,
    MaterialSelection
)
from materials_db import get_all_materials, WALL_MATERIALS, INSULATION_MATERIALS, ROOF_MATERIALS, GLAZING_SYSTEMS
from weather_service import fetch_nasa_power_weather, HOTSPOTS
from physics_engine import run_thermal_simulation
from optimizer import run_budget_optimization
from auto_optimizer import run_auto_optimize
from csv_parser import sanitize_and_parse_microclimate_csv
from pdf_generator import generate_pdf_specsheet

app = FastAPI(
    title="ThermoShell API",
    description="DRDO Passive Solar Architecture Matchmaker & RC-Network Physics Simulation Engine",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://thermoshell-6i51.vercel.app",
        "https://thermoshell-6i51-git-main-ace-3a40.vercel.app",
        "https://thermoshell-6i5l-2vc1ulcre-ace-3a40.vercel.app"
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check():
    return {
        "status": "online",
        "service": "ThermoShell RC-Network Simulation Core",
        "sponsored_by": "DRDO Smart India Hackathon 2026",
        "version": "1.0.0"
    }

@app.get("/api/materials")
async def get_materials_catalog():
    return get_all_materials()

@app.get("/api/hotspots")
async def get_strategic_hotspots():
    return HOTSPOTS

@app.post("/api/simulate", response_model=SimulationResponse)
async def simulate_shelter_thermal_dynamics(req: SimulationRequest):
    try:
        # Check if custom weather was supplied or fetch from NASA POWER
        if req.custom_weather_data and len(req.custom_weather_data) >= 8760:
            weather_data = req.custom_weather_data
        else:
            weather_data = await fetch_nasa_power_weather(
                lat=req.location.latitude,
                lon=req.location.longitude,
                elevation_m=req.location.elevation_m or 3500.0
            )

        sim_result = run_thermal_simulation(
            weather_data=weather_data,
            location=req.location,
            dim=req.dimensions,
            mat=req.materials,
            comfort_min=req.comfort_temp_min,
            comfort_max=req.comfort_temp_max,
            heating_setpoint=req.auxiliary_heating_setpoint
        )

        return SimulationResponse(
            status="success",
            location=req.location,
            metrics=sim_result["metrics"],
            hourly_sample_profile=sim_result["hourly_sample_profile"],
            monthly_summary=sim_result["monthly_summary"],
            diurnal_winter_day=sim_result["diurnal_winter_day"],
            diurnal_spring_day=sim_result["diurnal_spring_day"],
            diurnal_summer_day=sim_result.get("diurnal_spring_day", []), # reuse or summer
            materials_breakdown=sim_result["materials_breakdown"],
            recipe_recommendation=sim_result["recipe_recommendation"],
            climate_profile_warning=sim_result.get("climate_profile_warning")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(e)}")

@app.post("/api/auto-optimize")
async def auto_optimize_envelope(req: SimulationRequest):
    """
    Automated Optimization Routine for failing envelope recipes (0-30% comfort).
    Returns corrected high-performance material configuration.
    """
    try:
        if req.custom_weather_data and len(req.custom_weather_data) >= 8760:
            weather_data = req.custom_weather_data
        else:
            weather_data = await fetch_nasa_power_weather(
                lat=req.location.latitude,
                lon=req.location.longitude,
                elevation_m=req.location.elevation_m or 3500.0
            )

        result = run_auto_optimize(
            location=req.location,
            dimensions=req.dimensions,
            materials=req.materials,
            weather_data=weather_data
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Auto-optimization error: {str(e)}")

@app.post("/api/optimize-budget")
async def optimize_materials_for_budget(req: BudgetOptimizationRequest):
    """
    Feature A: Budget-Optimizer Grid Search over material combinations.
    """
    try:
        weather_data = await fetch_nasa_power_weather(
            lat=req.location.latitude,
            lon=req.location.longitude,
            elevation_m=req.location.elevation_m or 3500.0
        )

        opt_result = run_budget_optimization(
            weather_data=weather_data,
            location=req.location,
            dimensions=req.dimensions,
            max_budget_inr=req.max_budget_inr,
            budget_mode=req.budget_mode,
            prioritize_sustainability=req.prioritize_sustainability
        )
        return opt_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optimization error: {str(e)}")

@app.post("/api/upload-microclimate-csv")
async def upload_microclimate_csv(
    file: UploadFile = File(...)
):
    """
    Feature B: Local Microclimate CSV Overrides.
    """
    try:
        file_bytes = await file.read()
        records_8760, meta = sanitize_and_parse_microclimate_csv(file_bytes, filename=file.filename)
        return {
            "status": "success",
            "metadata": meta,
            "weather_records_sample": records_8760[:48],
            "weather_records_8760": records_8760
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"CSV processing failed: {str(e)}")

@app.post("/api/generate-pdf-spec")
async def export_specsheet_pdf(req: SimulationRequest):
    """
    Feature C: High-Impact PDF Spec-Sheet Generation with ReportLab.
    """
    try:
        if req.custom_weather_data and len(req.custom_weather_data) >= 8760:
            weather_data = req.custom_weather_data
        else:
            weather_data = await fetch_nasa_power_weather(
                lat=req.location.latitude,
                lon=req.location.longitude,
                elevation_m=req.location.elevation_m or 3500.0
            )

        sim_result = run_thermal_simulation(
            weather_data=weather_data,
            location=req.location,
            dim=req.dimensions,
            mat=req.materials,
            comfort_min=req.comfort_temp_min,
            comfort_max=req.comfort_temp_max,
            heating_setpoint=req.auxiliary_heating_setpoint
        )

        pdf_bytes = generate_pdf_specsheet(
            sim_data=sim_result,
            location_name=req.location.location_name or "High-Altitude Defense Outpost",
            lat=req.location.latitude,
            lon=req.location.longitude,
            elevation_m=req.location.elevation_m or 3500.0,
            dims=req.dimensions.model_dump()
        )

        filename = f"ThermoShell_SpecSheet_{req.location.location_name.replace(' ', '_') if req.location.location_name else 'Site'}.pdf"
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
