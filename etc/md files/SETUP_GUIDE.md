# Kannada Learning Web Application - Setup Guide

## 🎯 Project Overview

A complete learning management system for Kannada language education with:
- **10 Chapters** with study material and summaries
- **Admin Panel** for content management
- **Student Interface** for learning
- **Quiz System** with instant results
- **JSON-based Storage** (no database setup required)

## 📁 Project Structure

```
kannada-learning-app/
├── backend/                 # Node.js Express API server
│   ├── data/               # JSON data files
│   │   ├── chapters.json   # Study material storage
│   │   └── quizzes.json    # Quiz questions storage
│   ├── server.js           # Main server file
│   ├── package.json        # Dependencies
│   └── README.md
├── frontend/               # HTML/CSS/JS Frontend
│   ├── css/
│   │   └── styles.css     # All styles with Kannada font support
│   ├── js/
│   │   ├── api.js         # API communication
│   │   ├── student.js     # Student view logic
│   │   ├── admin.js       # Admin panel logic
│   │   └── app.js         # Main app initialization
│   └── index.html         # Main HTML file
└── README.md
```

## 🚀 Quick Start

### Step 1: Install Node.js
1. Download Node.js from https://nodejs.org/ (LTS version)
2. Install and verify: Open PowerShell and run:
   ```powershell
   node --version
   npm --version
   ```

### Step 2: Setup Backend

```powershell
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Start the server
npm start
```

The backend server will start on **http://localhost:3000**

You should see: "Server is running on http://localhost:3000"

### Step 3: Open Frontend

1. Open the frontend folder
2. Double-click `index.html` OR
3. Right-click `index.html` → Open with → Your browser

The app will open at **http://localhost** or **file:///**

## 📖 How to Use

### For Administrators:

1. Click **"ನಿರ್ವಾಹಕ (Admin)"** button in the top menu
2. **Add Chapters:**
   - Fill in chapter number (1-10)
   - Enter title in Kannada
   - Add study material (supports Kannada Unicode text)
   - Write a summary
   - Click "ಉಳಿಸಿ (Save)"

3. **Create Quizzes:**
   - Click "ಪರೀಕ್ಷೆಗಳು" tab
   - Select a chapter from dropdown
   - Click "+ ಪ್ರಶ್ನೆ ಸೇರಿಸಿ" to add questions
   - Enter question text
   - Add 4 options (A, B, C, D)
   - Select correct answer
   - Optional: Add explanation
   - Click "ಪರೀಕ್ಷೆ ಉಳಿಸಿ"

### For Students:

1. Click **"ವಿದ್ಯಾರ್ಥಿಗಳು (Students)"** button
2. Browse available chapters
3. Click on any chapter to:
   - Read study material
   - View summary
   - Take quiz
4. After quiz:
   - View instant score
   - See correct/incorrect answers
   - Review explanations

## 🎨 Features

### Admin Features:
- ✅ Add/Edit/Delete chapters
- ✅ Rich text support for Kannada
- ✅ Create unlimited quiz questions per chapter
- ✅ Set correct answers and explanations
- ✅ Visual management dashboard

### Student Features:
- ✅ Browse all chapters
- ✅ Read study material with proper Kannada fonts
- ✅ View chapter summaries
- ✅ Take multiple choice quizzes
- ✅ Instant score calculation
- ✅ Detailed results with explanations
- ✅ Retry capability

### Technical Features:
- ✅ Responsive design (works on mobile/tablet/desktop)
- ✅ Kannada Unicode font support (Noto Sans Kannada)
- ✅ RESTful API architecture
- ✅ JSON file-based storage (no database needed)
- ✅ CORS enabled for local development
- ✅ Error handling and validation

## 🔧 Configuration

### Backend Port
Default: 3000
To change, edit `backend/server.js`:
```javascript
const PORT = 3000; // Change this
```

### API URL
If backend runs on different port, edit `frontend/js/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:3000/api';
```

## 📝 Data Format

### Chapter Object:
```json
{
  "id": 1,
  "chapterNumber": 1,
  "title": "ಅಧ್ಯಾಯದ ಶೀರ್ಷಿಕೆ",
  "studyMaterial": "ಅಧ್ಯಯನ ವಿಷಯ...",
  "summary": "ಸಾರಾಂಶ...",
  "createdAt": "2025-11-15T10:00:00.000Z"
}
```

### Quiz Object:
```json
{
  "id": 1,
  "chapterId": 1,
  "questions": [
    {
      "question": "ಪ್ರಶ್ನೆ?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "A",
      "explanation": "ವಿವರಣೆ"
    }
  ]
}
```

## 🐛 Troubleshooting

### Backend won't start:
```powershell
# Make sure you're in backend folder
cd backend

# Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules
npm install

# Try starting again
npm start
```

### Port already in use:
```powershell
# Find and kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

### Cannot connect to backend:
1. Check if backend is running (you should see console message)
2. Verify URL in `frontend/js/api.js` matches backend port
3. Check browser console for CORS errors

### Kannada text not displaying:
1. Make sure you have internet connection (for Google Fonts)
2. Browser must support Unicode fonts
3. Copy-paste Kannada text directly (don't type transliteration)

## 📱 Browser Compatibility

- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

## 🔐 Security Notes

**For Production:**
- This is a local development setup
- For 10 users, deploy to a private network
- Add authentication (username/password)
- Use environment variables for configuration
- Consider migrating to PostgreSQL for better data integrity

## 🎓 Sample Content

To get started quickly, add this sample chapter:

**Chapter 1:**
- Title: ಜೀವರಹುಳಿ ಕಥೆ
- Study Material: (Paste your Kannada text from the image)
- Summary: ಸತತ ಪ್ರಯತ್ನವೇ ಗೆಲುವಿನ ಗುಟ್ಟು

**Quiz:**
- Question: ರಾಜನು ಯಾರಿಂದ ಪ್ರೇರಣೆ ಪಡೆದನು?
- Options: [ಜೀವರಹುಳಿ, ಸಿಂಹ, ಆನೆ, ಮಂತ್ರಿ]
- Correct: A

## 📞 Support

For issues or questions:
1. Check browser console for errors (F12)
2. Verify backend is running
3. Check data files in `backend/data/`

## 🚀 Future Enhancements

Potential additions:
- User authentication
- Progress tracking
- Flashcards
- Audio pronunciation
- Bookmarking
- Export/Import data
- Dark mode
- Mobile app version

---

**Ready to start!** Follow the Quick Start guide above. 🎉
