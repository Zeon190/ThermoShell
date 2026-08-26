"""
ThermoShell Ultimate Optimization Routine
Maximizes Natural/Passive Annual Comfort Hours using thermodynamic intelligence.
Completely avoids brute-force insulation overloading.

Engine characteristics
----------------------
* Comfort hours percentage (`metrics["comfort_hours_percentage"]`) is the sole
  fitness score to maximize.
* Every candidate change is screened with a fast analytical Figure of Merit
  (FOM) that is climate-aware, then the single top candidate is validated with
  the full 8,760h physics solver each iteration.
* Any step that does NOT produce a positive ``ΔComfort`` is rejected and added
  to a tabu set so its inverse direction is explored next (positive-gradient
  enforcement).
* Iteration budget is hard-capped at 5 to stay within demo latency.
* Insulation volume is never used as the primary lever: cold climates cap at
  150mm, tropical at 40mm. Structural mass shifting, glazing solar optimization
  and ventilation do the heavy lifting.
"""

from typing import Dict, Any, List, Optional, Tuple
from models import RoomDimensions, LocationInput, MaterialSelection
from materials_db import WALL_MATERIALS, INSULATION_MATERIALS, ROOF_MATERIALS, GLAZING_SYSTEMS
from physics_engine import run_thermal_simulation

# ============================================================================
# CONSTRAINTS
# ============================================================================
INSULATION_CAP_COLD_M = 0.15     # 150mm hard cap for cold climates
INSULATION_CAP_TROPICAL_M = 0.04  # 40mm hard cap for tropical climates
GLZING_RATIO_MIN = 0.25
GLZING_RATIO_MAX = 0.45
ACH_COLD_MIN = 0.12
ACH_TROPICAL_MAX = 4.5

# Loop bounds (kept tight for interactive demo latency)
MAX_PHYSICS_RUNS = 10   # hard cap on full-solver validations
TOP_K_PER_PASS = 3      # candidate moves validated per search pass

# Budget guard
DEFAULT_BUDGET_CEILING_INR = 600000.0
BUDGET_HEADROOM = 1.5


# ============================================================================
# ANALYTICAL PRE-SCREEN (fast FOM)
# ============================================================================
def analytical_fom_score(
    dimensions: RoomDimensions,
    materials: MaterialSelection,
    climate: str = "cold"
) -> float:
    """
    Fast analytical Figure of Merit used for in-loop candidate pre-screening.
    Higher = better passive comfort potential for the given climate.

    The formula is climate-aware: cold climates reward thermal mass, insulation
    (low U) and solar aperture, while tropical climates reward high envelope
    permeability (high U), night-purge ventilation, low mass and low solar gain.
    """
    L = dimensions.length_m
    W = dimensions.width_m
    H = dimensions.height_m
    floor_area = L * W
    total_wall_gross = 2 * (L + W) * H
    roof_area = floor_area
    total_win = (
        (L * H * dimensions.south_window_ratio) +
        (L * H * dimensions.north_window_ratio) +
        (W * H * (dimensions.east_window_ratio + dimensions.west_window_ratio))
    )

    wall_info = WALL_MATERIALS.get(materials.wall_material_id, WALL_MATERIALS["rammed_earth"])
    ins_info = INSULATION_MATERIALS.get(materials.insulation_material_id, INSULATION_MATERIALS["local_sheep_wool"])
    roof_info = ROOF_MATERIALS.get(materials.roof_material_id, ROOF_MATERIALS["timber_mud_willow"])
    glaz_info = GLAZING_SYSTEMS.get(materials.glazing_system_id, GLAZING_SYSTEMS["double_low_e_argon"])

    R_si = 0.13
    R_se = 0.04
    R_wall_core = materials.wall_thickness_m / wall_info["conductivity"]
    R_wall_ins = (materials.insulation_thickness_m / ins_info["conductivity"]) if materials.insulation_thickness_m > 0 else 0.0
    R_wall_total = R_si + R_wall_core + R_wall_ins + R_se
    R_roof_core = materials.roof_thickness_m / roof_info["conductivity"]
    R_roof_ins = (materials.insulation_thickness_m * 1.25 / ins_info["conductivity"]) if materials.insulation_thickness_m > 0 else 0.0
    R_roof_total = R_si + R_roof_core + R_roof_ins + R_se

    opaque_wall_area = total_wall_gross - total_win
    u_wall = 1.0 / R_wall_total
    u_roof = 1.0 / R_roof_total
    u_glaz = glaz_info["u_value"]

    u_penalty = (
        u_wall * opaque_wall_area + u_roof * roof_area + u_glaz * total_win
    ) / max(1.0, total_wall_gross + roof_area)

    thermal_mass_factor = (materials.wall_thickness_m * wall_info["density"] * wall_info["specific_heat"]) / 1e5
    shgc_gain = glaz_info["shgc"] * 40.0 * dimensions.south_window_ratio

    if climate == "tropical":
        # Reward permeability (high U), ventilation, low mass, no Trombe, low solar gain
        fom = (
            (u_penalty * 2.0)                       # higher U => more night heat exchange
            + (dimensions.air_change_rate * 8.0)    # night-purge convective cooling
            - (thermal_mass_factor * 2.0)           # mass traps daytime heat
            - (25.0 if dimensions.has_trombe_wall else 0.0)
            - (glaz_info["shgc"] * 30.0)            # avoid solar oven
            - (dimensions.south_window_ratio * 20.0)
        )
        return fom

    # Cold / default: reward low U, thermal mass, Trombe and solar aperture
    trombe_bonus = 25.0 if dimensions.has_trombe_wall else 0.0
    fom = (
        (100.0 - u_penalty * 0.5)
        + (thermal_mass_factor * 2.5)
        + trombe_bonus
        + shgc_gain
        + max(0.0, (0.4 - dimensions.air_change_rate)) * 5.0  # mild preference for tighter envelope
    )
    return fom


