#!/usr/bin/env python3
"""
Generate visual flowchart diagrams with boxes for Kannada Learning App
Using reportlab and PIL for pure Python flowchart generation (no Graphviz needed)
"""

from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import cm
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from io import BytesIO

def create_student_flowchart_visual():
    """Create visual Student Flow flowchart with boxes"""
    
    dot = Digraph('Student Flow', comment='Student Journey Flowchart')
    dot.attr(rankdir='TB', size='10,14')
    dot.attr('node', shape='box', style='filled', fillcolor='lightblue', 
             fontname='Helvetica', fontsize='10', margin='0.3,0.2')
    dot.attr('graph', bgcolor='white', pad='0.5')
    
    # Define nodes with colors
    dot.attr('node', fillcolor='lightgreen')
    dot.node('start', 'START\nPage Load', shape='ellipse')
    
    dot.attr('node', fillcolor='lightblue')
    dot.node('load_progress', 'Load Progress\nfrom localStorage')
    dot.node('sync_server', 'Sync Progress\nfrom Server\nGET /api/auth/user/:id')
    dot.node('display_chapters', 'Display Chapters\nwith Progress Bars')
    
    dot.attr('node', fillcolor='lightyellow')
    dot.node('read_decision', 'User Clicks\nRead Chapter?', shape='diamond')
    dot.node('open_chapter', 'Open Chapter\nModal\nopenChapterToRead()')
    dot.node('mark_read', 'Mark as Read\nhasRead = true\nmarkAsReadAndClose()')
    dot.node('save_progress_srv', 'Save Progress\nto Server\nPUT /api/auth/user/:id')
    
    dot.attr('node', fillcolor='lightsalmon')
    dot.node('quiz_decision', 'User Clicks\nTake Quiz?', shape='diamond')
    dot.node('check_hasread', 'Check: hasRead?', shape='diamond', fillcolor='#FFB6C1')
    dot.node('show_read_modal', 'Show Modal:\n"Read First"\nLOCKED', fillcolor='#FF6B6B')
    
    dot.attr('node', fillcolor='#FFD700')
    dot.node('check_pass_1st', 'Check:\nPassed on\n1st attempt?', shape='diamond')
    dot.node('show_pass_modal', 'Show Modal:\n"Already Passed"\nLOCKED', fillcolor='#FF6B6B')
    
    dot.attr('node', fillcolor='#FFA500')
    dot.node('check_fail_2x', 'Check:\nFailed both\nattempts?', shape='diamond')
    dot.node('show_fail_modal', 'Show Modal:\n"Locked"\nLOCKED', fillcolor='#FF6B6B')
    
    dot.attr('node', fillcolor='#90EE90')
    dot.node('load_quiz', 'Load Quiz\nQuestions\nstartQuiz()')
    dot.node('show_questions', 'Display Quiz\nwith Questions')
    dot.node('save_answer', 'Student Selects\nAnswer\nsaveAnswer()')
    
    dot.attr('node', fillcolor='#87CEEB')
    dot.node('submit_quiz', 'Submit Quiz\nsubmitQuiz()\nPOST /api/quizzes/:id/submit')
    dot.node('calculate_score', 'Calculate Score\nCompare Answers')
    dot.node('save_result', 'Save Result to DB\nPOST /api/results/submit\nsaveResultToDatabase()')
    
    dot.attr('node', fillcolor='#DDA0DD')
    dot.node('update_progress', 'Update Progress\nupdateChapterProgress()\nAdd attempt score')
    dot.node('persist_progress', 'Persist to Server\nsaveProgressToServer()\nPUT /api/auth/user/:id')
    
    dot.attr('node', fillcolor='#FFB6C1')
    dot.node('show_results', 'Show Results\nwith Score & Emoji\nshowResults()')
    
    dot.attr('node', fillcolor='lightgreen')
    dot.node('end', 'Continue or\nLogout', shape='ellipse')
    
    # Define edges
    dot.edge('start', 'load_progress')
    dot.edge('load_progress', 'sync_server')
    dot.edge('sync_server', 'display_chapters')
    
    dot.edge('display_chapters', 'read_decision')
    dot.edge('read_decision', 'open_chapter', label='YES')
    dot.edge('read_decision', 'quiz_decision', label='NO')
    dot.edge('open_chapter', 'mark_read')
    dot.edge('mark_read', 'save_progress_srv')
    dot.edge('save_progress_srv', 'display_chapters')
    
    dot.edge('quiz_decision', 'check_hasread', label='YES')
    dot.edge('quiz_decision', 'end', label='NO')
    
    dot.edge('check_hasread', 'show_read_modal', label='NO')
    dot.edge('show_read_modal', 'end')
    
    dot.edge('check_hasread', 'check_pass_1st', label='YES')
    dot.edge('check_pass_1st', 'show_pass_modal', label='YES')
    dot.edge('show_pass_modal', 'end')
    
    dot.edge('check_pass_1st', 'check_fail_2x', label='NO')
    dot.edge('check_fail_2x', 'show_fail_modal', label='YES')
    dot.edge('show_fail_modal', 'end')
    
    dot.edge('check_fail_2x', 'load_quiz', label='NO')
    dot.edge('load_quiz', 'show_questions')
    
    dot.edge('show_questions', 'save_answer')
    dot.edge('save_answer', 'show_questions', label='More Questions')
    
    dot.edge('show_questions', 'submit_quiz', label='All Answered')
    dot.edge('submit_quiz', 'calculate_score')
    dot.edge('calculate_score', 'save_result')
    dot.edge('save_result', 'update_progress')
    dot.edge('update_progress', 'persist_progress')
    dot.edge('persist_progress', 'show_results')
    dot.edge('show_results', 'end')
    
    # Render to PDF
    output_path = 'd:\\VS\\Learn\\kannada-learning-app\\STUDENT_FLOWCHART_VISUAL'
    dot.render(output_path, format='pdf', cleanup=True)
    print(f"✅ STUDENT_FLOWCHART_VISUAL.pdf created")

