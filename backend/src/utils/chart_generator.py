import sys
import json
import os
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import Paragraph
from hd_data import (GATE_DESCRIPTIONS, CENTER_DESCRIPTIONS, 
                     TYPE_DESCRIPTIONS, AUTHORITY_DESCRIPTIONS,
                     PROFILE_DESCRIPTIONS, DEFINITION_DESCRIPTIONS)

def draw_astro_section(c, width, height, astro_data):
    # Draw astrological section header
    c.setFont("Helvetica-Bold", 16)
    c.drawString(1*inch, height - 7*inch, "Astrological Placements")
    
    # Draw planetary positions
    c.setFont("Helvetica-Bold", 12)
    y_pos = height - 7.5*inch
    
    for planet, data in astro_data['planets'].items():
        c.setFont("Helvetica-Bold", 12)
        c.drawString(1*inch, y_pos, f"{planet}:")
        c.setFont("Helvetica", 12)
        c.drawString(2*inch, y_pos, f"{data['sign']} {data['degrees']}°")
        y_pos -= 0.25*inch
    
    # Draw aspects
    c.setFont("Helvetica-Bold", 12)
    y_pos -= 0.25*inch
    c.drawString(1*inch, y_pos, "Major Aspects:")
    y_pos -= 0.25*inch
    
    c.setFont("Helvetica", 10)
    for aspect in astro_data['aspects']:
        aspect_text = f"{aspect['bodies'][0]} {aspect['aspect']} {aspect['bodies'][1]}"
        c.drawString(1.2*inch, y_pos, aspect_text)
        y_pos -= 0.2*inch
        if y_pos < 1*inch:  # Prevent overflow
            break
    
    # Draw moon phase
    y_pos -= 0.25*inch
    c.setFont("Helvetica-Bold", 12)
    c.drawString(1*inch, y_pos, "Moon Phase:")
    c.setFont("Helvetica", 12)
    c.drawString(2*inch, y_pos, f"{astro_data['moonPhase']['phase']} ({astro_data['moonPhase']['percentage']}%)")

def draw_gate_descriptions(c, width, height, gates):
    # Draw gate descriptions header
    c.setFont("Helvetica-Bold", 16)
    c.drawString(width/2 + 0.5*inch, height - 7*inch, "Active Gates & Their Meanings")
    
    # Create a style for the paragraphs
    styles = getSampleStyleSheet()
    gate_style = ParagraphStyle(
        'GateStyle',
        parent=styles['Normal'],
        fontSize=9,
        leading=11
    )
    
    # Draw gate descriptions in two columns
    gates_sorted = sorted(gates)
    col_height = (len(gates_sorted) + 1) // 2
    
    y_pos = height - 7.5*inch
    x_pos = width/2 + 0.5*inch
    
    for i, gate in enumerate(gates_sorted):
        if i == col_height:
            y_pos = height - 7.5*inch
            x_pos = width/2 + 3.5*inch
            
        description = GATE_DESCRIPTIONS.get(gate, f"Gate {gate}")
        text = f"<b>Gate {gate}:</b> {description}"
        p = Paragraph(text, gate_style)
        p.wrapOn(c, 2.5*inch, 0.5*inch)
        p.drawOn(c, x_pos, y_pos)
        y_pos -= 0.25*inch

