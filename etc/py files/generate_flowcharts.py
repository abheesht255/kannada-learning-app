#!/usr/bin/env python3
"""
Generate three detailed flowchart PDFs for Kannada Learning App
Using simple PDF drawing approach
"""

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.colors import HexColor, black, white
from reportlab.lib.units import inch

def create_student_flowchart():
    """Create Student Flow Flowchart PDF"""
    pdf_path = "d:\\VS\\Learn\\kannada-learning-app\\STUDENT_FLOWCHART.pdf"
    c = canvas.Canvas(pdf_path, pagesize=landscape(A4))
    width, height = landscape(A4)
    
    c.setFont("Helvetica-Bold", 20)
    c.drawString(width/2 - 200, height - 40, "📚 STUDENT FLOW - Kannada Learning App")
    
    # Page 1
    y = height - 100
    c.setFont("Helvetica-Bold", 14)
    
    c.drawString(50, y, "Page Load Functions:")
    y -= 30
    c.setFont("Helvetica", 11)
    functions = [
        "• DOMContentLoaded() → loadStudentProgress(), syncProgressFromServer(), displayUserInfo()",
        "• loadStudentProgress() → Load from localStorage",
        "• syncProgressFromServer() → GET /api/auth/user/:id",
        "• displayUserInfo() → Show welcome message + logout",
        "• displayStudentStats() → Show total/completed/in-progress chapters",
    ]
    for func in functions:
        c.drawString(70, y, func)
        y -= 20
    
    y -= 10
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, "Chapter Reading Functions:")
    y -= 30
    c.setFont("Helvetica", 11)
    read_funcs = [
        "• loadChapters() → Display chapters with progress bars",
        "• getChapterProgress(chapterId) → Calculate 50% read + 50% passed quiz",
        "• getChapterStatus(chapterId) → Determine completed/in-progress/failed status",
        "• openChapterToRead(chapterId) → Show chapter content in modal",
        "• markAsReadAndClose(chapterId) → Set hasRead=true, saveProgressToServer()",
    ]
    for func in read_funcs:
        c.drawString(70, y, func)
        y -= 20
    
    y -= 10
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, "Quiz Taking Functions:")
    y -= 30
    c.setFont("Helvetica", 11)
    quiz_funcs = [
        "• startChapterQuiz(chapterId) → Check locks (hasRead, 1st pass, 2x fail)",
        "• showReadFirstModal() → Lock quiz - student must read first",
        "• showAlreadyPassedModal() → Lock quiz - already passed on 1st attempt",
        "• showQuizLockedModal() → Lock quiz - failed 2 attempts",
        "• startQuiz(chapterId) → Load quiz questions, initialize userAnswers[]",
        "• saveAnswer(index, answer) → Update userAnswers on selection",
        "• submitQuiz(event) → Send answers to /api/quizzes/:id/submit, calculate score",
        "• saveResultToDatabase(results) → POST /api/results/submit",
        "• updateChapterProgress(chapterId, hasRead, quizScore) → Track score & attempts",
        "• saveProgressToServer() → PUT /api/auth/user/:id with progress",
        "• showResults(results) → Display score, emoji, congratulations message",
    ]
    for func in quiz_funcs:
        c.drawString(70, y, func)
        y -= 18
    
    c.showPage()
    
    # Page 2 - Data & Logic
    y = height - 50
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, y, "DATA STRUCTURE & PROGRESS LOGIC")
    
    y -= 40
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "studentProgress Data Structure:")
    y -= 25
    c.setFont("Courier", 10)
    code_lines = [
        "studentProgress[chapterId] = {",
        "  hasRead: boolean,           // 50% progress when true",
        "  quizAttempts: [{score, date}],  // Max 2 attempts",
        "  bestScore: number           // 50% progress when >= 50",
        "}",
    ]
    for line in code_lines:
        c.drawString(70, y, line)
        y -= 18
    
    y -= 20
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "Progress Calculation:")
    y -= 25
    c.setFont("Helvetica", 11)
    progress_rules = [
        "• 0% → No progress (not read, no attempts)",
        "• 50% → Read only (hasRead=true, no passing score)",
        "• 50% → Failed attempt (hasRead=true, bestScore < 50)",
        "• 100% → Completed (hasRead=true AND bestScore >= 50)",
    ]
    for rule in progress_rules:
        c.drawString(70, y, rule)
        y -= 20
    
    y -= 20
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "Quiz Attempt Rules:")
    y -= 25
    c.setFont("Helvetica", 11)
    rules = [
        "• Scenario 1: hasRead=false → Show 'Read First' modal (LOCKED)",
        "• Scenario 2: Passed on 1st attempt (score >= 50) → LOCKED, no retakes",
        "• Scenario 3: Failed 1st attempt (score < 50) → Can retake once",
        "• Scenario 4: Failed both attempts → LOCKED (100% fail)",
        "• Scenario 5: Passed 2nd attempt after fail → COMPLETED",
    ]
    for rule in rules:
        c.drawString(70, y, rule)
        y -= 20
    
    c.showPage()
    c.save()
    print(f"✅ STUDENT_FLOWCHART.pdf created")

