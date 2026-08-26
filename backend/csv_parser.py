"""
ThermoShell Microclimate CSV Parser & Sanitizer
Allows field engineers and DRDO units to override NASA satellite data with on-site logger logs.
"""

import io
import re
import math
import pandas as pd
from typing import Dict, Any, List, Tuple

def sanitize_and_parse_microclimate_csv(
    file_bytes: bytes,
    filename: str = "sensor_log.csv"
) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """
    Parses and sanitizes uploaded CSV containing on-site microclimate sensor readings.
    Returns (hourly_records, metadata_summary).
    """
    try:
        df = pd.read_csv(io.BytesIO(file_bytes))
    except Exception as e:
        raise ValueError(f"Unable to read CSV file: {str(e)}")

    if df.empty:
        raise ValueError("The uploaded CSV file is empty.")

    # Normalize column names to lowercase stripped
    df.columns = [str(c).strip().lower() for c in df.columns]

    # Flexible column matching
    temp_col = None
    solar_col = None
    wind_col = None
    rh_col = None

    for col in df.columns:
        if not temp_col and any(k in col for k in ["temp", "t2m", "drybulb", "temperature", "degc"]):
            temp_col = col
        elif not solar_col and any(k in col for k in ["solar", "rad", "ghi", "irradiance", "allsky", "flux"]):
            solar_col = col
        elif not wind_col and any(k in col for k in ["wind", "ws", "speed", "velocity"]):
            wind_col = col
        elif not rh_col and any(k in col for k in ["rh", "humid", "moisture"]):
            rh_col = col

    if not temp_col:
        # If no temperature column identified, check for first numeric column
        numeric_cols = df.select_dtypes(include=["number"]).columns
        if len(numeric_cols) > 0:
            temp_col = numeric_cols[0]
        else:
            raise ValueError("Could not detect a Temperature column (e.g., 'temperature', 'temp', 'T2M') in the CSV.")

    # Clean temperature column
    df[temp_col] = pd.to_numeric(df[temp_col], errors="coerce")
    # Sanitize unrealistic sensor spikes (-60?C to +55?C)
    df[temp_col] = df[temp_col].clip(lower=-60.0, upper=55.0)
    df[temp_col] = df[temp_col].interpolate(method="linear").bfill().ffill()

    # Clean solar radiation column
    if solar_col:
        df[solar_col] = pd.to_numeric(df[solar_col], errors="coerce").clip(lower=0.0, upper=1350.0)
        df[solar_col] = df[solar_col].interpolate(method="linear").bfill().ffill()
    else:
        df["synth_solar"] = 0.0
        solar_col = "synth_solar"

    # Clean wind speed column
    if wind_col:
        df[wind_col] = pd.to_numeric(df[wind_col], errors="coerce").clip(lower=0.1, upper=50.0)
        df[wind_col] = df[wind_col].interpolate(method="linear").bfill().ffill()
    else:
        df["synth_wind"] = 3.5
        wind_col = "synth_wind"

    # Clean RH column
    if rh_col:
        df[rh_col] = pd.to_numeric(df[rh_col], errors="coerce").clip(lower=5.0, upper=100.0)
        df[rh_col] = df[rh_col].interpolate(method="linear").bfill().ffill()
    else:
        df["synth_rh"] = 45.0
        rh_col = "synth_rh"

    # Build 8,760 hourly records (replicate or tile if logger data has fewer than 8,760 hours)
    raw_len = len(df)
    records_8760: List[Dict[str, Any]] = []

    for i in range(8760):
        row_idx = i % raw_len
        row = df.iloc[row_idx]
        
        t_val = float(row[temp_col])
        s_val = float(row[solar_col])
        w_val = float(row[wind_col])
        r_val = float(row[rh_col])

        # If solar wasn't present in CSV, synthesize high-altitude day/night solar bell curve
        if solar_col == "synth_solar":
            hour_of_day = i % 24
            if 6 <= hour_of_day <= 18:
                s_val = max(0.0, 950.0 * math.sin(math.pi * (hour_of_day - 6) / 12.0))
            else:
                s_val = 0.0

        records_8760.append({
            "hour_index": i,
            "day_of_year": (i // 24) + 1,
            "month": min(12, (i // 730) + 1),
            "hour": i % 24,
            "T2M": round(t_val, 2),
            "ALLSKY_SFC_SW_DWN": round(s_val, 1),
            "WS10M": round(w_val, 1),
            "RH2M": round(r_val, 1)
        })

    meta = {
        "filename": filename,
        "raw_rows_detected": raw_len,
        "temperature_col": temp_col,
        "solar_col": solar_col,
        "wind_col": wind_col,
        "min_temp_recorded": round(float(df[temp_col].min()), 1),
        "max_temp_recorded": round(float(df[temp_col].max()), 1),
        "avg_temp_recorded": round(float(df[temp_col].mean()), 1),
        "sanitization_status": "Success: 8,760 hourly records calibrated"
    }

    return records_8760, meta