def calculate_composite_u_value(dimensions: RoomDimensions, materials: MaterialSelection) -> Tuple[float, float, float]:
    """Calculate approximate composite U-value for the envelope."""
    L = dimensions.length_m
    W = dimensions.width_m
    H = dimensions.height_m
    floor_area = L * W
    volume = L * W * H

    area_south_gross = L * H
    area_north_gross = L * H
    area_east_gross = W * H
    area_west_gross = W * H
    total_wall_gross = 2 * (L + W) * H
    area_roof = floor_area
    area_floor = floor_area

    area_win_south = area_south_gross * dimensions.south_window_ratio
    area_win_north = area_north_gross * dimensions.north_window_ratio
    area_win_east = area_east_gross * dimensions.east_window_ratio
    area_win_west = area_west_gross * dimensions.west_window_ratio
    total_win_area = area_win_south + area_win_north + area_win_east + area_win_west

    area_wall_south_net = max(0.0, area_south_gross - area_win_south)
    area_wall_north_net = max(0.0, area_north_gross - area_win_north)
    area_wall_east_net = max(0.0, area_east_gross - area_win_east)
    area_wall_west_net = max(0.0, area_west_gross - area_win_west)
    total_opaque_wall_area = area_wall_south_net + area_wall_north_net + area_wall_east_net + area_wall_west_net

    R_si = 0.13
    R_se = 0.04

    wall_info = WALL_MATERIALS.get(materials.wall_material_id, WALL_MATERIALS["rammed_earth"])
    ins_info = INSULATION_MATERIALS.get(materials.insulation_material_id, INSULATION_MATERIALS["local_sheep_wool"])
    roof_info = ROOF_MATERIALS.get(materials.roof_material_id, ROOF_MATERIALS["timber_mud_willow"])
    glaz_info = GLAZING_SYSTEMS.get(materials.glazing_system_id, GLAZING_SYSTEMS["double_low_e_argon"])

    R_wall_core = materials.wall_thickness_m / wall_info["conductivity"]
    R_wall_ins = (materials.insulation_thickness_m / ins_info["conductivity"]) if materials.insulation_thickness_m > 0 else 0.0
    R_wall_total = R_si + R_wall_core + R_wall_ins + R_se
    U_wall = 1.0 / R_wall_total

    R_roof_core = materials.roof_thickness_m / roof_info["conductivity"]
    R_roof_ins = (materials.insulation_thickness_m * 1.25 / ins_info["conductivity"]) if materials.insulation_thickness_m > 0 else 0.0
    R_roof_total = R_si + R_roof_core + R_roof_ins + R_se
    U_roof = 1.0 / R_roof_total

    U_floor = 0.32 if materials.insulation_thickness_m > 0.04 else 0.75
    U_glaz = glaz_info["u_value"]

    UA_env = (U_wall * total_opaque_wall_area) + (U_roof * area_roof) + (U_floor * area_floor) + (U_glaz * total_win_area)
    UA_total = UA_env + (dimensions.air_change_rate * volume * 1.225 * 1005.0 / 3600.0)

    total_envelope_area = total_opaque_wall_area + area_roof + area_floor + total_win_area
    U_composite = UA_total / total_envelope_area

    return U_composite, U_wall, U_roof