def create_admin_flowchart_visual():
    """Create visual Admin Flow flowchart with boxes"""
    
    dot = Digraph('Admin Flow', comment='Admin Management Flowchart')
    dot.attr(rankdir='TB', size='12,14')
    dot.attr('node', shape='box', style='filled', fillcolor='lightyellow', 
             fontname='Helvetica', fontsize='10', margin='0.3,0.2')
    dot.attr('graph', bgcolor='white', pad='0.5')
    
    dot.attr('node', fillcolor='#FFD700')
    dot.node('admin_start', 'ADMIN LOGIN', shape='ellipse')
    dot.node('admin_dashboard', 'Admin Dashboard\nloadAdminChapters()')
    dot.node('admin_choice', 'Select Action', shape='diamond')
    
    # Content Management Branch
    dot.attr('node', fillcolor='#87CEEB')
    dot.node('content_choice', 'Manage Content?', shape='diamond')
    dot.node('content_action', 'Choose Action', shape='diamond')
    dot.node('create_chapter', 'Create Chapter\nFill Form\nsubmit chapter-form')
    dot.node('edit_chapter', 'Edit Chapter\neditChapter()\nLoad & Modify')
    dot.node('delete_chapter', 'Delete Chapter\ndeleteChapter()\nConfirm Delete')
    dot.node('save_chapter', 'Save to Backend\nPOST/PUT /api/chapters\nUpdate chapters.json')
    
    # Quiz Management Branch
    dot.attr('node', fillcolor='#DDA0DD')
    dot.node('quiz_choice', 'Manage Quizzes?', shape='diamond')
    dot.node('quiz_action', 'Choose Action', shape='diamond')
    dot.node('create_quiz', 'Create Quiz\nSelect Chapter\nAdd Questions')
    dot.node('edit_quiz', 'Edit Quiz\neditQuiz()\nModify Questions')
    dot.node('delete_quiz', 'Delete Quiz\ndeleteQuiz()\nConfirm')
    dot.node('save_quiz', 'Save to Backend\nPOST/PUT /api/quizzes\nUpdate quizzes.json')
    
    # Results Management Branch
    dot.attr('node', fillcolor='#FFB6C1')
    dot.node('results_choice', 'View Results?', shape='diamond')
    dot.node('results_action', 'Choose Action', shape='diamond')
    dot.node('view_all', 'View All Results\nloadResults()\nGET /api/results/all')
    dot.node('filter_results', 'Filter by Student\nfilterResults()\nGET /api/results/user/:id')
    dot.node('download_pdf', 'Download PDF\ndownloadPDF()\nGET /api/results/download-pdf/:id')
    dot.node('reset_quiz', 'Reset Student Quiz\nresetQuiz()\nPOST /api/results/reset-quiz')
    
    # Display Results
    dot.attr('node', fillcolor='#90EE90')
    dot.node('display_results', 'Display Results\nTable with Data')
    dot.node('take_action', 'Take Action?', shape='diamond')
    dot.node('pdf_generated', 'PDF Generated\nwith Kannada\nDownload File')
    
    # Student Management Branch
    dot.attr('node', fillcolor='#F0E68C')
    dot.node('students_choice', 'Manage Students?', shape='diamond')
    dot.node('load_students', 'Load Students\nloadStudents()\nGET /api/auth/users')
    dot.node('search_student', 'Search Student\nsearchStudent()\nFilter by name/email')
    dot.node('view_progress', 'View Progress\nviewStudentProgress()\nShow detail stats')
    
    # End
    dot.attr('node', fillcolor='lightgreen')
    dot.node('admin_end', 'Continue or\nLogout', shape='ellipse')
    
    # Edges
    dot.edge('admin_start', 'admin_dashboard')
    dot.edge('admin_dashboard', 'admin_choice')
    
    # Content Management Flow
    dot.edge('admin_choice', 'content_choice', label='1. Content')
    dot.edge('content_choice', 'content_action', label='YES')
    dot.edge('content_action', 'create_chapter', label='Create')
    dot.edge('content_action', 'edit_chapter', label='Edit')
    dot.edge('content_action', 'delete_chapter', label='Delete')
    dot.edge('create_chapter', 'save_chapter')
    dot.edge('edit_chapter', 'save_chapter')
    dot.edge('delete_chapter', 'save_chapter')
    dot.edge('save_chapter', 'admin_dashboard')
    
    # Quiz Management Flow
    dot.edge('admin_choice', 'quiz_choice', label='2. Quizzes')
    dot.edge('quiz_choice', 'quiz_action', label='YES')
    dot.edge('quiz_action', 'create_quiz', label='Create')
    dot.edge('quiz_action', 'edit_quiz', label='Edit')
    dot.edge('quiz_action', 'delete_quiz', label='Delete')
    dot.edge('create_quiz', 'save_quiz')
    dot.edge('edit_quiz', 'save_quiz')
    dot.edge('delete_quiz', 'save_quiz')
    dot.edge('save_quiz', 'admin_dashboard')
    
    # Results Management Flow
    dot.edge('admin_choice', 'results_choice', label='3. Results')
    dot.edge('results_choice', 'results_action', label='YES')
    dot.edge('results_action', 'view_all', label='View All')
    dot.edge('results_action', 'filter_results', label='Filter')
    dot.edge('view_all', 'display_results')
    dot.edge('filter_results', 'display_results')
    dot.edge('display_results', 'take_action')
    dot.edge('take_action', 'download_pdf', label='Download')
    dot.edge('take_action', 'reset_quiz', label='Reset')
    dot.edge('download_pdf', 'pdf_generated')
    dot.edge('reset_quiz', 'display_results', label='Refreshed')
    dot.edge('pdf_generated', 'admin_dashboard')
    
    # Student Management Flow
    dot.edge('admin_choice', 'students_choice', label='4. Students')
    dot.edge('students_choice', 'load_students', label='YES')
    dot.edge('load_students', 'search_student')
    dot.edge('search_student', 'view_progress')
    dot.edge('view_progress', 'admin_dashboard')
    
    dot.edge('admin_choice', 'admin_end', label='Logout')
    
    # Render to PDF
    output_path = 'd:\\VS\\Learn\\kannada-learning-app\\ADMIN_FLOWCHART_VISUAL'
    dot.render(output_path, format='pdf', cleanup=True)
    print(f"✅ ADMIN_FLOWCHART_VISUAL.pdf created")