def create_admin_flowchart():
    """Create Admin Flow Flowchart PDF"""
    pdf_path = "d:\\VS\\Learn\\kannada-learning-app\\ADMIN_FLOWCHART.pdf"
    c = canvas.Canvas(pdf_path, pagesize=landscape(A4))
    width, height = landscape(A4)
    
    c.setFont("Helvetica-Bold", 20)
    c.drawString(width/2 - 150, height - 40, "⚙️ ADMIN FLOW - Kannada Learning App")
    
    # Page 1
    y = height - 100
    c.setFont("Helvetica-Bold", 14)
    
    c.drawString(50, y, "Admin Dashboard Functions:")
    y -= 30
    c.setFont("Helvetica", 11)
    admin_funcs = [
        "• loadAdminChapters() → GET /api/chapters, display list",
        "• editChapter(id) → Load chapter data, populate form for edit",
        "• deleteChapter(id) → DELETE /api/chapters/:id, remove from list",
        "• loadChapterDropdown() → Populate chapter dropdown for quiz creation",
        "• loadAdminQuizzes() → GET /api/quizzes, display all quizzes",
        "• saveQuiz() → POST /api/quizzes or PUT /api/quizzes/:id",
        "• editQuiz(id) → Load quiz, show questions for editing",
        "• deleteQuiz(id) → DELETE /api/quizzes/:id",
    ]
    for func in admin_funcs:
        c.drawString(70, y, func)
        y -= 20
    
    y -= 10
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, "Results Management Functions:")
    y -= 30
    c.setFont("Helvetica", 11)
    results_funcs = [
        "• loadResults() → GET /api/results/all, display table of all quiz submissions",
        "• filterResults(userId) → GET /api/results/user/:userId, show student's history",
        "• downloadPDF(resultId) → GET /api/results/download-pdf/:id, generate jsPDF",
        "• resetQuiz(userId, chapterId) → POST /api/results/reset-quiz",
        "  - Clears: hasRead=false, quizAttempts=[], bestScore=0",
        "  - Result: Student can re-read and retake quiz",
    ]
    for func in results_funcs:
        c.drawString(70, y, func)
        y -= 20
    
    y -= 10
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, "Student Management Functions:")
    y -= 30
    c.setFont("Helvetica", 11)
    student_funcs = [
        "• loadStudents() → GET /api/auth/users, show enrollment",
        "• searchStudent(query) → Filter students by name/email",
        "• viewStudentProgress(userId) → GET /api/auth/user/:id, show progress details",
        "• Statistics: Total enrolled, completed chapters, quiz attempts per student",
    ]
    for func in student_funcs:
        c.drawString(70, y, func)
        y -= 20
    
    c.showPage()
    
    # Page 2
    y = height - 50
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, y, "ADMIN CAPABILITIES & WORKFLOWS")
    
    y -= 40
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "1. CONTENT MANAGEMENT:")
    y -= 25
    c.setFont("Helvetica", 11)
    content_wf = [
        "Create Chapter → Fill form (number, title, content, summary) → Submit",
        "Edit Chapter → Select chapter → Modify fields → Update",
        "Delete Chapter → Confirm deletion → Remove from system",
        "Result: chapters.json updated, students see changes immediately",
    ]
    for item in content_wf:
        c.drawString(70, y, item)
        y -= 18
    
    y -= 15
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "2. QUIZ MANAGEMENT:")
    y -= 25
    c.setFont("Helvetica", 11)
    quiz_wf = [
        "Create Quiz → Select chapter → Add questions (Q, options, answer) → Submit",
        "Edit Quiz → Select quiz → Modify questions → Update",
        "Delete Quiz → Confirm → Remove from system",
        "Result: quizzes.json updated, affects student assessments",
    ]
    for item in quiz_wf:
        c.drawString(70, y, item)
        y -= 18
    
    y -= 15
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "3. RESULTS MONITORING:")
    y -= 25
    c.setFont("Helvetica", 11)
    results_wf = [
        "View All Results → See all quiz submissions with timestamps & scores",
        "Filter by Student → Search by name → View student's quiz history",
        "Download PDF → Get detailed report (Q&A) in Kannada",
        "Result: results.json queried, jsPDF generated with Kannada support",
    ]
    for item in results_wf:
        c.drawString(70, y, item)
        y -= 18
    
    y -= 15
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "4. STUDENT PROGRESS RESET:")
    y -= 25
    c.setFont("Helvetica", 11)
    reset_wf = [
        "View Student Results → Click 'Reset Quiz' → Confirm",
        "Backend: Clear hasRead=false, quizAttempts=[], bestScore=0",
        "Student Experience: Chapter shows as unread, quiz re-available",
        "Workflow: Student reads again, can retake quiz from scratch",
    ]
    for item in reset_wf:
        c.drawString(70, y, item)
        y -= 18
    
    c.showPage()
    c.save()
    print(f"✅ ADMIN_FLOWCHART.pdf created")

