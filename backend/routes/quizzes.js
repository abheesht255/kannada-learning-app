const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const quizzesFile = path.join(__dirname, '../data/quizzes.json');

// Helper function to read quizzes
async function readQuizzes() {
    try {
        const data = await fs.readFile(quizzesFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// Helper function to write quizzes
async function writeQuizzes(quizzes) {
    await fs.writeFile(quizzesFile, JSON.stringify(quizzes, null, 2));
}

// GET all quizzes
router.get('/', async (req, res) => {
    try {
        const quizzes = await readQuizzes();
        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching quizzes', error: error.message });
    }
});

// GET quiz by chapter ID (for student view)
router.get('/chapter/:chapterId', async (req, res) => {
    try {
        const quizzes = await readQuizzes();
        const quiz = quizzes.find(q => q.chapterId === parseInt(req.params.chapterId));
        
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found for this chapter' });
        }
        
        res.json(quiz);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching quiz', error: error.message });
    }
});

// GET quiz by ID
router.get('/:id', async (req, res) => {
    try {
        const quizzes = await readQuizzes();
        const quiz = quizzes.find(q => q.id === parseInt(req.params.id));
        
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        
        res.json(quiz);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching quiz', error: error.message });
    }
});

// POST create new quiz
router.post('/', async (req, res) => {
    try {
        const quizzes = await readQuizzes();
        const { chapterId, questions } = req.body;
        
        if (!chapterId || !questions || !Array.isArray(questions)) {
            return res.status(400).json({ message: 'Invalid quiz data' });
        }
        
        // Generate new ID
        const newId = quizzes.length > 0 ? Math.max(...quizzes.map(q => q.id)) + 1 : 1;
        
        const newQuiz = {
            id: newId,
            chapterId: parseInt(chapterId),
            questions: questions.map((q, index) => ({
                question: q.question,
                options: q.options || [],
                correctAnswer: q.correctAnswer,
                explanation: q.explanation || ''
            })),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        quizzes.push(newQuiz);
        await writeQuizzes(quizzes);
        
        res.status(201).json({ message: 'Quiz created successfully', quiz: newQuiz });
    } catch (error) {
        res.status(500).json({ message: 'Error creating quiz', error: error.message });
    }
});

// PUT update quiz
router.put('/:id', async (req, res) => {
    try {
        const quizzes = await readQuizzes();
        const quizIndex = quizzes.findIndex(q => q.id === parseInt(req.params.id));
        
        if (quizIndex === -1) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        
        const { questions } = req.body;
        
        if (!questions || !Array.isArray(questions)) {
            return res.status(400).json({ message: 'Invalid quiz data' });
        }
        
        quizzes[quizIndex].questions = questions.map(q => ({
            question: q.question,
            options: q.options || [],
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || ''
        }));
        quizzes[quizIndex].updatedAt = new Date().toISOString();
        
        await writeQuizzes(quizzes);
        
        res.json({ message: 'Quiz updated successfully', quiz: quizzes[quizIndex] });
    } catch (error) {
        res.status(500).json({ message: 'Error updating quiz', error: error.message });
    }
});

// DELETE quiz
router.delete('/:id', async (req, res) => {
    try {
        const quizzes = await readQuizzes();
        const quizIndex = quizzes.findIndex(q => q.id === parseInt(req.params.id));
        
        if (quizIndex === -1) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        
        quizzes.splice(quizIndex, 1);
        await writeQuizzes(quizzes);
        
        res.json({ message: 'Quiz deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting quiz', error: error.message });
    }
});

// POST submit quiz answers and get results
router.post('/:chapterId/submit', async (req, res) => {
    try {
        const chapterId = parseInt(req.params.chapterId);
        const { answers } = req.body;

        console.log('\n=== QUIZ SUBMISSION ===');
        console.log('Chapter ID:', chapterId);
        console.log('Answers received:', answers);
        console.log('Answers is array:', Array.isArray(answers));
        console.log('Answers length:', answers?.length);

        // Validate input
        if (!answers) {
            console.error('❌ No answers provided');
            return res.status(400).json({ 
                success: false,
                message: 'Answers are required',
                error: 'answers field is missing'
            });
        }

        if (!Array.isArray(answers)) {
            console.error('❌ Answers is not an array:', typeof answers);
            return res.status(400).json({ 
                success: false,
                message: 'Answers must be an array',
                error: `Expected array, got ${typeof answers}`
            });
        }

        // Read quizzes
        const quizzes = await readQuizzes();
        console.log('Total quizzes in database:', quizzes.length);

        // Find quiz for this chapter
        const quiz = quizzes.find(q => q.chapterId === chapterId);
        
        if (!quiz) {
            console.error(`❌ No quiz found for chapter ${chapterId}`);
            return res.status(404).json({ 
                success: false,
                message: `Quiz not found for chapter ${chapterId}`,
                searchedChapterId: chapterId,
                availableChapters: quizzes.map(q => q.chapterId)
            });
        }

        console.log(`✅ Quiz found for chapter ${chapterId}`);
        console.log('Questions in quiz:', quiz.questions?.length);

        // Validate quiz structure
        if (!quiz.questions || !Array.isArray(quiz.questions)) {
            console.error('❌ Quiz has no questions or questions is not an array');
            return res.status(500).json({ 
                success: false,
                message: 'Quiz is malformed'
            });
        }

        // Grade the quiz
        let correctCount = 0;
        const results = [];

        quiz.questions.forEach((question, index) => {
            const userAnswer = answers[index];
            const correctAnswer = question.correctAnswer;
            const isCorrect = userAnswer === correctAnswer;

            if (isCorrect) {
                correctCount++;
            }

            results.push({
                questionId: index,
                questionNumber: index + 1,
                question: question.question,
                userAnswer: userAnswer || 'Not answered',
                correctAnswer: correctAnswer,
                isCorrect: isCorrect,
                explanation: question.explanation || 'No explanation provided'
            });

            console.log(`  Q${index + 1}: ${isCorrect ? '✅' : '❌'} (User: ${userAnswer}, Correct: ${correctAnswer})`);
        });

        const percentage = ((correctCount / quiz.questions.length) * 100).toFixed(2);

        console.log(`\n📊 SCORE: ${correctCount}/${quiz.questions.length} (${percentage}%)\n`);

        res.json({
            success: true,
            correctAnswers: correctCount,
            totalQuestions: quiz.questions.length,
            percentage: parseFloat(percentage),
            results: results
        });

    } catch (error) {
        console.error('❌ Error in quiz submission:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error processing quiz submission',
            error: error.message
        });
    }
});

module.exports = router;
