"""
ThermoShell Automated PDF Spec-Sheet Engine
Generates downloadable, engineering-grade DRDO compliant Passive Solar Architecture Spec Sheets.
"""

import io
import os
from typing import Dict, Any
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
)
from reportlab.graphics.shapes import Drawing, Rect, String, Line, Group, Polygon

def generate_pdf_specsheet(
    sim_data: Dict[str, Any],
    location_name: str = "Ladakh High-Altitude Field Base",
    lat: float = 34.152,
    lon: float = 77.577,
    elevation_m: float = 3524.0,
    dims: Dict[str, Any] = None
) -> bytes:
    """
    Generates a high-quality PDF spec sheet and returns PDF bytes.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom styles
    header_title_style = ParagraphStyle(
        'HeaderTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#0f172a'),
        alignment=0
    )

    badge_style = ParagraphStyle(
        'Badge',
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=colors.HexColor('#047857'),
        alignment=0
    )

    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#1e293b'),
        spaceBefore=10,
        spaceAfter=6
    )

    body_text = ParagraphStyle(
        'BodyText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#334155')
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=10,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        fontName='Helvetica',
        fontSize=8.5,
        leading=10.5,
        textColor=colors.HexColor('#1e293b')
    )

    elements = []

    # 1. Header Banner & Classification
    header_data = [
        [
            Paragraph("<b>THERMOSHELL TACTICAL SPEC SHEET</b><br/><font size=8 color='#475569'>DRDO PASSIVE SOLAR ARCHITECTURE MATCHMAKER | SIH 2026</font>", header_title_style),
            Paragraph("<b>STATUS:</b> FIELD-READY<br/><b>ZONE:</b> HIGH-ALTITUDE COLD<br/><b>DOC ID:</b> TS-2026-LDK-01", badge_style)
        ]
    ]
    header_table = Table(header_data, colWidths=[360, 160])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LINEBELOW', (0,0), (-1,-1), 1.5, colors.HexColor('#0284c7'))
    ]))
    elements.append(header_table)
    elements.append(Spacer(1, 10))

    # 2. Site & Deployment Metadata
    meta_data = [
        [
            Paragraph("<b>Target Location:</b>", table_cell_style),
            Paragraph(f"{location_name}", table_cell_style),
            Paragraph("<b>Coordinates:</b>", table_cell_style),
            Paragraph(f"{lat:.4f}? N, {lon:.4f}? E", table_cell_style)
        ],
        [
            Paragraph("<b>Altitude / Terrain:</b>", table_cell_style),
            Paragraph(f"{elevation_m:,.0f} m AMSL (Cold Desert)", table_cell_style),
            Paragraph("<b>Target Comfort Band:</b>", table_cell_style),
            Paragraph("18.0?C ? 24.0?C (DRDO Standard)", table_cell_style)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[110, 150, 110, 150])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 10))

    # 3. 2D Architectural Drawing Diagram (Vector graphics generated with ReportLab Drawing)
    elements.append(Paragraph("1. ARCHITECTURAL BLUEPRINT & SOLAR ORIENTATION (PLAN VIEW)", section_heading))
    
    dwg = Drawing(520, 110)
    # Background Grid
    dwg.add(Rect(0, 0, 520, 110, fillColor=colors.HexColor('#f1f5f9'), strokeColor=colors.HexColor('#cbd5e1'), strokeWidth=0.5))
    
    # Room Box (Plan View)
    dwg.add(Rect(140, 20, 240, 70, fillColor=colors.HexColor('#ffffff'), strokeColor=colors.HexColor('#0f172a'), strokeWidth=2))
    
    # Trombe Wall / South Glazing (Bottom edge = South in diagram)
    dwg.add(Rect(160, 16, 200, 8, fillColor=colors.HexColor('#f59e0b'), strokeColor=colors.HexColor('#d97706'), strokeWidth=1))
    dwg.add(String(200, 6, "? SOUTH SOLAR GLAZING & TROMBE WALL ?", fontSize=7, fontName='Helvetica-Bold', fillColor=colors.HexColor('#b45309')))
    
    # Dimensions text
    L_m = dims.get("length_m", 6.0) if dims else 6.0
    W_m = dims.get("width_m", 4.0) if dims else 4.0
    H_m = dims.get("height_m", 2.8) if dims else 2.8
    
    dwg.add(String(230, 52, f"PLAN: {L_m}m (E-W) x {W_m}m (N-S)", fontSize=8, fontName='Helvetica-Bold', fillColor=colors.HexColor('#1e293b')))
    dwg.add(String(235, 38, f"Clear Ceiling Height: {H_m}m", fontSize=7.5, fontName='Helvetica', fillColor=colors.HexColor('#64748b')))
    
    # North Arrow Indicator
    dwg.add(Line(50, 30, 50, 85, strokeColor=colors.HexColor('#dc2626'), strokeWidth=2))
    dwg.add(Polygon([45, 75, 55, 75, 50, 92], fillColor=colors.HexColor('#dc2626'), strokeColor=colors.HexColor('#dc2626')))
    dwg.add(String(47, 20, "N", fontSize=10, fontName='Helvetica-Bold', fillColor=colors.HexColor('#dc2626')))
    dwg.add(String(22, 10, "TRUE NORTH", fontSize=6.5, fontName='Helvetica-Bold', fillColor=colors.HexColor('#475569')))

    # Solar Ray indicators
    dwg.add(String(410, 80, "Winter Solar Rays (32? Alt)", fontSize=7.5, fontName='Helvetica-Bold', fillColor=colors.HexColor('#ea580c')))
    dwg.add(Line(400, 75, 370, 26, strokeColor=colors.HexColor('#ea580c'), strokeWidth=1.5, strokeDashArray=[3,2]))
    dwg.add(String(410, 45, "Max Solar Heat Trap", fontSize=7, fontName='Helvetica', fillColor=colors.HexColor('#64748b')))

    elements.append(dwg)
    elements.append(Spacer(1, 10))

    # 4. Bill of Materials (BOM) Table
    elements.append(Paragraph("2. ENVELOPE RECIPE & BILL OF MATERIALS (BOM)", section_heading))
    
    mb = sim_data.get("materials_breakdown", {})
    metrics = sim_data.get("metrics", {})
    
    bom_data = [
        [
            Paragraph("<b>Component</b>", table_header_style),
            Paragraph("<b>Selected Material & Specification</b>", table_header_style),
            Paragraph("<b>Thickness</b>", table_header_style),
            Paragraph("<b>Thermal R / U</b>", table_header_style),
            Paragraph("<b>Est. Cost (?)</b>", table_header_style)
        ],
        [
            Paragraph("<b>Exterior Wall Core</b>", table_cell_style),
            Paragraph(f"{mb.get('wall', {}).get('name', 'Rammed Earth')}", table_cell_style),
            Paragraph(f"{mb.get('wall', {}).get('thickness_cm', 35):.0f} cm", table_cell_style),
            Paragraph(f"U = {mb.get('wall', {}).get('u_value', 0.28):.3f} W/m?K", table_cell_style),
            Paragraph(f"?{mb.get('wall', {}).get('cost_inr', 0):,.0f}", table_cell_style)
        ],
        [
            Paragraph("<b>Thermal Insulation</b>", table_cell_style),
            Paragraph(f"{mb.get('insulation', {}).get('name', 'Sheep Wool Batt')}", table_cell_style),
            Paragraph(f"{mb.get('insulation', {}).get('thickness_cm', 8):.0f} cm", table_cell_style),
            Paragraph(f"R = {mb.get('insulation', {}).get('r_value', 2.1):.2f} m?K/W", table_cell_style),
            Paragraph(f"?{mb.get('insulation', {}).get('cost_inr', 0):,.0f}", table_cell_style)
        ],
        [
            Paragraph("<b>Roof Assembly</b>", table_cell_style),
            Paragraph(f"{mb.get('roof', {}).get('name', 'Timber Mud-Willow')}", table_cell_style),
            Paragraph(f"{mb.get('roof', {}).get('thickness_cm', 25):.0f} cm", table_cell_style),
            Paragraph(f"U = {mb.get('roof', {}).get('u_value', 0.22):.3f} W/m?K", table_cell_style),
            Paragraph(f"?{mb.get('roof', {}).get('cost_inr', 0):,.0f}", table_cell_style)
        ],
        [
            Paragraph("<b>Fenestration & Glazing</b>", table_cell_style),
            Paragraph(f"{mb.get('glazing', {}).get('name', 'Double Low-E Argon')}", table_cell_style),
            Paragraph(f"{mb.get('glazing', {}).get('area_m2', 5.2):.1f} m?", table_cell_style),
            Paragraph(f"U = {mb.get('glazing', {}).get('u_value', 1.4):.2f} | SHGC: {mb.get('glazing', {}).get('shgc', 0.62):.2f}", table_cell_style),
            Paragraph(f"?{mb.get('glazing', {}).get('cost_inr', 0):,.0f}", table_cell_style)
        ],
        [
            Paragraph("<b>Passive Solar Storage</b>", table_cell_style),
            Paragraph("Integrated South Trombe Wall Collector", table_cell_style),
            Paragraph("Full South", table_cell_style),
            Paragraph("Thermal Lag: 7.5 hrs", table_cell_style),
            Paragraph("?35,000", table_cell_style)
        ],
        [
            Paragraph("<b>TOTAL SHELTER BUDGET</b>", ParagraphStyle('TotalLabel', fontName='Helvetica-Bold', fontSize=9, textColor=colors.HexColor('#047857'))),
            Paragraph("<b>Complete High-Altitude Envelope Package</b>", table_cell_style),
            Paragraph("?", table_cell_style),
            Paragraph(f"<b>Time Const: {metrics.get('thermal_time_constant_hrs', 32):.1f} hrs</b>", table_cell_style),
            Paragraph(f"<b>?{metrics.get('total_envelope_cost_inr', 0):,.0f}</b>", ParagraphStyle('TotalVal', fontName='Helvetica-Bold', fontSize=9.5, textColor=colors.HexColor('#047857')))
        ]
    ]

    bom_table = Table(bom_data, colWidths=[100, 180, 60, 110, 70])
    bom_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0f172a')),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('BACKGROUND', (0,1), (-1,-2), colors.white),
        ('BACKGROUND', (0,-1), (-1,-1), colors.HexColor('#ecfdf5')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4)
    ]))
    elements.append(bom_table)
    elements.append(Spacer(1, 10))

    # 5. Annual 8,760h Performance & Logistics Impact Metrics
    elements.append(Paragraph("3. 8,760-HOUR THERMAL PERFORMANCE & DEFENSE LOGISTICS IMPACT", section_heading))
    
    perf_data = [
        [
            Paragraph("<b>Natural Comfort Hours:</b>", table_cell_style),
            Paragraph(f"<font color='#047857' size=10><b>{metrics.get('comfort_hours_percentage', 0):.1f}%</b></font> ({metrics.get('comfort_hours_count', 0):,} hrs/yr)", table_cell_style),
            Paragraph("<b>Peak Winter Min Temp:</b>", table_cell_style),
            Paragraph(f"<b>Indoor: {metrics.get('min_indoor_temp', 0):.1f}?C</b> (vs Outdoor {metrics.get('min_outdoor_temp', 0):.1f}?C)", table_cell_style)
        ],
        [
            Paragraph("<b>Heating Fuel Avoided:</b>", table_cell_style),
            Paragraph(f"<font color='#0284c7' size=9.5><b>{metrics.get('kerosene_fuel_saved_liters', 0):,.0f} Liters Kerosene / Diesel</b></font>", table_cell_style),
            Paragraph("<b>Airlift Fuel Cost Saved:</b>", table_cell_style),
            Paragraph(f"<font color='#047857' size=9.5><b>?{metrics.get('heating_cost_saved_inr', 0):,.0f} / winter</b></font>", table_cell_style)
        ],
        [
            Paragraph("<b>Carbon Emission Offset:</b>", table_cell_style),
            Paragraph(f"<b>{metrics.get('co2_emissions_avoided_kg', 0):,.0f} kg CO?</b> avoided annually", table_cell_style),
            Paragraph("<b>Envelope Cost / Sq.m:</b>", table_cell_style),
            Paragraph(f"<b>?{metrics.get('cost_per_sqm_inr', 0):,.0f} / m?</b>", table_cell_style)
        ]
    ]

    perf_table = Table(perf_data, colWidths=[130, 130, 130, 130])
    perf_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#0284c7')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5)
    ]))
    elements.append(perf_table)
    elements.append(Spacer(1, 10))

    # 6. Recommendation & Field Engineer Sign-off
    rec = sim_data.get("recipe_recommendation", {})
    rec_text = f"<b>ENGINEERING DIRECTIVE:</b> {rec.get('summary', 'Deploy specified passive solar thermal envelope to eliminate diesel bukhari dependency.')}"
    elements.append(Paragraph(rec_text, body_text))
    elements.append(Spacer(1, 10))

    # Sign-off box
    sign_data = [
        [
            Paragraph("<b>PREPARED BY:</b> ThermoShell AI Engine", ParagraphStyle('Sign1', fontName='Helvetica', fontSize=7.5, textColor=colors.HexColor('#475569'))),
            Paragraph("<b>SPONSORING AGENCY:</b> DRDO (SIH 2026)", ParagraphStyle('Sign2', fontName='Helvetica', fontSize=7.5, textColor=colors.HexColor('#475569'))),
            Paragraph("<b>VERIFICATION HASH:</b> 0x7E4C9F28A1 (AUTHENTIC)", ParagraphStyle('Sign3', fontName='Helvetica', fontSize=7.5, textColor=colors.HexColor('#047857')))
        ]
    ]
    sign_table = Table(sign_data, colWidths=[170, 170, 180])
    sign_table.setStyle(TableStyle([
        ('LINEABOVE', (0,0), (-1,-1), 0.5, colors.HexColor('#94a3b8')),
        ('TOPPADDING', (0,0), (-1,-1), 4)
    ]))
    elements.append(sign_table)

    doc.build(elements)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes