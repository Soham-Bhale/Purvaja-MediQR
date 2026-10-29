"""
MediQR - Diagram-Dominant Presentation Generator (SIH 2026 Academic White Background)
Minimizes text, maximizes large high-resolution architecture diagrams,
DFDs, state machines, and operational UI screens.
"""

import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def build_presentation(output_pptx_path="MediQR_Project_Presentation.pptx"):
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Color Palette Definitions
    C_WHITE = RGBColor(255, 255, 255)
    C_BLACK = RGBColor(0, 0, 0)
    C_DARK = RGBColor(15, 23, 42)           # Slate 900
    C_TEXT = RGBColor(30, 41, 59)           # Slate 800
    C_MUTED = RGBColor(71, 85, 105)         # Slate 600
    C_GRAY_BG = RGBColor(241, 245, 249)     # Slate 100
    C_NAVY = RGBColor(14, 50, 110)          # Hackathon Navy (#0E326E)
    C_GREEN = RGBColor(22, 101, 52)         # Forest Green (#166534)
    C_RED = RGBColor(185, 28, 28)           # Dark Crimson (#B91C1C)

    def set_white_background(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = C_WHITE
        bg.line.fill.background()
        return bg

    def add_reference_header(slide, title_text, team_name="Astralis"):
        # 1. Left Oval Team Badge
        oval = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.4), Inches(0.2), Inches(1.35), Inches(0.48))
        oval.fill.solid()
        oval.fill.fore_color.rgb = C_WHITE
        oval.line.color.rgb = C_BLACK
        oval.line.width = Pt(1.5)
        tf_o = oval.text_frame
        p_o = tf_o.paragraphs[0]
        p_o.text = team_name
        p_o.font.name = "Arial"
        p_o.font.size = Pt(12)
        p_o.font.bold = True
        p_o.font.color.rgb = C_BLACK
        p_o.alignment = PP_ALIGN.CENTER

        # 2. Center Bold Title
        tb_title = slide.shapes.add_textbox(Inches(1.85), Inches(0.16), Inches(8.9), Inches(0.55))
        tf_t = tb_title.text_frame
        tf_t.word_wrap = True
        p_t = tf_t.paragraphs[0]
        p_t.text = title_text
        p_t.font.name = "Arial"
        p_t.font.size = Pt(16.5)
        p_t.font.bold = True
        p_t.font.color.rgb = C_BLACK
        p_t.alignment = PP_ALIGN.CENTER

        # 3. Right Hackathon Branding
        tb_brand = slide.shapes.add_textbox(Inches(10.85), Inches(0.12), Inches(2.1), Inches(0.6))
        tf_b = tb_brand.text_frame
        tf_b.word_wrap = True
        p_b1 = tf_b.paragraphs[0]
        p_b1.text = "SMART INDIA"
        p_b1.font.name = "Arial Black"
        p_b1.font.size = Pt(9.5)
        p_b1.font.bold = True
        p_b1.font.color.rgb = C_NAVY
        p_b1.alignment = PP_ALIGN.RIGHT

        p_b2 = tf_b.add_paragraph()
        p_b2.text = "HACKATHON 2026"
        p_b2.font.name = "Arial Black"
        p_b2.font.size = Pt(9.0)
        p_b2.font.bold = True
        p_b2.font.color.rgb = C_DARK
        p_b2.alignment = PP_ALIGN.RIGHT

        # 4. Thin Horizontal Dividing Rule
        line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.4), Inches(0.78), Inches(12.533), Pt(1.5))
        line.fill.solid()
        line.fill.fore_color.rgb = C_BLACK
        line.line.fill.background()

    def add_bordered_frame(slide, left, top, width, height, title="", title_bg=C_GRAY_BG):
        box = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, width, height)
        box.fill.solid()
        box.fill.fore_color.rgb = C_WHITE
        box.line.color.rgb = C_BLACK
        box.line.width = Pt(1.2)

        if title:
            strip_h = Inches(0.32)
            strip = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, width, strip_h)
            strip.fill.solid()
            strip.fill.fore_color.rgb = title_bg
            strip.line.color.rgb = C_BLACK
            strip.line.width = Pt(1.2)
            tf_s = strip.text_frame
            p_s = tf_s.paragraphs[0]
            p_s.text = title
            p_s.font.name = "Arial"
            p_s.font.size = Pt(9.5)
            p_s.font.bold = True
            p_s.font.color.rgb = C_BLACK
            p_s.alignment = PP_ALIGN.CENTER
        return box

    # =========================================================================
    # SLIDE 1: TITLE PAGE (Clean Academic / SIH Format)
    # =========================================================================
    slide1 = prs.slides.add_slide(blank_layout)
    set_white_background(slide1)

    # Top SIH Header
    tb_sih1 = slide1.shapes.add_textbox(Inches(0.8), Inches(0.35), Inches(8.5), Inches(0.6))
    tf_sih1 = tb_sih1.text_frame
    p_sih1 = tf_sih1.paragraphs[0]
    p_sih1.text = "SMART INDIA HACKATHON 2026"
    p_sih1.font.name = "Georgia"
    p_sih1.font.size = Pt(28)
    p_sih1.font.bold = True
    p_sih1.font.color.rgb = C_NAVY
    p_sih1.alignment = PP_ALIGN.LEFT

    tb_sih_r = slide1.shapes.add_textbox(Inches(10.5), Inches(0.3), Inches(2.3), Inches(0.75))
    tf_sr = tb_sih_r.text_frame
    p_sr1 = tf_sr.paragraphs[0]
    p_sr1.text = "SMART INDIA"
    p_sr1.font.name = "Arial Black"
    p_sr1.font.size = Pt(12)
    p_sr1.font.bold = True
    p_sr1.font.color.rgb = C_NAVY
    p_sr1.alignment = PP_ALIGN.RIGHT

    p_sr2 = tf_sr.add_paragraph()
    p_sr2.text = "HACKATHON 2026"
    p_sr2.font.name = "Arial Black"
    p_sr2.font.size = Pt(11)
    p_sr2.font.bold = True
    p_sr2.font.color.rgb = C_DARK
    p_sr2.alignment = PP_ALIGN.RIGHT

    tb_tp = slide1.shapes.add_textbox(Inches(0.5), Inches(1.15), Inches(12.333), Inches(0.5))
    tf_tp = tb_tp.text_frame
    p_tp = tf_tp.paragraphs[0]
    p_tp.text = "TITLE PAGE"
    p_tp.font.name = "Georgia"
    p_tp.font.size = Pt(22)
    p_tp.font.bold = True
    p_tp.font.color.rgb = C_BLACK
    p_tp.alignment = PP_ALIGN.CENTER

    # Left Brief Info Bullets
    tb_left = slide1.shapes.add_textbox(Inches(0.8), Inches(1.85), Inches(6.6), Inches(5.2))
    tf_l = tb_left.text_frame
    tf_l.word_wrap = True

    title_items = [
        ("• Problem Statement ID – ", "26147 (SIH-2026-MED01)"),
        ("• Problem Statement Title – ", "Automated Decentralized Healthcare Ledger & Sub-Second Emergency Medical QR Triage Engine (MediQR)"),
        ("• Theme – ", "Healthcare & Biomedical Technology / Smart Health"),
        ("• PS Category – ", "Software / Distributed Systems & Cryptography"),
        ("• Team Name – ", "Astralis (MediQR Core)"),
        ("• Team ID – ", "MEDI-QR-8799"),
        ("• Students – ", "Sakshi D. Thombare (23025331242087)\n  Pushpak M. Jaiswal (23025331242099)"),
        ("• Project Guide – ", "Prof. N. Z. Patel (Dept. of CSE)"),
        ("• Institute – ", "CSMSS Chh. Shahu College of Engineering | DBATU")
    ]

    for idx, (b_title, b_val) in enumerate(title_items):
        if idx == 0:
            p = tf_l.paragraphs[0]
        else:
            p = tf_l.add_paragraph()
            p.space_before = Pt(6)
        p.line_spacing = 1.15

        r_b = p.add_run()
        r_b.text = b_title
        r_b.font.name = "Arial"
        r_b.font.size = Pt(11)
        r_b.font.bold = True
        r_b.font.color.rgb = C_BLACK

        r_v = p.add_run()
        r_v.text = b_val
        r_v.font.name = "Calibri"
        r_v.font.size = Pt(10.5)
        r_v.font.color.rgb = C_DARK

    # Right Diagram Box (Figure 1.1)
    add_bordered_frame(slide1, Inches(7.6), Inches(1.85), Inches(5.3), Inches(5.2),
                       title="Fig. MediQR Dual-Segment Smart Card & Blockchain Ledger")
    fig1_path = os.path.join("Images", "Figure 1.1 High-Level System Architecture.png")
    if os.path.exists(fig1_path):
        slide1.shapes.add_picture(fig1_path, Inches(7.7), Inches(2.25), Inches(5.1), Inches(4.7))


    # =========================================================================
    # SLIDE 2: PROBLEM STATEMENT & 3-TIER DECOUPLED PIPELINE
    # =========================================================================
    slide2 = prs.slides.add_slide(blank_layout)
    set_white_background(slide2)
    add_reference_header(slide2, "PROBLEM STATEMENT & 3-TIER DECOUPLED ARCHITECTURE", team_name="Astralis")

    # Left: Concise Problem & Solution Cards (Width 4.3 inches)
    # 1. The Healthcare Crisis (Top Left)
    add_bordered_frame(slide2, Inches(0.4), Inches(0.92), Inches(4.3), Inches(3.2),
                       title="The Healthcare Crisis: Golden Hour Bottlenecks")
    tb_p = slide2.shapes.add_textbox(Inches(0.48), Inches(1.3), Inches(4.14), Inches(2.7))
    tf_p = tb_p.text_frame
    tf_p.word_wrap = True

    crisis_points = [
        ("🚨 The 3-Minute Trap: ", "Roadside trauma victims are unconscious; EMTs lack vital blood group & Penicillin allergy data."),
        ("🔒 Data Silos: ", "Hospitals do not interoperate; central IT requests take 15–30 critical minutes."),
        ("⚠️ Plain QR Leaks: ", "Raw paper QR codes violate HIPAA/privacy; central SQL databases invite ransomware & insider alteration.")
    ]
    for idx, (b_h, b_d) in enumerate(crisis_points):
        p = tf_p.paragraphs[0] if idx == 0 else tf_p.add_paragraph()
        if idx > 0: p.space_before = Pt(8)
        p.line_spacing = 1.15
        r1 = p.add_run(); r1.text = b_h; r1.font.name = "Arial"; r1.font.size = Pt(9.5); r1.font.bold = True; r1.font.color.rgb = C_RED if "🚨" in b_h else C_BLACK
        r2 = p.add_run(); r2.text = b_d; r2.font.name = "Calibri"; r2.font.size = Pt(9.0); r2.font.color.rgb = C_TEXT

    # 2. The MediQR Dual-Segment Solution (Bottom Left)
    add_bordered_frame(slide2, Inches(0.4), Inches(4.25), Inches(4.3), Inches(2.95),
                       title="The MediQR Solution: Dual-Segment Smart Card")
    tb_s = slide2.shapes.add_textbox(Inches(0.48), Inches(4.62), Inches(4.14), Inches(2.5))
    tf_s = tb_s.text_frame
    tf_s.word_wrap = True

    sol_points = [
        ("⚡ Public Triage Front: ", "Scannable offline by any phone in <1.84s; exposes only Blood Type (O-) & critical allergies."),
        ("🔐 Protected Vault Back: ", "Salted HMAC-SHA256 query pointer; decryptable only by verified doctors via hospital key."),
        ("⛓️ Zero PII On-Chain: ", "Solidity ledger anchors 32-byte SHA-256 hash digests only; 100% HIPAA/DPDP compliant.")
    ]
    for idx, (b_h, b_d) in enumerate(sol_points):
        p = tf_s.paragraphs[0] if idx == 0 else tf_s.add_paragraph()
        if idx > 0: p.space_before = Pt(8)
        p.line_spacing = 1.15
        r1 = p.add_run(); r1.text = b_h; r1.font.name = "Arial"; r1.font.size = Pt(9.5); r1.font.bold = True; r1.font.color.rgb = C_GREEN if "⚡" in b_h else C_BLACK
        r2 = p.add_run(); r2.text = b_d; r2.font.name = "Calibri"; r2.font.size = Pt(9.0); r2.font.color.rgb = C_TEXT

    # Right: Prominent 3-Tier Decoupled Architecture Diagram (Figure 4.1)
    add_bordered_frame(slide2, Inches(4.85), Inches(0.92), Inches(8.08), Inches(4.1),
                       title="Fig. System Architecture: 3-Tier Decoupled Pipeline")
    fig41_path = os.path.join("Images", "Figure 4.1 System Architecture (3-Tier Decoupled Pipeline).png")
    if os.path.exists(fig41_path):
        slide2.shapes.add_picture(fig41_path, Inches(4.95), Inches(1.3), Inches(7.88), Inches(3.65))

    # Bottom Right: 2 GUI Screens Side-by-Side (Figure 8.2 & Figure 8.3)
    add_bordered_frame(slide2, Inches(4.85), Inches(5.15), Inches(8.08), Inches(2.05),
                       title="Working GUI Prototypes: Roadside Triage Terminal (<1.8s) vs. Doctor Clinical Workstation")
    fig82_path = os.path.join("Images", "Figure 8.2 Screen shot roadside emergency triage terminal.png")
    fig83_path = os.path.join("Images", "Figure 8.3 Screen shot doctor clinical workstation.png")
    if os.path.exists(fig82_path):
        slide2.shapes.add_picture(fig82_path, Inches(5.8), Inches(5.52), Inches(1.6), Inches(1.6))
    if os.path.exists(fig83_path):
        slide2.shapes.add_picture(fig83_path, Inches(8.7), Inches(5.52), Inches(2.8), Inches(1.6))


    # =========================================================================
    # SLIDE 3: TECHNICAL APPROACH & DATA FLOW DIAGRAM (DFD LEVEL 1)
    # =========================================================================
    slide3 = prs.slides.add_slide(blank_layout)
    set_white_background(slide3)
    add_reference_header(slide3, "TECHNICAL APPROACH & DATA FLOW DIAGRAM (DFD LEVEL 1)", team_name="Astralis")

    # Top: Large Prominent DFD Level 1 Diagram (Figure 4.3)
    add_bordered_frame(slide3, Inches(0.4), Inches(0.92), Inches(12.533), Inches(4.0),
                       title="Fig. Level 1 Data Flow Diagram (DFD): Paramedic (1.0) ➔ Doctor (2.0) ➔ Encrypt (3.0) ➔ Solidity (4.0) ➔ Verify (5.0)")
    fig43_path = os.path.join("Images", "Figure 4.3 Data flow diagram Level 1.png")
    if os.path.exists(fig43_path):
        slide3.shapes.add_picture(fig43_path, Inches(0.6), Inches(1.3), Inches(12.133), Inches(3.55))

    # Bottom Left: Tech Stack & Cryptographic Primitives Badges
    add_bordered_frame(slide3, Inches(0.4), Inches(5.05), Inches(4.8), Inches(2.15),
                       title="Core Tech Stack & Cryptographic Primitives")
    tech_badges = [
        ("Solidity 0.8.20", "EVM Smart Contract"),
        ("AES-256-GCM", "12B IV + 16B AuthTag"),
        ("HMAC-SHA256", "Salted Unlinkable Key"),
        ("Next.js 14", "Web Crypto API in RAM"),
        ("Hardhat EVM", "14/14 Unit Tests Pass"),
        ("Docker Nodes", "Distributed Hospital REST")
    ]
    for idx, (t_b, t_s) in enumerate(tech_badges):
        bx = Inches(0.55 + (idx % 2) * 2.3)
        by = Inches(5.45 + (idx // 2) * 0.52)
        b = slide3.shapes.add_shape(MSO_SHAPE.RECTANGLE, bx, by, Inches(2.2), Inches(0.45))
        b.fill.solid(); b.fill.fore_color.rgb = C_GRAY_BG; b.line.color.rgb = C_BLACK; b.line.width = Pt(1)
        p1 = b.text_frame.paragraphs[0]
        p1.text = t_b; p1.font.name = "Arial"; p1.font.size = Pt(8.5); p1.font.bold = True; p1.font.color.rgb = C_NAVY; p1.alignment = PP_ALIGN.CENTER
        p2 = b.text_frame.add_paragraph()
        p2.text = t_s; p2.font.name = "Calibri"; p2.font.size = Pt(7.5); p2.font.color.rgb = C_DARK; p2.alignment = PP_ALIGN.CENTER

    # Bottom Right: UML Sequence Diagram (Figure 4.7)
    add_bordered_frame(slide3, Inches(5.35), Inches(5.05), Inches(7.583), Inches(2.15),
                       title="Fig. UML Sequence: Cross-Hospital Verification & On-Chain Integrity Validation")
    fig47_path = os.path.join("Images", "Figure 4.7 UML Sequence Diagram (Cross-Hospital Verification).png")
    if os.path.exists(fig47_path):
        slide3.shapes.add_picture(fig47_path, Inches(6.0), Inches(5.42), Inches(6.3), Inches(1.72))


    # =========================================================================
    # SLIDE 4: SECURITY MODEL & FORENSIC TAMPER VERIFICATION
    # =========================================================================
    slide4 = prs.slides.add_slide(blank_layout)
    set_white_background(slide4)
    add_reference_header(slide4, "SECURITY MODEL & FORENSIC TAMPER DETECTION STATE MACHINE", team_name="Astralis")

    # Left: UML State Machine Diagram (Figure 4.11)
    add_bordered_frame(slide4, Inches(0.4), Inches(0.92), Inches(6.5), Inches(5.3),
                       title="Fig. Record Lifecycle State Machine: Draft ➔ Encrypt ➔ Anchor ➔ Verify or Block")
    fig411_path = os.path.join("Images", "Figure 4.11 UML state machine diagram.png")
    if os.path.exists(fig411_path):
        slide4.shapes.add_picture(fig411_path, Inches(0.5), Inches(1.3), Inches(6.3), Inches(4.85))

    # Right: Live Forensic Tamper Alert UI Screen (Figure 8.4)
    add_bordered_frame(slide4, Inches(7.05), Inches(0.92), Inches(5.883), Inches(5.3),
                       title="Fig. Forensic Tamper Alert (/admin & /simulator): Single-Bit Mismatch Halts Decryption")
    fig84_path = os.path.join("Images", "Figure 8.4 Screen shot government commissioning appliance.png")
    if os.path.exists(fig84_path):
        slide4.shapes.add_picture(fig84_path, Inches(7.15), Inches(1.3), Inches(5.68), Inches(4.85))

    # Bottom Row: 4 Challenges ➔ Targeted Mitigations (Single Line Strip)
    c_m_items = [
        ("✗ Privacy Leakage", "✓ Zero PII on-chain (SHA-256 only)"),
        ("✗ Unconscious Victim", "✓ Dual-Segment Card (<1.8s Triage)"),
        ("✗ Cross-Hospital Silos", "✓ Content-addressed ledger query"),
        ("✗ Database Tampering", "✓ 1-Bit mismatch halts decryption")
    ]
    for idx, (c_txt, m_txt) in enumerate(c_m_items):
        cx = Inches(0.4 + idx * 3.16)
        b = slide4.shapes.add_shape(MSO_SHAPE.RECTANGLE, cx, Inches(6.35), Inches(3.05), Inches(0.85))
        b.fill.solid(); b.fill.fore_color.rgb = C_GRAY_BG; b.line.color.rgb = C_BLACK; b.line.width = Pt(1)
        p1 = b.text_frame.paragraphs[0]
        p1.text = c_txt; p1.font.name = "Arial"; p1.font.size = Pt(8.0); p1.font.bold = True; p1.font.color.rgb = C_RED; p1.alignment = PP_ALIGN.CENTER
        p2 = b.text_frame.add_paragraph()
        p2.text = m_txt; p2.font.name = "Calibri"; p2.font.size = Pt(8.0); p2.font.bold = True; p2.font.color.rgb = C_GREEN; p2.alignment = PP_ALIGN.CENTER


    # =========================================================================
    # SLIDE 5: PERFORMANCE BENCHMARKING & OPERATIONAL PIPELINE
    # =========================================================================
    slide5 = prs.slides.add_slide(blank_layout)
    set_white_background(slide5)
    add_reference_header(slide5, "PERFORMANCE BENCHMARKING & OPERATIONAL PIPELINE", team_name="Astralis")

    # Left: Prominent Benchmarking Visual Charts (Figure 8.1)
    add_bordered_frame(slide5, Inches(0.4), Inches(0.92), Inches(6.3), Inches(6.28),
                       title="Fig. Empirical Benchmarks: 1.5s vs 900s Triage Latency & 100% vs 0% Tamper Catch Rate")
    fig81_path = os.path.join("Images", "Figure 8.1 Benchmarking Visual Charts.png")
    if os.path.exists(fig81_path):
        slide5.shapes.add_picture(fig81_path, Inches(0.5), Inches(1.3), Inches(6.1), Inches(5.8))

    # Right Top: 4 Key Metric Badges (2x2 Grid)
    add_bordered_frame(slide5, Inches(6.85), Inches(0.92), Inches(6.083), Inches(2.3),
                       title="Verified Performance & Cryptographic Assurance Metrics")
    metrics = [
        ("⚡ < 1.84 s", "Triage Retrieval Latency", "90% faster than portal logins"),
        ("🔒 0 Bytes", "PII Stored On-Chain", "Strict HIPAA & DPDP compliance"),
        ("🛡️ 100%", "Tamper Detection Rate", "Single-bit mutation caught in RAM"),
        ("⚡ 14.2 ms", "In-Browser Web Crypto", "Client-side AES-256-GCM decrypt")
    ]
    for idx, (m_val, m_title, m_sub) in enumerate(metrics):
        mx = Inches(7.0 + (idx % 2) * 2.95)
        my = Inches(1.3 + (idx // 2) * 0.9)
        mb = slide5.shapes.add_shape(MSO_SHAPE.RECTANGLE, mx, my, Inches(2.85), Inches(0.82))
        mb.fill.solid(); mb.fill.fore_color.rgb = C_GRAY_BG; mb.line.color.rgb = C_BLACK; mb.line.width = Pt(1)
        p1 = mb.text_frame.paragraphs[0]
        p1.text = m_val; p1.font.name = "Arial"; p1.font.size = Pt(12); p1.font.bold = True; p1.font.color.rgb = C_NAVY; p1.alignment = PP_ALIGN.CENTER
        p2 = mb.text_frame.add_paragraph()
        p2.text = m_title; p2.font.name = "Calibri"; p2.font.size = Pt(8.0); p2.font.bold = True; p2.font.color.rgb = C_BLACK; p2.alignment = PP_ALIGN.CENTER

    # Right Bottom: Conventional EHR vs. MediQR Pipeline
    add_bordered_frame(slide5, Inches(6.85), Inches(3.35), Inches(6.083), Inches(3.85),
                       title="Conventional Centralized EHR vs. MediQR Decentralized Architecture")

    # Conventional Row
    c1 = slide5.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(7.0), Inches(3.8), Inches(1.75), Inches(0.65))
    c1.fill.solid(); c1.fill.fore_color.rgb = C_GRAY_BG; c1.line.color.rgb = C_BLACK
    c1.text_frame.paragraphs[0].text = "Centralized EHR\n(Isolated DB)"
    c1.text_frame.paragraphs[0].font.size = Pt(8.0); c1.text_frame.paragraphs[0].font.bold = True
    c1.text_frame.paragraphs[0].font.color.rgb = C_BLACK; c1.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

    c2 = slide5.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(9.05), Inches(3.8), Inches(1.85), Inches(0.65))
    c2.fill.solid(); c2.fill.fore_color.rgb = C_GRAY_BG; c2.line.color.rgb = C_BLACK
    c2.text_frame.paragraphs[0].text = "Manual Login / IT Gate\n(Locked Phone Fails)"
    c2.text_frame.paragraphs[0].font.size = Pt(8.0); c2.text_frame.paragraphs[0].font.bold = True
    c2.text_frame.paragraphs[0].font.color.rgb = C_BLACK; c2.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

    c3 = slide5.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(11.2), Inches(3.8), Inches(1.6), Inches(0.65))
    c3.fill.solid(); c3.fill.fore_color.rgb = RGBColor(254, 242, 242); c3.line.color.rgb = C_RED
    c3.text_frame.paragraphs[0].text = "✗ 15-30m Delay\nHigh Trauma Risk"
    c3.text_frame.paragraphs[0].font.size = Pt(8.0); c3.text_frame.paragraphs[0].font.bold = True; c3.text_frame.paragraphs[0].font.color.rgb = C_RED; c3.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

    # MediQR Row
    m1 = slide5.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(7.0), Inches(4.65), Inches(1.75), Inches(0.65))
    m1.fill.solid(); m1.fill.fore_color.rgb = C_GRAY_BG; m1.line.color.rgb = C_BLACK
    m1.text_frame.paragraphs[0].text = "Dual-Segment MediQR\n(Public + Vault)"
    m1.text_frame.paragraphs[0].font.size = Pt(8.0); m1.text_frame.paragraphs[0].font.bold = True
    m1.text_frame.paragraphs[0].font.color.rgb = C_BLACK; m1.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

    m2 = slide5.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(9.05), Inches(4.65), Inches(1.85), Inches(0.65))
    m2.fill.solid(); m2.fill.fore_color.rgb = C_GRAY_BG; m2.line.color.rgb = C_BLACK
    m2.text_frame.paragraphs[0].text = "Roadside Scan (<1.8s)\n+ Doctor Biometrics"
    m2.text_frame.paragraphs[0].font.size = Pt(8.0); m2.text_frame.paragraphs[0].font.bold = True
    m2.text_frame.paragraphs[0].font.color.rgb = C_BLACK; m2.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

    m3 = slide5.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(11.2), Inches(4.65), Inches(1.6), Inches(0.65))
    m3.fill.solid(); m3.fill.fore_color.rgb = RGBColor(240, 253, 244); m3.line.color.rgb = C_GREEN
    m3.text_frame.paragraphs[0].text = "✓ Verified Record\nGolden Hr Saved"
    m3.text_frame.paragraphs[0].font.size = Pt(8.0); m3.text_frame.paragraphs[0].font.bold = True; m3.text_frame.paragraphs[0].font.color.rgb = C_GREEN; m3.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

    # Arrows
    for y_pos in [Inches(4.0), Inches(4.85)]:
        a1 = slide5.shapes.add_shape(MSO_SHAPE.RIGHT_ARROW, Inches(8.8), y_pos, Inches(0.2), Inches(0.18))
        a1.fill.solid(); a1.fill.fore_color.rgb = C_BLACK; a1.line.fill.background()
        a2 = slide5.shapes.add_shape(MSO_SHAPE.RIGHT_ARROW, Inches(10.95), y_pos, Inches(0.2), Inches(0.18))
        a2.fill.solid(); a2.fill.fore_color.rgb = C_BLACK; a2.line.fill.background()

    # Key Advantage Box
    b_adv = slide5.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(7.0), Inches(5.5), Inches(5.8), Inches(1.55))
    b_adv.fill.solid(); b_adv.fill.fore_color.rgb = C_WHITE; b_adv.line.color.rgb = C_BLACK; b_adv.line.width = Pt(1)
    tf_adv = b_adv.text_frame; tf_adv.word_wrap = True
    p = tf_adv.paragraphs[0]
    p.text = "Key Takeaway:\n"
    p.font.name = "Arial"; p.font.size = Pt(9.5); p.font.bold = True; p.font.color.rgb = C_NAVY
    r = p.add_run()
    r.text = "MediQR decouples urgent roadside life-support data from confidential lifetime medical history. Paramedics get instant data without passwords; doctors get verified tamper-proof dossiers. Zero central database honeypot exists."
    r.font.name = "Calibri"; r.font.size = Pt(8.5); r.font.color.rgb = C_DARK


    # =========================================================================
    # SLIDE 6: UML COMPONENT ARCHITECTURE & PROJECT ROADMAP
    # =========================================================================
    slide6 = prs.slides.add_slide(blank_layout)
    set_white_background(slide6)
    add_reference_header(slide6, "UML COMPONENT ARCHITECTURE & VALIDATION ROADMAP", team_name="Astralis")

    # Left: UML Component Diagram (Figure 4.9)
    add_bordered_frame(slide6, Inches(0.4), Inches(0.92), Inches(7.2), Inches(5.85),
                       title="Fig. UML 2.0 Component Diagram: Web Client, Storage Appliances & EVM Node")
    fig49_path = os.path.join("Images", "Figure 4.9 UML component diagram.png")
    if os.path.exists(fig49_path):
        slide6.shapes.add_picture(fig49_path, Inches(0.5), Inches(1.3), Inches(7.0), Inches(5.4))

    # Right: Phased Roadmap & Test Vector Coverage
    add_bordered_frame(slide6, Inches(7.8), Inches(0.92), Inches(5.133), Inches(3.6),
                       title="Phased Implementation & Validation Roadmap")
    phases = [
        ("Phase 1: Cryptography & Smart Contract (DONE)",
         "✓ MedicalRecordLedger.sol deployed on EVM.\n✓ AES-256-GCM + Salted HMAC test suite.\n*Milestone 1: Zero-PII contract verified on Hardhat.*"),
        
        ("Phase 2: Full-Stack Clinical Portals (DONE)",
         "✓ Roadside Emergency Terminal (/emergency).\n✓ Doctor Workstation with Biometrics (/doctor).\n*Milestone 2: Sub-2s offline triage verified.*"),
        
        ("Phase 3: Field Hardening & Kiosks (IN PROGRESS)",
         "✓ Forensic Tamper Simulation Lab (/simulator).\n✓ ESP32 IoT Ambulance mini-terminal & ABHA connector.\n*Milestone 3: Ready for state emergency fleets.*")
    ]
    p_top = Inches(1.32)
    for p_title, p_desc in phases:
        pb = slide6.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(7.92), p_top, Inches(4.9), Inches(0.98))
        pb.fill.solid(); pb.fill.fore_color.rgb = C_GRAY_BG; pb.line.color.rgb = C_BLACK; pb.line.width = Pt(1)
        tf_p = pb.text_frame; tf_p.word_wrap = True
        p1 = tf_p.paragraphs[0]
        p1.text = p_title; p1.font.name = "Arial"; p1.font.size = Pt(8.2); p1.font.bold = True; p1.font.color.rgb = C_NAVY
        p2 = tf_p.add_paragraph()
        p2.text = p_desc; p2.font.name = "Calibri"; p2.font.size = Pt(7.5); p2.font.color.rgb = C_DARK
        p_top += Inches(1.05)

    # Right Bottom: Validation Test Datasets (2x2 Grid)
    add_bordered_frame(slide6, Inches(7.8), Inches(4.6), Inches(5.133), Inches(2.17),
                       title="Experimental Validation Datasets")
    datasets = [
        ("1,000+ Synthetic Profiles", "24 Clinical specialties (JSON/HL7)"),
        ("Hardhat 14/14 Unit Tests", "100% Assertion Pass | 62k gas"),
        ("10k Forensic Mutations", "100% Single-bit detection rate"),
        ("Multi-Hospital Nodes", "Node A (:5001) & Node B (:5002)")
    ]
    for d_idx, (d_t, d_s) in enumerate(datasets):
        dx = Inches(7.92 + (d_idx % 2) * 2.5)
        dy = Inches(4.98 + (d_idx // 2) * 0.85)
        db = slide6.shapes.add_shape(MSO_SHAPE.RECTANGLE, dx, dy, Inches(2.4), Inches(0.72))
        db.fill.solid(); db.fill.fore_color.rgb = C_GRAY_BG; db.line.color.rgb = C_BLACK; db.line.width = Pt(1)
        p1 = db.text_frame.paragraphs[0]
        p1.text = d_t; p1.font.name = "Arial"; p1.font.size = Pt(8.0); p1.font.bold = True; p1.font.color.rgb = C_BLACK; p1.alignment = PP_ALIGN.CENTER
        p2 = db.text_frame.add_paragraph()
        p2.text = d_s; p2.font.name = "Calibri"; p2.font.size = Pt(7.2); p2.font.color.rgb = C_MUTED; p2.alignment = PP_ALIGN.CENTER

    # Bottom Full-Width Black Strip
    bar_bot = slide6.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.4), Inches(6.88), Inches(12.533), Inches(0.42))
    bar_bot.fill.solid()
    bar_bot.fill.fore_color.rgb = C_BLACK
    bar_bot.line.fill.background()
    tf_bb = bar_bot.text_frame
    p_bb = tf_bb.paragraphs[0]
    p_bb.text = "All smart contracts, cryptographic primitives, clinical portals & forensic verification engines are implemented in the MediQR prototype."
    p_bb.font.name = "Arial"
    p_bb.font.size = Pt(9.5)
    p_bb.font.bold = True
    p_bb.font.color.rgb = C_WHITE
    p_bb.alignment = PP_ALIGN.CENTER

    prs.save(output_pptx_path)
    print(f"Diagram-Dominant Presentation successfully created at: {output_pptx_path}")

if __name__ == "__main__":
    build_presentation()