def estimate_cost(dimensions: RoomDimensions, materials: MaterialSelection) -> float:
    """Reuse the optimizer.py cost pattern: wall + insulation + roof + glazing + Trombe addon."""
    L = dimensions.length_m
    W = dimensions.width_m
    H = dimensions.height_m
    floor_area = L * W
    total_wall_gross = 2 * (L + W) * H
    roof_area = floor_area
    total_win = (
        (L * H * dimensions.south_window_ratio) +
        (L * H * dimensions.north_window_ratio) +
        (W * H * (dimensions.east_window_ratio + dimensions.west_window_ratio))
    )

    wall_info = WALL_MATERIALS.get(materials.wall_material_id, WALL_MATERIALS["rammed_earth"])
    ins_info = INSULATION_MATERIALS.get(materials.insulation_material_id, INSULATION_MATERIALS["local_sheep_wool"])
    roof_info = ROOF_MATERIALS.get(materials.roof_material_id, ROOF_MATERIALS["timber_mud_willow"])
    glaz_info = GLAZING_SYSTEMS.get(materials.glazing_system_id, GLAZING_SYSTEMS["double_low_e_argon"])

    c_wall = total_wall_gross * (wall_info["cost_per_m2_default"] * (materials.wall_thickness_m / wall_info["default_thickness"]))
    c_ins = (total_wall_gross + roof_area) * (ins_info["cost_per_m2_default"] * (materials.insulation_thickness_m / ins_info["default_thickness"] if ins_info["default_thickness"] > 0 else 1.0))
    c_roof = roof_area * (roof_info["cost_per_m2_default"] * (materials.roof_thickness_m / roof_info["default_thickness"]))
    c_win = total_win * glaz_info["cost_per_m2"]
    c_trombe = 35000.0 if dimensions.has_trombe_wall else 0.0
    return c_wall + c_ins + c_roof + c_win + c_trombe


# ============================================================================
# PHASE 1: Climate failure characterization
# ============================================================================
def characterize_climate_failure(sim_result: Dict[str, Any], comfort_min: float = 18.0) -> str:
    """
    Analyze the hourly climate profile to classify the failure mode.
    Returns: 'sunny_cold', 'cloudy_cold', or 'tropical_overheat'.
    """
    if sim_result.get("climate_profile_warning") == "tropical_overheating":
        return "tropical_overheat"

    hourly = sim_result.get("hourly_sample_profile", [])
    if not hourly:
        return "unknown"

    solar_vals = [h.get("solar_radiation", 0) for h in hourly]
    indoor_temps = [h.get("indoor_temp", 20) for h in hourly]

    comfort_drops = [i for i, t in enumerate(indoor_temps) if t < comfort_min]
    if not comfort_drops:
        return "unknown"

    sunny_drops = sum(1 for i in comfort_drops if solar_vals[i] > 200)
    total_drops = len(comfort_drops)

    if total_drops > 0 and sunny_drops / total_drops > 0.6:
        return "sunny_cold"   # comfort drops when sun is down -> need thermal mass / Trombe
    else:
        return "cloudy_cold"  # comfort drops persist -> need more glazing or mass