def generate_hd_chart(hd_data, astro_data, user_name, output_path):
    try:
        # Create a new PDF with ReportLab (landscape for more space)
        c = canvas.Canvas(output_path, pagesize=landscape(letter))
        width, height = landscape(letter)
        
        # Set up the document
        c.setTitle(f"Human Design Chart - {user_name}")
        
        # Draw the header
        c.setFont("Helvetica-Bold", 24)
        c.drawCentredString(width/2, height - 1*inch, "Human Design & Astrology Chart")
        
        c.setFont("Helvetica", 16)
        c.drawCentredString(width/2, height - 1.5*inch, f"for {user_name}")
        
        # Draw basic info with descriptions
        y_pos = height - 2.5*inch
        
        # Type info
        c.setFont("Helvetica-Bold", 14)
        c.drawString(1*inch, y_pos, "Type:")
        c.setFont("Helvetica", 14)
        c.drawString(2.5*inch, y_pos, hd_data['type'])
        c.setFont("Helvetica", 10)
        c.drawString(2.5*inch, y_pos - 0.2*inch, TYPE_DESCRIPTIONS.get(hd_data['type'], ""))
        
        # Authority info
        y_pos -= 0.5*inch
        c.setFont("Helvetica-Bold", 14)
        c.drawString(1*inch, y_pos, "Authority:")
        c.setFont("Helvetica", 14)
        c.drawString(2.5*inch, y_pos, hd_data['authority'])
        c.setFont("Helvetica", 10)
        c.drawString(2.5*inch, y_pos - 0.2*inch, AUTHORITY_DESCRIPTIONS.get(hd_data['authority'], ""))
        
        # Profile info
        y_pos -= 0.5*inch
        c.setFont("Helvetica-Bold", 14)
        c.drawString(1*inch, y_pos, "Profile:")
        c.setFont("Helvetica", 14)
        c.drawString(2.5*inch, y_pos, hd_data['profile'])
        c.setFont("Helvetica", 10)
        c.drawString(2.5*inch, y_pos - 0.2*inch, PROFILE_DESCRIPTIONS.get(hd_data['profile'], ""))
        
        # Definition info
        y_pos -= 0.5*inch
        c.setFont("Helvetica-Bold", 14)
        c.drawString(1*inch, y_pos, "Definition:")
        c.setFont("Helvetica", 14)
        c.drawString(2.5*inch, y_pos, hd_data['definition'])
        c.setFont("Helvetica", 10)
        c.drawString(2.5*inch, y_pos - 0.2*inch, DEFINITION_DESCRIPTIONS.get(hd_data['definition'], ""))
        
        # Draw activated centers with descriptions
        y_pos = height - 5*inch
        c.setFont("Helvetica-Bold", 14)
        c.drawString(1*inch, y_pos, "Activated Centers:")
        
        y_pos -= 0.3*inch
        c.setFont("Helvetica", 12)
        for center in hd_data['centers']:
            c.drawString(1.5*inch, y_pos, f"• {center}")
            c.setFont("Helvetica", 10)
            c.drawString(1.7*inch, y_pos - 0.15*inch, CENTER_DESCRIPTIONS.get(center, ""))
            y_pos -= 0.4*inch
            c.setFont("Helvetica", 12)
        
        # Draw body graph
        c.setFont("Helvetica-Bold", 16)
        c.drawCentredString(width/2, 6*inch, "Body Graph")
        
        # Center positions (adjusted for landscape)
        center_positions = {
            'Head': (width/2, 5*inch),
            'Ajna': (width/2, 4.5*inch),
            'Throat': (width/2, 4*inch),
            'G': (width/2 - 0.7*inch, 3.5*inch),
            'Heart': (width/2 + 0.7*inch, 3.5*inch),
            'Solar Plexus': (width/2, 3*inch),
            'Spleen': (width/2 - 0.7*inch, 2.5*inch),
            'Sacral': (width/2, 2.5*inch),
            'Root': (width/2, 2*inch)
        }
        
        # Draw centers
        for center, pos in center_positions.items():
            if center in hd_data['centers']:
                c.setFillColorRGB(0.8, 0.3, 0.8)  # Purple
            else:
                c.setFillColorRGB(0.8, 0.8, 0.8)  # Light gray
                
            c.circle(pos[0], pos[1], 0.2*inch, fill=1)
            c.setFillColorRGB(0, 0, 0)  # Reset to black
            c.setFont("Helvetica", 8)
            c.drawCentredString(pos[0], pos[1] - 0.1*inch, center)
        
        # Draw astrological section
        draw_astro_section(c, width, height, astro_data)
        
        # Draw gate descriptions
        draw_gate_descriptions(c, width, height, hd_data['gates'])
        
        # Add a footer
        c.setFont("Helvetica", 10)
        c.drawCentredString(width/2, 0.25*inch, 
                          "This is a simplified representation for educational purposes only.")
        
        c.save()
        return {'success': True, 'path': output_path}
        
    except Exception as e:
        error_msg = str(e)
        print(f"Error generating chart: {error_msg}", file=sys.stderr)
        return {'success': False, 'error': error_msg}

if __name__ == "__main__":
    if len(sys.argv) != 5:
        result = {'success': False, 'error': 'Incorrect arguments. Required: hd_data_json astro_data_json user_name output_path'}
        print(json.dumps(result))
        sys.exit(1)
    
    try:
        hd_data = json.loads(sys.argv[1])
        astro_data = json.loads(sys.argv[2])
        user_name = sys.argv[3]
        output_path = sys.argv[4]
        
        # Ensure output directory exists
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        result = generate_hd_chart(hd_data, astro_data, user_name, output_path)
        print(json.dumps(result))
        sys.exit(0 if result['success'] else 1)
        
    except json.JSONDecodeError as e:
        result = {'success': False, 'error': f'Invalid JSON data: {str(e)}'}
        print(json.dumps(result))
        sys.exit(1)
    except Exception as e:
        result = {'success': False, 'error': f'Unexpected error: {str(e)}'}
        print(json.dumps(result))
        sys.exit(1) 