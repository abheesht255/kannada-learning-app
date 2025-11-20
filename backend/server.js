const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(session({
    secret: 'kannada-learning-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Import routes
const authRoutes = require('./routes/auth');
const resultsRoutes = require('./routes/results');
const quizzesRoutes = require('./routes/quizzes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/results', resultsRoutes);
app.use('/api/quizzes', quizzesRoutes);

// Data file paths
const CHAPTERS_FILE = path.join(__dirname, 'data', 'chapters.json');
const QUIZZES_FILE = path.join(__dirname, 'data', 'quizzes.json');

// Helper functions to read/write JSON files
async function readJSONFile(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading file:', error);
        return [];
    }
}

async function writeJSONFile(filePath, data) {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Error writing file:', error);
        return false;
    }
}

// ==================== CHAPTER ROUTES ====================

// Get all chapters
app.get('/api/chapters', async (req, res) => {
    const chapters = await readJSONFile(CHAPTERS_FILE);
    res.json(chapters);
});

// Get single chapter by ID
app.get('/api/chapters/:id', async (req, res) => {
    const chapters = await readJSONFile(CHAPTERS_FILE);
    const chapter = chapters.find(c => c.id === parseInt(req.params.id));
    if (chapter) {
        res.json(chapter);
    } else {
        res.status(404).json({ error: 'Chapter not found' });
    }
});

// Create new chapter
app.post('/api/chapters', async (req, res) => {
    const chapters = await readJSONFile(CHAPTERS_FILE);
    const newChapter = {
        id: chapters.length > 0 ? Math.max(...chapters.map(c => c.id)) + 1 : 1,
        chapterNumber: req.body.chapterNumber,
        title: req.body.title,
        studyMaterial: req.body.studyMaterial || '',
        summary: req.body.summary || '',
        createdAt: new Date().toISOString()
    };
    chapters.push(newChapter);
    await writeJSONFile(CHAPTERS_FILE, chapters);
    res.status(201).json(newChapter);
});

// Update chapter
app.put('/api/chapters/:id', async (req, res) => {
    const chapters = await readJSONFile(CHAPTERS_FILE);
    const index = chapters.findIndex(c => c.id === parseInt(req.params.id));
    
    if (index !== -1) {
        chapters[index] = {
            ...chapters[index],
            chapterNumber: req.body.chapterNumber || chapters[index].chapterNumber,
            title: req.body.title || chapters[index].title,
            studyMaterial: req.body.studyMaterial !== undefined ? req.body.studyMaterial : chapters[index].studyMaterial,
            summary: req.body.summary !== undefined ? req.body.summary : chapters[index].summary,
            updatedAt: new Date().toISOString()
        };
        await writeJSONFile(CHAPTERS_FILE, chapters);
        res.json(chapters[index]);
    } else {
        res.status(404).json({ error: 'Chapter not found' });
    }
});

// Delete chapter
app.delete('/api/chapters/:id', async (req, res) => {
    const chapters = await readJSONFile(CHAPTERS_FILE);
    const filteredChapters = chapters.filter(c => c.id !== parseInt(req.params.id));
    
    if (chapters.length !== filteredChapters.length) {
        await writeJSONFile(CHAPTERS_FILE, filteredChapters);
        res.json({ message: 'Chapter deleted successfully' });
    } else {
        res.status(404).json({ error: 'Chapter not found' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`API endpoints available at http://localhost:${PORT}/api`);
});