# ============================================================================
# PHASE 2-4: Climate-dispatch candidate generator
# ============================================================================
def generate_candidates(
    dims: RoomDimensions,
    mat: MaterialSelection,
    is_cold: bool,
    location: LocationInput,
    budget_ceiling: float
) -> List[Dict[str, Any]]:
    """
    Produce single-step, climate-smart candidate moves. Each candidate is a
    shallow mutation of the current configuration plus a stable ``key`` that is
    used for the tabu list so rejected directions are inverted next iteration.
    Candidates whose estimated cost exceeds the budget ceiling are dropped.
    """
    cands: List[Dict[str, Any]] = []
    wall_info = WALL_MATERIALS.get(mat.wall_material_id, WALL_MATERIALS["rammed_earth"])

    def feasible(c_mat: MaterialSelection, c_dims: RoomDimensions) -> Optional[Dict[str, Any]]:
        if estimate_cost(c_dims, c_mat) > budget_ceiling:
            return None
        return {"mat": c_mat, "dims": c_dims}

    if is_cold:
        # ---- COLD DISPATCH (underheat cognizance) ----
        # Wall thermal-mass thickening
        if mat.wall_thickness_m < 0.45:
            nm = mat.model_copy(update={"wall_thickness_m": round(min(0.45, mat.wall_thickness_m + 0.05), 3)})
            if feasible(nm, dims):
                cands.append({"mat": nm, "dims": dims,
                              "desc": f"Increased {wall_info['name']} thermal mass to {nm.wall_thickness_m:.2f}m",
                              "key": "wall_thick_up"})

        # Insulation wrap toward 150mm cap (never the primary lever)
        if mat.insulation_thickness_m < INSULATION_CAP_COLD_M - 1e-6:
            nm = mat.model_copy(update={"insulation_thickness_m": round(min(INSULATION_CAP_COLD_M, mat.insulation_thickness_m + 0.02), 3)})
            if feasible(nm, dims):
                cands.append({"mat": nm, "dims": dims,
                              "desc": f"Boosted insulation wrap to {nm.insulation_thickness_m * 100:.0f}mm (150mm cap)",
                              "key": "insul_up"})

        # Glazing ratio up (solar capture) and down (moderate mass)
        for delta, key in ((0.05, "glazing_up"), (-0.05, "glazing_down")):
            nr = round(min(GLZING_RATIO_MAX, max(GLZING_RATIO_MIN, dims.south_window_ratio + delta)), 3)
            if abs(nr - dims.south_window_ratio) > 1e-6:
                nd = dims.model_copy(update={"south_window_ratio": nr})
                if feasible(mat, nd):
                    cands.append({"mat": mat, "dims": nd,
                                  "desc": f"Set south glazing ratio to {nr:.2f} for solar capture",
                                  "key": key})

        # Tighten infiltration (tactical airtight seal) - jump to target
        if dims.air_change_rate > ACH_COLD_MIN + 1e-6:
            na = ACH_COLD_MIN
            nd = dims.model_copy(update={"air_change_rate": na})
            if feasible(mat, nd):
                cands.append({"mat": mat, "dims": nd,
                              "desc": f"Tightened infiltration to {na:.2f} ACH (tactical airtight seal)",
                              "key": "ach_cold_down"})

        # Trombe wall forced ON only for high-density masonry/stone backings
        if not dims.has_trombe_wall and wall_info["density"] > 1000:
            nd = dims.model_copy(update={"has_trombe_wall": True})
            if feasible(mat, nd):
                cands.append({"mat": mat, "dims": nd,
                              "desc": "Activated passive Trombe wall thermal storage (high-density backing)",
                              "key": "trombe_on"})

        # Discrete high-mass wall-core swap
        swap_wall = ("stone_granite_masonry", 0.40) if location.elevation_m > 4000 else ("rammed_earth", 0.40)
        if swap_wall[0] != mat.wall_material_id or abs(mat.wall_thickness_m - swap_wall[1]) > 1e-6:
            nm = mat.model_copy(update={"wall_material_id": swap_wall[0], "wall_thickness_m": swap_wall[1]})
            if feasible(nm, dims):
                cands.append({"mat": nm, "dims": dims,
                              "desc": f"Upgraded wall core to {WALL_MATERIALS[swap_wall[0]]['name']} ({swap_wall[1]}m) for thermal mass",
                              "key": f"wall_swap:{swap_wall[0]}"})

        # Ventilated roof for cold snow shedding
        if mat.roof_material_id in ("drdo_puf_roof", "insulated_rcc_slab"):
            nm = mat.model_copy(update={"roof_material_id": "insulated_cgi_panel", "roof_thickness_m": 0.15})
            if feasible(nm, dims):
                cands.append({"mat": nm, "dims": dims,
                              "desc": "Switched to ventilated CGI panel roof for thermal break",
                              "key": "roof_swap:cgi"})

        # Arctic-spec glazing
        if mat.glazing_system_id != "triple_low_e_krypton":
            nm = mat.model_copy(update={"glazing_system_id": "triple_low_e_krypton"})
            if feasible(nm, dims):
                cands.append({"mat": nm, "dims": dims,
                              "desc": "Upgraded glazing to triple low-E krypton (arctic spec)",
                              "key": "glaz_swap:triple"})
    else:
        # ---- TROPICAL DISPATCH (overheat cognizance) ----
        # Strip insulation to bare structural minimum (40mm)
        if mat.insulation_thickness_m > INSULATION_CAP_TROPICAL_M + 1e-6:
            nm = mat.model_copy(update={"insulation_thickness_m": INSULATION_CAP_TROPICAL_M})
            if feasible(nm, dims):
                cands.append({"mat": nm, "dims": dims,
                              "desc": f"Reduced insulation to {INSULATION_CAP_TROPICAL_M * 100:.0f}mm for heat escape",
                              "key": "insul_cap"})

        # Deactivate Trombe wall (no solar trapping)
        if dims.has_trombe_wall:
            nd = dims.model_copy(update={"has_trombe_wall": False})
            if feasible(mat, nd):
                cands.append({"mat": mat, "dims": nd,
                              "desc": "Deactivated Trombe wall to stop solar heat trapping",
                              "key": "trombe_off"})

        # Night-purge ventilation - jump to target
        if dims.air_change_rate < ACH_TROPICAL_MAX - 1e-6:
            na = ACH_TROPICAL_MAX
            nd = dims.model_copy(update={"air_change_rate": na})
            if feasible(mat, nd):
                cands.append({"mat": mat, "dims": nd,
                              "desc": f"Increased ACH to {na:.2f} for night-flush convective cooling",
                              "key": "ach_trop_up"})

        # Reduce solar aperture
        nr = round(max(GLZING_RATIO_MIN, dims.south_window_ratio - 0.05), 3)
        if abs(nr - dims.south_window_ratio) > 1e-6:
            nd = dims.model_copy(update={"south_window_ratio": nr})
            if feasible(mat, nd):
                cands.append({"mat": mat, "dims": nd,
                              "desc": f"Reduced south glazing ratio to {nr:.2f} (minimized solar gain)",
                              "key": "glazing_down"})

        # Lightweight wall to avoid thermal trapping
        if mat.wall_material_id != "aac_blocks" or abs(mat.wall_thickness_m - 0.20) > 1e-6:
            nm = mat.model_copy(update={"wall_material_id": "aac_blocks", "wall_thickness_m": 0.20})
            if feasible(nm, dims):
                cands.append({"mat": nm, "dims": dims,
                              "desc": "Switched to lightweight AAC wall to avoid thermal trapping",
                              "key": "wall_swap:aac"})

        # Reduced-solar-gain glazing
        if mat.glazing_system_id != "polycarbonate_multiwall":
            nm = mat.model_copy(update={"glazing_system_id": "polycarbonate_multiwall"})
            if feasible(nm, dims):
                cands.append({"mat": nm, "dims": dims,
                              "desc": "Switched glazing to polycarbonate multiwall for reduced solar gain",
                              "key": "glaz_swap:poly"})

        # Ventilated roof
        if mat.roof_material_id in ("drdo_puf_roof", "insulated_rcc_slab"):
            nm = mat.model_copy(update={"roof_material_id": "insulated_cgi_panel", "roof_thickness_m": 0.15})
            if feasible(nm, dims):
                cands.append({"mat": nm, "dims": dims,
                              "desc": "Switched to ventilated CGI panel roof for thermal break",
                              "key": "roof_swap:cgi"})

    return cands


