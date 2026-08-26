"""
ThermoShell Materials Database
Comprehensive database of building envelope materials, insulation, roofing, and glazing
calibrated for extreme cold climates (Ladakh, Siachen, high Himalayas).
"""

from typing import Dict, Any, List

WALL_MATERIALS: Dict[str, Dict[str, Any]] = {
    "rammed_earth": {
        "id": "rammed_earth",
        "name": "Ladakh Rammed Earth (Vernacular)",
        "category": "Earth & Masonry",
        "conductivity": 0.85,  # W/m?K
        "density": 1950,        # kg/m?
        "specific_heat": 1050,  # J/kg?K
        "default_thickness": 0.35,  # meters (35cm)
        "cost_per_m2_default": 750, # INR / m?
        "embodied_carbon": 15,  # kg CO2/m?
        "local_availability": 10, # 1-10 scale
        "solar_absorptance": 0.70,
        "description": "Indigenous high-thermal-mass earth wall with high heat capacity for night heat release.",
        "pros": ["Zero transport cost in Ladakh", "High thermal mass (8-10hr lag)", "100% biodegradable"],
        "cons": ["Labor intensive", "Requires thick structural footprint"]
    },
    "cseb_blocks": {
        "id": "cseb_blocks",
        "name": "Compressed Stabilized Earth Blocks (CSEB)",
        "category": "Earth & Masonry",
        "conductivity": 0.90,
        "density": 1850,
        "specific_heat": 980,
        "default_thickness": 0.25,
        "cost_per_m2_default": 900,
        "embodied_carbon": 35,
        "local_availability": 9,
        "solar_absorptance": 0.68,
        "description": "Hydraulically pressed local soil stabilized with 5% cement/lime.",
        "pros": ["Uniform strength", "High thermal mass", "Manufacturable on site"],
        "cons": ["Moderate cement curing needed"]
    },
    "drdo_puf_panel": {
        "id": "drdo_puf_panel",
        "name": "DRDO Modular PUF Sandwich Wall (Military Spec)",
        "category": "Pre-Engineered Military",
        "conductivity": 0.024,
        "density": 42,
        "specific_heat": 1400,
        "default_thickness": 0.10, # 100mm
        "cost_per_m2_default": 2400,
        "embodied_carbon": 140,
        "local_availability": 7,
        "solar_absorptance": 0.50,
        "description": "Military-grade rapid assembly sandwich panels with galvanized steel facings and polyurethane foam core.",
        "pros": ["Extremely low U-value (0.24 W/m?K)", "Airlift-ready modular assembly", "Hermetic air-seal"],
        "cons": ["Low thermal mass", "High material cost"]
    },
    "aac_blocks": {
        "id": "aac_blocks",
        "name": "Autoclaved Aerated Concrete (AAC) Blocks",
        "category": "Engineered Concrete",
        "conductivity": 0.16,
        "density": 600,
        "specific_heat": 1050,
        "default_thickness": 0.20,
        "cost_per_m2_default": 1300,
        "embodied_carbon": 95,
        "local_availability": 8,
        "solar_absorptance": 0.60,
        "description": "Lightweight precast concrete blocks with millions of microscopic air pockets.",
        "pros": ["Good thermal resistance", "Fire resistant", "Lightweight"],
        "cons": ["Requires mortar joints and moisture barrier"]
    },
    "stone_granite_masonry": {
        "id": "stone_granite_masonry",
        "name": "Traditional Slate / Granite Stone Masonry",
        "category": "Earth & Masonry",
        "conductivity": 1.80,
        "density": 2400,
        "specific_heat": 850,
        "default_thickness": 0.40,
        "cost_per_m2_default": 1100,
        "embodied_carbon": 20,
        "local_availability": 10,
        "solar_absorptance": 0.75,
        "description": "Locally quarried heavy stone walls delivering massive thermal buffering.",
        "pros": ["Unmatched durability", "Ultra-high thermal inertia", "Local material"],
        "cons": ["High conductivity requires external insulation batt"]
    },
    "straw_bale_plaster": {
        "id": "straw_bale_plaster",
        "name": "Compressed Straw-Bale with Lime Plaster",
        "category": "Bio-Based Sustainable",
        "conductivity": 0.065,
        "density": 120,
        "specific_heat": 1800,
        "default_thickness": 0.30,
        "cost_per_m2_default": 800,
        "embodied_carbon": -25, # Net Carbon Negative!
        "local_availability": 7,
        "solar_absorptance": 0.55,
        "description": "Agricultural byproduct bales encased in lime-mud breathable rendering.",
        "pros": ["Carbon negative envelope", "Superb insulation (R-4.6)", "Very low cost"],
        "cons": ["Requires careful rodent & moisture detailing"]
    }
}

