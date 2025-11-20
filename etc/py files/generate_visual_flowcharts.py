#!/usr/bin/env python3
"""
Generate visual flowchart diagrams with boxes for Kannada Learning App
Using reportlab for pure Python flowchart generation (no external executables)
"""

from reportlab.lib.pagesizes import landscape, A4
from reportlab.lib.units import cm, inch
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from datetime import datetime

class FlowchartBox:
    """Represents a box in the flowchart"""
    def __init__(self, x, y, width, height, text, box_type="box", color=colors.lightblue):
        self.x = x
        self.y = y
        self.width = width
        self.height = height
        self.text = text
        self.box_type = box_type  # "box", "diamond", "ellipse", "note"
        self.color = color

def draw_box(c, x, y, width, height, text, box_type="box", color=colors.lightblue):
    """Draw a box/diamond/ellipse on the canvas"""
    c.setFillColor(color)
    c.setStrokeColor(colors.black)
    c.setLineWidth(1.5)
    
    if box_type == "diamond":
        # Draw diamond shape using path
        path = c.beginPath()
        path.moveTo(x + width/2, y + height)  # top
        path.lineTo(x + width, y + height/2)   # right
        path.lineTo(x + width/2, y)             # bottom
        path.lineTo(x, y + height/2)            # left
        path.close()
        c.drawPath(path, fill=1, stroke=1)
    elif box_type == "ellipse":
        # Draw ellipse (start/end)
        c.ellipse(x, y, x + width, y + height, fill=1)
    else:  # box (rectangle)
        c.rect(x, y, width, height, fill=1, stroke=1)
    
    # Add text
    c.setFillColor(colors.black)
    c.setFont("Helvetica", 8)
    
    text_x = x + width / 2
    text_y = y + height / 2
    
    # Split text into lines
    lines = text.split('\n')
    line_height = 10
    start_y = text_y + (len(lines) - 1) * line_height / 2
    
    for i, line in enumerate(lines):
        y_pos = start_y - i * line_height
        c.drawCentredString(text_x, y_pos, line)

def draw_arrow(c, x1, y1, x2, y2, label=""):
    """Draw an arrow between two points"""
    c.setStrokeColor(colors.black)
    c.setLineWidth(1.5)
    c.line(x1, y1, x2, y2)
    
    # Draw simple arrowhead
    import math
    angle = math.atan2(y2 - y1, x2 - x1)
    arrow_size = 0.25
    
    # Points for triangle arrowhead
    p1_x = x2 - arrow_size * math.cos(angle - math.pi/6)
    p1_y = y2 - arrow_size * math.sin(angle - math.pi/6)
    p2_x = x2 - arrow_size * math.cos(angle + math.pi/6)
    p2_y = y2 - arrow_size * math.sin(angle + math.pi/6)
    
    # Draw arrowhead as a filled path
    path = c.beginPath()
    path.moveTo(x2, y2)
    path.lineTo(p1_x, p1_y)
    path.lineTo(p2_x, p2_y)
    path.close()
    c.setFillColor(colors.black)
    c.drawPath(path, fill=1, stroke=0)
    
    # Add label if provided
    if label:
        mid_x = (x1 + x2) / 2
        mid_y = (y1 + y2) / 2
        c.setFillColor(colors.red)
        c.setFont("Helvetica", 7)
        c.drawString(mid_x + 0.2, mid_y + 0.1, label)

