# Kannada Learning App

A comprehensive web application for learning Kannada language with interactive quizzes, progress tracking, and admin management capabilities.

## 🎯 Features

### Student Features
- **Chapter Reading**: Learn Kannada through structured chapters with Kannada Unicode support
- **Interactive Quizzes**: Test knowledge with multiple-choice questions
- **Progress Tracking**: Visual progress bars showing learning completion
- **Smart Quiz System**: 
  - Must read chapter before taking quiz
  - Cannot retake quiz after first successful attempt
  - Maximum 2 attempts per quiz
  - Real-time score calculation
- **PDF Results**: Download quiz results as PDF with Kannada text rendering
- **Persistent Storage**: Progress saved locally and on server

### Admin Features
- **Content Management**: Create, edit, and delete chapters
- **Quiz Management**: Create and manage quiz questions for each chapter
- **Results Dashboard**: View student results with filtering options
- **Student Management**: Track individual student progress
- **Reset Functionality**: Clear student progress and allow retry
- **PDF Generation**: Download student results as PDF with Kannada support

## 🛠️ Tech Stack

### Frontend
- HTML5, CSS3, Vanilla JavaScript
- localStorage for client-side persistence
- Fetch API for HTTP requests

### Backend
- Node.js + Express.js
- JSON file-based database (users.json, chapters.json, quizzes.json, results.json)
- JWT authentication
- jsPDF + jspdf-autotable for PDF generation with Kannada Unicode support

### Storage
- **users.json**: User profiles and learning progress
- **chapters.json**: Course content
- **quizzes.json**: Quiz questions and answers
- **results.json**: Quiz attempt records

## 📁 Project Structure

```
kannada-learning-app/
├── backend/
│   ├── server.js              # Express server main file
│   ├── package.json           # Node dependencies
│   ├── routes/
│   │   ├── auth.js           # Authentication & user profiles
│   │   ├── quizzes.js        # Quiz endpoints
│   │   └── results.js        # Results & PDF generation
│   └── data/
│       ├── users.json        # User data
│       ├── chapters.json     # Course chapters
│       ├── quizzes.json      # Quiz questions
│       └── results.json      # Quiz results
├── frontend/
│   ├── index.html            # Student dashboard
│   ├── login.html            # Login page
│   ├── admin-dashboard.html  # Admin interface
│   ├── admin-login.html      # Admin login
│   ├── admin-chapters.html   # Chapter management
│   ├── admin-quiz.html       # Quiz management
│   ├── admin-results.html    # Results view
│   ├── admin-students.html   # Student management
│   ├── css/
│   │   └── styles.css        # Main stylesheet
│   └── js/
│       ├── student.js        # Student app logic
│       ├── admin.js          # Admin app logic
│       └── auth.js           # Authentication helper
├── .gitignore
├── package.json
└── README.md
```

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v14+)
- Python 3.7+ (for flowchart generation scripts)

### Installation

1. **Install Node dependencies**
```bash
cd backend
npm install
```

2. **Configure environment** (optional)
```bash
# backend/.env
PORT=3000
NODE_ENV=development
```

3. **Start backend server**
```bash
npm start
# or for development with auto-reload
npm run dev
```

4. **Open frontend**
```
Open frontend/index.html in a web browser
or
Open frontend/admin-dashboard.html for admin interface
```

## 📚 Usage

### Student Workflow
1. Login/Sign up on index.html
2. Browse available chapters
3. Click "Read" to learn chapter content (marks as read)
4. Click "Take Quiz" to attempt the quiz
5. Answer all questions and submit
6. View results and download PDF if desired

### Admin Workflow
1. Login on admin-dashboard.html
2. Manage content:
   - Create chapters with Kannada titles
   - Create quizzes with questions
   - Edit or delete existing content
3. Monitor results:
   - View all student results
   - Filter by student
   - Download individual PDFs
   - Reset student progress

## 🔐 Quiz Constraints

The app enforces smart quiz progression:
- **Initial State**: "📖 Read"
- **After Reading**: "🎯 Take Quiz" (enabled)
- **After 1st Pass**: "✅ Passed" (locked, no retakes)
- **After 1st Fail**: "🔁 Retry" (can attempt once more)
- **After 2nd Fail**: "❌ Locked" (no more attempts)

## 💾 Data Persistence

### Frontend (localStorage)
- Student ID
- Chapter progress and scores
- Quiz attempt records

### Backend (JSON files)
- User profiles with cumulative progress
- Chapter metadata
- Quiz questions and answers
- Quiz results history

**Smart Sync Algorithm**: 
- Prevents stale server data from overwriting fresh local progress
- Preserves recent changes on page refresh
- Synchronizes with server for persistence

## 🎨 Flowchart Documentation

Three visual flowchart PDFs included:
- **STUDENT_FLOWCHART_VISUAL.pdf**: Complete student journey with decision points
- **ADMIN_FLOWCHART_VISUAL.pdf**: Admin management workflows
- **COMPLETE_SYSTEM_FLOWCHART_VISUAL.pdf**: Full system architecture (Student → API → Backend → DB → Admin)

## 📄 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/user/:id` - Get user profile
- `PUT /api/auth/user/:id` - Update user profile

### Chapters
- `GET /api/chapters` - List all chapters
- `GET /api/chapters/:id` - Get chapter details
- `POST /api/chapters` - Create chapter (admin)
- `PUT /api/chapters/:id` - Update chapter (admin)
- `DELETE /api/chapters/:id` - Delete chapter (admin)

### Quizzes
- `GET /api/quizzes/:id` - Get quiz for chapter
- `POST /api/quizzes/:id/submit` - Submit quiz answers

### Results
- `GET /api/results/all` - Get all results (admin)
- `GET /api/results/user/:id` - Get results for user
- `POST /api/results/submit` - Save quiz result
- `GET /api/results/download-pdf/:id` - Download result as PDF
- `POST /api/results/reset-quiz` - Reset student quiz (admin)

## 🐛 Known Issues & Fixes

### Phase 12 Fixes Applied
- ✅ **Progress Reset Bug**: Fixed issue where progress reset to 50% after page refresh
  - Solution: Added `saveProgressToServer()` function to persist progress to backend
- ✅ **Quiz Retake Lock**: Fixed ability to retake quiz after passing on first attempt
  - Solution: Added first-attempt pass check and `showAlreadyPassedModal()`

### Phase 11 Fixes Applied
- ✅ **PDF Kannada Support**: Switched from PDFKit to jsPDF for proper Kannada Unicode rendering

## 🔄 Development Phases

The app was developed incrementally through 13 phases:

1. **Phase 1-2**: Quiz system foundation and attempt limiting
2. **Phase 3-4**: Admin reset feature and UI fixes
3. **Phase 5-8**: Advanced synchronization and data persistence
4. **Phase 9**: Progress reset logic improvements
5. **Phase 10**: Smart data merge sync algorithm
6. **Phase 11**: PDF generation with Kannada support
7. **Phase 12**: Bug fixes (progress persistence, quiz retakes)
8. **Phase 13**: Visual flowchart documentation

## 📝 License

This project is created for educational purposes.

## 👤 Author

Developed as a comprehensive Kannada Language Learning Platform

---

**Last Updated**: November 2025
**Status**: Production Ready ✅