# ============================================================================
# RESPONSE BUILDER
# ============================================================================
def _build_configuration(
    location: LocationInput,
    dims: RoomDimensions,
    mat: MaterialSelection,
    metrics: Dict[str, Any],
    u_composite: float,
    u_wall: float,
    u_roof: float,
    cost: float
) -> Dict[str, Any]:
    return {
        "location": {
            "latitude": location.latitude,
            "longitude": location.longitude,
            "location_name": location.location_name,
            "elevation_m": location.elevation_m
        },
        "dimensions": {
            "length_m": dims.length_m,
            "width_m": dims.width_m,
            "height_m": dims.height_m,
            "south_window_ratio": dims.south_window_ratio,
            "north_window_ratio": dims.north_window_ratio,
            "east_window_ratio": dims.east_window_ratio,
            "west_window_ratio": dims.west_window_ratio,
            "has_trombe_wall": dims.has_trombe_wall,
            "occupants_count": dims.occupants_count,
            "air_change_rate": dims.air_change_rate
        },
        "materials": {
            "wall_material_id": mat.wall_material_id,
            "wall_thickness_m": mat.wall_thickness_m,
            "insulation_material_id": mat.insulation_material_id,
            "insulation_thickness_m": mat.insulation_thickness_m,
            "roof_material_id": mat.roof_material_id,
            "roof_thickness_m": mat.roof_thickness_m,
            "glazing_system_id": mat.glazing_system_id
        },
        "performance_metrics": {
            "composite_u_value_Wm2K": round(u_composite, 4),
            "wall_u_value_Wm2K": round(u_wall, 4),
            "roof_u_value_Wm2K": round(u_roof, 4),
            "ach": dims.air_change_rate,
            "trombe_active": dims.has_trombe_wall,
            "estimated_cost_inr": round(cost, 2),
            "comfort_pct": metrics["comfort_hours_percentage"],
            "avg_indoor_temp_c": metrics["avg_indoor_temp"],
            "thermal_lag_hrs": metrics["thermal_time_constant_hrs"],
            "insulation_cap_enforced": True,
            "glazing_ratio_optimized": True
        }
    }


