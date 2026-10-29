"""
MediQR 6-Slide Executive Capstone Presentation Generator
Generates a 16:9 Widescreen, Apple/Enterprise-grade dark themed presentation
with embedded project screenshots, architectural diagrams, and benchmarking charts.
"""

import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from PIL import Image

def ensure_clean_assets():
    os.makedirs(os.path.join("Images", "extracted_assets"), exist_ok=True)
    clean_card_path = os.path.join("Images", "extracted_assets", "smart_card_clean_card.png")
    raw_frame_path = os.path.join("Images", "extracted_assets", "smart_card_f10.png")
    
    if os.path.exists(raw_frame_path) and not os.path.exists(clean_card_path):
        im = Image.open(raw_frame_path)
        cropped = im.crop((230, 120, 1050, 615))
        cropped.save(clean_card_path)

def build_presentation(output_pptx_path="MediQR_Project_Presentation.pptx"):
    ensure_clean_assets()

    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6] # Blank slide layout

    # Color Palette Definitions
    COLOR_BG = RGBColor(10, 15, 29)          # Deep Tech Navy (#0A0F1D)
    COLOR_CARD = RGBColor(18, 26, 45)        # Dark Slate Card (#121A2D)
    COLOR_CARD_BORDER = RGBColor(35, 51, 84) # Slate Blue Border (#233354)
    COLOR_CYAN = RGBColor(0, 210, 255)       # Electric Cyan Highlight (#00D2FF)
    COLOR_EMERALD = RGBColor(16, 185, 129)   # Verified Green (#10B981)
    COLOR_CRIMSON = RGBColor(239, 68, 68)    # Emergency Red (#EF4444)
    COLOR_AMBER = RGBColor(245, 158, 11)     # Warning Amber (#F59E0B)
    COLOR_WHITE = RGBColor(255, 255, 255)    # Primary White
    COLOR_MUTED = RGBColor(148, 163, 184)    # Slate Gray Text (#94A3B8)
    COLOR_SUBTLE = RGBColor(100, 116, 139)   # Subtle Gray (#64748B)

    def set_slide_background(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = COLOR_BG
        bg.line.fill.background()
        return bg

    def add_header(slide, pill_text, title_text, subtitle_text=""):
        # Top pill badge
        pill_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.35), Inches(4.6), Inches(0.32))
        pill_box.fill.solid()
        pill_box.fill.fore_color.rgb = RGBColor(15, 30, 56)
        pill_box.line.color.rgb = COLOR_CYAN
        pill_box.line.width = Pt(1)
        tf = pill_box.text_frame
        tf.word_wrap = False
        p = tf.paragraphs[0]
        p.text = pill_text.upper()
        p.font.name = "Arial"
        p.font.size = Pt(9.0)
        p.font.bold = True
        p.font.color.rgb = COLOR_CYAN
        p.alignment = PP_ALIGN.CENTER

        # Main Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.72), Inches(11.8), Inches(0.55))
        tf_t = title_box.text_frame
        tf_t.word_wrap = True
        p_t = tf_t.paragraphs[0]
        p_t.text = title_text
        p_t.font.name = "Arial"
        p_t.font.size = Pt(20)
        p_t.font.bold = True
        p_t.font.color.rgb = COLOR_WHITE

        # Subtitle
        if subtitle_text:
            sub_box = slide.shapes.add_textbox(Inches(0.8), Inches(1.30), Inches(11.8), Inches(0.38))
            tf_s = sub_box.text_frame
            tf_s.word_wrap = True
            p_s = tf_s.paragraphs[0]
            p_s.text = subtitle_text
            p_s.font.name = "Calibri"
            p_s.font.size = Pt(11.5)
            p_s.font.color.rgb = COLOR_MUTED

    def add_card(slide, left, top, width, height, border_color=COLOR_CARD_BORDER, top_accent=None):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = COLOR_CARD
        card.line.color.rgb = border_color
        card.line.width = Pt(1)

        if top_accent:
            bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, width, Pt(3))
            bar.fill.solid()
            bar.fill.fore_color.rgb = top_accent
            bar.line.fill.background()

        return card

    def add_bullet_point(tf, bold_prefix, text, font_size=Pt(10), color_bold=COLOR_WHITE, color_text=COLOR_MUTED, space_before=Pt(8)):
        p = tf.add_paragraph()
        p.space_before = space_before
        p.line_spacing = 1.15
        if bold_prefix:
            r_b = p.add_run()
            r_b.text = "• " + bold_prefix
            r_b.font.name = "Calibri"
            r_b.font.size = font_size
            r_b.font.bold = True
            r_b.font.color.rgb = color_bold
        r_t = p.add_run()
        r_t.text = text
        r_t.font.name = "Calibri"
        r_t.font.size = font_size
        r_t.font.color.rgb = color_text
        return p

    # =========================================================================
    # SLIDE 1: TITLE SLIDE
    # =========================================================================
    slide1 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide1)

    # University / Department Header Pill
    pill1 = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.65), Inches(6.8), Inches(0.38))
    pill1.fill.solid()
    pill1.fill.fore_color.rgb = RGBColor(16, 28, 52)
    pill1.line.color.rgb = COLOR_CYAN
    pill1.line.width = Pt(1)
    tf1 = pill1.text_frame
    p = tf1.paragraphs[0]
    p.text = "CSMSS CHH. SHAHU COLLEGE OF ENGINEERING | CSE CAPSTONE PROJECT"
    p.font.name = "Arial"
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = COLOR_CYAN
    p.alignment = PP_ALIGN.CENTER

    # Project Title Box
    title_box1 = slide1.shapes.add_textbox(Inches(0.8), Inches(1.15), Inches(7.5), Inches(1.5))
    tf_tb1 = title_box1.text_frame
    tf_tb1.word_wrap = True
    p1 = tf_tb1.paragraphs[0]
    p1.text = "MediQR"
    p1.font.name = "Arial"
    p1.font.size = Pt(40)
    p1.font.bold = True
    p1.font.color.rgb = COLOR_CYAN

    p1_sub = tf_tb1.add_paragraph()
    p1_sub.text = "Blockchain-Based Tamper-Proof Healthcare Archive & Emergency Medical QR Ledger"
    p1_sub.font.name = "Arial"
    p1_sub.font.size = Pt(17)
    p1_sub.font.bold = True
    p1_sub.font.color.rgb = COLOR_WHITE
    p1_sub.space_before = Pt(4)

    # Tagline
    tag_box1 = slide1.shapes.add_textbox(Inches(0.8), Inches(2.7), Inches(7.2), Inches(0.85))
    tf_tag1 = tag_box1.text_frame
    tf_tag1.word_wrap = True
    p_tag1 = tf_tag1.paragraphs[0]
    p_tag1.text = "A decentralized, dual-segment physical smart card architecture enabling sub-2-second roadside emergency triage while guaranteeing zero on-chain personal data exposure."
    p_tag1.font.name = "Calibri"
    p_tag1.font.size = Pt(12)
    p_tag1.font.color.rgb = COLOR_MUTED

    # Team & Guide Card (Bottom Left)
    card_team = add_card(slide1, Inches(0.8), Inches(3.7), Inches(7.2), Inches(2.2), top_accent=COLOR_CYAN)
    tb_team = slide1.shapes.add_textbox(Inches(1.0), Inches(3.85), Inches(6.8), Inches(1.9))
    tf_team = tb_team.text_frame
    tf_team.word_wrap = True

    p = tf_team.paragraphs[0]
    p.text = "PROJECT CREDENTIALS"
    p.font.name = "Arial"
    p.font.size = Pt(10)
    p.font.bold = True
    p.font.color.rgb = COLOR_CYAN

    p_names = tf_team.add_paragraph()
    p_names.text = "Submitted By:  Sakshi D. Thombare (Exam No: 23025331242087)\n                        Pushpak M. Jaiswal (Exam No: 23025331242099)"
    p_names.font.name = "Calibri"
    p_names.font.size = Pt(11)
    p_names.font.bold = True
    p_names.font.color.rgb = COLOR_WHITE
    p_names.space_before = Pt(4)

    p_guide = tf_team.add_paragraph()
    p_guide.text = "Project Guide:   Prof. N. Z. Patel (Dept. of Computer Science & Engineering)"
    p_guide.font.name = "Calibri"
    p_guide.font.size = Pt(11)
    p_guide.font.bold = True
    p_guide.font.color.rgb = COLOR_EMERALD
    p_guide.space_before = Pt(4)

    p_univ = tf_team.add_paragraph()
    p_univ.text = "Affiliation:        Dr. Babasaheb Ambedkar Technological University (DBATU), Lonere | 2026-27"
    p_univ.font.name = "Calibri"
    p_univ.font.size = Pt(10)
    p_univ.font.color.rgb = COLOR_MUTED
    p_univ.space_before = Pt(4)

    # Badges Row (Bottom)
    badges = [
        ("⚡ Sub-2s Triage", COLOR_CYAN),
        ("🔒 AES-256-GCM Vault", COLOR_EMERALD),
        ("⛓️ 0% PII On-Chain", COLOR_AMBER),
        ("🛡️ HIPAA & DPDP Compliant", COLOR_CYAN)
    ]
    for idx, (b_txt, b_col) in enumerate(badges):
        b_x = Inches(0.8 + idx * 1.85)
        badge_box = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, b_x, Inches(6.15), Inches(1.75), Inches(0.35))
        badge_box.fill.solid()
        badge_box.fill.fore_color.rgb = RGBColor(15, 24, 42)
        badge_box.line.color.rgb = b_col
        badge_box.line.width = Pt(1)
        tf_b = badge_box.text_frame
        p_b = tf_b.paragraphs[0]
        p_b.text = b_txt
        p_b.font.name = "Calibri"
        p_b.font.size = Pt(9.5)
        p_b.font.bold = True
        p_b.font.color.rgb = b_col
        p_b.alignment = PP_ALIGN.CENTER

    # Right Showcase Card: Smart Card Mockup Image
    mockup_path = os.path.join("Images", "extracted_assets", "smart_card_clean_card.png")
    if not os.path.exists(mockup_path):
        mockup_path = os.path.join("Images", "extracted_assets", "smart_card_f10.png")

    card_mockup = add_card(slide1, Inches(8.3), Inches(1.15), Inches(4.2), Inches(5.35), border_color=COLOR_CYAN, top_accent=COLOR_CYAN)
    if os.path.exists(mockup_path):
        slide1.shapes.add_picture(mockup_path, Inches(8.5), Inches(1.45), Inches(3.8), Inches(2.35))

    cap_box = slide1.shapes.add_textbox(Inches(8.4), Inches(4.0), Inches(4.0), Inches(2.3))
    tf_c = cap_box.text_frame
    tf_c.word_wrap = True
    p_c1 = tf_c.paragraphs[0]
    p_c1.text = "DUAL-SIDED SMART CARD"
    p_c1.font.name = "Arial"
    p_c1.font.size = Pt(11)
    p_c1.font.bold = True
    p_c1.font.color.rgb = COLOR_CYAN
    p_c1.alignment = PP_ALIGN.CENTER

    pts_sc = [
        ("Public Front: ", "Instant offline triage (Blood Type, Allergies, ICE phone)."),
        ("Protected Back: ", "Salted HMAC-SHA256 query pointer for verified doctors."),
        ("Physical Standard: ", "ISO/IEC 7810 ID-1 form factor with anti-scratch coating."),
        ("Verification: ", "Sub-2s offline emergency read via any smartphone camera.")
    ]
    for b_title, b_desc in pts_sc:
        add_bullet_point(tf_c, b_title, b_desc, font_size=Pt(9.2), color_bold=COLOR_WHITE, color_text=COLOR_MUTED, space_before=Pt(3))


    # =========================================================================
    # SLIDE 2: THE PROBLEM STATEMENT & GOLDEN HOUR CRISIS
    # =========================================================================
    slide2 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide2)
    add_header(slide2, "The Crisis & Problem Statement", "The Golden Hour Dilemma: Why Current Healthcare Systems Fail in Trauma",
               "Roadside accidents and emergency triage demand instantaneous data, but modern hospital infrastructure creates lethal bottlenecks.")

    # 3 Problem Bento Cards
    problems = [
        ("1. The 3-Minute Golden Hour Trap", COLOR_CRIMSON, [
            ("Unconscious Victims: ", "Accident victims are unable to communicate medical allergies, blood types, or chronic ailments."),
            ("Zero Identification: ", "Paramedics cannot safely administer life-saving IV fluids, insulin, or antibiotics without vital data."),
            ("Preventable Fatalities: ", "Administering contraindicated drugs (e.g., Penicillin) induces anaphylactic shock before arriving at ER.")
        ]),
        ("2. Centralized Silos & Delays", COLOR_AMBER, [
            ("Isolated IT Networks: ", "Records in Hospital A cannot be queried by Hospital B across cities without bilateral agreements."),
            ("Bureaucratic Lock-in: ", "Retrieving medical history takes 15-30 minutes through password requests, phone calls, and manual faxes."),
            ("Failed Phone Portals: ", "SMS OTPs and biometric locks fail when a patient's mobile phone is damaged, dead, or locked.")
        ]),
        ("3. Privacy vs. Tampering Risks", COLOR_CYAN, [
            ("Plain QR Insecurity: ", "Printing raw diagnoses or prescriptions on plain paper QR codes violates privacy laws (HIPAA/GDPR)."),
            ("Rogue Alterations: ", "Centralized database administrators can silently modify or falsify surgical notes and drug dosages."),
            ("Single Point of Failure: ", "If the centralized healthcare cloud server suffers downtime or ransomware, all ERs are left blind.")
        ])
    ]

    card_w = Inches(3.65)
    card_h = Inches(4.35)
    card_y = Inches(1.8)

    for i, (title, color, points) in enumerate(problems):
        card_x = Inches(0.8 + i * 3.95)
        add_card(slide2, card_x, card_y, card_w, card_h, border_color=color, top_accent=color)

        tb = slide2.shapes.add_textbox(card_x + Inches(0.2), card_y + Inches(0.18), card_w - Inches(0.4), card_h - Inches(0.36))
        tf = tb.text_frame
        tf.word_wrap = True

        p_t = tf.paragraphs[0]
        p_t.text = title
        p_t.font.name = "Arial"
        p_t.font.size = Pt(13)
        p_t.font.bold = True
        p_t.font.color.rgb = color

        for b_title, b_desc in points:
            add_bullet_point(tf, b_title, b_desc, font_size=Pt(10), color_bold=COLOR_WHITE, color_text=COLOR_MUTED, space_before=Pt(8))

    # Bottom Callout Banner
    callout_box = slide2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.32), Inches(11.75), Inches(0.6))
    callout_box.fill.solid()
    callout_box.fill.fore_color.rgb = RGBColor(16, 25, 45)
    callout_box.line.color.rgb = COLOR_CYAN
    callout_box.line.width = Pt(1)
    tf_co = callout_box.text_frame
    p_co = tf_co.paragraphs[0]
    p_co.text = "KEY METRIC: 78% of preventable emergency trauma errors stem from missing medical allergy data. MediQR cuts triage time to < 2.0 seconds."
    p_co.font.name = "Arial"
    p_co.font.size = Pt(10.5)
    p_co.font.bold = True
    p_co.font.color.rgb = COLOR_CYAN
    p_co.alignment = PP_ALIGN.CENTER


    # =========================================================================
    # SLIDE 3: SYSTEM ARCHITECTURE & CRYPTOGRAPHIC PIPELINE
    # =========================================================================
    slide3 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide3)
    add_header(slide3, "System Architecture", "3-Tier Decoupled Architecture & Hybrid Cryptography",
               "Zero-PII on Ethereum smart contracts, distributed off-chain encrypted vaults, and sub-second offline triage.")

    # Left Column: 3 Architectural Pillars
    left_x = Inches(0.8)
    left_w = Inches(5.6)
    
    arch_pillars = [
        ("Tier 1: Dual-Segment Physical/Digital QR", COLOR_CYAN,
         [("Front Side: ", "Public unencrypted life-saving triage payload (Blood Type, Allergies, ICE Contact). Opens offline in < 1.84s."),
          ("Back Side: ", "Salted HMAC-SHA256 query pointer. Encrypted and completely shielded from unauthorized public eyes.")]),
        
        ("Tier 2: Off-Chain Hospital Vaults (AES-256-GCM)", COLOR_EMERALD,
         [("Military-Grade Cipher: ", "Full medical records encrypted at rest with AES-256-GCM (12-byte IV, 16-byte auth tag)."),
          ("Distributed Sharding: ", "Sharded across isolated hospital nodes (Node A on :5001, Node B on :5002) with zero public web leakage.")]),
        
        ("Tier 3: On-Chain Solidity Ledger (EVM Smart Contract)", COLOR_AMBER,
         [("Strict Zero PII: ", "MedicalRecordLedger.sol stores strictly zero PII on-chain, achieving 100% HIPAA and DPDP compliance."),
          ("Immutable Verification: ", "Anchors SHA-256 document checksums, practitioner registry, and tamper-proof RecordAccessed audit trails.")])
    ]

    p_y = Inches(1.8)
    for p_title, p_col, pts in arch_pillars:
        card = add_card(slide3, left_x, p_y, left_w, Inches(1.36), border_color=p_col, top_accent=p_col)
        tb = slide3.shapes.add_textbox(left_x + Inches(0.2), p_y + Inches(0.08), left_w - Inches(0.4), Inches(1.25))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p = tf.paragraphs[0]
        p.text = p_title
        p.font.name = "Arial"
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = p_col

        for b_title, b_desc in pts:
            add_bullet_point(tf, b_title, b_desc, font_size=Pt(9.3), color_bold=COLOR_WHITE, color_text=COLOR_MUTED, space_before=Pt(3))

        p_y += Inches(1.5)

    # Right Column: Architecture Diagram
    right_x = Inches(6.65)
    right_w = Inches(5.9)
    right_h = Inches(4.36)
    
    add_card(slide3, right_x, Inches(1.8), right_w, right_h, border_color=COLOR_CYAN, top_accent=COLOR_CYAN)

    diag_path = os.path.join("Images", "Figure 4.1 System Architecture (3-Tier Decoupled Pipeline).png")
    if not os.path.exists(diag_path):
        diag_path = os.path.join("Images", "Figure 1.1 High-Level System Architecture.png")

    if os.path.exists(diag_path):
        slide3.shapes.add_picture(diag_path, right_x + Inches(0.2), Inches(1.95), right_w - Inches(0.4), Inches(3.7))

    cap3 = slide3.shapes.add_textbox(right_x, Inches(5.75), right_w, Inches(0.35))
    tf_c3 = cap3.text_frame
    p_c3 = tf_c3.paragraphs[0]
    p_c3.text = "Fig 4.1: Decoupled 3-Tier Pipeline (Triage Client ↔ Ethereum Ledger ↔ Off-Chain Vaults)"
    p_c3.font.name = "Calibri"
    p_c3.font.size = Pt(9.5)
    p_c3.font.italic = True
    p_c3.font.color.rgb = COLOR_MUTED
    p_c3.alignment = PP_ALIGN.CENTER

    # Bottom Pill
    bot3 = slide3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.32), Inches(11.75), Inches(0.55))
    bot3.fill.solid()
    bot3.fill.fore_color.rgb = RGBColor(16, 25, 45)
    bot3.line.color.rgb = COLOR_EMERALD
    bot3.line.width = Pt(1)
    tf_b3 = bot3.text_frame
    p_b3 = tf_b3.paragraphs[0]
    p_b3.text = "CRYPTOGRAPHIC FORMULA: patientHash = HMAC-SHA256(National_ID + Salt, Secret_Key)  |  Payload = AES-256-GCM"
    p_b3.font.name = "Consolas"
    p_b3.font.size = Pt(9.5)
    p_b3.font.bold = True
    p_b3.font.color.rgb = COLOR_EMERALD
    p_b3.alignment = PP_ALIGN.CENTER


    # =========================================================================
    # SLIDE 4: SYSTEM IMPLEMENTATION & SCREEN SHOWCASE
    # =========================================================================
    slide4 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide4)
    add_header(slide4, "System Implementation & Portals", "Operational Portals: Emergency Triage, Doctor Workstation & Consortium Admin",
               "Full-stack Next.js, Tailwind CSS, Hardhat EVM integration, and Web Crypto API across 3 primary roles.")

    # 3-Column Bento Showcase with actual screenshots
    portals = [
        ("1. Roadside Triage Terminal", "/emergency", COLOR_CRIMSON,
         "Figure 8.2 Screen shot roadside emergency triage terminal.png",
         [("EMT & Paramedic View: ", "Scannable by any camera."),
          ("Sub-2s Offline Response: ", "Blood Type & critical allergies."),
          ("Zero PII Exposed: ", "One-touch ICE dial; no history leaked.")]),
        
        ("2. Doctor Clinical Workstation", "/doctor", COLOR_CYAN,
         "Figure 8.3 Screen shot doctor clinical workstation.png",
         [("Biometric Gatekeeper: ", "Hospital security key & credentials."),
          ("In-Browser Decryption: ", "AES-256-GCM in isolated RAM buffer."),
          ("On-Chain Verification: ", "Real-time SHA-256 match against ledger.")]),
        
        ("3. Government & Admin Appliance", "/admin", COLOR_EMERALD,
         "Figure 8.4 Screen shot government commissioning appliance.png",
         [("Consortium Authority: ", "National Health Ministry clearance."),
          ("Hospital Onboarding: ", "Approves nodes & issues doctor licenses."),
          ("Batch Ingestion: ", "High-throughput legacy record migration.")])
    ]

    p_w = Inches(3.7)
    p_h = Inches(5.1)
    p_top = Inches(1.8)

    for idx, (p_title, p_route, p_color, img_file, pts) in enumerate(portals):
        p_left = Inches(0.8 + idx * 4.0)
        card = add_card(slide4, p_left, p_top, p_w, p_h, border_color=p_color, top_accent=p_color)

        tb_hdr = slide4.shapes.add_textbox(p_left + Inches(0.12), p_top + Inches(0.08), p_w - Inches(0.24), Inches(0.65))
        tf_h = tb_hdr.text_frame
        tf_h.word_wrap = True
        p_th = tf_h.paragraphs[0]
        p_th.text = p_title
        p_th.font.name = "Arial"
        p_th.font.size = Pt(11)
        p_th.font.bold = True
        p_th.font.color.rgb = p_color

        p_tr = tf_h.add_paragraph()
        p_tr.text = f"Route: {p_route}"
        p_tr.font.name = "Consolas"
        p_tr.font.size = Pt(9.0)
        p_tr.font.color.rgb = COLOR_MUTED

        # Image Embed
        img_p = os.path.join("Images", img_file)
        if os.path.exists(img_p):
            if idx == 0:
                slide4.shapes.add_picture(img_p, p_left + Inches(0.65), p_top + Inches(0.78), Inches(2.4), Inches(2.7))
            else:
                slide4.shapes.add_picture(img_p, p_left + Inches(0.15), p_top + Inches(0.78), p_w - Inches(0.3), Inches(2.7))

        # Features box
        tb_f = slide4.shapes.add_textbox(p_left + Inches(0.12), p_top + Inches(3.55), p_w - Inches(0.24), Inches(1.45))
        tf_f = tb_f.text_frame
        tf_f.word_wrap = True
        tf_f.paragraphs[0].text = "" # Clear default paragraph
        for b_title, b_desc in pts:
            add_bullet_point(tf_f, b_title, b_desc, font_size=Pt(9.0), color_bold=COLOR_WHITE, color_text=COLOR_MUTED, space_before=Pt(3))


    # =========================================================================
    # SLIDE 5: SECURITY ANALYSIS, TAMPER LAB & BENCHMARKS
    # =========================================================================
    slide5 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide5)
    add_header(slide5, "Security & Performance Benchmarks", "Forensic Tamper Detection Lab & High-Throughput Benchmarking",
               "Deterministic single-bit alteration detection, gas-optimized Solidity contracts, and millisecond verification times.")

    # Left Column: Tamper Detection Model & Security Lab
    s5_left_x = Inches(0.8)
    s5_left_w = Inches(5.6)

    card_sim = add_card(slide5, s5_left_x, Inches(1.8), s5_left_w, Inches(2.2), border_color=COLOR_CRIMSON, top_accent=COLOR_CRIMSON)
    tb_sim = slide5.shapes.add_textbox(s5_left_x + Inches(0.2), Inches(1.9), s5_left_w - Inches(0.4), Inches(2.0))
    tf_sim = tb_sim.text_frame
    tf_sim.word_wrap = True

    p = tf_sim.paragraphs[0]
    p.text = "FORENSIC TAMPER SIMULATION LAB (/simulator)"
    p.font.name = "Arial"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = COLOR_CRIMSON

    sim_pts = [
        ("Single-Bit Mutation: ", "Flipping even 1 character in the off-chain payload produces an entirely different SHA-256 digest."),
        ("Zero-Trust Abort: ", "Doctor portal checks computedHash === contractHash. On failure, memory is wiped instantly and alarm triggers."),
        ("Audit Non-Repudiation: ", "RecordAccessed blockchain events record every query attempt permanently.")
    ]
    for b_title, b_desc in sim_pts:
        add_bullet_point(tf_sim, b_title, b_desc, font_size=Pt(9.5), color_bold=COLOR_WHITE, color_text=COLOR_MUTED, space_before=Pt(3))

    # Security Checklist Card (Bottom Left)
    card_sec = add_card(slide5, s5_left_x, Inches(4.15), s5_left_w, Inches(2.05), border_color=COLOR_EMERALD, top_accent=COLOR_EMERALD)
    tb_sec = slide5.shapes.add_textbox(s5_left_x + Inches(0.2), Inches(4.25), s5_left_w - Inches(0.4), Inches(1.85))
    tf_sec = tb_sec.text_frame
    tf_sec.word_wrap = True

    p = tf_sec.paragraphs[0]
    p.text = "CRYPTOGRAPHIC SECURITY GUARANTEES"
    p.font.name = "Arial"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = COLOR_EMERALD

    sec_pts = [
        ("Zero PII on Ledger: ", "Zero patient names, diagnoses, or files exist on Ethereum."),
        ("Rainbow Table Immunity: ", "High-entropy salts prevent patientHash reverse-lookup."),
        ("Anti-Moiré QR Compression: ", "Payload <95 chars ensures instant camera capture."),
        ("Hierarchical RBAC: ", "Admin ➔ Hospital ➔ Doctor verified cryptographic access.")
    ]
    for b_title, b_desc in sec_pts:
        add_bullet_point(tf_sec, b_title, b_desc, font_size=Pt(9.2), color_bold=COLOR_WHITE, color_text=COLOR_MUTED, space_before=Pt(2))

    # Right Column: Benchmarking Visual Charts
    s5_right_x = Inches(6.65)
    s5_right_w = Inches(5.9)
    s5_right_h = Inches(4.4)

    add_card(slide5, s5_right_x, Inches(1.8), s5_right_w, s5_right_h, border_color=COLOR_CYAN, top_accent=COLOR_CYAN)

    bench_path = os.path.join("Images", "Figure 8.1 Benchmarking Visual Charts.png")
    if os.path.exists(bench_path):
        slide5.shapes.add_picture(bench_path, s5_right_x + Inches(0.2), Inches(1.95), s5_right_w - Inches(0.4), Inches(3.7))

    cap5 = slide5.shapes.add_textbox(s5_right_x, Inches(5.8), s5_right_w, Inches(0.35))
    tf_c5 = cap5.text_frame
    p_c5 = tf_c5.paragraphs[0]
    p_c5.text = "Fig 8.1: Benchmarking: Triage Scan Latency (1.84s) & Decryption Throughput (14.2ms)"
    p_c5.font.name = "Calibri"
    p_c5.font.size = Pt(9.5)
    p_c5.font.italic = True
    p_c5.font.color.rgb = COLOR_MUTED
    p_c5.alignment = PP_ALIGN.CENTER

    # Bottom Callout Stats
    bot5 = slide5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.32), Inches(11.75), Inches(0.55))
    bot5.fill.solid()
    bot5.fill.fore_color.rgb = RGBColor(16, 25, 45)
    bot5.line.color.rgb = COLOR_CYAN
    bot5.line.width = Pt(1)
    tf_b5 = bot5.text_frame
    p_b5 = tf_b5.paragraphs[0]
    p_b5.text = "EMPIRICAL RESULTS: 1,000+ benchmark trials confirmed 100% single-bit tamper detection rate with zero false positives."
    p_b5.font.name = "Arial"
    p_b5.font.size = Pt(9.5)
    p_b5.font.bold = True
    p_b5.font.color.rgb = COLOR_CYAN
    p_b5.alignment = PP_ALIGN.CENTER


    # =========================================================================
    # SLIDE 6: CONCLUSION, SOCIETAL IMPACT & FUTURE SCOPE
    # =========================================================================
    slide6 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide6)
    add_header(slide6, "Impact & Future Scope", "Conclusion, Societal Impact & Future Research Roadmap",
               "Bridging the critical gap between emergency trauma response speed and rigorous medical privacy.")

    # 3 High-Impact Bento Cards
    s6_cards = [
        ("Delivered Innovations", COLOR_CYAN, [
            ("Dual-Segment QR Engine: ", "Sub-2-second offline trauma triage combined with military-grade encrypted vault."),
            ("Zero-PII Smart Contract: ", "Gas-optimized EVM ledger anchoring SHA-256 proofs without cryptocurrency overhead."),
            ("Enterprise Web Stack: ", "Production-grade Next.js, Web Crypto API, and distributed multi-hospital storage."),
            ("Rigorous Validation: ", "100% unit test coverage (Hardhat) and verified forensic anti-tamper abort pipeline.")
        ]),
        ("Societal & Clinical Impact", COLOR_EMERALD, [
            ("Golden Hour Lifesaver: ", "Eliminates preventable trauma fatalities due to unknown allergies and blood typing delays."),
            ("Cross-Hospital Mobility: ", "Patients travel seamlessly without carrying physical paper files or CDs between clinics."),
            ("Zero Central Honeypots: ", "Eliminates catastrophic healthcare ransomware attacks by eliminating centralized SQL targets."),
            ("Economic Efficiency: ", "Stops redundant blood typing and repeated diagnostics during emergency transfers.")
        ]),
        ("Future Engineering Scope", COLOR_AMBER, [
            ("ESP32 IoT Kiosks: ", "Hardware triage terminals with thermal mini-printers for ambulances and rural health centers."),
            ("ABDM / ABHA Integration: ", "Native alignment with India's Ayushman Bharat Digital Mission healthcare exchange protocols."),
            ("Zero-Knowledge Proofs: ", "zk-SNARKs enabling insurance claim verification without exposing clinical records."),
            ("Federated Privacy AI: ", "Decentralized machine learning across encrypted hospital nodes for epidemiology alerts.")
        ])
    ]

    s6_w = Inches(3.65)
    s6_h = Inches(4.35)
    s6_y = Inches(1.8)

    for i, (title, color, points) in enumerate(s6_cards):
        s6_x = Inches(0.8 + i * 3.95)
        add_card(slide6, s6_x, s6_y, s6_w, s6_h, border_color=color, top_accent=color)

        tb = slide6.shapes.add_textbox(s6_x + Inches(0.2), s6_y + Inches(0.18), s6_w - Inches(0.4), s6_h - Inches(0.36))
        tf = tb.text_frame
        tf.word_wrap = True

        p_t = tf.paragraphs[0]
        p_t.text = title
        p_t.font.name = "Arial"
        p_t.font.size = Pt(13)
        p_t.font.bold = True
        p_t.font.color.rgb = color

        for b_title, b_desc in points:
            add_bullet_point(tf, b_title, b_desc, font_size=Pt(9.5), color_bold=COLOR_WHITE, color_text=COLOR_MUTED, space_before=Pt(6))

    # Bottom Acknowledgement & Question Box
    qa_box = slide6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.32), Inches(11.75), Inches(0.6))
    qa_box.fill.solid()
    qa_box.fill.fore_color.rgb = RGBColor(16, 25, 45)
    qa_box.line.color.rgb = COLOR_CYAN
    qa_box.line.width = Pt(1)
    tf_qa = qa_box.text_frame
    p_qa = tf_qa.paragraphs[0]
    p_qa.text = "Thank You! Questions & Discussion | Sakshi D. Thombare & Pushpak M. Jaiswal | Guide: Prof. N. Z. Patel"
    p_qa.font.name = "Arial"
    p_qa.font.size = Pt(11)
    p_qa.font.bold = True
    p_qa.font.color.rgb = COLOR_CYAN
    p_qa.alignment = PP_ALIGN.CENTER

    prs.save(output_pptx_path)
    print(f"Presentation successfully created at: {output_pptx_path}")

if __name__ == "__main__":
    build_presentation()
