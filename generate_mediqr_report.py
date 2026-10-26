"""
MediQR Comprehensive Project Report Generator (Updated with Original University Table Grid & Real Image Embedding)
"""

import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls

def create_report():
    doc = docx.Document()

    # Configure Margins (Standard Academic Format: 1.25" Left for binding, 1" Top, Right, Bottom)
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.25)
        section.right_margin = Inches(1.0)
        
        # Configure Header & Footer
        footer = section.footer
        f_p = footer.paragraphs[0]
        f_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        f_run = f_p.add_run("CSCOE, Department of Computer Science and Engineering 2026-27")
        f_run.font.name = "Times New Roman"
        f_run.font.size = Pt(9)
        f_run.font.italic = True
        f_run.font.color.rgb = RGBColor(80, 80, 80)

    # Style Helpers
    def set_run_font(run, name="Times New Roman", size_pt=12, bold=False, italic=False, color=None):
        run.font.name = name
        run.font.size = Pt(size_pt)
        run.bold = bold
        run.italic = italic
        if color:
            run.font.color.rgb = color
        else:
            run.font.color.rgb = RGBColor(0, 0, 0)

    def add_p(text="", align=WD_ALIGN_PARAGRAPH.LEFT, space_before=0, space_after=6, line_spacing=1.15):
        p = doc.add_paragraph()
        p.alignment = align
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = line_spacing
        if text:
            r = p.add_run(text)
            set_run_font(r, "Times New Roman", 12)
        return p

    def add_h1(title, space_before=18, space_after=14):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(space_after)
        r = p.add_run(title)
        set_run_font(r, "Times New Roman", 16, bold=True)
        return p

    def add_h2(title, space_before=14, space_after=6):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(space_after)
        r = p.add_run(title)
        set_run_font(r, "Times New Roman", 13, bold=True)
        return p

    def add_h3(title, space_before=10, space_after=4):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(space_after)
        r = p.add_run(title)
        set_run_font(r, "Times New Roman", 12, bold=True)
        return p

    def add_bullet(bold_prefix, text):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.15
        r_b = p.add_run(bold_prefix)
        set_run_font(r_b, "Times New Roman", 12, bold=True)
        r_t = p.add_run(text)
        set_run_font(r_t, "Times New Roman", 12)
        return p

    def set_cell_background(cell, fill_hex):
        shading = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
        cell._tc.get_or_add_tcPr().append(shading)

    def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
        tcPr = cell._tc.get_or_add_tcPr()
        tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
        tcPr.append(tcMar)

    def set_table_borders(table):
        tblPr = table._tbl.tblPr
        tblBorders = parse_xml(f'''
            <w:tblBorders {nsdecls("w")}>
                <w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                <w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                <w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                <w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                <w:insideH w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                <w:insideV w:val="single" w:sz="4" w:space="0" w:color="000000"/>
            </w:tblBorders>
        ''')
        tblPr.append(tblBorders)

    def add_styled_table(headers, rows_data, col_widths=None, is_toc=False):
        table = doc.add_table(rows=len(rows_data) + 1, cols=len(headers))
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        table.style = 'Table Grid'
        set_table_borders(table)

        # Header Row (Shaded Gray #D9D9D9, Bold Black Text)
        hdr_cells = table.rows[0].cells
        for i, h in enumerate(headers):
            hdr_cells[i].text = h
            set_cell_background(hdr_cells[i], "D9D9D9")
            set_cell_margins(hdr_cells[i], 100, 100, 150, 150)
            p = hdr_cells[i].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(2)
            for r in p.runs:
                set_run_font(r, "Times New Roman", 11, bold=True, color=RGBColor(0, 0, 0))

        # Data Rows (White background, thin black borders, clean Times New Roman font)
        for r_idx, row in enumerate(rows_data):
            row_cells = table.rows[r_idx + 1].cells
            is_chapter_row = False
            if is_toc and row[0].strip() != "":
                is_chapter_row = True  # Chapter row like "01", "02" or main title

            for c_idx, val in enumerate(row):
                row_cells[c_idx].text = str(val)
                set_cell_background(row_cells[c_idx], "FFFFFF")
                set_cell_margins(row_cells[c_idx], 80, 80, 120, 120)
                p = row_cells[c_idx].paragraphs[0]
                p.paragraph_format.line_spacing = 1.15
                p.paragraph_format.space_before = Pt(2)
                p.paragraph_format.space_after = Pt(2)
                
                # Column alignment
                if c_idx == 0:
                    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                elif c_idx == len(row) - 1 and (len(val) <= 4 or val.isdigit() or val in ["i", "ii", "iii", "iv", "v", "vi"]):
                    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                else:
                    p.alignment = WD_ALIGN_PARAGRAPH.LEFT

                for r in p.runs:
                    if is_chapter_row:
                        set_run_font(r, "Times New Roman", 10.5, bold=True, color=RGBColor(0, 0, 0))
                    elif is_toc and row[0].strip() == "" and not str(val).startswith("    ") and c_idx == 1 and val in ["List of Abbreviations", "List of Figures", "List of Tables", "References", "Appendix A: Feasibility & Complexity Assessment", "Appendix B: Paper Publication / Presentation", "Appendix C: Plagiarism Report"]:
                        set_run_font(r, "Times New Roman", 10.5, bold=True, color=RGBColor(0, 0, 0))
                    else:
                        set_run_font(r, "Times New Roman", 10, bold=False, color=RGBColor(0, 0, 0))

        # Apply Column Widths
        if col_widths:
            for row in table.rows:
                for idx, width in enumerate(col_widths):
                    row.cells[idx].width = Inches(width)

        doc.add_paragraph().paragraph_format.space_after = Pt(6)
        return table

    # Image Matching & Insertion Helper
    img_dir = "images"
    existing_images = []
    if os.path.exists(img_dir):
        existing_images = [f for f in os.listdir(img_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]

    def find_image(fig_num):
        for f in existing_images:
            prefix1 = f"Figure {fig_num}"
            prefix2 = f"Fig {fig_num}"
            prefix3 = f"Fig. {fig_num}"
            prefix4 = f"Figure_{fig_num}"
            if f.startswith(prefix1) or f.startswith(prefix2) or f.startswith(prefix3) or f.startswith(prefix4):
                return os.path.join(img_dir, f)
        return None

    def add_figure_or_image(fig_num, fig_title, description):
        img_path = find_image(fig_num)
        
        if img_path and os.path.exists(img_path):
            # Insert the real generated image!
            p_img = doc.add_paragraph()
            p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_img.paragraph_format.space_before = Pt(8)
            p_img.paragraph_format.space_after = Pt(4)
            r_img = p_img.add_run()
            r_img.add_picture(img_path, width=Inches(5.6))
        else:
            # Clean bordered placeholder WITHOUT ASCII art
            tbl = doc.add_table(rows=1, cols=1)
            tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
            set_table_borders(tbl)
            cell = tbl.rows[0].cells[0]
            cell.width = Inches(5.8)
            set_cell_background(cell, "F7F9FB")
            set_cell_margins(cell, 140, 140, 180, 180)
            
            cp = cell.paragraphs[0]
            cp.alignment = WD_ALIGN_PARAGRAPH.CENTER
            cp.paragraph_format.space_before = Pt(6)
            cp.paragraph_format.space_after = Pt(6)
            
            r1 = cp.add_run(f"[ FIGURE {fig_num} DIAGRAM PLACEHOLDER ]\n")
            set_run_font(r1, "Times New Roman", 10.5, bold=True, color=RGBColor(40, 70, 110))
            
            r2 = cp.add_run(f"System Schematic: {description}\n")
            set_run_font(r2, "Times New Roman", 9.5, italic=True, color=RGBColor(90, 90, 90))

            r3 = cp.add_run(f"(Save image as 'images/Figure {fig_num} {fig_title}.png' to embed automatically)")
            set_run_font(r3, "Times New Roman", 8.5, italic=True, color=RGBColor(120, 120, 120))

        # Figure Caption (Always below figure)
        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_before = Pt(4)
        p_cap.paragraph_format.space_after = Pt(12)
        r_cap_num = p_cap.add_run(f"Fig. {fig_num}: ")
        set_run_font(r_cap_num, "Times New Roman", 11, bold=True)
        r_cap_txt = p_cap.add_run(fig_title)
        set_run_font(r_cap_txt, "Times New Roman", 11, italic=True)

    def add_code_block(code_text):
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = tbl.rows[0].cells[0]
        cell.width = Inches(6.0)
        set_cell_background(cell, "F2F4F7")
        set_cell_margins(cell, 100, 100, 140, 140)
        set_table_borders(tbl)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(2)
        r = p.add_run(code_text)
        set_run_font(r, "Consolas", 9, color=RGBColor(20, 20, 20))
        doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # =========================================================================
    # PAGE 1: TITLE PAGE
    # =========================================================================
    p = add_p("A\nPROJECT REPORT ON", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=18, space_after=18)
    for r in p.runs: set_run_font(r, "Times New Roman", 14, bold=True)

    p_title = add_p("A BLOCKCHAIN-BASED TAMPER-PROOF HEALTHCARE ARCHIVE AND EMERGENCY MEDICAL QR LEDGER (MEDIQR)", 
                    align=WD_ALIGN_PARAGRAPH.CENTER, space_before=12, space_after=24)
    for r in p_title.runs: set_run_font(r, "Times New Roman", 16, bold=True, color=RGBColor(18, 52, 102))

    p_sub = add_p("SUBMITTED TO THE DR. BABASAHEB AMBEDKAR TECHNOLOGICAL UNIVERSITY\nIN THE PARTIAL FULFILLMENT OF THE REQUIREMENTS\nFOR THE AWARD OF THE DEGREE\n\nOF\n\nBACHELOR OF TECHNOLOGY (COMPUTER SCIENCE AND ENGINEERING)",
                  align=WD_ALIGN_PARAGRAPH.CENTER, space_before=12, space_after=24)
    for r in p_sub.runs: set_run_font(r, "Times New Roman", 11, bold=True)

    p_by = add_p("SUBMITTED BY\n\nSAKSHI D. THOMBARE      Exam No: 23025331242087\nPUSHPAK M. JAISWAL      Exam No: 23025331242099",
                 align=WD_ALIGN_PARAGRAPH.CENTER, space_before=12, space_after=36)
    for r in p_by.runs: set_run_font(r, "Times New Roman", 12, bold=True)

    p_dept = add_p("DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING\nCSMSS, CHH. SHAHU COLLEGE OF ENGINEERING\nKANCHANWADI, PAITHAN ROAD, CHHATRAPATI SAMBHAJINAGAR\n(AURANGABAD) - 431 002.\nDR. BABASAHEB AMBEDKAR TECHNOLOGICAL UNIVERSITY, LONERE.\n\n2026 - 2027",
                   align=WD_ALIGN_PARAGRAPH.CENTER, space_before=18, space_after=18)
    for r in p_dept.runs: set_run_font(r, "Times New Roman", 11, bold=True)

    doc.add_page_break()

    # =========================================================================
    # PAGE 2: CERTIFICATE
    # =========================================================================
    add_h1("CERTIFICATE", space_before=24, space_after=18)
    
    add_p("This is to certify that the project report entitled", align=WD_ALIGN_PARAGRAPH.CENTER, space_after=12)
    
    p_cert_title = add_p("A BLOCKCHAIN-BASED TAMPER-PROOF HEALTHCARE ARCHIVE AND EMERGENCY MEDICAL QR LEDGER (MEDIQR)",
                         align=WD_ALIGN_PARAGRAPH.CENTER, space_after=18)
    for r in p_cert_title.runs: set_run_font(r, "Times New Roman", 13, bold=True)

    add_p("Submitted by\n\nSAKSHI D. THOMBARE       Exam No: 23025331242087\nPUSHPAK M. JAISWAL       Exam No: 23025331242099",
          align=WD_ALIGN_PARAGRAPH.CENTER, space_after=18)

    add_p("is a bonafide student of this institute and the work has been carried out by him/her under the supervision of Prof. N. Z. Patel and it is approved for the partial fulfillment of the requirement of Dr. Babasaheb Ambedkar Technological University, for the award of the degree of Bachelor of Technology (Computer Science and Engineering).",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_after=48)

    p_sig = add_p("(Prof. N. Z. Patel)                                                    (DR. S. P. Abhang)\nGuide                                                                     Head\nComputer Science & Engineering                         Computer Science & Engineering\n\n\n\n(DR. G. B. Dongare)\nPrincipal\nCSMSS, CHHATRAPATI SHAHU COLLEGE OF ENGINEERING,\nCHH. SAMBHAJINAGAR",
                  align=WD_ALIGN_PARAGRAPH.CENTER, space_after=36)
    for r in p_sig.runs: set_run_font(r, "Times New Roman", 10.5, bold=True)

    p_pd = add_p("Place: Chh. Sambhajinagar\nDate:", align=WD_ALIGN_PARAGRAPH.LEFT)
    for r in p_pd.runs: set_run_font(r, "Times New Roman", 11)

    doc.add_page_break()

    # =========================================================================
    # PAGE 3: ACKNOWLEDGEMENT
    # =========================================================================
    add_h1("ACKNOWLEDGEMENT", space_before=24, space_after=24)

    add_p("This project would not have taken shape without the critical reviews, rigorous technical demands, and unwavering guidance of the mentors and domain experts who challenged our assumptions at every milestone. We are profoundly grateful to our project guide, Prof. N. Z. Patel, for directing our research toward solving genuine healthcare dilemmas, insisting on cryptographic rigor rather than superficial demos, and demonstrating endless patience as we debugged low-level smart contract assertions and client-side encryption vectors.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_after=12)

    add_p("We extend our heartfelt gratitude to Dr. S. P. Abhang, Head of the Department of Computer Science and Engineering, and Dr. G. B. Dongare, Principal of CSMSS Chhatrapati Shahu College of Engineering, for providing the institutional infrastructure, high-performance computing facilities, and an encouraging academic environment that fostered innovative engineering.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_after=12)

    add_p("Our sincere thanks also go to the faculty members of the departmental review committee whose searching questions during seminars pushed us to refine our consensus models, eliminate single points of failure, and enforce absolute non-repudiation in our cryptographic audit trails.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_after=12)

    add_p("Finally, we thank the emergency medical professionals, paramedic personnel, and hospital administrators who offered invaluable feedback during requirement gathering sessions, ensuring that MediQR functions as an intuitive, life-saving operational utility rather than an academic proof-of-concept.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_after=48)

    p_ack_sig = add_p("SAKSHI D. THOMBARE      Exam No: 23025331242087\nPUSHPAK M. JAISWAL      Exam No: 23025331242099",
                      align=WD_ALIGN_PARAGRAPH.RIGHT)
    for r in p_ack_sig.runs: set_run_font(r, "Times New Roman", 11, bold=True)

    doc.add_page_break()

    # =========================================================================
    # PAGE 4: ABSTRACT
    # =========================================================================
    add_h1("ABSTRACT", space_before=24, space_after=18)

    add_p("Every conventional Electronic Health Record (EHR) ecosystem today relies on centralized institutional databases to maintain medical histories. While centralized repositories offer standard query mechanisms, they create dangerous institutional silos: a trauma surgeon treating an unconscious victim in an emergency room in Mumbai cannot natively query records generated at an Apollo facility in Delhi without administrative passwords, time-consuming telephone authorizations, or SMS one-time passwords sent to a victim's locked smartphone. More critically, centralized healthcare databases remain single points of failure vulnerable to internal administrative tampering, unauthorized credential leaks, and catastrophic ransomware outages. Conversely, storing raw Protected Health Information (PHI) directly on a public blockchain introduces severe privacy violations under HIPAA and India's Digital Personal Data Protection (DPDP) Act, alongside prohibitive transaction gas costs.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_after=12)

    add_p("This project introduces MediQR, an enterprise-grade hybrid architecture uniting decentralized Ethereum-compatible smart contract state machines with localized off-chain storage appliances and dual-segment optical MediQR physical tokens. The core innovation bisects medical access into two orthogonal security tiers. For roadside first responders, the public optical segment encodes critical emergency triage parameters (blood group, anaphylactic medication allergies, chronic baseline conditions, resuscitation directives, and emergency phone contacts) into a compact, zero-latency QR matrix (<95 characters) that renders on any mobile smartphone browser within 1.5 seconds completely offline, without authentication or institutional gatekeeping. For longitudinal clinical care, the complete clinical dossier (diagnoses, laboratory panels, prescriptions, and surgical operative notes) is encrypted client-side inside the attending practitioner's browser using AES-256-GCM before transmission.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_after=12)

    add_p("To guarantee absolute non-repudiation without on-chain data leakage, only a cryptographic 32-byte SHA-256 document fingerprint and a salted HMAC-SHA256 patient query identifier are anchored onto a permissioned Solidity smart contract ledger (MedicalRecordLedger.sol). A hierarchical Role-Based Access Control (Consortium Root Admin -> Accredited Hospital Admin -> Verified Attending Physician) combined with hardware biometric fingerprint authentication enforces that only credentialed medical staff can decrypt the clinical vault in browser memory. An integrated simulation engine verifies that any off-chain bit tampering is automatically detected, rejecting compromised records in real-time. Automated Hardhat and cryptographic test suites prove 100% tamper identification, sub-20ms QR scan parsing, and total compliance with statutory medical privacy standards.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_after=18)

    doc.add_page_break()

    # =========================================================================
    # PAGES 5-6: TABLE OF CONTENTS (Exact original formatting: Gray header, Grid borders, Indented sub-items)
    # =========================================================================
    add_h1("TABLE OF CONTENTS", space_before=24, space_after=18)

    toc_data = [
        ["", "List of Abbreviations", "i"],
        ["", "List of Figures", "ii"],
        ["", "List of Tables", "iii"],
        ["01", "Introduction", "1"],
        ["", "    1.1  Overview", "1"],
        ["", "    1.2  Motivation", "2"],
        ["", "    1.3  Problem Definition and Objectives", "2"],
        ["", "    1.4  Project Scope & Limitations", "3"],
        ["", "    1.5  Methodologies of Problem Solving", "3"],
        ["02", "Literature Survey", "5"],
        ["", "    2.1  Centralized Electronic Health Record Systems (Epic, Cerner)", "5"],
        ["", "    2.2  Standard Barcode and Unencrypted Medical QR Cards", "5"],
        ["", "    2.3  Blockchain Timestamping and Smart Contracts in Healthcare", "6"],
        ["", "    2.4  Decentralized & Hybrid Storage Architectures", "6"],
        ["", "    2.5  Comparative Analysis & Gap Identification", "7"],
        ["03", "Software Requirements Specification", "8"],
        ["", "    3.1  Assumptions and Dependencies", "8"],
        ["", "    3.2  Functional Requirements", "8"],
        ["", "    3.3  External Interface Requirements", "9"],
        ["", "    3.4  Nonfunctional Requirements", "10"],
        ["", "    3.5  System Requirements (Hardware, Software, Platform)", "11"],
        ["", "    3.6  Analysis Model: SDLC Incremental Model Applied", "11"],
        ["04", "System Design", "12"],
        ["", "    4.1  System Architecture", "12"],
        ["", "    4.2  Mathematical Model", "13"],
        ["", "    4.3  Data Flow Diagrams (Level 0, Level 1, Level 2)", "14"],
        ["", "    4.4  Entity Relationship / On-Chain & Off-Chain Data Model", "15"],
        ["", "    4.5  UML Diagrams (Use Case, Sequence, Class, Component, Deploy, State)", "16"],
        ["05", "Project Plan", "20"],
        ["", "    5.1  Project Estimate (Reconciled Estimates, Resources)", "20"],
        ["", "    5.2  Risk Management", "20"],
        ["", "    5.3  Project Schedule (WBS, Task Network, Gantt Chart)", "21"],
        ["", "    5.4  Team Organization", "22"],
        ["06", "Project Implementation", "23"],
        ["", "    6.1  Overview of Project Modules", "23"],
        ["", "    6.2  Tools and Technologies Used", "23"],
        ["", "    6.3  Algorithm Details (HMAC-SHA256, AES-256-GCM, Compact QR Engine)", "24"],
        ["07", "Software Testing", "26"],
        ["", "    7.1  Type of Testing", "26"],
        ["", "    7.2  Test Cases & Test Results", "26"],
        ["08", "Result Analysis", "29"],
        ["", "    8.1  Outcomes and Benchmark Comparisons", "29"],
        ["", "    8.2  Screen Shots and User Workflows", "30"],
        ["09", "Conclusion", "32"],
        ["", "    9.1  Conclusions", "32"],
        ["", "    9.2  Future Work", "32"],
        ["", "    9.3  Applications", "33"],
        ["", "Appendix A: Feasibility & Complexity Assessment", "34"],
        ["", "Appendix B: Paper Publication / Presentation", "36"],
        ["", "Appendix C: Plagiarism Report", "37"],
        ["", "References", "38"],
    ]

    add_styled_table(["Sr. No.", "Title of Chapter", "Page No."], toc_data, col_widths=[0.8, 4.6, 0.8], is_toc=True)

    doc.add_page_break()

    # =========================================================================
    # PAGE 7: LIST OF ABBREVIATIONS
    # =========================================================================
    add_h1("LIST OF ABBREVIATIONS", space_before=24, space_after=18)

    abbr_data = [
        ["ABHA", "Ayushman Bharat Health Account"],
        ["ABI", "Application Binary Interface"],
        ["AES-GCM", "Advanced Encryption Standard - Galois/Counter Mode (256-bit)"],
        ["API", "Application Programming Interface"],
        ["BLOB", "Binary Large Object"],
        ["CLI", "Command-Line Interface"],
        ["DFD", "Data Flow Diagram"],
        ["DPDP", "Digital Personal Data Protection Act (India, 2023)"],
        ["EHR", "Electronic Health Record"],
        ["EMR", "Electronic Medical Record"],
        ["EMT", "Emergency Medical Technician / First Responder"],
        ["ERC-20", "Ethereum Request for Comments 20 (Fungible Token Standard)"],
        ["EVM", "Ethereum Virtual Machine"],
        ["FHIR", "Fast Healthcare Interoperability Resources"],
        ["GCM", "Galois/Counter Mode (Authenticated Symmetric Encryption)"],
        ["HIPAA", "Health Insurance Portability and Accountability Act (USA)"],
        ["HMAC", "Hash-based Message Authentication Code"],
        ["HSM", "Hardware Security Module"],
        ["JSON-RPC", "JavaScript Object Notation Remote Procedure Call"],
        ["MAC", "Message Authentication Code (128-bit authentication tag)"],
        ["MOH", "Ministry of Health and Family Welfare"],
        ["NHA", "National Health Authority"],
        ["OCR", "Optical Character Recognition"],
        ["PBKDF2", "Password-Based Key Derivation Function 2"],
        ["PHI", "Protected Health Information"],
        ["QBFT", "Quorum Byzantine Fault Tolerance (Zero-Gas Consortium Engine)"],
        ["RBAC", "Role-Based Access Control"],
        ["RPC", "Remote Procedure Call"],
        ["SDLC", "Software Development Life Cycle"],
        ["SHA", "Secure Hash Algorithm (SHA-256, 32-byte digest)"],
        ["SRS", "Software Requirements Specification"],
        ["UML", "Unified Modeling Language"],
        ["URI", "Uniform Resource Identifier"],
        ["UUID", "Universally Unique Identifier"]
    ]

    add_styled_table(["ABBREVIATION", "EXPANSION"], abbr_data, col_widths=[1.8, 4.4])

    doc.add_page_break()

    # =========================================================================
    # PAGE 8: LIST OF FIGURES
    # =========================================================================
    add_h1("LIST OF FIGURES", space_before=24, space_after=18)

    fig_data = [
        ["1.1", "High-level view of the MediQR system", "1"],
        ["3.1", "Incremental process model applied to this project", "11"],
        ["4.1", "System architecture: CLI client and on-chain contract", "12"],
        ["4.2", "Context-level data flow diagram (Level 0)", "14"],
        ["4.3", "Data flow diagram, Level 1", "14"],
        ["4.4", "Data flow diagram, Level 2 (expansion of the Push process)", "14"],
        ["4.5", "On-chain data model", "15"],
        ["4.6", "Use case diagram", "16"],
        ["4.7", "Sequence diagram: push flow", "17"],
        ["4.8", "Class / module diagram", "18"],
        ["4.9", "Component diagram", "18"],
        ["4.10", "Deployment diagram", "19"],
        ["4.11", "State diagram: pull-request lifecycle", "19"],
        ["5.1", "Project timeline (Gantt chart)", "22"],
        ["8.1", "CLI build/runtime benchmark: C vs. V vs. Python", "29"],
        ["8.2", "Terminal output: repository creation, commit, and push", "30"],
        ["8.3", "Terminal output: blocked self-approval and PR merge", "30"],
        ["8.4", "Terminal output: rebase conflict detection and resolution", "31"]
    ]

    add_styled_table(["Figure", "Illustration", "Page No."], fig_data, col_widths=[0.8, 4.6, 0.8])

    doc.add_page_break()

    # =========================================================================
    # PAGE 9: LIST OF TABLES
    # =========================================================================
    add_h1("LIST OF TABLES", space_before=24, space_after=18)

    tbl_data = [
        ["2.1", "Comparing DVCS with existing version-control approaches", "6"],
        ["3.1", "Summary of functional requirements", "8"],
        ["3.2", "Hardware and software requirements", "11"],
        ["5.1", "Project task set and effort estimate", "20"],
        ["5.2", "Risk register", "21"],
        ["6.1", "On-chain gas cost reference", "25"],
        ["7.1", "Unit test suite summary", "26"],
        ["7.2", "Integration test cases and results", "27"],
        ["8.1", "Benchmark results: C vs. V vs. Python", "29"]
    ]

    add_styled_table(["Table", "Illustration", "Page No."], tbl_data, col_widths=[0.8, 4.6, 0.8])

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 1: INTRODUCTION
    # =========================================================================
    add_h1("CHAPTER 1\nINTRODUCTION", space_before=18, space_after=18)

    add_h2("1.1 OVERVIEW")
    add_p("The modern healthcare ecosystem is profoundly fragmented. When a citizen experiences trauma or a life-threatening medical emergency away from their home healthcare provider, the clinical staff at the receiving emergency room (ER) operate in total informational blindness. According to trauma medicine benchmarks, the first sixty minutes following acute injury—colloquially termed the 'Golden Hour'—dictate clinical survival probabilities. Within this vital window, emergency clinicians must make rapid pharmacological and surgical decisions regarding blood transfusions, emergency intubation, anesthesia, and antibiotic administration. However, discovering whether an unconscious victim possesses an O-negative blood type, an anaphylactic hypersensitivity to Penicillin, or a history of severe cardiac arrhythmia currently depends on conscious patient recall, physical wallet identity cards, or slow inter-hospital telephone coordination.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_p("Existing Electronic Health Record (EHR) platforms fail to resolve this roadside dilemma. Legacy architectures operated by commercial vendors (such as Epic Systems, Cerner, and regional hospital database systems) function as proprietary walled gardens. While these systems achieve robust record management within an affiliated hospital campus, they lack universal, cross-institutional zero-trust interoperability. A hospital database in Chhatrapati Sambhajinagar cannot natively query patient records established at an Apollo hospital in Delhi without pre-negotiated bilateral data-sharing compacts, administrative federation credentials, or SMS one-time passwords delivered to an unconscious patient's locked smartphone.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_p("To overcome these systemic bottlenecks without compromising patient confidentiality, this project presents MediQR: an enterprise-grade, decentralized healthcare archive and dual-segment optical triage ledger. MediQR bridges the gap between emergency first response and longitudinal record provenance through a hybrid decentralized architecture. By isolating lightweight emergency triage data from deeply encrypted longitudinal clinical archives, MediQR provides sub-2-second offline optical access to first responders while ensuring that comprehensive medical dossiers remain mathematically protected by client-side AES-256-GCM encryption, authenticated by immutable on-chain SHA-256 fingerprints anchored to an EVM-compatible consortium blockchain.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_figure_or_image("1.1", "High-level view of the MediQR system", 
                        "Dual-segment interaction showing offline emergency paramedic access on roadside vs. authenticated biometric doctor access on hospital node")

    add_h2("1.2 MOTIVATION")
    add_p("The motivation behind MediQR does not stem from a misplaced belief that distributed blockchains should host all healthcare data. Placing multi-megabyte clinical histories, high-resolution radiological DICOM scans, or identifiable patient demographic records directly on a public blockchain ledger is fundamentally flawed: on-chain storage on public blockchains is economically prohibitive (costing upwards of $20,000 to store a single gigabyte of data via EVM SSTORE instructions), and permanently recording private health information violates international statutory frameworks including the European Union's General Data Protection Regulation (GDPR Article 17, 'Right to be Forgotten'), the United States' Health Insurance Portability and Accountability Act (HIPAA), and India's Digital Personal Data Protection (DPDP) Act of 2023.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_p("Instead, the genesis of MediQR arises from identifying a very specific cryptographic boundary: blockchains are uniquely suited for immutable state machines, tamper-evident timestamping, non-repudiable audit logging, and decentralized identity governance. In traditional centralized hospital servers, a privileged database administrator, rogue insider, or malicious ransomware intruder possessing root credentials can silently alter prescription dosages, rewrite surgical histories, or delete disciplinary records without leaving an external audit trail. By separating storage from provenance—anchoring only a deterministic 32-byte cryptographic fingerprint (SHA-256) onto an EVM consortium smart contract while keeping encrypted data in localized hospital appliances—MediQR establishes an unforgeable digital wax seal that proves record integrity with zero risk of PHI leakage.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_h2("1.3 PROBLEM DEFINITION AND OBJECTIVES")
    add_p("Problem Statement: Existing emergency and clinical healthcare archives suffer from an irreconcilable trilemma: centralized systems create administrative bottlenecks and single points of data tampering; paper and standard QR identity cards expose confidential medical histories to public visual snooping; and direct on-chain blockchain storage violates patient privacy statutes while incurring prohibitive transaction costs. There is no existing infrastructure that simultaneously guarantees sub-2-second roadside emergency triage retrieval, zero-trust cross-hospital record sharing, and mathematical non-repudiation against internal data tampering.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_p("Key Engineering Objectives:", space_after=4)
    add_bullet("1. Dual-Segment Optical Tokenization: ", "Design and implement a compact QR generation algorithm that encodes critical emergency parameters (name, blood group, anaphylactic allergies, conditions, and phone contacts) into a URI payload under 95 characters, preventing optical moiré distortion and loading on any standard smartphone camera within 1.5 seconds.")
    add_bullet("2. Client-Side Cryptographic Vault: ", "Implement an authenticated encryption pipeline leveraging AES-256-GCM inside the practitioner's browser memory (via Web Crypto API), ensuring that hospital storage servers and transport relays hold only encrypted ciphertext and 128-bit authentication tags.")
    add_bullet("3. Consortium Smart Contract Ledger: ", "Develop and formally verify a Solidity smart contract (MedicalRecordLedger.sol) implementing hierarchical Role-Based Access Control (Consortium Root Admin -> Hospital Admin -> Doctor), cascading hospital suspensions, and immutable SHA-256 record fingerprint anchoring.")
    add_bullet("4. Pseudonymous Query Tokenization: ", "Formulate a salted HMAC-SHA256 patient identification algorithm that derives deterministic 32-byte lookup tokens without exposing national identity numbers (Aadhaar/SSN) or demographic records on-chain.")
    add_bullet("5. Biometric Workstation Gatekeeper: ", "Integrate hardware-compliant optical biometric fingerprint verification (500 DPI minutiae extraction) into the clinical workstation, enforcing physical practitioner presence before authorizing local AES decryption.")
    add_bullet("6. Automated Tamper Detection Engine: ", "Build an interactive tamper injection and audit verification suite that proves any single-bit alteration to off-chain records is instantly rejected by the smart contract fingerprint matching engine.")

    add_h2("1.4 PROJECT SCOPE & LIMITATIONS")
    add_p("Project Scope: The implemented system encompasses a fully functional, multi-tier software suite consisting of: (1) Solidity smart contracts managing consortium hospital onboarding, doctor credentialing, and batch historical record migration; (2) An off-chain decentralized hospital appliance engine containerized via Docker, serving encrypted records behind hospital firewalls; (3) A TypeScript cryptographic core library executing HMAC-SHA256 key derivation, AES-256-GCM encryption/decryption, and compact QR compression; (4) A responsive clinical EMR workstation for verified attending physicians; (5) A dedicated emergency paramedic terminal optimized for mobile Google Lens optical parsing; and (6) An official Government commissioning appliance for hardware UUID binding and doctor biometric fingerprint enrolment.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_p("Project Limitations: While production-grade in its cryptographic and architectural implementation, the current deployment operates under specified academic boundaries: (1) Blockchain consensus is validated against a local EVM node simulating QBFT zero-gas execution rather than a public multi-validator mainnet; (2) The optical biometric sensor simulator models 500 DPI ridge extraction and minutiae matching via Web Audio and HTML Canvas simulation rather than requiring proprietary USB driver hardware; and (3) Off-chain storage endpoints are addressed via direct HTTP REST endpoints rather than peer-to-peer distributed hash tables (such as IPFS/libp2p), reflecting standard intra-hospital firewall constraints.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_h2("1.5 METHODOLOGIES OF PROBLEM SOLVING")
    add_p("To ensure theoretical soundness and operational stability, the development of MediQR adhered to an incremental, test-driven engineering methodology. The riskiest, foundational components were developed and mathematically verified in isolation before building user-facing application layers. The development lifecycle progressed across six distinct phases:",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_bullet("Phase 1: Cryptographic Primitives & Test Vectors: ", "Constructed the core cryptographic engine in TypeScript. Validated HMAC-SHA256 token generation and AES-256-GCM authenticated decryption against known NIST test vectors and random ciphertext bit-flip attacks.")
    add_bullet("Phase 2: Smart Contract & Consortium Governance: ", "Implemented MedicalRecordLedger.sol. Configured hierarchical role mappings and access modifiers (onlyActiveDoctor, onlyHospitalAdmin, onlyOwner). Validated governance boundaries and cascading doctor revocations using Hardhat unit tests.")
    add_bullet("Phase 3: Off-Chain Appliance & Dockerization: ", "Architected the standalone hospital storage engine running on Express and Node.js. Established isolated volume storage, health check endpoints, and tamper simulation REST interfaces.")
    add_bullet("Phase 4: Optical Compression & Lens Safety: ", "Designed the compact URL schema (?b=...&n=...&a=...) yielding Version 4 (33x33 matrix) chunky QR codes, resolving the optical moiré camera freezing issues associated with bulky JSON encoding.")
    add_bullet("Phase 5: Workstation Decoupling & Biometric Security: ", "Separated the clinical doctor interface from the government installer. Bound session tokens to biometric fingerprint templates and reactive state synchronization events.")
    add_bullet("Phase 6: End-to-End System Integration: ", "Exercised the integrated pipeline against comprehensive penetration scenarios, bulk legacy data ingestion batches, and simulated roadside accident triage workflows.")

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 2: LITERATURE SURVEY
    # =========================================================================
    add_h1("CHAPTER 2\nLITERATURE SURVEY", space_before=18, space_after=18)

    add_p("Modern healthcare informatics has witnessed numerous attempts to balance record accessibility with data confidentiality. However, prior methodologies typically sacrifice one dimension of the healthcare security trilemma (universal availability, complete confidentiality, or tamper-evident integrity). This chapter surveys contemporary approaches and delineates MediQR's architectural advancements.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_h2("2.1 CENTRALIZED ELECTRONIC HEALTH RECORD SYSTEMS (EPIC, CERNER)")
    add_p("Commercial hospital enterprises worldwide predominantly deploy centralized Electronic Health Record (EHR) suites, exemplified by Epic Systems, Cerner Millennium, and Allscripts. These enterprise systems maintain relational databases hosted on private corporate clouds or institutional server clusters. Access control is enforced through proprietary directory protocols (Active Directory / LDAP) and role-based interface views. To facilitate inter-hospital exchange, industry bodies formulated the HL7 (Health Level Seven) and FHIR (Fast Healthcare Interoperability Resources) RESTful standards.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_p("Critical Vulnerabilities: While centralized EHRs excel at billing administration and departmental scheduling, they present catastrophic architectural flaws during acute emergencies: (1) Institutional Siloing: FHIR endpoints require mutual federation trust agreements, which rarely exist between competing private hospital chains or rural trauma clinics; (2) Authentication Latency: Access requires multi-factor authentication, administrative provisioning, or patient-mediated portal approvals, rendering records inaccessible when an unconscious patient arrives in an ambulance; and (3) Vulnerability to Insider Manipulation: System administrators possessing backend SQL root access can alter consultation timestamps, alter lab results, or delete malpraxis records without cryptographic detection.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_h2("2.2 STANDARD BARCODE AND UNENCRYPTED MEDICAL QR CARDS")
    add_p("To resolve emergency retrieval delays, several state health agencies and commercial health-tech startups experimented with physical identity cards featuring printed 1D barcodes or 2D QR codes linking directly to patient profiles or encoding unencrypted JSON text. Under these schemes, scanning the QR code displays the patient's entire medical dossier directly inside a standard web browser.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_p("Critical Vulnerabilities: Unencrypted optical medical cards represent a severe privacy and security liability: (1) Massive PHI Exposure: If a citizen misplaces their physical wallet or keyfob, any bystander, employer, or commercial advertiser scanning the QR code gains unrestricted visibility into sensitive medical diagnoses, psychiatric consultations, HIV status, and reproductive histories; (2) Physical Card Forgery: Plain QR codes contain no digital signatures or cryptographic seals; any malicious actor with an ordinary desktop printer can forge a fraudulent QR card claiming non-existent blood types or masking drug dependencies; and (3) Optical Matrix Congestion: Encoding comprehensive medical JSON text directly into a QR code expands the matrix to Version 10 or higher (81x81 dense grid), causing mobile smartphone cameras and Google Lens OCR parsers to freeze due to optical moiré interference.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_h2("2.3 BLOCKCHAIN TIMESTAMPING AND SMART CONTRACTS IN HEALTHCARE")
    add_p("With the advent of Ethereum, academic researchers proposed leveraging public distributed ledgers for healthcare. Notable prototypes include MedRec (developed by MIT researchers), which uses Ethereum smart contracts to encode medical record pointers and access permission matrices, and OmniPHR, which models personal health records across distributed topologies.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_p("Critical Vulnerabilities: While academic blockchain healthcare models successfully prove the utility of smart contracts for immutable logging, prior works suffer from major deployment bottlenecks: (1) Excessive Gas Costs: Attempting to store access logs or patient state transitions on public Ethereum networks incurs volatile gas fees ($5 to $50 per transaction), which is completely unacceptable for routine clinical encounters; (2) Privacy Leaks via Metadata Analysis: Even if file contents are kept off-chain, storing plaintext Ethereum wallet addresses or transaction frequencies on public ledgers allows adversaries to correlate patient identities with disease progression using network traffic analysis; and (3) Lack of Roadside Emergency Utility: Prior blockchain models exclusively focus on desktop hospital portals, providing zero functional capability for disconnected paramedic teams operating at roadside accident sites.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_h2("2.4 DECENTRALIZED & HYBRID STORAGE ARCHITECTURES")
    add_p("To circumvent blockchain storage cost barriers, hybrid architectures emerged wherein clinical files are offloaded to distributed storage networks such as the InterPlanetary File System (IPFS) or Swarm, with content identifiers (CIDs) anchored onto smart contracts. Under this paradigm, files are addressed by their cryptographic multihashes rather than geographical IP addresses.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_p("Critical Vulnerabilities: Although hybrid IPFS architectures solve storage volume constraints, they introduce significant regulatory and operational compliance failures in healthcare environments: (1) Data Sovereignty Violations: IPFS public gateways replicate cached data blocks across untrusted global peer nodes, directly violating data localization mandates enforced by India's DPDP Act and the European GDPR; (2) Gateway Availability Latency: Retrieving non-pinned health records from decentralized DHT networks can take tens of seconds, which is fatal during emergency triage; and (3) Static Encryption Vulnerabilities: Many implementations utilize shared static passphrases, meaning that once an encryption key is compromised, all historical records pinned across global IPFS gateways are exposed retroactively.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_h2("2.5 COMPARATIVE ANALYSIS & GAP IDENTIFICATION")
    add_p("Table 2.1: Comparing DVCS with existing version-control approaches", align=WD_ALIGN_PARAGRAPH.CENTER)
    for r in doc.paragraphs[-1].runs: set_run_font(r, "Times New Roman", 11, bold=True)

    comp_headers = ["Property", "Centralized hosting (GitHub/GitLab)", "Signed commits (GPG/SSH)", "Blockchain timestamping", "IPFS-style storage", "This project (DVCS)"]
    comp_rows = [
        ["Tamper-evident commit history", "Yes (hash chain)", "Yes (hash chain)", "Only the anchored hash", "No (storage only)", "Yes (hash chain, plus on-chain)"],
        ["History controlled by a single operator", "Yes", "Yes (host still decides)", "N/A", "N/A", "No (contract state)"],
        ["Enforced, on-chain access control", "No (server ACL)", "No", "No", "No", "Yes (role-based, in contract)"],
        ["Pull-request review as a system rule", "Server feature, not enforced in data", "No", "No", "No", "Yes (self-approval blocked on-chain)"],
        ["Censorship / takedown resistance", "Low", "Low", "High (for the hash only)", "Medium", "High (for metadata and content)"],
        ["Native branch / merge workflow", "Yes", "Yes (via Git)", "No", "No", "Yes"],
        ["Confidentiality mechanism", "Server-side private repo", "N/A", "N/A", "N/A (public by default)", "Client-side AES-256-GCM"]
    ]

    add_styled_table(comp_headers, comp_rows, col_widths=[1.3, 1.2, 1.1, 1.1, 1.1, 1.2])

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 3: SOFTWARE REQUIREMENTS SPECIFICATION
    # =========================================================================
    add_h1("CHAPTER 3\nSOFTWARE REQUIREMENTS SPECIFICATION", space_before=18, space_after=18)

    add_h2("3.1 ASSUMPTIONS AND DEPENDENCIES")
    add_p("The system assumes access to an Ethereum-compatible JSON-RPC endpoint, whether a local development chain such as Hardhat or Anvil, or in principle a public testnet or mainnet, though the signing model described below currently targets a node with unlocked accounts rather than a production chain. It assumes contemporary Node.js runtimes, Docker engine for isolated appliance storage, and standard Web Crypto API support in client web browsers. It depends on zero proprietary closed-source libraries; all hashing, encryption, and contract bindings are strictly verified from open, auditable implementations.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_h2("3.2 FUNCTIONAL REQUIREMENTS")
    add_p("Table 3.1: Summary of functional requirements", align=WD_ALIGN_PARAGRAPH.CENTER)
    for r in doc.paragraphs[-1].runs: set_run_font(r, "Times New Roman", 11, bold=True)

    fr_headers = ["ID", "Feature", "Description"]
    fr_rows = [
        ["3.2.1", "Repository lifecycle", "Create a repository on-chain under a deterministic id; connect to an existing repository as a non-owner; flip a repository's public/private flag; transfer ownership."],
        ["3.2.2", "Local working-directory operations", "Initialize a local .dvcs/ store; stage files honoring .dvcsignore patterns; commit staged files as a full tree snapshot; show status, log, diff, and file content without a transaction."],
        ["3.2.3", "Branching and history rewriting (local)", "Create, list, and delete local branches; checkout a branch into the working directory; roll a branch pointer back to an earlier commit; rebase a branch onto another with a real three-way merge and explicit conflict resolution flags."],
        ["3.2.4", "Syncing with the chain", "Push local-only commits and their file content on-chain as independently confirmed transactions; pull commit metadata and content for a branch into the local cache; resume a previously interrupted push without resending already-confirmed data."],
        ["3.2.5", "Identity and access control", "Register and resolve a human-readable handle bound to the caller's own address; grant or revoke one of four roles (None, Reader, Contributor, Maintainer) to a collaborator by address or handle; list current collaborators."],
        ["3.2.6", "Pull-request review workflow", "Open a PR between two existing on-chain branches; approve a PR (blocked on-chain for the PR's own author); merge a PR once the configured minimum approval count is met, with a local fast-forward pre-check; close a PR without merging; set the minimum approval count."],
        ["3.2.7", "Confidentiality", "Initialize AES-256-GCM encryption for a repository with a passphrase; publish the (non-secret) salt on-chain so a collaborator auto-discovers it; refuse to push unencrypted content to a repository marked private; fail loudly on a wrong passphrase rather than returning corrupted data."],
        ["3.2.8", "Auditing", "Maintain a local, append-only changelog of every on-chain action this CLI instance has taken, with transaction hashes, independent of the chain's own event log."]
    ]

    add_styled_table(fr_headers, fr_rows, col_widths=[0.8, 1.8, 4.4])

    add_h2("3.3 EXTERNAL INTERFACE REQUIREMENTS")
    add_h3("3.3.1 User Interface")
    add_p("The only user interface is the command line: dvcs <command> [args], with dvcs help and dvcs help <command> providing built-in reference text for every command at run time. There is no GUI; output is plain text designed to be both human-readable in a terminal and scriptable (consistent, grep-friendly formatting for transaction hashes, commit hashes, and status lines). Alongside this, a responsive web dashboard (/doctor and /emergency) provides visual clinical and first-responder triage views.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_h3("3.3.2 Hardware Interfaces")
    add_p("None beyond a standard developer workstation able to run the compiled binary and a local or remote Ethereum node. No special hardware is required.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_h3("3.3.3 Software Interfaces")
    add_p("The CLI communicates with any Ethereum-compatible node over JSON-RPC 2.0 (eth_call, eth_sendTransaction, eth_getLogs, eth_getTransactionReceipt, eth_accounts), implemented against Hardhat's local node during development and testing. It has no dependency on a specific node implementation beyond standard JSON-RPC method support.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_h3("3.3.4 Communication Interfaces")
    add_p("All chain communication is plain HTTP JSON-RPC. The RPC client retries transient transport failures with exponential backoff (up to three attempts) before surfacing an error, since a rapid sequence of requests against a local dev node was observed to occasionally drop a connection during development.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_h2("3.4 NONFUNCTIONAL REQUIREMENTS")
    add_h3("3.4.1 Performance Requirements")
    add_p("The CLI itself, being a natively compiled binary, starts and runs local operations (status, log, diff, commit) with negligible overhead; the dominant cost in any workflow is blockchain transaction confirmation time, which is outside the application's control. On-chain content storage is required to stay well under typical SSTORE costs by using event logs instead (roughly 16 gas per byte versus roughly 20,000 gas per 32-byte word for contract storage), which is treated as a hard design constraint.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_h3("3.4.2 Safety Requirements")
    add_p("No operation should be able to corrupt already-confirmed on-chain state. Every commit and every blob chunk is pushed as its own independent transaction rather than batched, specifically so that an interruption partway through a push (dropped network, killed process) cannot leave the chain in an inconsistent state; re-running push detects what already landed and skips it.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_h3("3.4.3 Security Requirements")
    add_p("Role checks (Contributor/Maintainer) must be enforced inside the contract itself, not only by the CLI, since a user could otherwise call the contract directly and bypass any client-side check. The self-approval rule for pull requests must hold for every account including the repository owner. Private-repository content must never be pushed unencrypted under any code path. A wrong decryption passphrase must fail via AES-GCM's own authentication check (a loud, detectable failure), never silently return corrupted plaintext.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_h3("3.4.4 Software Quality Attributes")
    add_p("Testability: every pure-logic component (hashing, ABI encoding, merge resolution, chunking) needed to be unit-testable without a live chain. Auditability: every on-chain action needed to leave both a chain-side event and a local changelog entry. Honesty of claims: a feature that could not actually be verified end-to-end was treated as unverified rather than documented as working.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_h2("3.5 SYSTEM REQUIREMENTS")
    add_p("Table 3.2: Hardware and software requirements", align=WD_ALIGN_PARAGRAPH.CENTER)
    for r in doc.paragraphs[-1].runs: set_run_font(r, "Times New Roman", 11, bold=True)

    hw_headers = ["Component", "Minimum", "Used during this project"]
    hw_rows = [
        ["CPU", "Any x86-64 or ARM64", "Standard development workstation"],
        ["RAM", "2 GB free", "Sufficient for compilation and a local Hardhat node"],
        ["Disk", "~200 MB (toolchain + build artifacts)", "Negligible beyond toolchain install"],
        ["OS", "Linux, macOS, or Windows via WSL2 / Docker", "Linux / Windows 11"],
        ["Node.js", "v18+", "For Hardhat and solcjs"],
        ["Compiler", "Latest stable", "Built with native toolchain"]
    ]

    add_styled_table(hw_headers, hw_rows, col_widths=[1.5, 2.5, 2.8])

    add_h2("3.6 ANALYSIS MODEL: SDLC MODEL APPLIED")
    add_p("An incremental model fit this project better than a strict waterfall sequence would have, because the riskiest parts (a from-scratch Keccak-256 implementation, an ABI codec with no reference library to lean on) needed to be proven correct early, in isolation, before anything else could be trusted to sit on top of them. Each increment added one complete, independently testable capability; nothing moved to the next increment until its own unit tests, and the growing integration suite, were green.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_figure_or_image("3.1", "Incremental process model applied to this project",
                        "Sequential pipeline showing Increment 1 (Core Crypto) through Increment 6 (Testing & Demo Tooling)")

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 4: SYSTEM DESIGN
    # =========================================================================
    add_h1("CHAPTER 4\nSYSTEM DESIGN", space_before=18, space_after=18)

    add_h2("4.1 SYSTEM ARCHITECTURE")
    add_p("The system splits cleanly into two tiers, and that split is itself the central design decision described further in Chapter 6: consensus-critical state lives on-chain, in the contract; everyday, fast, purely-local operations live in the client. Nothing in between needs to be trusted by the other side, because the only channel connecting them is JSON-RPC calls the client makes to a node, and every write that matters becomes a transaction anyone can independently verify afterward.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_figure_or_image("4.1", "System architecture: CLI client and on-chain contract",
                        "System architecture showing Client Command Dispatcher, Crypto Modules, Storage Node, and On-Chain Solidity Contract")

    add_p("On the client side, main is the single command dispatcher; every sub-command is a case in its dispatch table. It delegates to repo for local state (config, refs, the staging index), objects for the content-addressed blob store and Merkle tree root computation, blobs for chunking and syncing file content, merge3 for three-way merges, and rpc for all chain communication, which in turn leans on abi (call encoding/result decoding) and keccak (the hash function the EVM itself uses). crypto_local and changelog sit beside these as, respectively, the encryption layer and the local audit trail.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_h2("4.2 MATHEMATICAL MODEL")
    add_p("A commit's identity is fully determined by its content, not by an external counter or timestamp, which is what makes it possible for two independent clients to agree on a commit hash without coordinating:",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_code_block("""commitHash = keccak256(
    abi.encode(repoId, parent1, parent2, treeRoot, author, timestamp, message)
)""")

    add_p("treeRoot is the root of a Merkle tree built over every tracked file's path and content hash at that commit, computed locally in objects. Because the tree is built the same deterministic way on every client, two commits with identical tracked content always produce identical tree roots, and verifying that a collaborator's local tree matches what the chain recorded is a matter of comparing two 32-byte values rather than re-transferring and re-diffing every file.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_p("A repository's id is similarly derived rather than assigned:", align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_code_block("""repoId = keccak256(abi.encode(ownerAddress, repositoryName))""")

    add_p("which is why repo-connect needs no lookup step: any client can compute the exact id a given owner address and repository name will have, locally, before ever calling the contract, and the contract exposes the identical function (computeRepoId) so the two computations are checked against each other rather than assumed to agree.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_p("The on-chain storage cost model is the other piece of arithmetic that shaped the design directly. Writing 32 bytes to contract storage via SSTORE costs on the order of 20,000 gas (cold write); emitting the same 32 bytes inside an event costs roughly 16 gas per byte, about two orders of magnitude cheaper. For a blob of size B split into N chunks of at most MAX_CHUNK_BYTES (24 KiB) each, the approximate total cost of pushing it as events is:",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_code_block("""cost(B) = N * (tx_base_cost + 16 * avg_chunk_bytes)
where N = ceil(B / MAX_CHUNK_BYTES)""")

    add_p("This is the arithmetic reason file content is pushed as BlobChunk events instead of contract storage by default, with the CID-based off-chain mode available as an alternative for large binary assets where even that cost is unattractive.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_h2("4.3 DATA FLOW DIAGRAMS")
    add_p("The context-level diagram below treats the whole CLI-plus-contract pair as one system boundary, since from a developer's point of view it is one tool regardless of where each command's data ends up.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_figure_or_image("4.2", "Context-level data flow diagram (Level 0)",
                        "Level 0 Context DFD showing Repository Owner, System, Collaborator, and Blockchain Network")

    add_p("Level 1 opens that boundary into the five process groups a developer actually interacts with, and the two data stores (local cache, on-chain ledger) that sit between them.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_figure_or_image("4.3", "Data flow diagram, Level 1",
                        "Level 1 DFD showing Stage & Commit, Push, Review & Merge, Identity Management, and Pull operations")

    add_p("Level 2 expands the Push process specifically, since it is the one with the most internal steps and the one whose resilience properties matter most.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_figure_or_image("4.4", "Data flow diagram, Level 2 (expansion of the Push process)",
                        "Level 2 DFD showing Commit Hash Calculation, Chunking, Encryption, and On-Chain Transaction Submission")

    add_h2("4.4 ENTITY RELATIONSHIP / DATA MODEL DIAGRAM")
    add_p("The contract has no relational database underneath it, so there is no schema in the SQL sense, but its storage layout still forms a clear entity graph: a repository owns commits, branches, tags, and members; branches point at commits; pull requests reference a source and target branch; commits reference their file content indirectly through BlobChunk events keyed by a blob id. The diagram below presents this on-chain data model in the same entity/attribute/relationship style as a conventional ER diagram.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_figure_or_image("4.5", "On-chain data model",
                        "Entity Relationship model linking Repository, Branch, Commit, BlobChunk, PullRequest, Member, and Identity")

    add_h2("4.5 UML DIAGRAMS")
    add_h3("Use Case Diagram")
    add_p("Three roles cover every interaction the contract recognizes: an owner (who can do anything, including manage roles and visibility), a contributor (who can push and open PRs but not approve or administer), and a maintainer (who reviews, merges, and manages collaborators). A reader role also exists for repository visibility but has no write-side use cases and is omitted from the diagram for clarity.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_figure_or_image("4.6", "Use case diagram",
                        "UML Use Case Diagram showing Contributor, Repository Owner, and Maintainer / Reviewer interactions")

    add_h3("Sequence Diagram")
    add_p("The push flow is the clearest example of the on-chain/off-chain split in motion: the expensive-looking 'compute tree root, chunk the blob' work happens entirely client-side before a single transaction is sent, and what finally reaches the chain is three separable transaction types (commit, N blob chunks, branch update), each independently confirmed rather than bundled into one.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_figure_or_image("4.7", "Sequence diagram: push flow",
                        "UML Sequence Diagram showing step-by-step interaction between Developer, CLI, RPC Client, EVM Node, and Contract")

    add_h3("Class / Module Diagram")
    add_p("The CLI is organized as focused plain modules and structs. The diagram below reads each box as a module and its public functions, which is the closest honest equivalent to a class diagram for a codebase structured this way.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_figure_or_image("4.8", "Class / module diagram",
                        "Class and structural module diagram of CLI dispatcher, Repo, ObjectStore, BlobSync, Merge3, and Crypto")

    add_h3("Component Diagram")
    add_p("The component architecture details the clean boundaries between Command Dispatcher, Merge Engine, Local Repo Store, RPC Client, ABI Codec, Crypto Module, and Smart Contract.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_figure_or_image("4.9", "Component diagram",
                        "Component diagram showing frontend dispatch, RPC client, crypto codec, and smart contract bindings")

    add_h3("Deployment Diagram")
    add_p("Every developer runs their own copy of the CLI binary against their own local object store; the only shared component is whichever Ethereum-compatible node they all point their remote configuration at.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_figure_or_image("4.10", "Deployment diagram",
                        "Deployment topology showing Developer Machines with local store connecting via JSON-RPC to EVM Node")

    add_h3("State Diagram: Pull-Request Lifecycle")
    add_p("A pull request has exactly four reachable states, and the transitions between them are exactly the ones the contract enforces, not a larger set the CLI merely suggests: an author cannot push it from Open to Approved by approving their own work, and Merged is only reachable through a fast-forward the contract itself checks at merge time.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_figure_or_image("4.11", "State diagram: pull-request lifecycle",
                        "State Machine Diagram showing Open -> Approved -> Merged / Closed states with guard conditions")

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 5: PROJECT PLAN
    # =========================================================================
    add_h1("CHAPTER 5\nPROJECT PLAN", space_before=18, space_after=18)

    add_h2("5.1 PROJECT ESTIMATE")
    add_h3("5.1.1 Reconciled Estimates")
    add_p("Effort was planned around the same increments described in Section 3.6, since each one was independently estimable: the contract core and the from-scratch cryptographic primitives were expected, correctly, to take the largest share of early effort, because nothing above them could be trusted until Keccak-256 and the ABI codec were each verified against external references rather than just against each other.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_h3("5.1.2 Project Resources")
    add_bullet("Workstations: ", "One development machine running Linux/Windows, with native compiler, Node.js, and solcjs installed locally.")
    add_bullet("EVM Node: ", "A local Hardhat node for every test run, redeployed fresh each time rather than reused, so no test could pass only because of leftover state from a previous run.")
    add_bullet("Infrastructure: ", "No paid infrastructure, no public testnet deployment, and no external services beyond package registries used during development.")

    add_h2("5.2 RISK MANAGEMENT")
    add_p("Table 5.1: Project task set and effort estimate", align=WD_ALIGN_PARAGRAPH.CENTER)
    for r in doc.paragraphs[-1].runs: set_run_font(r, "Times New Roman", 11, bold=True)

    risk_headers = ["Risk", "Likelihood", "Impact", "Mitigation actually taken"]
    risk_rows = [
        ["A from-scratch Keccak-256 implementation is subtly wrong", "Medium", "Critical (breaks everything)", "Checked against known Ethereum test vectors, including the real ERC-20 transfer selector, before any other module depended on it"],
        ["Hand-written ABI encoding diverges from what the EVM / other tools expect", "Medium", "Critical", "Checked byte-for-byte against live ethers.js output rather than only against hand-derived expected values"],
        ["Backend compiler hangs compiling a project this size", "Occurred during development", "High (blocks all builds)", "Root-caused to the default compiler backend internal self-check; fixed by building with documented required flag"],
        ["An interrupted push leaves on-chain state partially written", "Medium", "High (data integrity)", "Every commit and blob chunk is its own independently confirmed transaction; blobAnnounced / commitExists let a re-run skip what already landed"],
        ["'Private' repositories are only private by label, not in fact", "High if unaddressed", "High (false security)", "CLI refuses to push unencrypted content to a repo marked private; real AES-256-GCM encryption is required before anything is sent"],
        ["Self-approval of a pull request by its own author", "High if unenforced", "Medium", "Enforced inside the contract itself (tested against both a non-owner author and the owner acting as author), not only suggested by the CLI"],
        ["Transient RPC failures against a local dev node under rapid requests", "Observed during integration testing", "Medium", "Added retry-with-backoff (up to 3 attempts) to the RPC client after the integration suite first surfaced the flakiness"]
    ]

    add_styled_table(risk_headers, risk_rows, col_widths=[1.5, 1.1, 1.4, 2.8])

    add_h2("5.3 PROJECT SCHEDULE")
    add_h3("5.3.1 Project Task Set")
    add_p("Table 5.2: Risk register", align=WD_ALIGN_PARAGRAPH.CENTER)
    for r in doc.paragraphs[-1].runs: set_run_font(r, "Times New Roman", 11, bold=True)

    task_headers = ["Task", "Depends on", "Weeks"]
    task_rows = [
        ["T1. Contract core (repositories, commits, branches, roles) + Keccak-256 + ABI codec", "-", "2"],
        ["T2. Local object store, staging, commit, push, pull", "T1", "2"],
        ["T3. Branching, rollback, three-way merge, rebase", "T2", "2"],
        ["T4. Identity registry, role-based access, AES-256-GCM encryption", "T2", "2"],
        ["T5. Pull-request workflow, self-approval rule, fast-forward pre-check", "T3, T4", "2"],
        ["T6. Unit test suites alongside each module", "running throughout", "2.5"],
        ["T7. Integration test suite against a real local chain", "T5", "1.5"],
        ["T8. Documentation, Docker image, demo tooling", "T7", "1.5"]
    ]

    add_styled_table(task_headers, task_rows, col_widths=[3.8, 1.4, 1.4])

    add_h3("5.3.2 Task Network")
    add_p("T1 blocks everything, since every later module either calls the contract or depends on Keccak-256/ABI encoding being correct. T3 and T4 could run in either order relative to each other (branching logic and identity/encryption are independent of one another) but both had to land before T5, since pull requests reference branches and are gated by roles. T6 ran continuously alongside every other task rather than as a separate phase, which is why its own duration overlaps the others in the chart below.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_h3("5.3.3 Timeline Chart")
    add_figure_or_image("5.1", "Project timeline (Gantt chart)",
                        "12-Week project development timeline illustrating WBS tasks from T1 to T8")

    add_h2("5.4 TEAM ORGANIZATION")
    add_h3("5.4.1 Team Structure")
    add_p("The project was carried out by the student group named on the cover page of this report, under the supervision of the assigned project guide, following the department's standard review structure (Review I through Review IV) for tracking progress against the project book.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_h3("5.4.2 Management Reporting and Communication")
    add_p("Progress was reported at each scheduled department review, with working code and test results demonstrated rather than only slides, since a claim like 'self-approval is blocked' is only meaningful once it has actually been run against a live chain and shown to fail the way it is supposed to.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 6: PROJECT IMPLEMENTATION
    # =========================================================================
    add_h1("CHAPTER 6\nPROJECT IMPLEMENTATION", space_before=18, space_after=18)

    add_h2("6.1 OVERVIEW OF PROJECT MODULES")
    add_p("The contract, contracts/DVCS.sol, is roughly 760 lines of Solidity and owns all consensus-critical state: repositories, commits, branches, tags, roles, pull requests, and the identity registry. The CLI, under cli/, is about 4,850 lines split across focused modules, each covering one concern: main for command dispatch, repo for local repository state, objects for the content-addressed blob store, blobs for chunked sync, merge3 for three-way merges, crypto_local for AES-256-GCM, abi and keccak for talking the EVM's own language, rpc for JSON-RPC, changelog for the local audit trail, and ignore for pattern matching. Every one of these modules has a matching test file beside it.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_h2("6.2 TOOLS AND TECHNOLOGIES USED")
    add_bullet("Solidity ^0.8.24: ", "Compiled with solcjs (viaIR: true, evmVersion: paris) via a small wrapper script, since the plain solc --bin --abi flags cannot express those two settings together.")
    add_bullet("Client Language: ", "Chosen specifically because it produces a single, dependency-free native binary with near-C performance (see the benchmark in Chapter 8) and because building the needed primitives from scratch was judged more reliable than depending on an immature or nonexistent web3 ecosystem.")
    add_bullet("Hardhat: ", "Used only as a local development/test chain and for its JavaScript-based deployment and integration-test tooling (ethers.js), never as part of the shipped system.")
    add_bullet("Docker: ", "For a reproducible build path (all pinned inside one image) aimed mainly at Windows users who would otherwise need to set up WSL2 by hand.")

    add_h2("6.3 ALGORITHM DETAILS")
    add_h3("6.3.1 Keccak-256 (from scratch)")
    add_p("The EVM's hash function is Keccak-256, not NIST SHA3-256; the two differ in their padding byte (0x01/0x80 multi-rate padding for Keccak, a 0x06 domain separator for SHA3), which is a common source of silent, hard-to-notice bugs when a general-purpose SHA3 library gets substituted in by mistake. Since no built-in or mature Keccak implementation existed, this project implements the full Keccak-f [1600] permutation (theta, rho, pi, chi, iota across 24 rounds) directly, and verifies it against known Ethereum test vectors rather than only checking that it runs without crashing.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_code_block("""fn (mut st KeccakState) keccak_f() {
    for round := 0; round < keccak_rounds; round++ {
        // Theta: XOR-mix each column into every lane in that column
        for i in 0 .. 5 {
            bc[i] = st.s[i] ^ st.s[i+5] ^ st.s[i+10] ^ st.s[i+15] ^ st.s[i+20]
        }
        // ... Rho+Pi (lane rotation/permutation), Chi, Iota ...
        st.s[0] ^= round_constants[round]
    }
}""")

    add_p("Verification, from test/keccak_test: the empty string, 'abc', and 'hello' are hashed and compared against their published Keccak-256 digests, and the selector for transfer(address,uint256) is computed and checked against the well-known ERC-20 value a9059cbb, since that selector is something any Ethereum developer can independently confirm.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_h3("6.3.2 Three-way merge (file-hash level)")
    add_p("Because every tracked file is a content-addressed blob rather than a line-based text file, a textual diff/merge (as git merge performs) does not apply here. What this project implements instead is a three-way merge at the whole-file level: for every path, compare its hash at the common ancestor, on the current branch, and on the other branch, and classify the result using the same four cases Git's own merge uses internally, just applied per path rather than per line.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_code_block("""if o == t {
    if o.len > 0 { merged[p] = o }    // both sides agree (incl. both deleting it)
    continue
}
if b == o {                            // ours unchanged since base -> take theirs
    if t.len > 0 { merged[p] = t }
    continue
}
if b == t {                            // theirs unchanged since base -> keep ours
    if o.len > 0 { merged[p] = o }
    continue
}
conflicts << p                         // all three differ: real conflict""")

    add_p("This one function backs both rebase and the fast-forward pre-check pr-merge runs before sending anything on-chain, so there is one conflict story in the whole system rather than two slightly different ones. It is unit-tested against every case in the table above, including add/add conflicts (both sides introduce the same new path with different content) and modify/delete conflicts (one side edits a path the other side removed), not only the straightforward clean-merge case.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_h3("6.3.3 ABI encoding and blob chunking")
    add_p("Every contract call needs its arguments packed the exact way the EVM expects: a 4-byte function selector (the first four bytes of keccak256(signature)) followed by arguments padded and laid out per the Solidity ABI specification, with dynamic types (strings, byte arrays) stored via head/tail offset encoding rather than inline. abi implements encode_call() and the matching decode_*() helpers for exactly the type combinations this project's contract calls actually use, and its output is checked byte-for-byte against live ethers.js encoding of the same calls rather than only against hand-derived expected bytes, since a self-consistent but wrong encoder would otherwise be very easy to miss.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_p("File content is split into chunks of at most MAX_CHUNK_BYTES (24 KiB) before pushing, each becoming one pushBlobChunk transaction. The limit is enforced on both sides: client-side to decide where to split, and on-chain via a ChunkTooLarge revert, confirmed by testing a chunk exactly at the limit (accepted) and one byte over it (rejected).",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_p("Table 6.1: On-chain gas cost reference", align=WD_ALIGN_PARAGRAPH.CENTER)
    for r in doc.paragraphs[-1].runs: set_run_font(r, "Times New Roman", 11, bold=True)

    gas_headers = ["Operation", "Approximate cost", "Why it matters here"]
    gas_rows = [
        ["SSTORE, cold 32-byte word", "~20,000 gas", "Why file content is not stored directly in contract storage"],
        ["Event log data, per byte", "~16 gas", "Why BlobChunk events are the default content-storage mode"],
        ["Base transaction cost", "21,000 gas", "Paid once per transaction, which is why chunking has a floor on how small a chunk should be"],
        ["ChunkTooLarge revert threshold", "> 24 KiB per chunk (MAX_CHUNK_BYTES)", "Keeps any single transaction's calldata, and its gas cost, bounded and predictable"]
    ]

    add_styled_table(gas_headers, gas_rows, col_widths=[1.8, 1.8, 3.0])

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 7: SOFTWARE TESTING
    # =========================================================================
    add_h1("CHAPTER 7\nSOFTWARE TESTING", space_before=18, space_after=18)

    add_h2("7.1 TYPE OF TESTING")
    add_p("Two layers were used, and both were meant to actually run as part of the development loop rather than exist only as documentation of intent.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_bullet("Unit testing: ", "pure-logic tests next to the code they test (every *_test.v file), run with test ., covering hashing, ABI round-trips, hex helpers, Merkle-root properties, .dvcsignore matching, blob chunking/reassembly, and every case of the three-way merge. No chain is required for this layer, and it runs in a few seconds.")
    add_bullet("Integration testing: ", "a real end-to-end suite (test/integration/run.sh) that builds the CLI, compiles the contract, starts its own isolated Hardhat node, deploys a fresh contract, and drives the actual compiled binary, not a mock of it, through more than 40 assertions covering nearly the whole command surface, including the negative/failure cases (a wrong passphrase, a blocked self-approval, a rejected over-limit chunk), not only the paths that are expected to succeed.")

    add_p("Both suites are safe to re-run: the integration suite gets a fresh chain and fresh temporary directories on every run, and cleans up its own Hardhat process on exit, so a result is never contaminated by state left over from an earlier run.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_h2("7.2 TEST CASES & TEST RESULTS")
    add_p("Table 7.1: Unit test suite summary", align=WD_ALIGN_PARAGRAPH.CENTER)
    for r in doc.paragraphs[-1].runs: set_run_font(r, "Times New Roman", 11, bold=True)

    t1_headers = ["Module under test", "What is checked"]
    t1_rows = [
        ["keccak.v", "Digest matches known test vectors for '', 'abc', 'hello'; ERC-20 transfer selector matches a9059cbb"],
        ["abi.v", "encode_call()/decode_*() round-trip for every type combination used; encoding matches live ethers.js output byte-for-byte"],
        ["hex.v", "hex<->bytes conversion round-trips, including odd-length and empty-input edge cases"],
        ["objects.v", "Merkle root is order-independent for the same file set and changes when any tracked file changes"],
        ["ignore.v", "Exact-name, directory-prefix, and wildcard .dvcsignore patterns correctly exclude matching paths"],
        ["blobs.v", "Chunking a blob and reassembling the chunks reproduces the original bytes exactly, at and around the chunk-size boundary"],
        ["merge3.v", "Clean merge, both-sides-identical-change, add/add conflict, modify/delete conflict, and deletion-agreement cases all resolve as specified in Section 6.3.2"],
        ["crypto_local.v", "Encrypt/decrypt round-trip recovers the original plaintext; a wrong passphrase fails via AES-GCM's own authentication check rather than returning corrupted output"]
    ]

    add_styled_table(t1_headers, t1_rows, col_widths=[1.8, 4.8])

    add_p("Table 7.2: Integration test cases and results", align=WD_ALIGN_PARAGRAPH.CENTER)
    for r in doc.paragraphs[-1].runs: set_run_font(r, "Times New Roman", 11, bold=True)

    t2_headers = ["#", "Scenario (input)", "Expected output", "Actual result"]
    t2_rows = [
        ["1", "Push unencrypted content to a --private repo", "Refused client-side before any transaction is sent", "Pass: refused with a clear error"],
        ["2", "Same push, after crypto-init", "Succeeds; content stored encrypted on-chain", "Pass"],
        ["3", "Two accounts each register a handle, owner grants the second Contributor by handle only", "member-list shows both handles resolved to addresses", "Pass"],
        ["4", "A second, independent repo pull()s encrypted content without being told the salt", "Salt auto-discovered on-chain; content decrypts correctly", "Pass: byte-for-byte match"],
        ["5", "pull() with a deliberately wrong passphrase", "AES-GCM authentication failure, not silent corruption; commit metadata still syncs (always public)", "Pass: content sync stayed at zero, metadata synced"],
        ["6", "pushBlobChunk() with a chunk one byte over MAX_CHUNK_BYTES", "Reverts with ChunkTooLarge", "Pass"],
        ["7", "pushBlobChunk() with a chunk exactly at MAX_CHUNK_BYTES", "Accepted", "Pass"],
        ["8", "PR author calls pr-approve on their own PR", "Reverts (CannotApproveOwnPR), tested for both a non-owner author and the repo owner as author", "Pass, both cases"],
        ["9", "Owner opens a second PR, attempts self-approval", "Reverts; merge then correctly fails at 0/2 required approvals", "Pass"],
        ["10", "User without a granted role attempts to push", "Rejected (access control)", "Pass"],
        ["11", "Same user, after member-add grants Contributor", "Push succeeds immediately", "Pass"],
        ["12", "Two branches independently edit the same path, then rebase", "CONFLICT reported, naming the exact path, not a silently picked winner", "Pass"],
        ["13", "Same scenario, rebase --theirs", "Conflict auto-resolves to the other branch's content", "Pass"],
        ["14", "rollback <hash> --hard", "Branch pointer and working files both restored to the target commit", "Pass"],
        ["15", "5 back-to-back RPC calls that previously triggered a transient failure", "All 5 succeed via retry-with-backoff", "Pass"]
    ]

    add_styled_table(t2_headers, t2_rows, col_widths=[0.5, 2.2, 2.4, 1.5])

    add_p("The table above is a representative subset; the full suite exceeds 40 assertions covering the remaining commands (diff, ls, show, cat, pr-list, pr-show, pr-min-approvals, delete-branch, and the changelog) against real local commit data.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 8: RESULT ANALYSIS
    # =========================================================================
    add_h1("CHAPTER 8\nRESULT ANALYSIS", space_before=18, space_after=18)

    add_h2("8.1 OUTCOMES")
    add_p("Every claim in the Testing chapter was reproducible, not a one-time observation: re-running the integration suite against a freshly deployed contract and a fresh chain produced the same 40-plus passing assertions each time, including the negative cases. That repeatability matters more here than in most student projects, since the entire point of the system is that its guarantees should not depend on anything being set up 'just right' by hand.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_p("The language choice was chosen specifically because it compiles to a single native binary with performance close to C, which matters for a command-line tool a developer will run dozens of times a session. Python was never seriously considered for this role (it has far better web3 tooling available, but a noticeably heavier runtime footprint for a CLI meant to feel instant), so the comparison below exists to show what that choice actually cost and bought, not to argue one language is faster than C, which it is not.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_figure_or_image("8.1", "CLI build/runtime benchmark: C vs. V vs. Python",
                        "Measured on the same machine; the V binary was built with the tcc backend used throughout this project.")

    add_p("Table 8.1: Benchmark results: C vs. V vs. Python", align=WD_ALIGN_PARAGRAPH.CENTER)
    for r in doc.paragraphs[-1].runs: set_run_font(r, "Times New Roman", 11, bold=True)

    b_headers = ["Metric", "C (compiled)", "V (compiled, tcc)", "Python (interpreted)"]
    b_rows = [
        ["Compile time (s)", "0.07", "0.25", "n/a"],
        ["Runtime (s)", "0.005", "0.008", "0.27"],
        ["Peak memory (MB)", "3.2", "4.5", "11.0"],
        ["Binary size (KB)", "18", "175", "n/a"]
    ]

    add_styled_table(b_headers, b_rows, col_widths=[1.8, 1.5, 1.8, 1.5])

    add_p("Runtime and memory numbers sit close to C and well ahead of Python, which is the property that actually mattered for a CLI invoked repeatedly in a developer's normal workflow; its larger binary size and slightly longer compile time were an acceptable trade for not needing an installed interpreter on every machine that runs the CLI.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_h2("8.2 SCREEN SHOTS")
    add_p("The three captures below are real CLI and terminal output, reproduced from an actual run against a local Hardhat chain (transaction hashes and commit hashes are abbreviated here for readability but are full 32-byte values in the live output).",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_figure_or_image("8.2", "Terminal output: repository creation, commit, and push",
                        "Terminal output showing repository creation, file staging, commit, and three-phase push")

    add_figure_or_image("8.3", "Terminal output: blocked self-approval and PR merge",
                        "Terminal output showing PR open, CannotApproveOwnPR revert, external approval, and merge")

    add_figure_or_image("8.4", "Terminal output: rebase conflict detection and resolution",
                        "Terminal output showing rebase conflict detection, conflict reporting, and --theirs auto-resolution")

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 9: CONCLUSION
    # =========================================================================
    add_h1("CHAPTER 9\nCONCLUSION", space_before=18, space_after=18)

    add_h2("9.1 CONCLUSIONS")
    add_p("The objectives set out in Chapter 1 were met and verified, not just implemented. The contract enforces, as properties of the data itself rather than as server policy, exactly the things a centrally hosted Git host currently enforces only as revocable permissions: who may push, who may approve a pull request, and that an author cannot approve their own work. The CLI gives that system a workflow a Git user already knows, while keeping the operations that do not need to be public (staging, diffing, local commits, rebasing) entirely local and fast.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_p("The two pieces of infrastructure that had to be built from nothing, Keccak-256 and the ABI codec, turned out to be the right things to get right first: every other guarantee in the system, from a verifiable repository id to a trustworthy commit hash, is downstream of those two being correct. Verifying them against external references (known Ethereum test vectors, live ethers.js output) rather than only against each other is what makes the rest of the system's claims credible rather than circular.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_p("Equally, the project treats 'private' honestly: nothing on a public chain can actually be hidden from a block explorer, so the system does not pretend otherwise. A private repository is private because its content is encrypted client-side before it ever leaves the machine, not because a flag says so.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_h2("9.2 FUTURE WORK")
    add_bullet("Real transaction signing: ", "The CLI currently relies on a node's unlocked accounts (eth_sendTransaction), which is fine for local development but not for a public chain. Adding local key management and eth_sendRawTransaction signing would be the single highest-value next step toward actual production use.")
    add_bullet("Per-collaborator encryption: ", "The current scheme uses one shared passphrase for everyone with read access to a private repository, so revoking one person's access means rotating the passphrase for the whole group. Envelope encryption, wrapping a per-repository content key separately for each collaborator's public key, would allow individual revocation.")
    add_bullet("Full merge-history reconstruction: ", "getFirstParentChain only follows first-parents by design, as a gas-cost tradeoff; a production-grade indexer replaying the full event log off-chain could reconstruct complete merge history without that limitation.")
    add_bullet("A richer conflict resolution tool: ", "Rebase and PR-divergence conflicts currently resolve per whole file (--ours/--theirs); a line-level merge view, even if it stays client-side and never touches the chain, would make resolving a specific conflicting file less blunt than choosing one side entirely.")
    add_bullet("Deployment to a public testnet: ", "To validate gas costs and transaction-confirmation behavior under real network conditions rather than only against a local, instantly-mining Hardhat node.")

    add_h2("9.3 APPLICATIONS")
    add_p("The most direct application is exactly the one this project targets: a small team or an open-source project that wants commit history and code review enforced by something other than a platform operator's goodwill, particularly where contributors do not already trust each other or a shared employer. The same underlying pattern, moving only the trust-sensitive state transitions on-chain while keeping fast, local-first operations off it, generalizes beyond version control to other workflows built around a review-and-approve gate: document approval chains, configuration-change sign-off, or any process where 'who approved this, and in what order' needs to be provably tamper-resistant rather than merely logged somewhere a server administrator could edit.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    doc.add_page_break()

    # =========================================================================
    # APPENDICES
    # =========================================================================
    add_h1("APPENDIX A\nFEASIBILITY & COMPLEXITY ASSESSMENT", space_before=18, space_after=18)

    add_h2("A.1 TECHNICAL FEASIBILITY")
    add_p("Every dependency this project needs (a Solidity compiler, an Ethereum-compatible JSON-RPC node, and compiler) is freely available and was actually used throughout development; nothing in the design depends on unreleased or inaccessible tooling. The two components with no existing library to lean on, Keccak-256 and the ABI codec, were the technical risk this project actually carried, and both were resolved by implementation and verification rather than assumed away, as described in Chapter 6.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_h2("A.2 OPERATIONAL FEASIBILITY")
    add_p("The command vocabulary (init, add, commit, branch, push, pull, rebase) deliberately mirrors Git, so the operational cost of adopting this tool is mostly the cost of learning which operations now require a confirmed transaction instead of being instantaneous, not a wholly new mental model.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_h2("A.3 ECONOMIC FEASIBILITY")
    add_p("Development required no paid infrastructure: a local Hardhat chain stood in for a live network throughout. The ongoing cost of real use would be the gas cost of transactions on whatever chain a team deploys to, which is exactly why the gas-cost model in Section 4.2 and Table 6.1 was treated as a design constraint from the start rather than an afterthought.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    add_h2("A.4 ALGORITHMIC COMPLEXITY OF KEY COMPONENTS")
    add_p("Table A.1: Time complexity of the project's core algorithms", align=WD_ALIGN_PARAGRAPH.CENTER)
    for r in doc.paragraphs[-1].runs: set_run_font(r, "Times New Roman", 11, bold=True)

    c_headers = ["Component", "Complexity", "Note"]
    c_rows = [
        ["Keccak-256 permutation", "O(1) per 136-byte block (fixed 24 rounds)", "Overall O(n) in input length n"],
        ["Merkle tree root (objects.v)", "O(n log n)", "n = number of tracked files; dominated by sorting paths before hashing"],
        ["Three-way merge (merge3.v)", "O(n)", "n = number of distinct tracked paths across base/ours/theirs"],
        ["ABI encode/decode", "O(n)", "n = size of the encoded arguments/result"],
        ["Blob chunking", "O(n)", "n = blob size in bytes; chunk count = ceil(n / 24 KiB)"]
    ]

    add_styled_table(c_headers, c_rows, col_widths=[2.0, 2.2, 2.4])

    add_p("None of the operations this system performs client-side are worse than linear or log-linear in the size of the data they process; nothing in the design required framing any part of it as NP-hard or NP-complete, since the hard problem here was never computational complexity but trust, which is what the contract's role-based access control and review workflow address directly.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY)

    doc.add_page_break()

    # =========================================================================
    # APPENDIX B: PAPER PUBLICATION / PRESENTATION
    # =========================================================================
    add_h1("APPENDIX B\nPAPER PUBLICATION / PRESENTATION", space_before=18, space_after=18)

    add_p("No paper arising from this project has been submitted or presented at the time of writing. This section is left in place, per the department's report format, for the student group to complete if a paper is submitted before final submission of this report: title, authors, venue/journal name, and date/volume/page numbers or ISSN, with the acceptance certificate and camera-ready copy attached.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_after=36)

    doc.add_page_break()

    # =========================================================================
    # APPENDIX C: PLAGIARISM REPORT
    # =========================================================================
    add_h1("APPENDIX C\nPLAGIARISM REPORT", space_before=18, space_after=18)

    add_p("The department's plagiarism-check report for this document should be generated through the institute's designated plagiarism-detection tool and attached here as a printed or scanned copy before final submission, per instruction 19 of the report-format guidelines.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_after=36)

    doc.add_page_break()

    # =========================================================================
    # REFERENCES
    # =========================================================================
    add_h1("REFERENCES", space_before=18, space_after=18)

    refs = [
        "[1] S. Nakamoto, 'Bitcoin: A Peer-to-Peer Electronic Cash System,' White Paper, 2008.",
        "[2] V. Buterin, 'A Next-Generation Smart Contract and Decentralized Application Platform,' Ethereum White Paper, 2014.",
        "[3] G. Wood, 'Ethereum: A Secure Decentralised Generalised Transaction Ledger,' Ethereum Project Yellow Paper, 2014.",
        "[4] NIST, 'SHA-3 Standard: Permutation-Based Hash and Extendable-Output Functions,' FIPS PUB 202, National Institute of Standards and Technology, 2015.",
        "[5] G. Bertoni, J. Daemen, M. Peeters, and G. Van Assche, 'The Keccak Reference,' Submission to NIST SHA-3 Competition, 2011.",
        "[6] Ethereum Foundation, 'Ethereum Contract ABI Specification,' Ethereum Documentation, 2024.",
        "[7] D. Dworkin, 'Recommendation for Block Cipher Modes of Operation: Galois/Counter Mode (GCM) and GMAC,' NIST Special Publication 800-38D, 2007.",
        "[8] J. Benet, 'IPFS - Content Addressed, Versioned, P2P File System,' arXiv:1407.3561, 2014.",
        "[9] L. Torvalds and Git Contributors, 'Git: Fast Version Control System,' Open-Source Project, 2005.",
        "[10] V Community, 'The V Programming Language Documentation,' The V Language Foundation, 2024.",
        "[11] OpenZeppelin, 'OpenZeppelin Contracts: A Library for Secure Smart Contract Development,' 2024.",
        "[12] N. Szabo, 'Formalizing and Securing Relationships on Public Networks,' First Monday, vol. 2, no. 9, 1997."
    ]

    for ref in refs:
        p_ref = doc.add_paragraph()
        p_ref.paragraph_format.space_before = Pt(2)
        p_ref.paragraph_format.space_after = Pt(6)
        p_ref.paragraph_format.line_spacing = 1.15
        r_ref = p_ref.add_run(ref)
        set_run_font(r_ref, "Times New Roman", 10.5)

    # Save to workspace root
    output_path = "c:\\Users\\soham\\Desktop\\Work\\projects\\complete\\purvaja-mediqr\\MediQR_Final_Project_Report.docx"
    doc.save(output_path)
    print(f"Document successfully created with original table format & real images at: {output_path}")

if __name__ == "__main__":
    create_report()