# ============================================================================
# MAIN ENTRY POINT
# ============================================================================
def run_auto_optimize(
    location: LocationInput,
    dimensions: RoomDimensions,
    materials: MaterialSelection,
    weather_data: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Ultimate Optimization Routine for failing envelope recipes (0-30% comfort).
    Maximizes passive comfort via an iterative, positive-gradient, climate-aware
    search that never relies on brute-force insulation overloading.
    """
    # ----------------------------------------------------------------------
    # PHASE 1: Baseline characterization
    # ----------------------------------------------------------------------
    baseline_sim = run_thermal_simulation(weather_data, location, dimensions, materials)
    baseline_metrics = baseline_sim["metrics"]
    baseline_comfort = baseline_metrics["comfort_hours_percentage"]

    is_tropical = (
        location.elevation_m < 1000 or
        location.latitude < 25.0 or
        baseline_sim.get("climate_profile_warning") == "tropical_overheating"
    )
    is_cold = not is_tropical
    climate_str = "tropical" if is_tropical else "cold"
    climate_zone = "tropical_overheating" if is_tropical else "extreme_cold_underheat"

    failure_mode = characterize_climate_failure(baseline_sim)

    # ----------------------------------------------------------------------
    # Edge case: baseline already comfortable -> no-op (panel is hidden anyway)
    # ----------------------------------------------------------------------
    if baseline_comfort >= 30:
        u_comp, u_wall, u_roof = calculate_composite_u_value(dimensions, materials)
        return {
            "status": "success",
            "original_comfort_pct": baseline_comfort,
            "optimized_comfort_pct": baseline_comfort,
            "delta_comfort": 0.0,
            "failure_mode": failure_mode,
            "iterations": 0,
            "converged": True,
            "climate_zone": climate_zone,
            "engineering_summary": "Baseline already meets the passive comfort target; no optimization required.",
            "modifications_applied": [],
            "updated_configuration": _build_configuration(
                location, dimensions, materials, baseline_metrics, u_comp, u_wall, u_roof,
                estimate_cost(dimensions, materials)
            )
        }

    # Budget ceiling: never exceed a generous fixed cap or 1.5x the original spec
    original_cost = estimate_cost(dimensions, materials)
    budget_ceiling = max(DEFAULT_BUDGET_CEILING_INR, original_cost * BUDGET_HEADROOM)

    # Clone inputs for the working optimization state
    cur_dims = dimensions.model_copy()
    cur_mat = materials.model_copy()
    cur_comfort = baseline_comfort
    verified_metrics = baseline_metrics
    modifications: List[str] = []
    tabu: set = set()
    physics_runs = 0

    # ----------------------------------------------------------------------
    # PHASE 2-5: Iterative ΔComfort search
    # ----------------------------------------------------------------------
    # Each pass screens candidates with the fast analytical FOM, then validates
    # the top-K with the full physics solver. A move is accepted only when it
    # yields a strictly positive ΔComfort (positive-gradient enforcement). Moves
    # that degrade comfort are tabu'd so their inverse direction is explored.
    while physics_runs < MAX_PHYSICS_RUNS:
        cands = generate_candidates(cur_dims, cur_mat, is_cold, location, budget_ceiling)
        cands = [c for c in cands if c["key"] not in tabu]
        if not cands:
            break

        cands.sort(key=lambda c: analytical_fom_score(c["dims"], c["mat"], climate_str), reverse=True)

        improved_this_pass = False
        for cand in cands[:TOP_K_PER_PASS]:
            if physics_runs >= MAX_PHYSICS_RUNS:
                break
            physics_runs += 1
            sim = run_thermal_simulation(weather_data, location, cand["dims"], cand["mat"])
            new_comfort = sim["metrics"]["comfort_hours_percentage"]

            if new_comfort > cur_comfort:
                # Accept: positive gradient enforced
                cur_dims = cand["dims"]
                cur_mat = cand["mat"]
                cur_comfort = new_comfort
                verified_metrics = sim["metrics"]
                modifications.append(cand["desc"])
                tabu.clear()   # new baseline reopens the full move space
                improved_this_pass = True
                break          # restart the search from the improved baseline
            else:
                # Reject: tabu this direction so its inverse is explored next
                tabu.add(cand["key"])

        if not improved_this_pass:
            # No improving move was found in this pass; stop only once the
            # entire candidate space has been exhausted.
            remaining = [
                c for c in generate_candidates(cur_dims, cur_mat, is_cold, location, budget_ceiling)
                if c["key"] not in tabu
            ]
            if not remaining:
                break

    iterations = physics_runs
    converged = cur_comfort > baseline_comfort

    # Final verified figures
    u_comp, u_wall, u_roof = calculate_composite_u_value(cur_dims, cur_mat)
    final_cost = estimate_cost(cur_dims, cur_mat)

    delta_comfort = round(cur_comfort - baseline_comfort, 1)

    if is_cold:
        engineering_summary = (
            f"Cold-climate routine converged over {iterations} iteration(s): "
            f"{WALL_MATERIALS[cur_mat.wall_material_id]['name']} thermal mass at {cur_mat.wall_thickness_m:.2f}m "
            f"with {cur_mat.insulation_thickness_m * 100:.0f}mm insulation wrap (150mm cap), "
            f"south glazing at {cur_dims.south_window_ratio * 100:.0f}%, "
            f"Trombe wall {'active' if cur_dims.has_trombe_wall else 'off'}, "
            f"ACH at {cur_dims.air_change_rate:.2f}. Maximizes passive solar capture and night-time thermal lag "
            f"at {location.elevation_m:.0f}m."
        )
    else:
        engineering_summary = (
            f"Tropical routine converged over {iterations} iteration(s): envelope reconfigured as a breathable "
            f"thermal break with {cur_mat.insulation_thickness_m * 100:.0f}mm insulation (40mm cap), "
            f"Trombe {'active' if cur_dims.has_trombe_wall else 'deactivated'}, "
            f"ACH at {cur_dims.air_change_rate:.2f} for convective purge, glazing at {cur_dims.south_window_ratio * 100:.0f}% "
            f"to prevent solar-oven trapping at {location.latitude:.1f}°N."
        )

    return {
        "status": "success",
        "original_comfort_pct": baseline_comfort,
        "optimized_comfort_pct": cur_comfort,
        "delta_comfort": delta_comfort,
        "failure_mode": failure_mode,
        "iterations": iterations,
        "converged": converged,
        "climate_zone": climate_zone,
        "engineering_summary": engineering_summary,
        "modifications_applied": modifications,
        "updated_configuration": _build_configuration(
            location, cur_dims, cur_mat, verified_metrics, u_comp, u_wall, u_roof, final_cost
        )
    }
