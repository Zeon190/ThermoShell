"""
NASA POWER API Weather Integration & High-Altitude Synthetic Meteorological Engine
Provides 8,760 hours of hourly T2M (temperature), ALLSKY_SFC_SW_DWN (solar irradiance),
WS10M (wind speed), and RH2M (relative humidity).
"""

import os
import json
import math
import hashlib
from typing import Dict, Any, List, Optional
import httpx

CACHE_DIR = os.path.join("/tmp", ".weather_cache")
os.makedirs(CACHE_DIR, exist_ok=True)

HOTSPOTS = [
    {
        "id": "siachen",
        "name": "Siachen Glacier Base Camp (DRDO Ops)",
        "latitude": 35.421,
        "longitude": 77.108,
        "elevation_m": 4800,
        "zone": "Extreme Arctic Sub-Zero",
        "winter_min_c": -38.5,
        "summer_max_c": 14.0,
        "description": "Highest battlefield on Earth. Severe cold winds, intense UV solar radiation during clear daytime."
    },
    {
        "id": "dras",
        "name": "Dras Valley (Gateway to Ladakh)",
        "latitude": 34.432,
        "longitude": 75.756,
        "elevation_m": 3280,
        "zone": "Severe Cold Desert / 2nd Coldest Inhabited",
        "winter_min_c": -42.0,
        "summer_max_c": 22.0,
        "description": "Known as the 2nd coldest inhabited place on Earth. Heavy winter snowpack and harsh freeze-thaw cycles."
    },
    {
        "id": "leh",
        "name": "Leh, Ladakh (High Altitude Cold Desert)",
        "latitude": 34.152,
        "longitude": 77.577,
        "elevation_m": 3524,
        "zone": "Cold Mountain Desert (300+ Sunny Days)",
        "winter_min_c": -20.0,
        "summer_max_c": 27.0,
        "description": "Cold desert with over 300 days of intense sunshine ? prime candidate for 100% passive solar heating."
    },
    {
        "id": "nyoma",
        "name": "Nyoma Military Airbase (Eastern Ladakh LAC)",
        "latitude": 33.197,
        "longitude": 78.651,
        "elevation_m": 4180,
        "zone": "High-Plateau Cold Steppe",
        "winter_min_c": -32.0,
        "summer_max_c": 20.0,
        "description": "High altitude strategic airbase on Indus banks with extreme wind chill and sub-zero night plunges."
    },
    {
        "id": "tawang",
        "name": "Tawang Valley, Arunachal Pradesh (Forward Sector)",
        "latitude": 27.586,
        "longitude": 91.866,
        "elevation_m": 3048,
        "zone": "Eastern Himalayan Alpine Zone",
        "winter_min_c": -12.0,
        "summer_max_c": 21.0,
        "description": "High-altitude eastern Himalayan zone with wet monsoons, snow winters, and dense cloud covers."
    },
    {
        "id": "spiti",
        "name": "Kaza, Spiti Valley, Himachal Pradesh",
        "latitude": 32.227,
        "longitude": 78.071,
        "elevation_m": 3800,
        "zone": "Trans-Himalayan Cold Desert",
        "winter_min_c": -28.0,
        "summer_max_c": 24.0,
        "description": "Deep mountain valley with severe isolation in winter and strong clear-sky solar potential."
    }
]