def create_student_flowchart():
    """Create Student Flow flowchart"""
    from reportlab.lib.pagesizes import landscape, letter
    
    width, height = landscape(A4)
    filename = 'd:\\VS\\Learn\\kannada-learning-app\\STUDENT_FLOWCHART_VISUAL.pdf'
    c = canvas.Canvas(filename, pagesize=(width, height))
    
    # Title
    c.setFont("Helvetica-Bold", 16)
    c.drawString(1*cm, height - 1*cm, "Student Flowchart - Quiz System Flow")
    c.setFont("Helvetica", 9)
    c.drawString(1*cm, height - 1.5*cm, f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Y position tracker (top to bottom)
    y = height - 2.5*cm
    
    # START
    draw_box(c, 4*cm, y, 2*cm, 0.6*cm, "START\nPage Load", "ellipse", colors.lightgreen)
    arrow_y1 = y
    y -= 1.2*cm
    
    # Load Progress
    draw_arrow(c, 5*cm, arrow_y1, 5*cm, y + 0.6*cm)
    draw_box(c, 3.5*cm, y, 3*cm, 0.8*cm, "Load Progress\nfrom localStorage", "box", colors.lightblue)
    arrow_y1 = y
    y -= 1.2*cm
    
    # Sync Server
    draw_arrow(c, 5*cm, arrow_y1, 5*cm, y + 0.8*cm)
    draw_box(c, 3.5*cm, y, 3*cm, 0.8*cm, "Sync Progress\nfrom Server", "box", colors.lightcyan)
    arrow_y1 = y
    y -= 1.2*cm
    
    # Display Chapters
    draw_arrow(c, 5*cm, arrow_y1, 5*cm, y + 0.8*cm)
    draw_box(c, 3.5*cm, y, 3*cm, 0.8*cm, "Display Chapters\nwith Progress Bars", "box", colors.lightyellow)
    arrow_y1 = y
    y -= 1.5*cm
    
    # Decision: Read or Quiz?
    draw_arrow(c, 5*cm, arrow_y1, 5*cm, y + 0.5*cm)
    draw_box(c, 4*cm, y - 0.5*cm, 2*cm, 1*cm, "User Action?", "diamond", colors.yellow)
    
    # LEFT PATH - READ
    draw_arrow(c, 4*cm, y, 2*cm, y - 1.5*cm, "Read")
    draw_box(c, 0.8*cm, y - 2.5*cm, 2.5*cm, 0.8*cm, "Open Chapter\nModal", "box", colors.lightcyan)
    draw_arrow(c, 2*cm, y - 2.5*cm, 2*cm, y - 3.6*cm)
    draw_box(c, 0.8*cm, y - 4.6*cm, 2.5*cm, 0.8*cm, "Mark as Read\nhasRead = true", "box", colors.lightgreen)
    draw_arrow(c, 2*cm, y - 4.6*cm, 2*cm, y - 5.7*cm)
    draw_box(c, 0.5*cm, y - 6.7*cm, 3*cm, 0.8*cm, "Save to Server\nPUT /api/auth/user", "box", colors.lightyellow)
    
    # RIGHT PATH - QUIZ
    y_quiz = y - 1.5*cm
    draw_arrow(c, 6*cm, y, 8*cm, y_quiz, "Quiz")
    draw_box(c, 7.5*cm, y_quiz - 0.5*cm, 1.5*cm, 1*cm, "Check:\nhasRead?", "diamond", colors.lightsalmon)
    
    # NO - Show locked
    draw_arrow(c, 8.25*cm, y_quiz - 0.5*cm, 9.5*cm, y_quiz - 1.5*cm, "NO")
    draw_box(c, 9*cm, y_quiz - 2.5*cm, 2*cm, 0.8*cm, "LOCKED:\nRead First", "box", colors.salmon)
    
    # YES - Check passed
    draw_arrow(c, 7.5*cm, y_quiz - 0.5*cm, 6*cm, y_quiz - 1.5*cm, "YES")
    draw_box(c, 5.25*cm, y_quiz - 2.3*cm, 1.5*cm, 1*cm, "Check:\nPassed?", "diamond", colors.gold)
    
    # Already passed - show locked
    draw_arrow(c, 6*cm, y_quiz - 2.3*cm, 3.5*cm, y_quiz - 3.3*cm, "YES")
    draw_box(c, 2.5*cm, y_quiz - 4.3*cm, 2.5*cm, 0.8*cm, "LOCKED:\nAlready Passed", "box", colors.salmon)
    
    # NO - Check failed attempts
    draw_arrow(c, 5.25*cm, y_quiz - 2.3*cm, 5.25*cm, y_quiz - 3.3*cm, "NO")
    draw_box(c, 4.25*cm, y_quiz - 4.1*cm, 2*cm, 1*cm, "Failed\n2 times?", "diamond", colors.orange)
    
    # Failed 2x - locked
    draw_arrow(c, 6.25*cm, y_quiz - 3.6*cm, 7.5*cm, y_quiz - 4.3*cm, "YES")
    draw_box(c, 7*cm, y_quiz - 5.3*cm, 2*cm, 0.8*cm, "LOCKED:\nFailed Limit", "box", colors.salmon)
    
    # Can take quiz
    draw_arrow(c, 5.25*cm, y_quiz - 4.1*cm, 5.25*cm, y_quiz - 5.1*cm, "NO")
    draw_box(c, 4.25*cm, y_quiz - 6*cm, 2*cm, 0.8*cm, "Load Quiz\nQuestions", "box", colors.lightgreen)
    draw_arrow(c, 5.25*cm, y_quiz - 6*cm, 5.25*cm, y_quiz - 7*cm)
    draw_box(c, 4*cm, y_quiz - 7.9*cm, 2.5*cm, 0.8*cm, "Answer Questions\nSelect Options", "box", colors.lightcyan)
    draw_arrow(c, 5.25*cm, y_quiz - 7.9*cm, 5.25*cm, y_quiz - 8.9*cm)
    draw_box(c, 4.25*cm, y_quiz - 9.8*cm, 2*cm, 0.8*cm, "Submit Quiz", "box", colors.lightyellow)
    draw_arrow(c, 5.25*cm, y_quiz - 9.8*cm, 5.25*cm, y_quiz - 10.8*cm)
    draw_box(c, 3.5*cm, y_quiz - 11.7*cm, 3.5*cm, 0.8*cm, "Save Result & Update Progress", "box", colors.lightcyan)
    draw_arrow(c, 5.25*cm, y_quiz - 11.7*cm, 5.25*cm, y_quiz - 12.7*cm)
    draw_box(c, 4*cm, y_quiz - 13.6*cm, 2.5*cm, 0.8*cm, "Show Results", "box", colors.lightpink)
    draw_arrow(c, 5.25*cm, y_quiz - 13.6*cm, 5.25*cm, y_quiz - 14.6*cm)
    draw_box(c, 4.5*cm, y_quiz - 15.5*cm, 1.5*cm, 0.6*cm, "END", "ellipse", colors.lightgreen)
    
    # Legend
    c.setFont("Helvetica-Bold", 9)
    c.drawString(0.5*cm, 0.8*cm, "Legend:")
    draw_box(c, 0.5*cm, 0.2*cm, 0.5*cm, 0.4*cm, "", "ellipse", colors.lightgreen)
    c.drawString(1.2*cm, 0.3*cm, "Start/End")
    
    draw_box(c, 2.2*cm, 0.2*cm, 0.5*cm, 0.4*cm, "", "box", colors.lightblue)
    c.drawString(2.9*cm, 0.3*cm, "Process")
    
    draw_box(c, 4*cm, 0.1*cm, 0.6*cm, 0.6*cm, "", "diamond", colors.yellow)
    c.drawString(4.8*cm, 0.3*cm, "Decision")
    
    draw_box(c, 6*cm, 0.2*cm, 0.5*cm, 0.4*cm, "", "box", colors.salmon)
    c.drawString(6.7*cm, 0.3*cm, "Locked/Stop")
    
    c.save()
    print(f"✅ STUDENT_FLOWCHART_VISUAL.pdf created")

def create_admin_flowchart():
    """Create Admin Flow flowchart"""
    width, height = landscape(A4)
    filename = 'd:\\VS\\Learn\\kannada-learning-app\\ADMIN_FLOWCHART_VISUAL.pdf'
    c = canvas.Canvas(filename, pagesize=(width, height))
    
    # Title
    c.setFont("Helvetica-Bold", 16)
    c.drawString(1*cm, height - 1*cm, "Admin Flowchart - Management Operations")
    c.setFont("Helvetica", 9)
    c.drawString(1*cm, height - 1.5*cm, f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    y = height - 2.5*cm
    
    # START
    draw_box(c, 4*cm, y, 2*cm, 0.6*cm, "ADMIN LOGIN", "ellipse", colors.lightgreen)
    y -= 1.2*cm
    
    # Dashboard
    draw_arrow(c, 5*cm, y + 1.2*cm, 5*cm, y + 0.6*cm)
    draw_box(c, 3.5*cm, y, 3*cm, 0.8*cm, "Admin Dashboard", "box", colors.lightblue)
    y -= 1.2*cm
    
    # Main Choice
    draw_arrow(c, 5*cm, y + 1.2*cm, 5*cm, y + 0.5*cm)
    draw_box(c, 3.5*cm, y - 0.5*cm, 3*cm, 1*cm, "Select Action", "diamond", colors.yellow)
    
    # Left branch - Content
    draw_arrow(c, 3.5*cm, y, 1.5*cm, y - 1.2*cm, "1. Content")
    draw_box(c, 0.3*cm, y - 2.2*cm, 2.5*cm, 0.8*cm, "Create/Edit/Delete\nChapters", "box", colors.lightcyan)
    draw_arrow(c, 1.5*cm, y - 2.2*cm, 1.5*cm, y - 3.3*cm)
    draw_box(c, 0.3*cm, y - 4.3*cm, 2.5*cm, 0.8*cm, "Save to Backend\n/api/chapters", "box", colors.lightyellow)
    draw_arrow(c, 1.5*cm, y - 4.3*cm, 1.5*cm, y - 5.4*cm)
    draw_box(c, 0.3*cm, y - 6.4*cm, 2.5*cm, 0.6*cm, "Refresh", "box", colors.lightgreen)
    
    # Middle branch - Quizzes
    draw_arrow(c, 5*cm, y - 0.5*cm, 5*cm, y - 1.2*cm, "2. Quizzes")
    draw_box(c, 3.5*cm, y - 2.2*cm, 3*cm, 0.8*cm, "Create/Edit/Delete\nQuiz Questions", "box", colors.lightcyan)
    draw_arrow(c, 5*cm, y - 2.2*cm, 5*cm, y - 3.3*cm)
    draw_box(c, 3.5*cm, y - 4.3*cm, 3*cm, 0.8*cm, "Save to Backend\n/api/quizzes", "box", colors.lightyellow)
    draw_arrow(c, 5*cm, y - 4.3*cm, 5*cm, y - 5.4*cm)
    draw_box(c, 3.5*cm, y - 6.4*cm, 3*cm, 0.6*cm, "Refresh", "box", colors.lightgreen)
    
    # Right branch - Results
    draw_arrow(c, 6.5*cm, y, 8.5*cm, y - 1.2*cm, "3. Results")
    draw_box(c, 7.5*cm, y - 2.2*cm, 2.5*cm, 0.8*cm, "View/Filter\nResults", "box", colors.lightcyan)
    draw_arrow(c, 8.75*cm, y - 2.2*cm, 8.75*cm, y - 3.3*cm)
    draw_box(c, 7.75*cm, y - 4.3*cm, 2*cm, 0.8*cm, "Download PDF or\nReset Student", "diamond", colors.gold)
    draw_arrow(c, 8.75*cm, y - 4.3*cm, 8.75*cm, y - 5.4*cm)
    draw_box(c, 7.75*cm, y - 6.4*cm, 2*cm, 0.8*cm, "API Call\n(PDF/Reset)", "box", colors.lightyellow)
    draw_arrow(c, 8.75*cm, y - 6.4*cm, 8.75*cm, y - 7.5*cm)
    draw_box(c, 7.75*cm, y - 8.5*cm, 2*cm, 0.6*cm, "Update DB", "box", colors.lightgreen)
    
    # Far right - Students
    draw_arrow(c, 6.5*cm, y - 0.5*cm, 11*cm, y - 1.2*cm, "4. Students")
    draw_box(c, 10.25*cm, y - 2.2*cm, 1.5*cm, 0.8*cm, "Load Students\nList", "box", colors.lightcyan)
    draw_arrow(c, 11*cm, y - 2.2*cm, 11*cm, y - 3.3*cm)
    draw_box(c, 10.25*cm, y - 4.3*cm, 1.5*cm, 0.8*cm, "Search/Filter\nby Name", "box", colors.lightyellow)
    draw_arrow(c, 11*cm, y - 4.3*cm, 11*cm, y - 5.4*cm)
    draw_box(c, 10*cm, y - 6.4*cm, 2*cm, 0.8*cm, "View Progress\nDetails", "box", colors.lightgreen)
    
    # All routes back to dashboard
    draw_arrow(c, 1.5*cm, y - 6.4*cm, 1.5*cm, y - 7.5*cm)
    draw_arrow(c, 1.5*cm, y - 7.5*cm, 5*cm, y - 7.5*cm)
    
    draw_arrow(c, 5*cm, y - 6.4*cm, 5*cm, y - 7.5*cm)
    
    draw_arrow(c, 8.75*cm, y - 8.5*cm, 8.75*cm, y - 9*cm)
    draw_arrow(c, 8.75*cm, y - 9*cm, 5*cm, y - 9*cm)
    
    draw_arrow(c, 11*cm, y - 6.4*cm, 11*cm, y - 9*cm)
    draw_arrow(c, 11*cm, y - 9*cm, 5*cm, y - 9*cm)
    
    # Back to dashboard
    draw_arrow(c, 5*cm, y - 7.5*cm, 5*cm, y + 0.5*cm, "Continue")
    
    # Logout
    draw_arrow(c, 6.5*cm, y - 0.5*cm, 13*cm, y - 1.5*cm, "Logout")
    draw_box(c, 12*cm, y - 2.5*cm, 1.5*cm, 0.6*cm, "END", "ellipse", colors.salmon)
    
    c.save()
    print(f"✅ ADMIN_FLOWCHART_VISUAL.pdf created")

def create_complete_system_flowchart():
    """Create Complete System flowchart"""
    width, height = landscape(A4)
    filename = 'd:\\VS\\Learn\\kannada-learning-app\\COMPLETE_SYSTEM_FLOWCHART_VISUAL.pdf'
    c = canvas.Canvas(filename, pagesize=(width, height))
    
    # Title
    c.setFont("Helvetica-Bold", 16)
    c.drawString(1*cm, height - 1*cm, "Complete System Architecture - Student & Admin Flows")
    c.setFont("Helvetica", 9)
    c.drawString(1*cm, height - 1.5*cm, f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Column headers
    y_header = height - 2*cm
    col_width = 2.5*cm
    
    c.setFont("Helvetica-Bold", 10)
    c.drawString(1.5*cm, y_header, "STUDENT")
    c.drawString(4.5*cm, y_header, "FRONTEND API")
    c.drawString(7.5*cm, y_header, "BACKEND API")
    c.drawString(10.5*cm, y_header, "DATABASE")
    c.drawString(13.5*cm, y_header, "ADMIN")
    
    # Draw vertical section lines
    c.setLineWidth(0.5)
    c.setStrokeColor(colors.grey)
    for x in [4*cm, 7*cm, 10*cm, 13*cm]:
        c.line(x, 1*cm, x, height - 2.5*cm)
    
    y = height - 2.8*cm
    
    # STUDENT Column
    draw_box(c, 0.5*cm, y, 2*cm, 0.6*cm, "Login", "box", colors.lightgreen)
    y -= 1*cm
    draw_box(c, 0.5*cm, y, 2*cm, 0.6*cm, "View Chapters", "box", colors.lightblue)
    y -= 0.8*cm
    draw_arrow(c, 1.5*cm, y + 0.8*cm, 1.5*cm, y + 0.2*cm)
    draw_box(c, 0.2*cm, y, 2.6*cm, 0.6*cm, "Read/Take Quiz", "diamond", colors.yellow)
    y -= 1*cm
    draw_arrow(c, 1.5*cm, y + 1*cm, 1.5*cm, y + 0.3*cm)
    draw_box(c, 0.5*cm, y, 2*cm, 0.6*cm, "Submit Answers", "box", colors.lightcyan)
    y -= 1*cm
    draw_box(c, 0.5*cm, y, 2*cm, 0.6*cm, "View Results", "box", colors.lightpink)
    
    # FRONTEND API Column
    y = height - 2.8*cm
    draw_box(c, 4.1*cm, y, 2*cm, 0.6*cm, "POST /login", "box", colors.lightyellow)
    y -= 1*cm
    draw_box(c, 4.1*cm, y, 2*cm, 0.6*cm, "GET /chapters", "box", colors.lightyellow)
    y -= 0.8*cm
    draw_arrow(c, 5.1*cm, y + 0.8*cm, 5.1*cm, y + 0.2*cm)
    draw_box(c, 3.8*cm, y, 2.6*cm, 0.6*cm, "PUT /user/progress", "box", colors.lightyellow)
    y -= 1*cm
    draw_arrow(c, 5.1*cm, y + 1*cm, 5.1*cm, y + 0.3*cm)
    draw_box(c, 4.1*cm, y, 2*cm, 0.6*cm, "POST /submit-quiz", "box", colors.lightyellow)
    y -= 1*cm
    draw_box(c, 4.1*cm, y, 2*cm, 0.6*cm, "GET /results", "box", colors.lightyellow)
    
    # BACKEND API Column
    y = height - 2.8*cm
    draw_box(c, 7.1*cm, y, 2*cm, 0.6*cm, "Auth Logic", "box", colors.lightcyan)
    y -= 1*cm
    draw_box(c, 7.1*cm, y, 2*cm, 0.6*cm, "Load Chapters", "box", colors.lightcyan)
    y -= 0.8*cm
    draw_arrow(c, 8.1*cm, y + 0.8*cm, 8.1*cm, y + 0.2*cm)
    draw_box(c, 6.8*cm, y, 2.6*cm, 0.6*cm, "Update User Profile", "box", colors.lightcyan)
    y -= 1*cm
    draw_arrow(c, 8.1*cm, y + 1*cm, 8.1*cm, y + 0.3*cm)
    draw_box(c, 7.1*cm, y, 2*cm, 0.6*cm, "Score Answers", "box", colors.lightcyan)
    y -= 1*cm
    draw_box(c, 7.1*cm, y, 2*cm, 0.6*cm, "Fetch Results", "box", colors.lightcyan)
    
    # DATABASE Column
    y = height - 2.8*cm
    draw_box(c, 10.1*cm, y, 2*cm, 0.6*cm, "users.json", "box", colors.gold)
    y -= 1*cm
    draw_box(c, 10.1*cm, y, 2*cm, 0.6*cm, "chapters.json", "box", colors.gold)
    y -= 0.8*cm
    draw_arrow(c, 11.1*cm, y + 0.8*cm, 11.1*cm, y + 0.2*cm)
    draw_box(c, 10.1*cm, y, 2*cm, 0.6*cm, "users.json\n(update)", "box", colors.gold)
    y -= 1*cm
    draw_arrow(c, 11.1*cm, y + 1*cm, 11.1*cm, y + 0.3*cm)
    draw_box(c, 10.1*cm, y, 2*cm, 0.6*cm, "results.json", "box", colors.gold)
    y -= 1*cm
    draw_box(c, 10.1*cm, y, 2*cm, 0.6*cm, "results.json\n(query)", "box", colors.gold)
    
    # ADMIN Column
    y = height - 2.8*cm
    draw_box(c, 13.1*cm, y, 2*cm, 0.6*cm, "Manage\nChapters", "box", colors.lightpink)
    y -= 1*cm
    draw_box(c, 13.1*cm, y, 2*cm, 0.6*cm, "View\nResults", "box", colors.lightpink)
    y -= 0.8*cm
    draw_arrow(c, 14.1*cm, y + 0.8*cm, 14.1*cm, y + 0.2*cm)
    draw_box(c, 12.8*cm, y, 2.6*cm, 0.6*cm, "Reset Progress", "diamond", colors.lightsalmon)
    y -= 1*cm
    draw_arrow(c, 14.1*cm, y + 1*cm, 14.1*cm, y + 0.3*cm)
    draw_box(c, 13.1*cm, y, 2*cm, 0.6*cm, "Generate PDF", "box", colors.lightpink)
    y -= 1*cm
    draw_box(c, 13.1*cm, y, 2*cm, 0.6*cm, "Manage\nStudents", "box", colors.lightpink)
    
    # Data flow arrows between columns
    for arr_y in [height - 2.8*cm, height - 3.8*cm, height - 4.6*cm, height - 5.6*cm, height - 6.6*cm]:
        draw_arrow(c, 2.6*cm, arr_y + 0.3*cm, 4*cm, arr_y + 0.3*cm)
        draw_arrow(c, 6.1*cm, arr_y + 0.3*cm, 7*cm, arr_y + 0.3*cm)
        draw_arrow(c, 9.1*cm, arr_y + 0.3*cm, 10*cm, arr_y + 0.3*cm)
    
    c.save()
    print(f"✅ COMPLETE_SYSTEM_FLOWCHART_VISUAL.pdf created")

if __name__ == "__main__":
    print("🚀 Generating Visual Flowchart PDFs with Boxes...\n")
    
    try:
        create_student_flowchart()
        create_admin_flowchart()
        create_complete_system_flowchart()
        
        print("\n✅ All three visual flowchart PDFs generated successfully!")
        print("\n📁 Output Files in: d:\\VS\\Learn\\kannada-learning-app\\")
        print("   1. STUDENT_FLOWCHART_VISUAL.pdf - Student journey with decision flow")
        print("   2. ADMIN_FLOWCHART_VISUAL.pdf - Admin management workflows")
        print("   3. COMPLETE_SYSTEM_FLOWCHART_VISUAL.pdf - Integrated system architecture")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
