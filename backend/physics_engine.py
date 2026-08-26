"""
ThermoShell RC-Network Lumped Parameter Physics Engine
Fast, accurate discrete thermodynamic simulation for extreme cold and high-altitude environments.
"""

import math
import numpy as np
from typing import Dict, Any, List
from materials_db import WALL_MATERIALS, INSULATION_MATERIALS, ROOF_MATERIALS, GLAZING_SYSTEMS
from models import RoomDimensions, MaterialSelection, LocationInput

def calculate_solar_irradiance_on_facades(
    ghi: float,
    solar_hour_angle: float,
    lat_deg: float,
    declination_deg: float,
    ground_albedo: float = 0.65
) -> Dict[str, float]:
    if ghi <= 0.0:
        return {"south": 0.0, "north": 0.0, "east": 0.0, "west": 0.0, "roof": 0.0}

    lat_rad = math.radians(lat_deg)
    dec_rad = math.radians(declination_deg)
    sha_rad = math.radians(solar_hour_angle)

    cos_zenith = math.sin(lat_rad) * math.sin(dec_rad) + math.cos(lat_rad) * math.cos(dec_rad) * math.cos(sha_rad)
    cos_zenith = max(0.001, min(1.0, cos_zenith))
    zenith_angle = math.acos(cos_zenith)
    solar_elevation = max(0.0, math.pi / 2.0 - zenith_angle)

    if solar_elevation <= 0.02:
        return {"south": 0.0, "north": 0.0, "east": 0.0, "west": 0.0, "roof": 0.0}

    sin_azimuth = (math.cos(dec_rad) * math.sin(sha_rad)) / max(0.05, math.cos(solar_elevation))
    sin_azimuth = max(-1.0, min(1.0, sin_azimuth))
    cos_azimuth = (math.sin(solar_elevation) * math.sin(lat_rad) - math.sin(dec_rad)) / max(0.05, math.cos(solar_elevation) * math.cos(lat_rad))
    cos_azimuth = max(-1.0, min(1.0, cos_azimuth))
    azimuth_rad = math.atan2(sin_azimuth, cos_azimuth)

    diffuse_ratio = max(0.12, min(0.85, 0.90 - 0.65 * (ghi / 1100.0)))
    dhi = ghi * diffuse_ratio
    dni = max(0.0, (ghi - dhi) / cos_zenith)

    # South Facade
    cos_theta_south = math.cos(solar_elevation) * math.cos(azimuth_rad)
    i_beam_south = dni * max(0.0, cos_theta_south)
    i_diffuse_south = dhi * 0.5 + ghi * ground_albedo * 0.5
    i_south = i_beam_south + i_diffuse_south

    # North Facade
    cos_theta_north = math.cos(solar_elevation) * math.cos(azimuth_rad - math.pi)
    i_beam_north = dni * max(0.0, cos_theta_north)
    i_diffuse_north = dhi * 0.5 + ghi * ground_albedo * 0.5
    i_north = i_beam_north + i_diffuse_north

    # East Facade
    cos_theta_east = math.cos(solar_elevation) * math.cos(azimuth_rad + math.pi / 2.0)
    i_beam_east = dni * max(0.0, cos_theta_east)
    i_diffuse_east = dhi * 0.5 + ghi * ground_albedo * 0.5
    i_east = i_beam_east + i_diffuse_east

    # West Facade
    cos_theta_west = math.cos(solar_elevation) * math.cos(azimuth_rad - math.pi / 2.0)
    i_beam_west = dni * max(0.0, cos_theta_west)
    i_diffuse_west = dhi * 0.5 + ghi * ground_albedo * 0.5
    i_west = i_beam_west + i_diffuse_west

    return {
        "south": max(0.0, i_south),
        "north": max(0.0, i_north),
        "east": max(0.0, i_east),
        "west": max(0.0, i_west),
        "roof": max(0.0, ghi)
    }