def generate_synthetic_tmy(lat: float, lon: float, elevation_m: float = 3500.0) -> List[Dict[str, Any]]:
    """
    Generates high-fidelity 8,760 hours of Typical Meteorological Year (TMY)
    using physical celestial geometry and thermodynamic lapse rates.
    Guarantees realistic diurnal temperature cycles and solar curves.
    """
    hourly_records: List[Dict[str, Any]] = []
    
    # Base temperature adjustment by elevation (-6.5?C per 1000m standard lapse rate)
    elevation_lapse = (elevation_m - 500) * 0.0065
    
    # Base annual mean temperature modeled on latitude & elevation
    annual_mean_temp = 22.0 - (abs(lat) - 15.0) * 0.9 - elevation_lapse
    
    # Seasonal amplitude (extreme in continental high-altitude deserts)
    seasonal_amp = 14.0 + (abs(lat) / 10.0) * 2.5
    
    # Diurnal amplitude (day-night swing: high altitude thin air causes huge 14-18?C swings!)
    diurnal_amp = 8.5 + (elevation_m / 1000.0) * 1.8
    
    # Day of year cold trough around Jan 15 (day 15)
    days_in_months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    
    hour_counter = 0
    for day_of_year in range(1, 366):
        # Solar declination angle delta (radians)
        declination = 23.45 * math.sin(math.radians(360 * (284 + day_of_year) / 365.0))
        dec_rad = math.radians(declination)
        lat_rad = math.radians(lat)
        
        # Day temperature base
        day_seasonal_factor = -math.cos(2 * math.pi * (day_of_year - 15) / 365.0)
        daily_mean_temp = annual_mean_temp + seasonal_amp * day_seasonal_factor
        
        # Solar noon zenith calculation
        cos_zenith_noon = math.sin(lat_rad) * math.sin(dec_rad) + math.cos(lat_rad) * math.cos(dec_rad)
        
        for hour in range(24):
            # Diurnal temperature cycle: lowest at 05:00 (dawn), peak at 14:00 (2 PM)
            hour_angle_temp = 2 * math.pi * (hour - 5) / 24.0
            temp_variation = -math.cos(hour_angle_temp) * diurnal_amp
            
            # Stochastic small atmospheric turbulence
            noise = math.sin(hour_counter * 0.23 + day_of_year) * 0.6
            
            t2m = round(daily_mean_temp + temp_variation + noise, 2)
            
            # Solar Radiation calculation (Hour angle omega)
            solar_hour_angle = (hour - 12.0) * 15.0 # degrees (-180 to 180)
            sha_rad = math.radians(solar_hour_angle)
            
            cos_zenith = math.sin(lat_rad) * math.sin(dec_rad) + math.cos(lat_rad) * math.cos(dec_rad) * math.cos(sha_rad)
            
            # Atmospheric clearness index for high altitude (clearer sky at 3500m+ gives up to 1050 W/m? peak!)
            solar_constant = 1367.0
            clearness_factor = min(0.88, 0.72 + (elevation_m / 10000.0) * 0.15)
            
            if cos_zenith > 0:
                solar_elevation = math.asin(max(0.0, min(1.0, cos_zenith)))
                # Direct normal + diffuse on horizontal
                air_mass = 1.0 / (cos_zenith + 0.50572 * ((6.07995 + math.degrees(solar_elevation)) ** -1.6364))
                ext_rad = solar_constant * (1 + 0.033 * math.cos(math.radians(360 * day_of_year / 365.0)))
                # High altitude thin air transmission
                ghi = ext_rad * cos_zenith * (clearness_factor ** air_mass)
                ghi = max(0.0, round(ghi, 1))
            else:
                ghi = 0.0
            
            # Wind speed: higher in afternoons and high elevation passes
            wind_speed = round(max(0.5, 3.2 + (elevation_m / 2000.0) * 1.5 + math.sin(hour_counter * 0.05) * 1.8 + (2.0 if 12 <= hour <= 17 else 0.0)), 1)
            
            # Relative humidity: inversely related to temperature
            rh2m = round(max(15.0, min(95.0, 55.0 - (temp_variation / diurnal_amp) * 25.0)), 1)
            
            # Determine month
            acc_days = 0
            month_idx = 1
            for m_idx, m_days in enumerate(days_in_months, start=1):
                if acc_days + m_days >= day_of_year:
                    month_idx = m_idx
                    break
                acc_days += m_days
            
            hourly_records.append({
                "hour_index": hour_counter,
                "day_of_year": day_of_year,
                "month": month_idx,
                "hour": hour,
                "T2M": t2m,
                "ALLSKY_SFC_SW_DWN": ghi,
                "WS10M": wind_speed,
                "RH2M": rh2m
            })
            hour_counter += 1
            
    return hourly_records

async def fetch_nasa_power_weather(lat: float, lon: float, elevation_m: float = 3500.0) -> List[Dict[str, Any]]:
    """
    Fetches real hourly meteorological data from NASA POWER API or returns cached / synthesized data.
    """
    cache_key = hashlib.md5(f"{lat:.3f}_{lon:.3f}".encode()).hexdigest()
    cache_file = os.path.join(CACHE_DIR, f"nasa_power_{cache_key}.json")
    
    if os.path.exists(cache_file):
        try:
            with open(cache_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                if len(data) == 8760 or len(data) == 8784:
                    return data[:8760]
        except Exception:
            pass

    # Try live NASA POWER API
    url = f"https://power.larc.nasa.gov/api/temporal/hourly/point"
    params = {
        "parameters": "T2M,ALLSKY_SFC_SW_DWN,WS10M,RH2M",
        "community": "RE",
        "longitude": f"{lon:.4f}",
        "latitude": f"{lat:.4f}",
        "start": "20230101",
        "end": "20231231",
        "format": "JSON"
    }
    
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            response = await client.get(url, params=params)
            if response.status_code == 200:
                json_data = response.json()
                properties = json_data.get("properties", {}).get("parameter", {})
                t2m_dict = properties.get("T2M", {})
                sol_dict = properties.get("ALLSKY_SFC_SW_DWN", {})
                ws_dict = properties.get("WS10M", {})
                rh_dict = properties.get("RH2M", {})
                
                records: List[Dict[str, Any]] = []
                keys = sorted(list(t2m_dict.keys()))
                hour_counter = 0
                for k in keys:
                    if hour_counter >= 8760:
                        break
                    # parse YYYYMMDDHH
                    month = int(k[4:6])
                    day = int(k[6:8])
                    hr = int(k[8:10])
                    
                    t_val = t2m_dict.get(k, 0.0)
                    s_val = max(0.0, sol_dict.get(k, 0.0))
                    w_val = max(0.2, ws_dict.get(k, 2.0))
                    r_val = max(5.0, min(100.0, rh_dict.get(k, 40.0)))
                    
                    records.append({
                        "hour_index": hour_counter,
                        "day_of_year": hour_counter // 24 + 1,
                        "month": month,
                        "hour": hr,
                        "T2M": round(t_val, 2),
                        "ALLSKY_SFC_SW_DWN": round(s_val, 1),
                        "WS10M": round(w_val, 1),
                        "RH2M": round(r_val, 1)
                    })
                    hour_counter += 1
                
                if len(records) >= 8760:
                    with open(cache_file, "w", encoding="utf-8") as f:
                        json.dump(records[:8760], f)
                    return records[:8760]
    except Exception as e:
        # Fallback to precision physics synthetic meteorological year
        pass

    synthetic = generate_synthetic_tmy(lat, lon, elevation_m)
    with open(cache_file, "w", encoding="utf-8") as f:
        json.dump(synthetic, f)
    return synthetic