def create_complete_system_flowchart_visual():
    """Create visual Complete System flowchart with boxes"""
    
    dot = Digraph('Complete System', comment='Complete System Flowchart')
    dot.attr(rankdir='LR', size='16,10')
    dot.attr('node', shape='box', style='filled', fillcolor='lightblue', 
             fontname='Helvetica', fontsize='9', margin='0.3,0.2')
    dot.attr('graph', bgcolor='white', pad='0.5')
    
    # Student Column
    dot.attr('node', fillcolor='#90EE90')
    dot.node('stu_start', 'STUDENT')
    dot.node('stu_login', 'Login\nPOST /api/auth/login')
    dot.node('stu_page', 'Page Load\nloadChapters()\nsyncProgressFromServer()')
    dot.node('stu_read', 'Read Chapter\nopenChapterToRead()\nmarkAsReadAndClose()')
    dot.node('stu_quiz', 'Take Quiz\nstartChapterQuiz()\nstartQuiz()')
    dot.node('stu_answer', 'Answer Questions\nsaveAnswer()')
    dot.node('stu_submit', 'Submit Quiz\nsubmitQuiz()')
    dot.node('stu_result', 'View Result\nshowResults()')
    dot.node('stu_end', 'Logout')
    
    # Backend Column
    dot.attr('node', fillcolor='#87CEEB')
    dot.node('auth_api', 'Auth API\n/api/auth/login\n/api/auth/signup')
    dot.node('chapter_api', 'Chapter API\n/api/chapters\n/api/chapters/:id')
    dot.node('user_api', 'User API\n/api/auth/user/:id\nGET & PUT')
    dot.node('quiz_api', 'Quiz API\n/api/quizzes/:id\n/api/quizzes/:id/submit')
    dot.node('result_api', 'Result API\n/api/results/submit\n/api/results/all\n/api/results/download-pdf')
    dot.node('reset_api', 'Reset API\n/api/results/reset-quiz')
    
    # Database Column
    dot.attr('node', fillcolor='#FFD700')
    dot.node('db_users', 'users.json\n(User Profiles +\nProgress)')
    dot.node('db_chapters', 'chapters.json\n(Content)')
    dot.node('db_quizzes', 'quizzes.json\n(Questions)')
    dot.node('db_results', 'results.json\n(Quiz Results)')
    
    # Admin Column
    dot.attr('node', fillcolor='#FFB6C1')
    dot.node('adm_start', 'ADMIN')
    dot.node('adm_login', 'Admin Login')
    dot.node('adm_content', 'Manage Content\nCreate/Edit/Delete\nChapters')
    dot.node('adm_quiz', 'Manage Quizzes\nCreate/Edit/Delete\nQuestions')
    dot.node('adm_results', 'View Results\nFilter by Student\nDownload PDF')
    dot.node('adm_reset', 'Reset Student\nClear Progress')
    dot.node('adm_end', 'Logout')
    
    # PDF Export
    dot.attr('node', fillcolor='#DDA0DD')
    dot.node('pdf_gen', 'PDF Generation\njsPDF + Kannada\njspdf-autotable')
    dot.node('pdf_file', 'PDF File Output\n(Download)')
    
    # STUDENT FLOW
    dot.edge('stu_start', 'stu_login')
    dot.edge('stu_login', 'auth_api', label='Register/Login')
    dot.edge('auth_api', 'db_users', label='Save User')
    dot.edge('stu_login', 'stu_page')
    dot.edge('stu_page', 'chapter_api', label='Get Chapters')
    dot.edge('chapter_api', 'db_chapters')
    dot.edge('stu_page', 'user_api', label='Get Progress')
    dot.edge('user_api', 'db_users')
    dot.edge('stu_page', 'stu_read')
    dot.edge('stu_read', 'user_api', label='Save hasRead')
    dot.edge('stu_read', 'stu_quiz')
    dot.edge('stu_quiz', 'quiz_api', label='Get Questions')
    dot.edge('quiz_api', 'db_quizzes')
    dot.edge('stu_quiz', 'stu_answer')
    dot.edge('stu_answer', 'stu_submit')
    dot.edge('stu_submit', 'quiz_api', label='Submit Answers')
    dot.edge('stu_submit', 'result_api', label='Save Result')
    dot.edge('result_api', 'db_results')
    dot.edge('stu_submit', 'user_api', label='Update Progress')
    dot.edge('user_api', 'db_users', label='Save Score')
    dot.edge('stu_result', 'stu_end')
    
    # ADMIN FLOW
    dot.edge('adm_start', 'adm_login')
    dot.edge('adm_login', 'auth_api')
    dot.edge('adm_content', 'chapter_api', label='Create/Edit')
    dot.edge('chapter_api', 'db_chapters')
    dot.edge('adm_quiz', 'quiz_api', label='Manage')
    dot.edge('quiz_api', 'db_quizzes')
    dot.edge('adm_results', 'result_api', label='Query Results')
    dot.edge('result_api', 'db_results')
    dot.edge('adm_results', 'pdf_gen', label='Generate')
    dot.edge('pdf_gen', 'pdf_file')
    dot.edge('adm_reset', 'reset_api', label='Clear Progress')
    dot.edge('reset_api', 'user_api')
    dot.edge('user_api', 'db_users')
    dot.edge('adm_login', 'adm_content')
    dot.edge('adm_content', 'adm_quiz')
    dot.edge('adm_quiz', 'adm_results')
    dot.edge('adm_results', 'adm_reset')
    dot.edge('adm_reset', 'adm_end')
    
    # Render to PDF
    output_path = 'd:\\VS\\Learn\\kannada-learning-app\\COMPLETE_SYSTEM_FLOWCHART_VISUAL'
    dot.render(output_path, format='pdf', cleanup=True)
    print(f"✅ COMPLETE_SYSTEM_FLOWCHART_VISUAL.pdf created")

if __name__ == "__main__":
    print("🚀 Generating Visual Flowchart PDFs with Boxes...\n")
    
    try:
        create_student_flowchart_visual()
        create_admin_flowchart_visual()
        create_complete_system_flowchart_visual()
        
        print("\n✅ All three visual flowchart PDFs generated successfully!")
        print("\n📁 Output Files in: d:\\VS\\Learn\\kannada-learning-app\\")
        print("   1. STUDENT_FLOWCHART_VISUAL.pdf - Student journey with decision diamonds")
        print("   2. ADMIN_FLOWCHART_VISUAL.pdf - Admin workflows with action boxes")
        print("   3. COMPLETE_SYSTEM_FLOWCHART_VISUAL.pdf - Integrated student/admin/backend/database")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