INSULATION_MATERIALS: Dict[str, Dict[str, Any]] = {
    "local_sheep_wool": {
        "id": "local_sheep_wool",
        "name": "Ladakh Indigenous Sheep Wool Batt",
        "category": "Bio-Natural",
        "conductivity": 0.038,
        "density": 28,
        "specific_heat": 1850,
        "default_thickness": 0.08, # 80mm
        "cost_per_m2_default": 420,
        "embodied_carbon": 6,
        "local_availability": 10,
        "description": "Natural Changthangi sheep wool batts treated with borax for fire/insect resistance.",
        "pros": ["Naturally hygroscopic (regulates humidity)", "Locally abundant in Ladakh", "Zero toxicity"],
        "cons": ["Requires pest treatment (Borax)"]
    },
    "eps_expanded_polystyrene": {
        "id": "eps_expanded_polystyrene",
        "name": "Expanded Polystyrene (EPS)",
        "category": "Synthetic Foam",
        "conductivity": 0.035,
        "density": 22,
        "specific_heat": 1450,
        "default_thickness": 0.075, # 75mm
        "cost_per_m2_default": 350,
        "embodied_carbon": 75,
        "local_availability": 9,
        "description": "Standard rigid insulation foam boards widely used for external wall envelope wrapping.",
        "pros": ["Most budget friendly", "Lightweight & easy cutting", "Moisture resistant"],
        "cons": ["Flammable unless protected", "Petrochemical base"]
    },
    "xps_extruded_polystyrene": {
        "id": "xps_extruded_polystyrene",
        "name": "Extruded Polystyrene (XPS)",
        "category": "Synthetic Foam",
        "conductivity": 0.028,
        "density": 35,
        "specific_heat": 1400,
        "default_thickness": 0.06, # 60mm
        "cost_per_m2_default": 720,
        "embodied_carbon": 90,
        "local_availability": 8,
        "description": "High compressive strength closed-cell rigid foam for sub-zero ground and perimeter insulation.",
        "pros": ["Zero water absorption", "High compressive strength for sub-slab", "Superior R-value"],
        "cons": ["Higher cost than EPS"]
    },
    "rockwool_dense": {
        "id": "rockwool_dense",
        "name": "High-Density Rockwool / Mineral Wool",
        "category": "Mineral Fiber",
        "conductivity": 0.034,
        "density": 80,
        "specific_heat": 840,
        "default_thickness": 0.08, # 80mm
        "cost_per_m2_default": 620,
        "embodied_carbon": 60,
        "local_availability": 8,
        "description": "Basalt volcanic rock spun into dense thermal & acoustic fire-stop insulation.",
        "pros": ["Non-combustible (Class A1 fire rating)", "Breathable vapor permeability", "High stability"],
        "cons": ["Requires protective gloves during installation"]
    },
    "aerogel_blanket": {
        "id": "aerogel_blanket",
        "name": "Aerogel Cryo-Insulation Blanket (Ultra-Tech)",
        "category": "Nanotechnology",
        "conductivity": 0.015,
        "density": 150,
        "specific_heat": 1000,
        "default_thickness": 0.02, # 20mm
        "cost_per_m2_default": 3800,
        "embodied_carbon": 180,
        "local_availability": 4,
        "description": "Silica aerogel matrix reinforced with non-woven batting for maximum insulation in minimal thickness.",
        "pros": ["Thinnest profile in existence", "Superb thermal barrier for tight spaces", "Extreme cold tested"],
        "cons": ["High premium cost"]
    }
}

ROOF_MATERIALS: Dict[str, Dict[str, Any]] = {
    "timber_mud_willow": {
        "id": "timber_mud_willow",
        "name": "Traditional Ladakhi Mud-Willow Roof + Wool Layer",
        "category": "Vernacular Timber",
        "conductivity": 0.12,
        "density": 1200,
        "specific_heat": 1200,
        "default_thickness": 0.25,
        "cost_per_m2_default": 1150,
        "embodied_carbon": 18,
        "local_availability": 10,
        "solar_absorptance": 0.65,
        "description": "Poplar beams, willow twigs (talo), dry straw layer, topped with compacted Ladakhi clay (Markalak).",
        "pros": ["Authentic passive architecture", "Substantial thermal capacitance", "Local craft"],
        "cons": ["Annual clay maintenance required"]
    },
    "insulated_cgi_panel": {
        "id": "insulated_cgi_panel",
        "name": "Sloped CGI Sheet + 100mm Rockwool & Ceiling Board",
        "category": "Engineered Composite",
        "conductivity": 0.036,
        "density": 45,
        "specific_heat": 1100,
        "default_thickness": 0.15,
        "cost_per_m2_default": 1750,
        "embodied_carbon": 95,
        "local_availability": 9,
        "solar_absorptance": 0.50,
        "description": "Pre-painted Corrugated Galvanized Iron roof over heavy rockwool insulation batt and pine wood ceiling.",
        "pros": ["Rapid snow shedding", "Weatherproof & hail resistant", "Excellent insulation"],
        "cons": ["Acoustic rain/wind noise without ceiling mass"]
    },
    "drdo_puf_roof": {
        "id": "drdo_puf_roof",
        "name": "DRDO Structural PUF Insulated Roof Panels (120mm)",
        "category": "Pre-Engineered Military",
        "conductivity": 0.022,
        "density": 45,
        "specific_heat": 1400,
        "default_thickness": 0.12,
        "cost_per_m2_default": 2800,
        "embodied_carbon": 160,
        "local_availability": 7,
        "solar_absorptance": 0.45,
        "description": "Self-supporting high-load military sandwich roof panels with thermal break interlocks.",
        "pros": ["High snow load capacity (500 kg/m?)", "Superior insulation", "Rapid assembly"],
        "cons": ["Airlift logistics needed"]
    },
    "insulated_rcc_slab": {
        "id": "insulated_rcc_slab",
        "name": "RCC Concrete Slab + 80mm XPS Top-Deck Insulation",
        "category": "Engineered Concrete",
        "conductivity": 0.040,
        "density": 1800,
        "specific_heat": 950,
        "default_thickness": 0.22,
        "cost_per_m2_default": 2300,
        "embodied_carbon": 220,
        "local_availability": 8,
        "solar_absorptance": 0.60,
        "description": "150mm reinforced concrete slab with over-slab XPS insulation and waterproof screed.",
        "pros": ["Walkable roof deck", "Immense interior thermal mass", "Wind-blast proof"],
        "cons": ["High embodied carbon", "Slow cold-weather curing"]
    }
}

