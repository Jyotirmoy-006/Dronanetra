import os
import sys
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    KeepTogether,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        canvas.Canvas.__init__(self, *args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 7)
        self.setFillColor(colors.HexColor("#475569"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 750, "DRONANETRA MALE UAV AERO PISTON ENGINE DIGITAL TWIN")
            self.drawRightString(558, 750, "RESTRICTED // AERONAUTICAL TECHNICAL OVERVIEW")
            self.setStrokeColor(colors.HexColor("#cbd5e1"))
            self.setLineWidth(0.5)
            self.line(54, 742, 558, 742)

        # Footer (all pages)
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(54, 45, 558, 45)
        self.setFont("Helvetica", 7)
        self.drawString(54, 32, "CONFIDENTIAL & PROPRIETARY — TAPAS-BH201 / ROTAX 914 PROGNOSTICS")
        self.drawRightString(558, 32, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()

def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54,
    )

    styles = getSampleStyleSheet()
    
    # Custom Palette
    c_primary = colors.HexColor("#0f172a")      # Deep Navy
    c_accent = colors.HexColor("#0284c7")       # Cyan/Blue
    c_border = colors.HexColor("#cbd5e1")       # Border grey
    c_table_bg = colors.HexColor("#f8fafc")     # Light card background
    c_table_header = colors.HexColor("#1e293b") # Header dark

    # Custom Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=c_primary,
        alignment=TA_LEFT,
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=c_accent,
        alignment=TA_LEFT,
    )
    
    meta_style = ParagraphStyle(
        'DocMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#64748b"),
        alignment=TA_LEFT,
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=c_primary,
        spaceBefore=12,
        spaceAfter=6,
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor("#1e293b"),
        spaceBefore=8,
        spaceAfter=4,
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#334155"),
        alignment=TA_JUSTIFY,
        spaceAfter=6,
    )

    body_bold = ParagraphStyle(
        'Body_Bold',
        parent=body_style,
        fontName='Helvetica-Bold',
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white,
        alignment=TA_CENTER,
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor("#1e293b"),
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor("#0f172a"),
    )

    story = []

    # Title Banner Block
    story.append(Paragraph("DRONANETRA MALE UAV AERO PISTON ENGINE DIGITAL TWIN", title_style))
    story.append(Spacer(1, 3))
    story.append(Paragraph("PREDICTIVE HEALTH MANAGEMENT (PHM) & AUTONOMOUS DIAGNOSTIC GCS PLATFORM", subtitle_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph("Target Platform: <b>TAPAS-BH201 (Rustom-II)</b> | Propulsion: <b>Rotax 914 Turbocharged Aero Engine</b> | Standard: <b>SAE J1939-11</b>", meta_style))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_primary, spaceBefore=0, spaceAfter=10))

    # Section 1: Executive Overview
    story.append(Paragraph("1. Executive Summary & Mission Scope", h1_style))
    story.append(Paragraph(
        "This platform is a mission-critical <b>Ground Control Station (GCS) Digital Twin and Prognostic Health Management (PHM) ecosystem</b> engineered for India's <b>Dronanetra MALE UAV program (TAPAS-BH201)</b>. Operating at a continuous 1 Hz synchronization cycle, the digital twin fuses real-time telemetry with <b>first-principles thermodynamic physics models</b> and <b>explainable artificial intelligence (XAI)</b> to transition aero-engine maintenance from reactive overhauls to proactive, condition-based operational readiness.",
        body_style
    ))

    # Section 2: Dual-Engine Architecture
    story.append(Paragraph("2. Dual-Engine Hybrid Diagnostic Architecture", h1_style))
    story.append(Paragraph(
        "The digital twin operates a synchronized dual-path diagnostic pipeline, combining static threshold boundaries with dynamic physics residuals and machine learning prognostics:",
        body_style
    ))

    arch_data = [
        [
            Paragraph("Diagnostic Dimension", table_header_style),
            Paragraph("Methodology & Mathematical Formulation", table_header_style),
            Paragraph("Operational Impact", table_header_style)
        ],
        [
            Paragraph("<b>Physics & Thermodynamics</b>", table_cell_bold),
            Paragraph("ISA standard atmosphere density correction up to 30,000 ft. Generates expected baselines for CHT, EGT, Fuel Flow (L/h), and MAP based on dynamic throttle and RPM curves.", table_cell_style),
            Paragraph("Calculates real-time physics residuals: <i>Residual = |Actual - Expected|</i>.", table_cell_style)
        ],
        [
            Paragraph("<b>AI Anomaly Detection</b>", table_cell_bold),
            Paragraph("Unsupervised Isolation Forest algorithm trained on multi-dimensional flight parameters and physics residuals.", table_cell_style),
            Paragraph("Detects early-stage sensor and system drift before conventional alarm thresholds are breached.", table_cell_style)
        ],
        [
            Paragraph("<b>Fault Classification (ISP #2)</b>", table_cell_bold),
            Paragraph("Multi-Class Gradient Boosted Classifier (XGBoost) identifying 7 core aero-engine failure modes.", table_cell_style),
            Paragraph("Instant classification of Overheating, Misfire, Lubrication Loss, Fuel Restriction, High Vibration.", table_cell_style)
        ],
        [
            Paragraph("<b>SHAP Explainability (XAI)</b>", table_cell_bold),
            Paragraph("Game-theoretic Shapley Additive Explanations attributing anomaly scores to exact sensor inputs.", table_cell_style),
            Paragraph("Full diagnostic transparency for GCS flight operators and maintenance crews.", table_cell_style)
        ],
        [
            Paragraph("<b>Prognostic RUL Regressor</b>", table_cell_bold),
            Paragraph("Continuous Remaining Useful Life regression calculating flight hours remaining until mandatory TBO.", table_cell_style),
            Paragraph("Outputs confidence bounds and future 30-minute operational mission feasibility forecasting.", table_cell_style)
        ],
    ]

    arch_table = Table(arch_data, colWidths=[120, 234, 150])
    arch_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_table_header),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [c_table_bg, colors.white]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(arch_table)
    story.append(Spacer(1, 10))

    # Section 3: Subsystem Life-Cycle Wear Tracking
    story.append(Paragraph("3. Component Life-Cycle Wear & TBO Tracking (7 Subsystems)", h1_style))
    story.append(Paragraph(
        "The digital twin continuously computes wear degradation percentages and remaining flight hours across seven critical aero-engine subsystems using live operating stresses:",
        body_style
    ))

    comp_data = [
        [
            Paragraph("Component ID", table_header_style),
            Paragraph("Subsystem Name", table_header_style),
            Paragraph("Max TBO", table_header_style),
            Paragraph("Primary Wear Acceleration Factors", table_header_style),
            Paragraph("Rated Status", table_header_style)
        ],
        [
            Paragraph("<b>COMP-IGN-01</b>", table_cell_bold),
            Paragraph("Dual Spark Plugs & Coils", table_cell_style),
            Paragraph("200 hrs", table_cell_style),
            Paragraph("CHT thermal stress (>140°C) and ignition misfire occurrences.", table_cell_style),
            Paragraph("Condition-Based", table_cell_style)
        ],
        [
            Paragraph("<b>COMP-LUB-02</b>", table_cell_bold),
            Paragraph("Oil Filter Element & Pump", table_cell_style),
            Paragraph("100 hrs", table_cell_style),
            Paragraph("Oil pressure delta (<2.5 bar) and scavenge oil temp (>95°C).", table_cell_style),
            Paragraph("Condition-Based", table_cell_style)
        ],
        [
            Paragraph("<b>COMP-FUL-03</b>", table_cell_bold),
            Paragraph("Fuel Injector Nozzles & Rail", table_cell_style),
            Paragraph("500 hrs", table_cell_style),
            Paragraph("Fuel line flow restrictions and high delivery variance across Cyl 1-4.", table_cell_style),
            Paragraph("Condition-Based", table_cell_style)
        ],
        [
            Paragraph("<b>COMP-THM-04</b>", table_cell_bold),
            Paragraph("Turbocharger & Wastegate", table_cell_style),
            Paragraph("400 hrs", table_cell_style),
            Paragraph("High Exhaust Gas Temperature (EGT > 780°C) and boost fatigue.", table_cell_style),
            Paragraph("Condition-Based", table_cell_style)
        ],
        [
            Paragraph("<b>COMP-COL-05</b>", table_cell_bold),
            Paragraph("Coolant Pump Impeller", table_cell_style),
            Paragraph("600 hrs", table_cell_style),
            Paragraph("Coolant thermal cycling and impeller cavitation indexing.", table_cell_style),
            Paragraph("Condition-Based", table_cell_style)
        ],
        [
            Paragraph("<b>COMP-ELE-06</b>", table_cell_bold),
            Paragraph("Alternator Belt & Power Bus", table_cell_style),
            Paragraph("300 hrs", table_cell_style),
            Paragraph("Electrical current draw load (>42A) and voltage ripple fluctuations.", table_cell_style),
            Paragraph("Condition-Based", table_cell_style)
        ],
        [
            Paragraph("<b>COMP-MEC-07</b>", table_cell_bold),
            Paragraph("Crankshaft Main Bearings", table_cell_style),
            Paragraph("1000 hrs", table_cell_style),
            Paragraph("Dynamic mechanical vibration FFT harmonics (1X/2X order spikes).", table_cell_style),
            Paragraph("Condition-Based", table_cell_style)
        ],
    ]

    comp_table = Table(comp_data, colWidths=[75, 115, 50, 184, 80])
    comp_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_table_header),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [c_table_bg, colors.white]),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
    ]))
    story.append(comp_table)
    story.append(Spacer(1, 10))

    # Section 4: SocketCAN / J1939 Protocol Inspector
    story.append(Paragraph("4. SocketCAN / SAE J1939 Aero-FADEC Protocol Inspector", h1_style))
    story.append(Paragraph(
        "The digital twin integrates a virtualized hardware-tap SocketCAN interface (<code>can0</code> / <code>vcan0</code>) running at <b>500 kbps</b>. It broadcasts and decodes 29-bit extended CAN identifiers and standard J1939 Parameter Group Numbers (PGNs):",
        body_style
    ))

    can_data = [
        [Paragraph("PGN", table_header_style), Paragraph("Broadcast Label", table_header_style), Paragraph("Decoded Engine Parameters", table_header_style), Paragraph("Rate", table_header_style)],
        [Paragraph("<b>61444</b>", table_cell_bold), Paragraph("EEC1 (Electronic Engine Controller 1)", table_cell_style), Paragraph("Actual Engine RPM, Engine Demand Torque %, Starter State", table_cell_style), Paragraph("100 ms", table_cell_style)],
        [Paragraph("<b>65262</b>", table_cell_bold), Paragraph("ET1 (Engine Temperature 1)", table_cell_style), Paragraph("Cylinder Head Temp (CHT °C), Exhaust Gas Temp (EGT °C)", table_cell_style), Paragraph("1000 ms", table_cell_style)],
        [Paragraph("<b>65263</b>", table_cell_bold), Paragraph("EFL_P1 (Engine Fluid Level/Pressure)", table_cell_style), Paragraph("Engine Oil Pressure (bar), Fuel Rail Delivery Pressure (bar)", table_cell_style), Paragraph("500 ms", table_cell_style)],
        [Paragraph("<b>65271</b>", table_cell_bold), Paragraph("VEP1 (Vehicle Electrical Power 1)", table_cell_style), Paragraph("Main 28V DC Avionics Bus Voltage, Alternator Current Draw (A)", table_cell_style), Paragraph("1000 ms", table_cell_style)],
        [Paragraph("<b>65253</b>", table_cell_bold), Paragraph("ENGINE_HOURS (Total Run Time)", table_cell_style), Paragraph("Total Accumulated Airframe/Engine Operating Hours (HRS)", table_cell_style), Paragraph("1000 ms", table_cell_style)],
        [Paragraph("<b>65280</b>", table_cell_bold), Paragraph("PROGN_DIAG (Digital Twin Telemetry)", table_cell_style), Paragraph("Composite Health Index %, RUL Flight Hours Remaining", table_cell_style), Paragraph("1000 ms", table_cell_style)],
    ]

    can_table = Table(can_data, colWidths=[55, 140, 249, 60])
    can_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_table_header),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [c_table_bg, colors.white]),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(can_table)
    story.append(Spacer(1, 10))

    # Section 5: Ground Control Station Tactical Features
    story.append(Paragraph("5. Tactical GCS Interface & Flight Crew Features", h1_style))
    story.append(Paragraph(
        "The Ground Control Station user interface is crafted with a high-durability <b>Weathered Metallic Steel Plate aesthetic</b> matching certified military avionics panels:",
        body_style
    ))
    story.append(Paragraph("• <b>Precision Aviation Meter Cluster</b>: Uniform circular analog meters for Engine RPM, Manifold Absolute Pressure (MAP), CHT, EGT, Oil Pressure/Temperature, Fuel Flow, Vibration, and Avionics Bus Voltage.", body_style))
    story.append(Paragraph("• <b>Autonomous Maintenance Advisory</b>: Dynamic action checklist categorizing work orders into <i>IMMEDIATE (NEXT FLIGHT)</i>, <i>URGENT PRE-FLIGHT</i>, and <i>ROUTINE 25H/50H/100H</i> with 1-click technical report generation.", body_style))
    story.append(Paragraph("• <b>Mission History & Multi-Format Log Exporter</b>: Instant export of flight telemetry into <b>CSV</b>, <b>Excel (.xlsx)</b>, <b>JSON</b>, and <b>PDF</b> formats directly from the live dashboard and history consoles.", body_style))
    story.append(Paragraph("• <b>What-If Scenario Simulation</b>: Dynamic stress test bench supporting live injection of critical failure modes (Misfire, Overheating, Lubrication Loss) and extreme atmospheric profiles.", body_style))
    story.append(Spacer(1, 10))

    # Section 6: System Execution & Tech Stack Summary
    story.append(Paragraph("6. Technology Stack & Deployment Endpoints", h1_style))
    
    tech_data = [
        [Paragraph("Layer", table_header_style), Paragraph("Technology / Framework", table_header_style), Paragraph("Key Role & Protocols", table_header_style)],
        [Paragraph("<b>Backend Engine</b>", table_cell_bold), Paragraph("FastAPI (Python 3.10+) & Uvicorn", table_cell_style), Paragraph("REST API & 1 Hz WebSocket stream (<code>/ws/engine</code>).", table_cell_style)],
        [Paragraph("<b>AI & Analytics</b>", table_cell_bold), Paragraph("XGBoost, Scikit-Learn, SHAP, NumPy", table_cell_style), Paragraph("Dual-engine AI inference, XAI attribution, RUL curves.", table_cell_style)],
        [Paragraph("<b>Protocol Layer</b>", table_cell_bold), Paragraph("python-can & SocketCAN (can0)", table_cell_style), Paragraph("SAE J1939-11 29-bit CAN bus frame generation & decode.", table_cell_style)],
        [Paragraph("<b>GCS Frontend</b>", table_cell_bold), Paragraph("React 18, Vite, Recharts, Lucide", table_cell_style), Paragraph("Tactical GCS dashboard with real-time WebSocket state.", table_cell_style)],
        [Paragraph("<b>Export Engines</b>", table_cell_bold), Paragraph("jsPDF, XLSX (SheetJS), ReportLab", table_cell_style), Paragraph("Multi-format flight telemetry logs & engineering whitepapers.", table_cell_style)],
    ]

    tech_table = Table(tech_data, colWidths=[90, 160, 254])
    tech_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_table_header),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [c_table_bg, colors.white]),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
    ]))
    story.append(tech_table)
    story.append(Spacer(1, 14))

    story.append(HRFlowable(width="100%", thickness=1, color=c_border, spaceBefore=0, spaceAfter=8))
    story.append(Paragraph("<b>CONFIDENTIAL</b> // AERONAUTICAL QUALITY ASSURANCE NODE // TAPAS-BH201 DIGITAL TWIN", meta_style))

    # Build PDF
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated technical overview PDF at: {filename}")

if __name__ == "__main__":
    out_path = os.path.abspath("Dronanetra_MALE_UAV_Digital_Twin_Project_Overview.pdf")
    build_pdf(out_path)
