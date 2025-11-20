// Admin View Functions

let editingChapterId = null;
let currentQuizChapter = null;
let quizQuestions = [];

// Load chapters for admin view
async function loadAdminChapters() {
    const container = document.getElementById('admin-chapters-list');
    
    try {
        const chapters = await api.chapters.getAll();
        
        if (chapters.length === 0) {
            container.innerHTML = '<p>ಇನ್ನೂ ಯಾವುದೇ ಅಧ್ಯಾಯಗಳಿಲ್ಲ. ಮೇಲಿನ ಫಾರ್ಮ್ ಬಳಸಿ ಸೇರಿಸಿ.</p>';
            return;
        }

        chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);

        container.innerHTML = chapters.map(chapter => `
            <div class="admin-list-item">
                <div class="admin-list-item-info">
                    <h4>ಅಧ್ಯಾಯ ${chapter.chapterNumber}: ${chapter.title}</h4>
                    <p>${chapter.summary ? chapter.summary.substring(0, 100) + '...' : 'ಸಾರಾಂಶ ಇಲ್ಲ'}</p>
                </div>
                <div class="admin-list-item-actions">
                    <button class="btn btn-primary btn-small" onclick="editChapter(${chapter.id})">
                        ಸಂಪಾದಿಸಿ
                    </button>
                    <button class="btn btn-danger btn-small" onclick="deleteChapter(${chapter.id})">
                        ಅಳಿಸಿ
                    </button>
                </div>
            </div>
        `).join('');

        // Also update chapter dropdown in quiz tab
        await loadChapterDropdown();
    } catch (error) {
        container.innerHTML = '<p>ಅಧ್ಯಾಯಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ</p>';
        console.error('Error loading admin chapters:', error);
    }
}

// Handle chapter form submission
document.getElementById('chapter-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const chapterData = {
        chapterNumber: parseInt(document.getElementById('chapter-number').value),
        title: document.getElementById('chapter-title').value,
        studyMaterial: document.getElementById('chapter-content').value,
        summary: document.getElementById('chapter-summary').value
    };

    try {
        if (editingChapterId) {
            await api.chapters.update(editingChapterId, chapterData);
            alert('ಅಧ್ಯಾಯ ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ');
        } else {
            await api.chapters.create(chapterData);
            alert('ಅಧ್ಯಾಯ ಯಶಸ್ವಿಯಾಗಿ ಸೇರಿಸಲಾಗಿದೆ');
        }

        resetChapterForm();
        await loadAdminChapters();
    } catch (error) {
        alert('ದೋಷ: ಅಧ್ಯಾಯವನ್ನು ಉಳಿಸಲು ವಿಫಲವಾಗಿದೆ');
        console.error('Error saving chapter:', error);
    }
});

// Edit chapter
async function editChapter(id) {
    try {
        const chapter = await api.chapters.getById(id);
        
        editingChapterId = id;
        document.getElementById('chapter-id').value = id;
        document.getElementById('chapter-number').value = chapter.chapterNumber;
        document.getElementById('chapter-title').value = chapter.title;
        document.getElementById('chapter-content').value = chapter.studyMaterial;
        document.getElementById('chapter-summary').value = chapter.summary;

        // Scroll to form
        document.getElementById('chapter-form').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        alert('ಅಧ್ಯಾಯವನ್ನು ಲೋಡ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ');
        console.error('Error loading chapter for edit:', error);
    }
}

// Delete chapter
async function deleteChapter(id) {
    if (!confirm('ನೀವು ಈ ಅಧ್ಯಾಯವನ್ನು ಅಳಿಸಲು ಖಚಿತವಾಗಿ ಬಯಸುವಿರಾ?')) {
        return;
    }

    try {
        await api.chapters.delete(id);
        alert('ಅಧ್ಯಾಯ ಯಶಸ್ವಿಯಾಗಿ ಅಳಿಸಲಾಗಿದೆ');
        await loadAdminChapters();
    } catch (error) {
        alert('ಅಧ್ಯಾಯವನ್ನು ಅಳಿಸಲು ವಿಫಲವಾಗಿದೆ');
        console.error('Error deleting chapter:', error);
    }
}

// Reset chapter form
function resetChapterForm() {
    editingChapterId = null;
    document.getElementById('chapter-form').reset();
    document.getElementById('chapter-id').value = '';
}

// Load chapter dropdown for quiz
async function loadChapterDropdown() {
    const select = document.getElementById('quiz-chapter-select');
    
    try {
        const chapters = await api.chapters.getAll();
        chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);

        select.innerHTML = '<option value="">-- ಆಯ್ಕೆ ಮಾಡಿ --</option>' + 
            chapters.map(chapter => `
                <option value="${chapter.id}">ಅಧ್ಯಾಯ ${chapter.chapterNumber}: ${chapter.title}</option>
            `).join('');
    } catch (error) {
        console.error('Error loading chapters for dropdown:', error);
    }
}

// Load quiz for selected chapter
async function loadQuizForChapter() {
    const chapterId = parseInt(document.getElementById('quiz-chapter-select').value);
    
    if (!chapterId) {
        document.getElementById('quiz-form-container').style.display = 'none';
        return;
    }

    currentQuizChapter = chapterId;

    try {
        const quiz = await api.quizzes.getByChapterId(chapterId);
        
        if (quiz && quiz.questions) {
            quizQuestions = quiz.questions;
        } else {
            quizQuestions = [];
        }

        renderQuizForm();
        document.getElementById('quiz-form-container').style.display = 'block';
    } catch (error) {
        // Quiz doesn't exist yet, start with empty
        quizQuestions = [];
        renderQuizForm();
        document.getElementById('quiz-form-container').style.display = 'block';
    }
}