GLAZING_SYSTEMS: Dict[str, Dict[str, Any]] = {
    "double_low_e_argon": {
        "id": "double_low_e_argon",
        "name": "Double Glazed Low-E + 16mm Argon Gap (Standard Passive)",
        "category": "High Performance Glazing",
        "u_value": 1.4, # W/m??K
        "shgc": 0.62,   # Solar Heat Gain Coefficient (high for solar capture)
        "vlt": 0.74,    # Visible Light Transmittance
        "cost_per_m2": 3200,
        "embodied_carbon": 65,
        "description": "Low-Emissivity silver coating on surface #3 reflecting indoor infrared heat back inside while transmitting solar radiation.",
        "pros": ["Ideal passive solar trap", "Prevents night radiative heat drain", "Resists condensation"],
        "cons": ["Requires airtight UPVC/thermal-break aluminum frame"]
    },
    "triple_low_e_krypton": {
        "id": "triple_low_e_krypton",
        "name": "Triple Glazed Ultra Low-E + Krypton Gas (Siachen Arctic Spec)",
        "category": "Extreme Cold Glazing",
        "u_value": 0.75,
        "shgc": 0.52,
        "vlt": 0.65,
        "cost_per_m2": 6800,
        "embodied_carbon": 110,
        "description": "Triple glass layers with two Low-E coatings and dual Krypton gas filled chambers.",
        "pros": ["Extreme insulation equivalent to solid insulated wall", "Surface stays warm at -40?C outdoor", "Zero draft"],
        "cons": ["Heavy sash weight", "High investment cost"]
    },
    "trombe_glazing_double": {
        "id": "trombe_glazing_double",
        "name": "Trombe Solar Heat Storage Glazing with Thermal Damper",
        "category": "Solar Collector",
        "u_value": 1.7,
        "shgc": 0.75,
        "vlt": 0.82,
        "cost_per_m2": 3900,
        "embodied_carbon": 70,
        "description": "Clear high-transmittance outer glazing placed 10cm ahead of dark painted south wall with top/bottom convective air vents.",
        "pros": ["Powers passive thermo-siphon convective loop", "Heats room naturally all winter", "No electricity needed"],
        "cons": ["Requires night insulation shutter for maximum efficiency"]
    },
    "polycarbonate_multiwall": {
        "id": "polycarbonate_multiwall",
        "name": "16mm Multiwall Polycarbonate Sheet (Shatterproof Solarium)",
        "category": "Polymer Glazing",
        "u_value": 2.2,
        "shgc": 0.70,
        "vlt": 0.76,
        "cost_per_m2": 1450,
        "embodied_carbon": 45,
        "description": "Multi-cell polycarbonate panels engineered for high altitude UV resistance and snow load impact.",
        "pros": ["Virtually unbreakable by rockfalls/snow", "Lightweight for transport", "Affordable"],
        "cons": ["Moderate U-value compared to glass"]
    },
    "single_clear_glass": {
        "id": "single_clear_glass",
        "name": "Standard Single Glazing 5mm (Baseline)",
        "category": "Legacy Glazing",
        "u_value": 5.8,
        "shgc": 0.82,
        "vlt": 0.88,
        "cost_per_m2": 850,
        "embodied_carbon": 30,
        "description": "Conventional single pane window. Serves as reference point for thermal leakage comparison.",
        "pros": ["Lowest upfront cost"],
        "cons": ["Severe heat loss", "Heavy frost condensation and draft"]
    }
}

def get_all_materials() -> Dict[str, Any]:
    return {
        "walls": list(WALL_MATERIALS.values()),
        "insulations": list(INSULATION_MATERIALS.values()),
        "roofs": list(ROOF_MATERIALS.values()),
        "glazings": list(GLAZING_SYSTEMS.values())
    }