def create_complete_system_flowchart():
    """Create Complete System Flow Flowchart PDF"""
    pdf_path = "d:\\VS\\Learn\\kannada-learning-app\\COMPLETE_SYSTEM_FLOWCHART.pdf"
    c = canvas.Canvas(pdf_path, pagesize=landscape(A4))
    width, height = landscape(A4)
    
    c.setFont("Helvetica-Bold", 18)
    c.drawString(width/2 - 200, height - 40, "🌐 COMPLETE SYSTEM FLOW")
    
    # Page 1 - Architecture & Journey
    y = height - 100
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, "SYSTEM ARCHITECTURE:")
    y -= 30
    c.setFont("Helvetica", 10)
    arch = [
        "Frontend (Student): HTML + Vanilla JS | Chapter reading, quiz taking, progress tracking",
        "Frontend (Admin): HTML + Admin.js | Content mgmt, quiz mgmt, results, student reset",
        "Backend: Node.js + Express | APIs, authentication, business logic",
        "Database: JSON Files | users.json, chapters.json, quizzes.json, results.json",
        "PDF Export: jsPDF + jspdf-autotable | Kannada support, downloadable results",
    ]
    for item in arch:
        c.drawString(70, y, item)
        y -= 18
    
    y -= 15
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, "COMPLETE USER JOURNEY:")
    y -= 25
    c.setFont("Helvetica", 9)
    journey = [
        "1. Signup/Login → Credentials → users.json + JWT token",
        "2. Page Load → syncProgressFromServer() → GET /api/auth/user/:id",
        "3. Browse → loadChapters() → GET /api/chapters → Progress bars",
        "4. Read Chapter → openChapterToRead() + markAsReadAndClose()",
        "5. Take Quiz → startChapterQuiz() → Lock checks → startQuiz()",
        "6. Answer Qs → saveAnswer() → submitQuiz() → POST /api/quizzes/:id/submit",
        "7. Save Result → saveResultToDatabase() → POST /api/results/submit",
        "8. Update Progress → updateChapterProgress() + saveProgressToServer()",
        "9. Admin Review → loadResults() → GET /api/results/all",
        "10. Download PDF → downloadPDF() → GET /api/results/download-pdf/:id",
        "11. Reset → resetQuiz() → POST /api/results/reset-quiz → Clear progress",
        "12. Retry → Student re-reads, retakes quiz",
    ]
    for item in journey:
        c.drawString(70, y, item)
        y -= 16
    
    c.showPage()
    
    # Page 2 - API Endpoints
    y = height - 50
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, "BACKEND API ENDPOINTS:")
    
    y -= 35
    c.setFont("Helvetica-Bold", 11)
    c.drawString(50, y, "AUTHENTICATION:")
    y -= 22
    c.setFont("Helvetica", 9)
    auth_api = [
        "POST /api/auth/signup → Create user → users.json + token",
        "POST /api/auth/login → Verify creds → JWT token",
        "GET /api/auth/user/:id → Fetch user+progress → syncProgressFromServer()",
        "PUT /api/auth/user/:id → Update user/progress → saveProgressToServer()",
    ]
    for api in auth_api:
        c.drawString(70, y, api)
        y -= 16
    
    y -= 12
    c.setFont("Helvetica-Bold", 11)
    c.drawString(50, y, "CONTENT:")
    y -= 22
    c.setFont("Helvetica", 9)
    content_api = [
        "GET /api/chapters → All chapters",
        "GET /api/chapters/:id → Single chapter",
        "POST /api/chapters → Create (admin)",
        "PUT /api/chapters/:id → Update (admin)",
        "DELETE /api/chapters/:id → Delete (admin)",
    ]
    for api in content_api:
        c.drawString(70, y, api)
        y -= 16
    
    y -= 12
    c.setFont("Helvetica-Bold", 11)
    c.drawString(50, y, "QUIZZES & RESULTS:")
    y -= 22
    c.setFont("Helvetica", 9)
    quiz_api = [
        "GET /api/quizzes/chapter/:id → Get quiz",
        "POST /api/quizzes/:id/submit → Submit+score",
        "POST /api/results/submit → Save result",
        "GET /api/results/all → All results (admin)",
        "GET /api/results/user/:id → Filter (admin)",
        "GET /api/results/download-pdf/:id → PDF",
        "POST /api/results/reset-quiz → Reset",
    ]
    for api in quiz_api:
        c.drawString(70, y, api)
        y -= 16
    
    c.showPage()
    
    # Page 3 - Key Logic & Data
    y = height - 50
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, "KEY LOGIC & DATA STRUCTURES:")
    
    y -= 40
    c.setFont("Helvetica-Bold", 11)
    c.drawString(50, y, "Progress Calculation (50% Read + 50% Pass):")
    y -= 22
    c.setFont("Courier", 9)
    logic = [
        "progress = 0;",
        "if (hasRead) progress += 50;",
        "if (bestScore >= 50) progress += 50;  // Passing score is 50%",
        "// Results: 0%, 50%, or 100%",
    ]
    for line in logic:
        c.drawString(70, y, line)
        y -= 14
    
    y -= 15
    c.setFont("Helvetica-Bold", 11)
    c.drawString(50, y, "Quiz Lock Rules:")
    y -= 22
    c.setFont("Helvetica", 9)
    lock_rules = [
        "IF hasRead=false → Lock: 'Read First'",
        "IF attempts=1 AND score>=50 → Lock: 'Already Passed'",
        "IF attempts>=2 AND allFailed → Lock: 'Failed Both'",
        "ELSE → Unlock: Allow Quiz",
    ]
    for rule in lock_rules:
        c.drawString(70, y, rule)
        y -= 14
    
    y -= 15
    c.setFont("Helvetica-Bold", 11)
    c.drawString(50, y, "User Progress Structure:")
    y -= 22
    c.setFont("Courier", 8)
    user_struct = [
        "user.progress[chapterId] = {",
        "  hasRead: boolean,",
        "  quizAttempts: [{score: 45, date: '2024-11-18'}, ...],",
        "  bestScore: 75  // Max score from all attempts",
        "}",
    ]
    for line in user_struct:
        c.drawString(70, y, line)
        y -= 12
    
    y -= 15
    c.setFont("Helvetica-Bold", 11)
    c.drawString(50, y, "Quiz Result Structure:")
    y -= 22
    c.setFont("Courier", 8)
    result_struct = [
        "result = {",
        "  id, userId, userName, chapterId, chapterTitle,",
        "  answers: [{question, userAnswer, correctAnswer, isCorrect}, ...],",
        "  score: 3, totalQuestions: 5, percentage: 60, submittedAt",
        "}",
    ]
    for line in result_struct:
        c.drawString(70, y, line)
        y -= 12
    
    c.showPage()
    
    # Page 4 - Capabilities
    y = height - 50
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, "CAPABILITIES MATRIX:")
    
    y -= 40
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "STUDENT:")
    y -= 25
    c.setFont("Helvetica", 10)
    student_cap = [
        "✓ View chapters with progress % & status badges",
        "✓ Read chapter content in modal",
        "✓ Take quizzes with intelligent locking rules",
        "✓ Get instant score feedback with emoji reaction",
        "✓ Track personal progress (0%, 50%, 100%)",
        "✓ View & update user profile",
        "✓ Auto-logout after 30 mins inactivity",
    ]
    for cap in student_cap:
        c.drawString(70, y, cap)
        y -= 16
    
    y -= 20
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "ADMIN:")
    y -= 25
    c.setFont("Helvetica", 10)
    admin_cap = [
        "✓ Create/edit/delete chapters (with content mgmt)",
        "✓ Create/edit/delete quizzes (with Q&A management)",
        "✓ View all student quiz submissions",
        "✓ Filter & search results by student",
        "✓ Download quiz reports as Kannada-compatible PDF",
        "✓ Reset individual student quizzes & progress",
        "✓ Monitor student enrollment & completion stats",
    ]
    for cap in admin_cap:
        c.drawString(70, y, cap)
        y -= 16
    
    c.showPage()
    c.save()
    print(f"✅ COMPLETE_SYSTEM_FLOWCHART.pdf created")

if __name__ == "__main__":
    print("🚀 Generating Kannada Learning App Flowchart PDFs...\n")
    
    try:
        create_student_flowchart()
        create_admin_flowchart()
        create_complete_system_flowchart()
        
        print("\n✅ All three PDFs generated successfully!")
        print("\n📁 Output Files in: d:\\VS\\Learn\\kannada-learning-app\\")
        print("   1. STUDENT_FLOWCHART.pdf (2 pages)")
        print("   2. ADMIN_FLOWCHART.pdf (2 pages)")
        print("   3. COMPLETE_SYSTEM_FLOWCHART.pdf (4 pages)")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
