const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { jsPDF } = require('jspdf');
const { jsPdfTable } = require('jspdf-autotable');

const RESULTS_FILE = path.join(__dirname, '../data/results.json');
const QUIZZES_FILE = path.join(__dirname, '../data/quizzes.json');
const USERS_FILE = path.join(__dirname, '../data/users.json');

// Helper functions
async function readResults() {
    try {
        const data = await fs.readFile(RESULTS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return { results: [] };
    }
}

async function writeResults(data) {
    await fs.writeFile(RESULTS_FILE, JSON.stringify(data, null, 2));
}

async function readQuizzes() {
    try {
        const data = await fs.readFile(QUIZZES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return { quizzes: [] };
    }
}

async function readUsers() {
    try {
        const data = await fs.readFile(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return { users: [] };
    }
}

async function writeUsers(data) {
    await fs.writeFile(USERS_FILE, JSON.stringify(data, null, 2));
}

// SUBMIT QUIZ RESULT
router.post('/submit', async (req, res) => {
    try {
        const { userId, userName, userEmail, chapterId, chapterTitle, quizId, answers, score, totalQuestions } = req.body;

        const resultsData = await readResults();

        const result = {
            id: Date.now().toString(),
            userId,
            userName,
            userEmail,
            chapterId,
            chapterTitle,
            quizId,
            answers, // Array of { questionId, question, userAnswer, correctAnswer, isCorrect }
            score,
            totalQuestions,
            percentage: ((score / totalQuestions) * 100).toFixed(2),
            submittedAt: new Date().toISOString()
        };

        resultsData.results.push(result);
        await writeResults(resultsData);

        res.json({ success: true, message: 'Quiz result submitted', result });
    } catch (error) {
        console.error('Submit result error:', error);
        res.status(500).json({ error: 'Failed to submit result' });
    }
});

// GET ALL RESULTS (Admin)
router.get('/all', async (req, res) => {
    try {
        const resultsData = await readResults();
        
        // Sort by most recent first
        const sortedResults = resultsData.results.sort((a, b) => 
            new Date(b.submittedAt) - new Date(a.submittedAt)
        );

        res.json(sortedResults);
    } catch (error) {
        console.error('Get results error:', error);
        res.status(500).json({ error: 'Failed to fetch results' });
    }
});

// GET RESULTS BY USER
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const resultsData = await readResults();
        
        const userResults = resultsData.results.filter(r => r.userId === userId);
        
        res.json(userResults);
    } catch (error) {
        console.error('Get user results error:', error);
        res.status(500).json({ error: 'Failed to fetch user results' });
    }
});

