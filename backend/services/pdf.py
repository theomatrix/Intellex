import os
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib import colors

class PDFService:
    def generate_report(self, data: dict, output_path: str):
        """Generate a professional PDF report from the structured data."""
        doc = SimpleDocTemplate(output_path, pagesize=letter,
                                rightMargin=72, leftMargin=72,
                                topMargin=72, bottomMargin=18)
                                
        styles = getSampleStyleSheet()
        
        # Custom Styles
        title_style = ParagraphStyle(
            name='TitleStyle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#1e3a8a")
        )
        
        heading_style = ParagraphStyle(
            name='HeadingStyle',
            parent=styles['Heading2'],
            fontSize=16,
            spaceBefore=20,
            spaceAfter=10,
            textColor=colors.HexColor("#2563eb"),
            borderPadding=5,
        )
        
        normal_style = styles['Normal']
        normal_style.fontSize = 11
        normal_style.spaceAfter = 10
        
        bullet_style = ParagraphStyle(
            name='BulletStyle',
            parent=normal_style,
            leftIndent=20,
            firstLineIndent=0,
            spaceAfter=5
        )
        
        Story = []
        
        # 1. Cover Page
        company_name = data.get('company_name', 'Company Intelligence Report')
        Story.append(Paragraph(company_name, title_style))
        Story.append(Spacer(1, 2 * 72)) # 2 inches
        
        Story.append(Paragraph(f"<b>Generated:</b> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", normal_style))
        Story.append(PageBreak())
        
        # Helper to add section
        def add_section(title, content):
            Story.append(Paragraph(title, heading_style))
            if isinstance(content, list):
                for item in content:
                    Story.append(Paragraph(f"• {item}", bullet_style))
            else:
                Story.append(Paragraph(str(content) if content else "N/A", normal_style))
        
        # Sections
        add_section("Company Summary", data.get('summary', ''))
        
        details = [
            f"<b>Website:</b> {data.get('website', 'N/A')}",
            f"<b>Phone:</b> {data.get('phone', 'N/A')}",
            f"<b>Address:</b> {data.get('address', 'N/A')}"
        ]
        add_section("Company Details", details)
        
        add_section("Products / Services", data.get('products', []))
        add_section("AI Pain Points", data.get('pain_points', []))
        add_section("Competitors", data.get('competitors', []))
        add_section("Sources", data.get('sources', []))
        
        # Build PDF
        doc.build(Story)
        
        return output_path
