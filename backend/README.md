# Kannada Learning App - Backend

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will run on http://localhost:3000

## API Endpoints

### Chapters
- `GET /api/chapters` - Get all chapters
- `GET /api/chapters/:id` - Get single chapter
- `POST /api/chapters` - Create new chapter
- `PUT /api/chapters/:id` - Update chapter
- `DELETE /api/chapters/:id` - Delete chapter

### Quizzes
- `GET /api/quizzes` - Get all quizzes
- `GET /api/quizzes/chapter/:chapterId` - Get quiz for specific chapter
- `POST /api/quizzes` - Create or update quiz
- `DELETE /api/quizzes/:id` - Delete quiz
- `POST /api/quizzes/:chapterId/submit` - Submit quiz answers and get score

## Data Structure

### Chapter Object
```json
{
  "id": 1,
  "chapterNumber": 1,
  "title": "Chapter Title in Kannada",
  "studyMaterial": "Study content...",
  "summary": "Chapter summary...",
  "createdAt": "2025-11-15T10:00:00.000Z"
}
```

### Quiz Object
```json
{
  "id": 1,
  "chapterId": 1,
  "questions": [
    {
      "question": "Question text in Kannada?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "A",
      "explanation": "Optional explanation"
    }
  ]
}
```