// Render quiz form
function renderQuizForm() {
    const container = document.getElementById('questions-container');

    if (quizQuestions.length === 0) {
        container.innerHTML = '<p>ಪ್ರಶ್ನೆಗಳನ್ನು ಸೇರಿಸಲು "+ ಪ್ರಶ್ನೆ ಸೇರಿಸಿ" ಬಟನ್ ಒತ್ತಿ</p>';
        return;
    }

    container.innerHTML = quizQuestions.map((q, index) => `
        <div class="question-item" id="question-${index}">
            <button type="button" class="btn btn-danger btn-small remove-question-btn" onclick="removeQuestion(${index})">
                ಅಳಿಸಿ
            </button>
            <h4>ಪ್ರಶ್ನೆ ${index + 1}</h4>
            
            <div class="form-group">
                <label>ಪ್ರಶ್ನೆ:</label>
                <input type="text" class="question-text" data-index="${index}" value="${q.question || ''}" required>
            </div>

            <div class="options-grid">
                <div class="form-group">
                    <label>ಆಯ್ಕೆ A:</label>
                    <input type="text" class="option-input" data-index="${index}" data-option="0" value="${q.options[0] || ''}" required>
                </div>
                <div class="form-group">
                    <label>ಆಯ್ಕೆ B:</label>
                    <input type="text" class="option-input" data-index="${index}" data-option="1" value="${q.options[1] || ''}" required>
                </div>
                <div class="form-group">
                    <label>ಆಯ್ಕೆ C:</label>
                    <input type="text" class="option-input" data-index="${index}" data-option="2" value="${q.options[2] || ''}" required>
                </div>
                <div class="form-group">
                    <label>ಆಯ್ಕೆ D:</label>
                    <input type="text" class="option-input" data-index="${index}" data-option="3" value="${q.options[3] || ''}" required>
                </div>
            </div>

            <div class="form-group">
                <label>ಸರಿಯಾದ ಉತ್ತರ:</label>
                <select class="correct-answer" data-index="${index}" required>
                    <option value="">-- ಆಯ್ಕೆ ಮಾಡಿ --</option>
                    <option value="A" ${q.correctAnswer === 'A' ? 'selected' : ''}>A</option>
                    <option value="B" ${q.correctAnswer === 'B' ? 'selected' : ''}>B</option>
                    <option value="C" ${q.correctAnswer === 'C' ? 'selected' : ''}>C</option>
                    <option value="D" ${q.correctAnswer === 'D' ? 'selected' : ''}>D</option>
                </select>
            </div>

            <div class="form-group">
                <label>ವಿವರಣೆ (ಐಚ್ಛಿಕ):</label>
                <textarea class="explanation" data-index="${index}" rows="2">${q.explanation || ''}</textarea>
            </div>
        </div>
    `).join('');
}

// Add new question
function addQuestion() {
    quizQuestions.push({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        explanation: ''
    });
    renderQuizForm();
}

// Remove question
function removeQuestion(index) {
    if (confirm('ಈ ಪ್ರಶ್ನೆಯನ್ನು ಅಳಿಸಲು ಖಚಿತವಾಗಿ ಬಯಸುವಿರಾ?')) {
        quizQuestions.splice(index, 1);
        renderQuizForm();
    }
}

// Handle quiz form submission
document.getElementById('quiz-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Collect all question data from form
    const questions = [];
    
    document.querySelectorAll('.question-item').forEach((item, index) => {
        const question = item.querySelector('.question-text').value;
        const options = Array.from(item.querySelectorAll('.option-input')).map(input => input.value);
        const correctAnswer = item.querySelector('.correct-answer').value;
        const explanation = item.querySelector('.explanation').value;

        questions.push({
            question,
            options,
            correctAnswer,
            explanation
        });
    });

    if (questions.length === 0) {
        alert('ದಯವಿಟ್ಟು ಕನಿಷ್ಠ ಒಂದು ಪ್ರಶ್ನೆಯನ್ನು ಸೇರಿಸಿ');
        return;
    }

    const quizData = {
        chapterId: currentQuizChapter,
        questions: questions
    };

    try {
        await api.quizzes.save(quizData);
        alert('ಪರೀಕ್ಷೆ ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ');
        quizQuestions = [];
        document.getElementById('quiz-chapter-select').value = '';
        document.getElementById('quiz-form-container').style.display = 'none';
    } catch (error) {
        alert('ಪರೀಕ್ಷೆಯನ್ನು ಉಳಿಸಲು ವಿಫಲವಾಗಿದೆ');
        console.error('Error saving quiz:', error);
    }
});

// Export functions
window.loadAdminChapters = loadAdminChapters;
window.editChapter = editChapter;
window.deleteChapter = deleteChapter;
window.resetChapterForm = resetChapterForm;
window.loadChapterDropdown = loadChapterDropdown;
window.loadQuizForChapter = loadQuizForChapter;
window.addQuestion = addQuestion;
window.removeQuestion = removeQuestion;