def run_thermal_simulation(
    weather_data: List[Dict[str, Any]],
    location: LocationInput,
    dim: RoomDimensions,
    mat: MaterialSelection,
    comfort_min: float = 18.0,
    comfort_max: float = 24.0,
    heating_setpoint: float = 16.0
) -> Dict[str, Any]:
    wall_info = WALL_MATERIALS.get(mat.wall_material_id, WALL_MATERIALS["rammed_earth"])
    ins_info = INSULATION_MATERIALS.get(mat.insulation_material_id, INSULATION_MATERIALS["local_sheep_wool"])
    roof_info = ROOF_MATERIALS.get(mat.roof_material_id, ROOF_MATERIALS["timber_mud_willow"])
    glaz_info = GLAZING_SYSTEMS.get(mat.glazing_system_id, GLAZING_SYSTEMS["double_low_e_argon"])

    L = dim.length_m
    W = dim.width_m
    H = dim.height_m
    floor_area = L * W
    volume = L * W * H

    area_south_gross = L * H
    area_north_gross = L * H
    area_east_gross = W * H
    area_west_gross = W * H
    total_wall_gross = 2 * (L + W) * H
    area_roof = floor_area
    area_floor = floor_area

    area_win_south = area_south_gross * dim.south_window_ratio
    area_win_north = area_north_gross * dim.north_window_ratio
    area_win_east = area_east_gross * dim.east_window_ratio
    area_win_west = area_west_gross * dim.west_window_ratio
    total_win_area = area_win_south + area_win_north + area_win_east + area_win_west

    area_wall_south_net = max(0.0, area_south_gross - area_win_south)
    area_wall_north_net = max(0.0, area_north_gross - area_win_north)
    area_wall_east_net = max(0.0, area_east_gross - area_win_east)
    area_wall_west_net = max(0.0, area_west_gross - area_win_west)
    total_opaque_wall_area = area_wall_south_net + area_wall_north_net + area_wall_east_net + area_wall_west_net

    R_si = 0.13
    R_se = 0.04

    # Wall R & U
    R_wall_core = mat.wall_thickness_m / wall_info["conductivity"]
    R_wall_ins = (mat.insulation_thickness_m / ins_info["conductivity"]) if mat.insulation_thickness_m > 0 else 0.0
    R_wall_total = R_si + R_wall_core + R_wall_ins + R_se
    U_wall = 1.0 / R_wall_total

    # Roof R & U
    R_roof_core = mat.roof_thickness_m / roof_info["conductivity"]
    R_roof_ins = (mat.insulation_thickness_m * 1.25 / ins_info["conductivity"]) if mat.insulation_thickness_m > 0 else 0.0
    R_roof_total = R_si + R_roof_core + R_roof_ins + R_se
    U_roof = 1.0 / R_roof_total

    # Ground floor U-value (damped ground coupling)
    U_floor = 0.32 if mat.insulation_thickness_m > 0.04 else 0.75
    U_glaz = glaz_info["u_value"]
    SHGC = glaz_info["shgc"]

    # Thermal Mass (J/K)
    c_wall_core = total_opaque_wall_area * mat.wall_thickness_m * wall_info["density"] * wall_info["specific_heat"]
    c_roof_core = area_roof * mat.roof_thickness_m * roof_info["density"] * roof_info["specific_heat"]

    elev_m = location.elevation_m or 3500.0
    air_density = 1.225 * math.exp(-elev_m / 8500.0) # ~0.80 kg/m?
    c_air = volume * air_density * 1005.0

    # Effective Thermal Capacitance (J/K)
    C_eff = (0.45 * c_wall_core) + (0.40 * c_roof_core) + c_air + (floor_area * 20000.0)

    UA_env = (U_wall * total_opaque_wall_area) + (U_roof * area_roof) + (U_floor * area_floor) + (U_glaz * total_win_area)
    H_inf_base = (dim.air_change_rate * volume * air_density * 1005.0) / 3600.0
    UA_total = UA_env + H_inf_base
    time_constant_hrs = (C_eff / max(1.0, UA_total)) / 3600.0

    # Costs
    wall_cost = total_wall_gross * (wall_info["cost_per_m2_default"] * (mat.wall_thickness_m / wall_info["default_thickness"]))
    ins_cost = (total_wall_gross + area_roof) * (ins_info["cost_per_m2_default"] * (mat.insulation_thickness_m / ins_info["default_thickness"] if ins_info["default_thickness"] > 0 else 1.0))
    roof_cost = area_roof * (roof_info["cost_per_m2_default"] * (mat.roof_thickness_m / roof_info["default_thickness"]))
    window_cost = total_win_area * glaz_info["cost_per_m2"]
    trombe_addon = 35000.0 if dim.has_trombe_wall else 0.0

    total_envelope_cost = round(wall_cost + ins_cost + roof_cost + window_cost + trombe_addon, 2)
    cost_per_sqm = round(total_envelope_cost / max(1.0, floor_area), 2)

    # Baseline Comparison (Uninsulated military canvas / tin shelter)
    UA_baseline = (4.2 * (total_wall_gross + area_roof)) + (1.6 * area_floor) + ((2.5 * volume * air_density * 1005.0) / 3600.0)

    # Simulation arrays
    num_hours = len(weather_data)
    t_indoor = np.zeros(num_hours)
    t_solair_south = np.zeros(num_hours)
    aux_heating_watts = np.zeros(num_hours)
    baseline_heating_watts = np.zeros(num_hours)

    # Warm initial spin-up condition
    avg_annual_out = np.mean([w["T2M"] for w in weather_data])
    curr_t_in = max(18.0, avg_annual_out + 20.0)

    trombe_buffer = np.zeros(8)
    alpha_wall = wall_info["solar_absorptance"]
    h_out = 18.0
    dt_sec = 3600.0

    q_internal = (dim.occupants_count * 90.0) + 150.0

    for i in range(num_hours):
        record = weather_data[i]
        t_out = record["T2M"]
        ghi = record["ALLSKY_SFC_SW_DWN"]
        hour = record["hour"]
        doy = record["day_of_year"]

        declination = 23.45 * math.sin(math.radians(360 * (284 + doy) / 365.0))
        sha = (hour - 12.0) * 15.0

        facades_solar = calculate_solar_irradiance_on_facades(ghi, sha, location.latitude, declination)
        i_south = facades_solar["south"]
        i_north = facades_solar["north"]
        i_east = facades_solar["east"]
        i_west = facades_solar["west"]
        i_roof = facades_solar["roof"]

        # Sol-Air Temperatures
        delta_R = 12.0 / h_out
        t_sa_south = t_out + (alpha_wall * i_south / h_out) - delta_R
        t_sa_north = t_out + (alpha_wall * i_north / h_out) - delta_R
        t_sa_east = t_out + (alpha_wall * i_east / h_out) - delta_R
        t_sa_west = t_out + (alpha_wall * i_west / h_out) - delta_R
        t_sa_roof = t_out + (roof_info.get("solar_absorptance", 0.6) * i_roof / h_out) - delta_R
        
        t_solair_south[i] = t_sa_south

        # Window Solar Gain (High transmission into room mass)
        q_sol_win = (
            (area_win_south * i_south) +
            (area_win_north * i_north) +
            (area_win_east * i_east) +
            (area_win_west * i_west)
        ) * SHGC * 0.85

        # Trombe Wall Solar Storage & Thermo-Siphon
        q_trombe_released = 0.0
        if dim.has_trombe_wall:
            trombe_collector_area = area_wall_south_net * 0.70
            q_trombe_direct = trombe_collector_area * i_south * 0.70 * 0.25
            q_trombe_stored = trombe_collector_area * i_south * 0.70 * 0.45
            trombe_buffer[i % 8] = q_trombe_stored
            delayed_heat = np.mean(trombe_buffer)
            q_trombe_released = q_trombe_direct + delayed_heat

        # Wind-adjusted infiltration
        ws = record.get("WS10M", 3.0)
        ach_dynamic = dim.air_change_rate * (1.0 + 0.06 * max(0.0, ws - 2.0))
        H_inf = (ach_dynamic * volume * air_density * 1005.0) / 3600.0

        # Conduction Heat Fluxes
        q_cond_south = U_wall * area_wall_south_net * (t_sa_south - curr_t_in)
        q_cond_north = U_wall * area_wall_north_net * (t_sa_north - curr_t_in)
        q_cond_east = U_wall * area_wall_east_net * (t_sa_east - curr_t_in)
        q_cond_west = U_wall * area_wall_west_net * (t_sa_west - curr_t_in)
        q_cond_roof = U_roof * area_roof * (t_sa_roof - curr_t_in)
        q_cond_floor = U_floor * area_floor * (max(4.0, t_out * 0.3 + 8.0) - curr_t_in)
        q_cond_win = U_glaz * total_win_area * (t_out - curr_t_in)
        q_inf = H_inf * (t_out - curr_t_in)

        # Net thermal heat rate into interior (Watts)
        q_net = (
            q_cond_south + q_cond_north + q_cond_east + q_cond_west +
            q_cond_roof + q_cond_floor + q_cond_win + q_inf +
            q_sol_win + q_internal + q_trombe_released
        )

        curr_t_in = curr_t_in + (q_net / C_eff) * dt_sec
        # Prevent extreme unphysical numerical oscillations
        curr_t_in = max(-25.0, min(36.0, curr_t_in))
        t_indoor[i] = round(curr_t_in, 2)

        # Auxiliary Heating Requirement
        if curr_t_in < heating_setpoint:
            needed_heat = (heating_setpoint - curr_t_in) * UA_total
            aux_heating_watts[i] = max(0.0, needed_heat)

        # Baseline Tent Heat Requirement
        t_tent_est = t_out + (q_internal / UA_baseline)
        if t_tent_est < heating_setpoint:
            baseline_heating_watts[i] = (heating_setpoint - t_tent_est) * UA_baseline

    comfort_mask = (t_indoor >= comfort_min) & (t_indoor <= comfort_max)
    comfort_hours = int(np.sum(comfort_mask))
    comfort_pct = round((comfort_hours / num_hours) * 100.0, 1)

    climate_profile_warning = None
    if location.elevation_m < 1000 or location.latitude < 25.0:
        climate_profile_warning = "tropical_overheating"

    t_out_arr = np.array([w["T2M"] for w in weather_data])
    hdd = round(float(np.sum(np.maximum(0.0, 18.0 - t_out_arr)) / 24.0), 1)

    aux_kwh = round(float(np.sum(aux_heating_watts)) / 1000.0, 1)
    baseline_kwh = round(float(np.sum(baseline_heating_watts)) / 1000.0, 1)
    kwh_saved = max(0.0, round(baseline_kwh - aux_kwh, 1))

    # Kerosene / Diesel Fuel Saved (High Altitude Logistics)
    kerosene_saved_liters = round(kwh_saved * 0.1582, 1)
    fuel_cost_per_liter = 160.0
    cost_saved_inr = round(kerosene_saved_liters * fuel_cost_per_liter, 2)
    co2_saved_kg = round(kerosene_saved_liters * 2.68, 1)

    # Monthly Aggregates
    monthly_data = []
    months_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    for m in range(1, 13):
        m_mask = np.array([w["month"] == m for w in weather_data])
        if np.any(m_mask):
            m_tin = t_indoor[m_mask]
            m_tout = t_out_arr[m_mask]
            m_comfort = np.sum((m_tin >= comfort_min) & (m_tin <= comfort_max))
            m_total_hrs = len(m_tin)
            monthly_data.append({
                "month": months_names[m-1],
                "avg_indoor_temp": round(float(np.mean(m_tin)), 1),
                "min_indoor_temp": round(float(np.min(m_tin)), 1),
                "max_indoor_temp": round(float(np.max(m_tin)), 1),
                "avg_outdoor_temp": round(float(np.mean(m_tout)), 1),
                "min_outdoor_temp": round(float(np.min(m_tout)), 1),
                "comfort_percent": round((m_comfort / max(1, m_total_hrs)) * 100.0, 1),
                "aux_heating_kwh": round(float(np.sum(aux_heating_watts[m_mask])) / 1000.0, 1)
            })

    # Diurnal Profiles (Safe Indexing)
    winter_start = min(14 * 24, max(0, num_hours - 24))
    diurnal_winter = []
    for h in range(min(24, num_hours)):
        idx = min(winter_start + h, num_hours - 1)
        diurnal_winter.append({
            "hour": h,
            "hour_label": f"{h:02d}:00",
            "indoor_temp": float(t_indoor[idx]),
            "outdoor_temp": float(t_out_arr[idx]),
            "solair_south": float(t_solair_south[idx]),
            "solar_radiation": float(weather_data[idx]["ALLSKY_SFC_SW_DWN"]),
            "comfort_min": comfort_min,
            "comfort_max": comfort_max
        })

    spring_start = min(104 * 24, max(0, num_hours - 24))
    diurnal_spring = []
    for h in range(min(24, num_hours)):
        idx = min(spring_start + h, num_hours - 1)
        diurnal_spring.append({
            "hour": h,
            "hour_label": f"{h:02d}:00",
            "indoor_temp": float(t_indoor[idx]),
            "outdoor_temp": float(t_out_arr[idx]),
            "solair_south": float(t_solair_south[idx]),
            "solar_radiation": float(weather_data[idx]["ALLSKY_SFC_SW_DWN"]),
            "comfort_min": comfort_min,
            "comfort_max": comfort_max
        })

    # Downsampled timeline for charts
    step = max(1, num_hours // 730)
    hourly_sample = []
    for idx in range(0, num_hours, step):
        hourly_sample.append({
            "hour_index": idx,
            "day": weather_data[idx]["day_of_year"],
            "month": weather_data[idx]["month"],
            "hour": weather_data[idx]["hour"],
            "indoor_temp": float(t_indoor[idx]),
            "outdoor_temp": float(t_out_arr[idx]),
            "solair_temp": float(t_solair_south[idx]),
            "solar_radiation": float(weather_data[idx]["ALLSKY_SFC_SW_DWN"])
        })

    metrics = {
        "comfort_hours_count": comfort_hours,
        "comfort_hours_percentage": comfort_pct,
        "avg_indoor_temp": round(float(np.mean(t_indoor)), 1),
        "min_indoor_temp": round(float(np.min(t_indoor)), 1),
        "max_indoor_temp": round(float(np.max(t_indoor)), 1),
        "avg_outdoor_temp": round(float(np.mean(t_out_arr)), 1),
        "min_outdoor_temp": round(float(np.min(t_out_arr)), 1),
        "max_outdoor_temp": round(float(np.max(t_out_arr)), 1),
        "heating_degree_days": hdd,
        "auxiliary_heating_kwh_yr": aux_kwh,
        "heating_energy_saved_vs_baseline_kwh": kwh_saved,
        "kerosene_fuel_saved_liters": kerosene_saved_liters,
        "heating_cost_saved_inr": cost_saved_inr,
        "co2_emissions_avoided_kg": co2_saved_kg,
        "total_envelope_cost_inr": total_envelope_cost,
        "cost_per_sqm_inr": cost_per_sqm,
        "overall_wall_u_value": round(U_wall, 3),
        "overall_roof_u_value": round(U_roof, 3),
        "thermal_time_constant_hrs": round(time_constant_hrs, 1)
    }

    materials_breakdown = {
        "wall": {
            "name": wall_info["name"],
            "thickness_cm": round(mat.wall_thickness_m * 100, 1),
            "u_value": round(U_wall, 3),
            "r_value": round(R_wall_total, 2),
            "cost_inr": round(wall_cost, 0),
            "embodied_carbon_kg": round(total_wall_gross * wall_info["embodied_carbon"], 1)
        },
        "insulation": {
            "name": ins_info["name"],
            "thickness_cm": round(mat.insulation_thickness_m * 100, 1),
            "r_value": round(R_wall_ins, 2),
            "cost_inr": round(ins_cost, 0),
            "sustainability_tag": "Zero Carbon Local" if "wool" in ins_info["id"] else "Standard Insulation"
        },
        "roof": {
            "name": roof_info["name"],
            "thickness_cm": round(mat.roof_thickness_m * 100, 1),
            "u_value": round(U_roof, 3),
            "r_value": round(R_roof_total, 2),
            "cost_inr": round(roof_cost, 0)
        },
        "glazing": {
            "name": glaz_info["name"],
            "u_value": glaz_info["u_value"],
            "shgc": glaz_info["shgc"],
            "area_m2": round(total_win_area, 2),
            "cost_inr": round(window_cost, 0)
        },
        "trombe_wall": {
            "active": dim.has_trombe_wall,
            "type": "Passive South Thermal Mass Storage Wall",
            "heat_contribution": "6-8h delayed night radiant heat" if dim.has_trombe_wall else "None"
        }
    }

    return {
        "status": "success",
        "metrics": metrics,
        "hourly_sample_profile": hourly_sample,
        "monthly_summary": monthly_data,
        "diurnal_winter_day": diurnal_winter,
        "diurnal_spring_day": diurnal_spring,
        "materials_breakdown": materials_breakdown,
        "recipe_recommendation": {
            "title": f"Passive Thermal Envelope for {location.location_name or 'Site'}",
            "headline": f"Maintains {comfort_pct}% Annual Natural Comfort without Fuel Burn",
            "summary": f"Using {wall_info['name']} ({mat.wall_thickness_m*100:.0f}cm) combined with {ins_info['name']} ({mat.insulation_thickness_m*100:.0f}cm) creates an R-{R_wall_total:.1f} envelope with a {time_constant_hrs:.1f}-hour thermal lag, saving {kerosene_saved_liters:,.0f} Liters of high-altitude defense heating fuel every winter."
        },
        "climate_profile_warning": climate_profile_warning
    }