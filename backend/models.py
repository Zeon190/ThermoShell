"""
Pydantic Models for ThermoShell API
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class LocationInput(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Latitude in decimal degrees")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Longitude in decimal degrees")
    location_name: Optional[str] = Field("Custom Field Site", description="Human readable location name")
    elevation_m: Optional[float] = Field(3500.0, description="Elevation above sea level in meters")

class RoomDimensions(BaseModel):
    length_m: float = Field(6.0, gt=0, le=50, description="Room length in meters (East-West axis)")
    width_m: float = Field(4.0, gt=0, le=50, description="Room width in meters (North-South axis)")
    height_m: float = Field(2.8, gt=1.5, le=10, description="Room ceiling height in meters")
    south_window_ratio: float = Field(0.25, ge=0.0, le=0.8, description="South wall glazing area ratio (0 to 0.8)")
    north_window_ratio: float = Field(0.05, ge=0.0, le=0.4, description="North wall glazing area ratio")
    east_window_ratio: float = Field(0.08, ge=0.0, le=0.4, description="East wall glazing area ratio")
    west_window_ratio: float = Field(0.08, ge=0.0, le=0.4, description="West wall glazing area ratio")
    has_trombe_wall: bool = Field(True, description="Whether South wall incorporates a passive Trombe thermal storage wall")
    occupants_count: int = Field(4, ge=0, le=50, description="Number of active occupants for internal heat gain")
    air_change_rate: float = Field(0.5, ge=0.1, le=5.0, description="Air infiltration / ventilation rate in ACH (Air Changes per Hour)")

class MaterialSelection(BaseModel):
    wall_material_id: str = Field("rammed_earth", description="Base wall core material ID")
    wall_thickness_m: float = Field(0.35, gt=0.05, le=1.0, description="Wall thickness in meters")
    insulation_material_id: str = Field("local_sheep_wool", description="Insulation material ID")
    insulation_thickness_m: float = Field(0.08, ge=0.0, le=1.0, description="Insulation thickness in meters")
    roof_material_id: str = Field("timber_mud_willow", description="Roof assembly material ID")
    roof_thickness_m: float = Field(0.25, gt=0.05, le=1.0, description="Roof thickness in meters")
    glazing_system_id: str = Field("double_low_e_argon", description="Window glazing system ID")

class SimulationRequest(BaseModel):
    location: LocationInput
    dimensions: RoomDimensions
    materials: MaterialSelection
    comfort_temp_min: float = Field(18.0, description="Minimum comfort temperature in ?C")
    comfort_temp_max: float = Field(24.0, description="Maximum comfort temperature in ?C")
    auxiliary_heating_setpoint: float = Field(16.0, description="Heater trigger temperature for auxiliary load calculation")
    custom_weather_data: Optional[List[Dict[str, Any]]] = None

class BudgetOptimizationRequest(BaseModel):
    location: LocationInput
    dimensions: RoomDimensions
    max_budget_inr: float = Field(250000.0, gt=10000, description="Total budget ceiling in INR")
    budget_mode: str = Field("total", description="'total' for whole shelter or 'per_m2' for cost per floor area")
    prioritize_sustainability: bool = Field(False, description="Whether to favor local low-carbon materials")
    min_comfort_score_target: float = Field(70.0, description="Target minimum comfort hours percentage")

class ThermalMetricSummary(BaseModel):
    comfort_hours_count: int
    comfort_hours_percentage: float
    avg_indoor_temp: float
    min_indoor_temp: float
    max_indoor_temp: float
    avg_outdoor_temp: float
    min_outdoor_temp: float
    max_outdoor_temp: float
    heating_degree_days: float
    auxiliary_heating_kwh_yr: float
    heating_energy_saved_vs_baseline_kwh: float
    kerosene_fuel_saved_liters: float
    heating_cost_saved_inr: float
    co2_emissions_avoided_kg: float
    total_envelope_cost_inr: float
    cost_per_sqm_inr: float
    overall_wall_u_value: float
    overall_roof_u_value: float
    thermal_time_constant_hrs: float

class SimulationResponse(BaseModel):
    status: str
    location: LocationInput
    metrics: ThermalMetricSummary
    hourly_sample_profile: List[Dict[str, Any]] # 24-48h representative sample or downsampled 8760
    monthly_summary: List[Dict[str, Any]]
    diurnal_winter_day: List[Dict[str, Any]] # Peak cold day hourly curve
    diurnal_spring_day: List[Dict[str, Any]]
    diurnal_summer_day: List[Dict[str, Any]]
    materials_breakdown: Dict[str, Any]
    recipe_recommendation: Dict[str, Any]
    climate_profile_warning: Optional[str] = None