// GET STATISTICS (Admin Dashboard)
router.get('/statistics', async (req, res) => {
    try {
        const resultsData = await readResults();
        
        const stats = {
            totalAttempts: resultsData.results.length,
            uniqueStudents: [...new Set(resultsData.results.map(r => r.userId))].length,
            averageScore: resultsData.results.length > 0 
                ? (resultsData.results.reduce((sum, r) => sum + parseFloat(r.percentage), 0) / resultsData.results.length).toFixed(2)
                : 0,
            topPerformers: resultsData.results
                .sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage))
                .slice(0, 5)
                .map(r => ({
                    name: r.userName,
                    email: r.userEmail,
                    percentage: r.percentage,
                    chapter: r.chapterTitle
                }))
        };

        res.json(stats);
    } catch (error) {
        console.error('Get statistics error:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// DOWNLOAD QUIZ PDF WITH ANSWERS
router.get('/download-pdf/:resultId', async (req, res) => {
    try {
        const { resultId } = req.params;
        const resultsData = await readResults();
        
        const result = resultsData.results.find(r => r.id === resultId);
        
        if (!result) {
            return res.status(404).json({ error: 'Result not found' });
        }

        // Use jsPDF for better Unicode/Kannada support
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // Configure font for Unicode support
        // jsPDF with Helvetica supports UTF-8 encoding
        doc.setFont('helvetica');
        
        // Title
        doc.setFontSize(20);
        doc.text('Quiz Result Report', 105, 20, { align: 'center', encoding: 'UTF-8' });
        
        // Student Info Section
        doc.setFontSize(12);
        let yPosition = 35;
        doc.text(`Student Name: ${result.userName}`, 15, yPosition, { encoding: 'UTF-8' });
        yPosition += 8;
        doc.text(`Email: ${result.userEmail}`, 15, yPosition, { encoding: 'UTF-8' });
        yPosition += 8;
        doc.text(`Chapter: ${result.chapterTitle}`, 15, yPosition, { encoding: 'UTF-8' });
        yPosition += 8;
        doc.text(`Date: ${new Date(result.submittedAt).toLocaleString()}`, 15, yPosition, { encoding: 'UTF-8' });
        yPosition += 8;
        
        // Separator
        doc.setDrawColor(0);
        doc.line(15, yPosition, 195, yPosition);
        yPosition += 8;
        
        // Score Summary Section
        doc.setFontSize(14);
        doc.text('Score Summary', 15, yPosition, { encoding: 'UTF-8' });
        yPosition += 8;
        
        doc.setFontSize(11);
        doc.text(`Total Questions: ${result.totalQuestions}`, 15, yPosition, { encoding: 'UTF-8' });
        yPosition += 6;
        
        doc.setTextColor(0, 150, 0); // Green
        doc.text(`Correct Answers: ${result.score}`, 15, yPosition, { encoding: 'UTF-8' });
        yPosition += 6;
        
        doc.setTextColor(200, 0, 0); // Red
        doc.text(`Wrong Answers: ${result.totalQuestions - result.score}`, 15, yPosition, { encoding: 'UTF-8' });
        yPosition += 6;
        
        doc.setTextColor(0, 0, 0); // Black
        doc.text(`Percentage: ${result.percentage}%`, 15, yPosition, { encoding: 'UTF-8' });
        yPosition += 10;
        
        // Separator
        doc.setDrawColor(0);
        doc.line(15, yPosition, 195, yPosition);
        yPosition += 8;
        
        // Questions & Answers Section
        doc.setFontSize(14);
        doc.text('Questions & Answers', 15, yPosition, { encoding: 'UTF-8' });
        yPosition += 10;
        
        // Add each question
        result.answers.forEach((answer, index) => {
            // Check if we need a new page
            if (yPosition > 260) {
                doc.addPage();
                yPosition = 15;
            }
            
            // Question
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            const questionText = `Q${index + 1}. ${answer.question}`;
            const splitQuestion = doc.splitTextToSize(questionText, 180);
            doc.text(splitQuestion, 15, yPosition, { encoding: 'UTF-8' });
            yPosition += splitQuestion.length * 5 + 2;
            
            // User's Answer
            doc.setFontSize(10);
            doc.setTextColor(answer.isCorrect ? 0 : 0, answer.isCorrect ? 150 : 0, answer.isCorrect ? 0 : 150);
            const answerText = `Your Answer: ${answer.userAnswer}`;
            const splitAnswer = doc.splitTextToSize(answerText, 170);
            doc.text(splitAnswer, 20, yPosition, { encoding: 'UTF-8' });
            yPosition += splitAnswer.length * 5 + 2;
            
            // Correct Answer if wrong
            if (!answer.isCorrect) {
                doc.setTextColor(0, 150, 0); // Green
                const correctText = `Correct Answer: ${answer.correctAnswer}`;
                const splitCorrect = doc.splitTextToSize(correctText, 170);
                doc.text(splitCorrect, 20, yPosition, { encoding: 'UTF-8' });
                yPosition += splitCorrect.length * 5 + 2;
            }
            
            // Result indicator
            doc.setTextColor(answer.isCorrect ? 0 : 200, answer.isCorrect ? 150 : 0, answer.isCorrect ? 0 : 0);
            doc.text(answer.isCorrect ? '✓ Correct' : '✗ Wrong', 20, yPosition, { encoding: 'UTF-8' });
            yPosition += 8;
        });
        
        // Footer
        const pageCount = doc.internal.pages.length - 1;
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text('Generated by Kannada Learning App', 105, 285, { align: 'center', encoding: 'UTF-8' });
            doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
        }
        
        // Send PDF to client
        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=quiz-result-${resultId}.pdf`);
        res.send(pdfBuffer);

    } catch (error) {
        console.error('Download PDF error:', error);
        res.status(500).json({ error: 'Failed to generate PDF: ' + error.message });
    }
});

// DOWNLOAD ALL RESULTS CSV (Admin)
router.get('/download-csv', async (req, res) => {
    try {
        const resultsData = await readResults();
        
        // Create CSV content
        const csvHeader = 'Student Name,Email,Chapter,Score,Total Questions,Percentage,Date\n';
        const csvRows = resultsData.results.map(r => 
            `"${r.userName}","${r.userEmail}","${r.chapterTitle}",${r.score},${r.totalQuestions},${r.percentage},"${new Date(r.submittedAt).toLocaleString()}"`
        ).join('\n');
        
        const csv = csvHeader + csvRows;
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=all-results.csv');
        res.send(csv);
        
    } catch (error) {
        console.error('Download CSV error:', error);
        res.status(500).json({ error: 'Failed to generate CSV' });
    }
});

// RESET QUIZ ATTEMPTS (Admin)
router.post('/reset-quiz', async (req, res) => {
    try {
        const { userId, chapterId } = req.body;

        if (!userId || !chapterId) {
            return res.status(400).json({ error: 'userId and chapterId are required' });
        }

        // Read users data
        const usersData = await readUsers();
        const user = usersData.users.find(u => u.id === userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Initialize progress if not exists
        if (!user.progress) {
            user.progress = {};
        }

        // Initialize chapter progress if not exists
        if (!user.progress[chapterId]) {
            user.progress[chapterId] = {
                hasRead: false,
                quizAttempts: [],
                bestScore: 0
            };
        }

        // Reset quiz attempts for this chapter
        const chapterProgress = user.progress[chapterId];
        const previousAttempts = chapterProgress.quizAttempts.length;
        
        chapterProgress.quizAttempts = [];
        chapterProgress.bestScore = 0;
        chapterProgress.hasRead = false;  // Also reset the read status so student must read again

        // Write updated users data
        await writeUsers(usersData);

        console.log(`Quiz reset for user ${userId}, chapter ${chapterId}. Previous attempts: ${previousAttempts}`);

        res.json({
            success: true,
            message: 'Quiz attempts reset successfully',
            userId: userId,
            chapterId: chapterId,
            previousAttempts: previousAttempts
        });

    } catch (error) {
        console.error('Reset quiz error:', error);
        res.status(500).json({ error: 'Failed to reset quiz attempts' });
    }
});

module.exports = router;
