// Student View Functions

let currentChapter = null;
let currentQuiz = null;
let userAnswers = [];
let currentUser = null;
let studentProgress = {};

// Check authentication on page load
window.addEventListener('DOMContentLoaded', async () => {
    const user = localStorage.getItem('user');
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    currentUser = JSON.parse(user);
    
    // Auto-refresh user data if missing mobile or schoolCollege
    if (!currentUser.mobile || !currentUser.schoolCollege) {
        try {
            const token = localStorage.getItem('authToken');
            if (token && currentUser.id) {
                const response = await fetch(`${window.API_URL}/api/auth/user/${currentUser.id}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const freshUserData = await response.json();
                    currentUser = {
                        ...currentUser,
                        ...freshUserData
                    };
                    localStorage.setItem('user', JSON.stringify(currentUser));
                }
            }
        } catch (error) {
            console.error('Error auto-refreshing user data:', error);
        }
    }
    
    loadStudentProgress();
    // Sync progress from server on page load to pick up any admin resets
    await syncProgressFromServer();
    displayUserInfo();
    displayStudentStats();
});

function displayUserInfo() {
    const userInfoEl = document.getElementById('user-info');
    if (userInfoEl && currentUser) {
        userInfoEl.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="background: rgba(255,255,255,0.95); padding: 8px 16px; border-radius: 20px; display: flex; align-items: center; gap: 10px; cursor: pointer; transition: all 0.3s; hover:shadow;" onclick="openUserProfileModal()">
                    <span style="font-size: 20px;">👤</span>
                    <span style="font-weight: 500; color: #2c3e50;">Welcome, ${currentUser.firstName}!</span>
                </div>
                <button onclick="logout()" style="
                    background: #e74c3c;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    font-weight: 600;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.3s;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                " onmouseover="this.style.background='#c0392b'; this.style.transform='scale(1.05)'" 
                   onmouseout="this.style.background='#e74c3c'; this.style.transform='scale(1)'">
                    🚪 Logout
                </button>
            </div>
        `;
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // Add logout animation
        const userInfoEl = document.getElementById('user-info');
        if (userInfoEl) {
            userInfoEl.style.opacity = '0';
            userInfoEl.style.transition = 'opacity 0.3s';
        }
        
        setTimeout(() => {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        }, 300);
    }
}

// Load student progress from localStorage
function loadStudentProgress() {
    const saved = localStorage.getItem(`progress_${currentUser.id}`);
    if (saved) {
        studentProgress = JSON.parse(saved);
    }
}

// Sync progress from server to get latest updates (e.g., after admin reset)
// IMPORTANT: This should only be called when we NEED to check locks, not when student just marked as read
async function syncProgressFromServer() {
    try {
        const token = localStorage.getItem('authToken');
        if (!token || !currentUser?.id) return;
        
        const response = await fetch(`${window.API_URL}/auth/user/${currentUser.id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const userData = await response.json();
            if (userData.progress) {
                // Merge server data with local data - don't overwrite fresh local hasRead flags
                const mergedProgress = { ...userData.progress };
                
                // Keep local hasRead=true if it's already true (student just marked it)
                for (const chapterId in studentProgress) {
                    if (studentProgress[chapterId]?.hasRead && 
                        (!mergedProgress[chapterId] || !mergedProgress[chapterId].hasRead)) {
                        // Keep the local hasRead=true
                        if (mergedProgress[chapterId]) {
                            mergedProgress[chapterId].hasRead = true;
                        }
                    }
                }
                
                studentProgress = mergedProgress;
                saveStudentProgress();
                console.log('✅ Progress synced from server (merged with local data)');
            }
        }
    } catch (error) {
        console.log('Could not sync progress from server:', error);
        // Continue with local progress if sync fails
    }
}

// Save student progress to server (called after quiz submission to persist score)
async function saveProgressToServer() {
    try {
        const token = localStorage.getItem('authToken');
        if (!token || !currentUser?.id) {
            console.warn('⚠️ Cannot save progress to server: no token or user id');
            return;
        }

        console.log('📤 Saving progress to server:', studentProgress);

        const response = await fetch(`${window.API_URL}/auth/user/${currentUser.id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ progress: studentProgress })
        });

        if (response.ok) {
            console.log('✅ Progress saved to server successfully');
            return true;
        } else {
            console.warn('⚠️ Failed to save progress to server:', response.status);
            return false;
        }
    } catch (error) {
        console.error('Error saving progress to server:', error);
        return false;
    }
}

// Save student progress to localStorage
function saveStudentProgress() {
    localStorage.setItem(`progress_${currentUser.id}`, JSON.stringify(studentProgress));
}

// Update chapter progress
function updateChapterProgress(chapterId, hasRead = null, quizScore = null) {
    // Initialize if doesn't exist
    if (!studentProgress[chapterId]) {
        studentProgress[chapterId] = {
            hasRead: false,
            quizAttempts: [],
            bestScore: 0
        };
    }
    
    // Only update hasRead if explicitly set to true
    if (hasRead === true) {
        studentProgress[chapterId].hasRead = true;
        console.log(`✅ Chapter ${chapterId} marked as read`);
    }
    
    // Add quiz score if provided
    if (quizScore !== null) {
        studentProgress[chapterId].quizAttempts.push({
            score: quizScore,
            date: new Date().toISOString()
        });
        studentProgress[chapterId].bestScore = Math.max(
            studentProgress[chapterId].bestScore || 0,
            quizScore
        );
        console.log(`✅ Quiz score ${quizScore}% added to chapter ${chapterId}`);
    }
    
    // Log current progress
    const currentProgress = getChapterProgress(chapterId);
    console.log(`📊 Chapter ${chapterId} progress: ${currentProgress}% (hasRead: ${studentProgress[chapterId].hasRead}, quizAttempts: ${studentProgress[chapterId].quizAttempts.length})`);
    
    saveStudentProgress();
    displayStudentStats();
}

// Get chapter progress percentage
// Progress = 50% for reading + 50% for passing the quiz (>= 50%)
function getChapterProgress(chapterId) {
    const progress = studentProgress[chapterId];
    if (!progress) return 0;
    
    let percentage = 0;
    
    // 50% for reading
    if (progress.hasRead) {
        percentage += 50;
    }
    
    // 50% only if best quiz score is passing (>= 50%)
    if (progress.bestScore >= 50) {
        percentage += 50;
    }
    
    return percentage;
}

// Get chapter status
function getChapterStatus(chapterId) {
    const progress = getChapterProgress(chapterId);
    const data = studentProgress[chapterId];
    
    // Completed: 100% (read + passed quiz)
    if (progress === 100) {
        return { status: 'completed', label: '✓ Completed', icon: '🏆' };
    }
    
    // In Progress: Attempted quiz but failed
    if (data?.bestScore > 0 && data.bestScore < 50) {
        return { status: 'failed', label: '❌ Failed - Retake Quiz', icon: '📉' };
    }
    
    // In Progress: Reading or attempted but not passed
    if (progress > 0 && progress < 100) {
        return { status: 'in-progress', label: '⏳ In Progress', icon: '📖' };
    }
    
    // Not started
    return { status: 'not-started', label: '🆕 New', icon: '✨' };
}

// Display student statistics
async function displayStudentStats() {
    const statsContainer = document.getElementById('student-stats');
    if (!statsContainer) return;
    
    try {
        const chapters = await api.chapters.getAll();
        const totalChapters = chapters.length;
        const completedChapters = chapters.filter(ch => getChapterProgress(ch.id) === 100).length;
        const inProgressChapters = chapters.filter(ch => {
            const prog = getChapterProgress(ch.id);
            return prog > 0 && prog < 100;
        }).length;
        
        statsContainer.innerHTML = `
            <div class="stat-card">
                <div class="stat-icon">📚</div>
                <div class="stat-number">${totalChapters}</div>
                <div class="stat-label">Total Chapters</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🏆</div>
                <div class="stat-number">${completedChapters}</div>
                <div class="stat-label">Completed</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">📖</div>
                <div class="stat-number">${inProgressChapters}</div>
                <div class="stat-label">In Progress</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🎯</div>
                <div class="stat-number">${totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0}%</div>
                <div class="stat-label">Progress</div>
            </div>
        `;
    } catch (error) {
        console.error('Error displaying stats:', error);
    }
}

// Load all chapters for student view
async function loadChapters() {
    const container = document.getElementById('chapters-list');
    
    try {
        const chapters = await api.chapters.getAll();
        
        if (chapters.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px; background: white; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
                    <div style="font-size: 4em; margin-bottom: 20px;">📚</div>
                    <h3 style="color: #666; font-size: 1.5em;">ಇನ್ನೂ ಯಾವುದೇ ಅಧ್ಯಾಯಗಳಿಲ್ಲ</h3>
                    <p style="color: #999;">Chapters will appear here soon!</p>
                </div>
            `;
            return;
        }

        // Sort chapters by chapter number
        chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);

        container.innerHTML = chapters.map(chapter => {
            const progress = getChapterProgress(chapter.id);
            const status = getChapterStatus(chapter.id);
            const chapterData = studentProgress[chapter.id];
            const bestScore = chapterData?.bestScore || 0;
            const attempts = chapterData?.quizAttempts?.length || 0;
            
            return `
                <div class="chapter-card">
                    <div class="chapter-header">
                        <span class="chapter-number">Chapter ${chapter.chapterNumber}</span>
                        <h3 class="chapter-title">${chapter.title}</h3>
                        
                        <div class="chapter-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${progress}%"></div>
                            </div>
                            <div class="progress-text">
                                <span>${progress}% Complete</span>
                                <span>${status.icon}</span>
                            </div>
                        </div>
                        
                        <span class="status-badge ${status.status}">
                            ${status.label}
                        </span>
                        
                        ${attempts > 0 ? `
                            <div style="margin-top: 15px; padding: 12px; background: ${bestScore >= 50 ? 'rgba(67, 233, 123, 0.1)' : 'rgba(231, 76, 60, 0.1)'}; border-radius: 12px; border-left: 4px solid ${bestScore >= 50 ? '#43e97b' : '#e74c3c'};">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="color: #666; font-size: 0.9em;">${bestScore >= 50 ? '✅ Best Score:' : '❌ Best Score:'}</span>
                                    <span style="color: ${bestScore >= 50 ? '#27ae60' : '#e74c3c'}; font-weight: 700; font-size: 1.1em;">${bestScore}%</span>
                                </div>
                                <div style="color: #999; font-size: 0.85em; margin-top: 5px;">
                                    ${bestScore >= 50 ? '✅ Passed!' : '❌ Failed - Retake (>= 50% to pass)'} | 📝 ${attempts} attempt${attempts > 1 ? 's' : ''}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="chapter-actions">
                        <button class="action-btn btn-read" onclick="openChapterToRead(${chapter.id})">
                            <span class="btn-icon">📖</span>
                            <span>Read</span>
                        </button>
                        ${(() => {
                            const isReadingRequired = !chapterData?.hasRead;
                            const attempts = chapterData?.quizAttempts?.length || 0;
                            const bestScore = chapterData?.bestScore || 0;
                            const firstAttemptScore = chapterData?.quizAttempts?.[0]?.score || 0;
                            const passedOnFirstAttempt = attempts === 1 && firstAttemptScore >= 50;
                            const hasAttempts = attempts >= 2;
                            const allFailed = hasAttempts && chapterData.quizAttempts.every(a => a.score < 50);
                            
                            if (isReadingRequired) {
                                return `<button class="action-btn btn-quiz" onclick="startChapterQuiz(${chapter.id})" style="opacity: 0.6; position: relative;">
                                    <span class="btn-icon">🔒</span>
                                    <span>Locked</span>
                                    <div style="position: absolute; top: -8px; right: -8px; background: #e74c3c; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 0.8em; font-weight: 700; box-shadow: 0 2px 8px rgba(231, 76, 60, 0.4);">!</div>
                                </button>`;
                            } else if (passedOnFirstAttempt) {
                                return `<button class="action-btn btn-quiz" onclick="alert('✅ Already passed! You cannot retake a quiz after passing on the first attempt.')" style="opacity: 0.5; position: relative; cursor: not-allowed;">
                                    <span class="btn-icon">✅</span>
                                    <span>Passed</span>
                                    <div style="position: absolute; top: -8px; right: -8px; background: #27ae60; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 0.8em; font-weight: 700; box-shadow: 0 2px 8px rgba(39, 174, 96, 0.4);">✓</div>
                                </button>`;
                            } else if (allFailed) {
                                return `<button class="action-btn btn-quiz" onclick="startChapterQuiz(${chapter.id})" style="opacity: 0.5; position: relative;">
                                    <span class="btn-icon">🔒</span>
                                    <span>Failed</span>
                                    <div style="position: absolute; top: -8px; right: -8px; background: #e74c3c; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 0.8em; font-weight: 700; box-shadow: 0 2px 8px rgba(231, 76, 60, 0.4);">×</div>
                                </button>`;
                            } else {
                                return `<button class="action-btn btn-quiz" onclick="startChapterQuiz(${chapter.id})">
                                    <span class="btn-icon">🎯</span>
                                    <span>Quiz</span>
                                </button>`;
                            }
                        })()}
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px; background: white; border-radius: 20px;">
                <div style="font-size: 4em; margin-bottom: 20px;">⚠️</div>
                <h3 style="color: #e74c3c;">ದೋಷ</h3>
                <p style="color: #999;">Failed to load chapters. Please try again.</p>
                <button onclick="loadChapters()" style="margin-top: 20px; padding: 12px 30px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 25px; cursor: pointer; font-weight: 600;">
                    🔄 Retry
                </button>
            </div>
        `;
        console.error('Error loading chapters:', error);
    }
}

// Open chapter to read
async function openChapterToRead(chapterId) {
    try {
        currentChapter = await api.chapters.getById(chapterId);
        
        const modal = document.getElementById('chapter-modal');
        const detailContainer = document.getElementById('chapter-detail');

        detailContainer.innerHTML = `
            <div style="max-width: 900px; margin: 0 auto;">
                <div style="text-align: center; margin-bottom: 40px; padding: 30px; background: linear-gradient(135deg, #667eea20, #764ba220); border-radius: 20px;">
                    <div style="font-size: 3em; margin-bottom: 15px;">📚</div>
                    <h2 style="color: #667eea; font-size: 2em; margin-bottom: 10px;">
                        ಅಧ್ಯಾಯ ${currentChapter.chapterNumber}
                    </h2>
                    <h3 style="color: #333; font-size: 1.5em;">${currentChapter.title}</h3>
                </div>

                <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); margin-bottom: 30px;">
                    <h3 style="color: #667eea; font-size: 1.8em; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                        <span>📖</span> ಅಧ್ಯಯನ ವಿಷಯ
                    </h3>
                    <div style="color: #333; font-size: 1.1em; line-height: 1.8; white-space: pre-wrap;">
                        ${currentChapter.studyMaterial}
                    </div>
                </div>

                <div style="background: linear-gradient(135deg, #43e97b20, #38f9d720); padding: 30px; border-radius: 20px; border-left: 5px solid #43e97b; margin-bottom: 30px;">
                    <h3 style="color: #27ae60; font-size: 1.5em; margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                        <span>💡</span> ಸಾರಾಂಶ
                    </h3>
                    <div style="color: #333; font-size: 1.05em; line-height: 1.7; white-space: pre-wrap;">
                        ${currentChapter.summary}
                    </div>
                </div>

                <div style="text-align: center;">
                    <button onclick="markAsReadAndClose(${currentChapter.id})" style="
                        padding: 18px 50px;
                        background: linear-gradient(135deg, #43e97b, #38f9d7);
                        color: white;
                        border: none;
                        border-radius: 30px;
                        font-size: 1.2em;
                        font-weight: 600;
                        cursor: pointer;
                        box-shadow: 0 8px 25px rgba(67, 233, 123, 0.4);
                        transition: all 0.3s ease;
                    " onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 12px 35px rgba(67, 233, 123, 0.5)'"
                       onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 25px rgba(67, 233, 123, 0.4)'">
                        ✓ Mark as Read & Close
                    </button>
                </div>
            </div>
        `;

        modal.classList.add('active');
    } catch (error) {
        alert('Failed to load chapter. Please try again.');
        console.error('Error loading chapter:', error);
    }
}

// Mark chapter as read and close
function markAsReadAndClose(chapterId) {
    console.log(`📝 Marking chapter ${chapterId} as read...`);
    
    // Update progress: set hasRead to true and clear attempts/score if this is after a reset
    const chapterProgress = studentProgress[chapterId];
    if (!chapterProgress) {
        studentProgress[chapterId] = {
            hasRead: false,
            quizAttempts: [],
            bestScore: 0
        };
    }
    
    // Mark as read
    studentProgress[chapterId].hasRead = true;
    console.log(`✅ Chapter ${chapterId} marked as read: ${JSON.stringify(studentProgress[chapterId])}`);
    
    // Save to localStorage immediately
    saveStudentProgress();
    
    // Close modal and reload chapters to reflect changes
    closeChapterModal();
    
    // Reload chapters to show quiz button (not read-first modal)
    loadChapters();
    
    console.log(`📊 After marking read - Progress: ${JSON.stringify(studentProgress[chapterId])}`);
}

// Start chapter quiz
async function startChapterQuiz(chapterId) {
    try {
        // CRITICAL: Check local progress FIRST (before sync)
        // This prevents sync from overwriting fresh local data with stale server data
        let progress = studentProgress[chapterId];
        
        // If chapter exists locally and hasRead=true, DON'T sync 
        // (student just marked it as read, don't fetch old server data)
        if (progress && progress.hasRead) {
            console.log(`✅ Chapter ${chapterId} marked as read locally, proceeding to quiz...`);
        } else {
            // No local data or not read - sync from server to get latest state
            console.log(`📡 Syncing progress from server for chapter ${chapterId}...`);
            await syncProgressFromServer();
            progress = studentProgress[chapterId];
        }
        
        // Check if chapter has been read
        if (!progress || !progress.hasRead) {
            console.log(`❌ Chapter ${chapterId} not read. Showing read-first modal.`);
            showReadFirstModal(chapterId);
            return;
        }
        
        console.log(`✅ Chapter ${chapterId} is read. Checking attempt locks...`);
        
        // Check if already passed on first attempt
        if (progress.quizAttempts && progress.quizAttempts.length === 1) {
            const firstAttemptScore = progress.quizAttempts[0]?.score || 0;
            if (firstAttemptScore >= 50) {
                console.log(`✅ Chapter ${chapterId} already passed on first attempt - no retakes allowed.`);
                showAlreadyPassedModal(chapterId);
                return;
            }
        }
        
        // Check if already failed twice
        if (progress.quizAttempts && progress.quizAttempts.length >= 2) {
            // Check if both attempts failed (score < 50)
            const allFailed = progress.quizAttempts.every(attempt => attempt.score < 50);
            if (allFailed) {
                console.log(`❌ Chapter ${chapterId} locked - 2 failed attempts.`);
                showQuizLockedModal(chapterId);
                return;
            }
        }
        
        console.log(`🎯 Chapter ${chapterId} ready for quiz. Attempts: ${progress.quizAttempts?.length || 0}`);
        currentChapter = await api.chapters.getById(chapterId);
        await startQuiz(chapterId);
    } catch (error) {
        alert('Failed to load quiz. Please try again.');
        console.error('Error starting quiz:', error);
    }
}

// Show modal prompting to read first
function showReadFirstModal(chapterId) {
    const modal = document.getElementById('chapter-modal');
    const detailContainer = document.getElementById('chapter-detail');
    
    detailContainer.innerHTML = `
        <div style="text-align: center; padding: 60px 40px; max-width: 600px; margin: 0 auto;">
            <div style="font-size: 5em; margin-bottom: 30px; animation: bounce 1s ease infinite;">📚</div>
            <h2 style="color: #667eea; font-size: 2.5em; margin-bottom: 20px;">
                Oops! Read First! 📖
            </h2>
            <p style="color: #666; font-size: 1.3em; line-height: 1.8; margin-bottom: 30px;">
                You need to <strong style="color: #f5576c;">read the chapter</strong> before taking the quiz!
                <br><br>
                📚 Reading helps you learn better<br>
                🎯 Then you'll ace the quiz!
            </p>
            
            <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
                <button onclick="closeChapterModal(); openChapterToRead(${chapterId})" style="
                    padding: 20px 40px;
                    background: linear-gradient(135deg, #43e97b, #38f9d7);
                    color: white;
                    border: none;
                    border-radius: 30px;
                    font-size: 1.3em;
                    font-weight: 600;
                    cursor: pointer;
                    box-shadow: 0 8px 25px rgba(67, 233, 123, 0.4);
                    transition: all 0.3s ease;
                " onmouseover="this.style.transform='translateY(-5px) scale(1.05)'"
                   onmouseout="this.style.transform='translateY(0) scale(1)'">
                    📖 Read Chapter Now
                </button>
                
                <button onclick="closeChapterModal()" style="
                    padding: 20px 40px;
                    background: linear-gradient(135deg, #a29bfe, #6c5ce7);
                    color: white;
                    border: none;
                    border-radius: 30px;
                    font-size: 1.3em;
                    font-weight: 600;
                    cursor: pointer;
                    box-shadow: 0 8px 25px rgba(108, 92, 231, 0.4);
                    transition: all 0.3s ease;
                " onmouseover="this.style.transform='translateY(-5px) scale(1.05)'"
                   onmouseout="this.style.transform='translateY(0) scale(1)'">
                    🏠 Back to Dashboard
                </button>
            </div>
            
            <div style="margin-top: 40px; padding: 25px; background: linear-gradient(135deg, #ffeaa720, #fdcb6e20); border-radius: 20px; border-left: 5px solid #fdcb6e;">
                <p style="color: #666; font-size: 1.1em; margin: 0;">
                    💡 <strong>Pro Tip:</strong> Take notes while reading to remember better!
                </p>
            </div>
        </div>
        
        <style>
            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-20px); }
            }
        </style>
    `;
    
    modal.classList.add('active');
}

// Show modal when quiz is locked due to 2 failed attempts
function showQuizLockedModal(chapterId) {
    const modal = document.getElementById('chapter-modal');
    const detailContainer = document.getElementById('chapter-detail');
    const progress = studentProgress[chapterId];
    
    detailContainer.innerHTML = `
        <div style="text-align: center; padding: 60px 40px; max-width: 600px; margin: 0 auto;">
            <div style="font-size: 5em; margin-bottom: 30px;">🔒</div>
            <h2 style="color: #e74c3c; font-size: 2.5em; margin-bottom: 20px;">
                Quiz Locked! ❌
            </h2>
            <p style="color: #666; font-size: 1.3em; line-height: 1.8; margin-bottom: 30px;">
                Unfortunately, you have failed this quiz <strong style="color: #e74c3c;">twice</strong>.
                <br><br>
                📊 Attempts: 2/2<br>
                Best Score: ${progress?.bestScore || 0}%<br>
                Required: 50% or more
            </p>
            
            <div style="background: #ffe5e5; padding: 20px; border-radius: 15px; margin-bottom: 30px; border-left: 5px solid #e74c3c;">
                <p style="color: #c0392b; font-size: 1.1em; margin: 0;">
                    <strong>💡 Tip:</strong> Re-read the chapter carefully and practice more before trying again!
                </p>
            </div>
            
            <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
                <button onclick="closeChapterModal(); openChapterToRead(${chapterId})" style="
                    padding: 20px 40px;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    border: none;
                    border-radius: 30px;
                    font-size: 1.3em;
                    font-weight: 600;
                    cursor: pointer;
                    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
                    transition: all 0.3s ease;
                " onmouseover="this.style.transform='translateY(-5px) scale(1.05)'"
                   onmouseout="this.style.transform='translateY(0) scale(1)'">
                    📖 Re-read Chapter
                </button>
                
                <button onclick="closeChapterModal()" style="
                    padding: 20px 40px;
                    background: linear-gradient(135deg, #95a5a6, #7f8c8d);
                    color: white;
                    border: none;
                    border-radius: 30px;
                    font-size: 1.3em;
                    font-weight: 600;
                    cursor: pointer;
                    box-shadow: 0 8px 25px rgba(127, 140, 141, 0.4);
                    transition: all 0.3s ease;
                " onmouseover="this.style.transform='translateY(-5px) scale(1.05)'"
                   onmouseout="this.style.transform='translateY(0) scale(1)'">
                    🏠 Back to Dashboard
                </button>
            </div>
            
            <div style="margin-top: 40px; padding: 20px; background: #f0f9ff; border-radius: 15px; border-left: 5px solid #3498db;">
                <p style="color: #2c3e50; font-size: 0.95em; margin: 0; line-height: 1.6;">
                    <strong>Note:</strong> Contact your instructor if you believe this is an error or if you need assistance.
                </p>
            </div>
        </div>
        
        <style>
            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-20px); }
            }
        </style>
    `;
    
    modal.classList.add('active');
}

// Show modal when student already passed on first attempt
function showAlreadyPassedModal(chapterId) {
    const modal = document.getElementById('chapter-modal');
    const detailContainer = document.getElementById('chapter-detail');
    const progress = studentProgress[chapterId];
    
    detailContainer.innerHTML = `
        <div style="text-align: center; padding: 60px 40px; max-width: 600px; margin: 0 auto;">
            <div style="font-size: 5em; margin-bottom: 30px; animation: bounce 0.6s ease infinite;">✅</div>
            <h2 style="color: #27ae60; font-size: 2.5em; margin-bottom: 20px;">
                Already Passed! 🎉
            </h2>
            <p style="color: #666; font-size: 1.3em; line-height: 1.8; margin-bottom: 30px;">
                Congratulations! You have already <strong style="color: #27ae60;">passed this quiz</strong> on your first attempt!
                <br><br>
                🏆 Score: ${progress?.bestScore || 0}%<br>
                ✅ Status: Completed<br>
                📝 Attempts: 1/1
            </p>
            
            <div style="background: #e8f8f5; padding: 20px; border-radius: 15px; margin-bottom: 30px; border-left: 5px solid #27ae60;">
                <p style="color: #186a3b; font-size: 1.1em; margin: 0;">
                    <strong>💡 Info:</strong> No retakes allowed. You've already completed this chapter successfully!
                </p>
            </div>
            
            <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
                <button onclick="closeChapterModal()" style="
                    padding: 20px 40px;
                    background: linear-gradient(135deg, #27ae60, #1e8449);
                    color: white;
                    border: none;
                    border-radius: 30px;
                    font-size: 1.3em;
                    font-weight: 600;
                    cursor: pointer;
                    box-shadow: 0 8px 25px rgba(39, 174, 96, 0.4);
                    transition: all 0.3s ease;
                " onmouseover="this.style.transform='translateY(-5px) scale(1.05)'"
                   onmouseout="this.style.transform='translateY(0) scale(1)'">
                    🏠 Back to Dashboard
                </button>
            </div>
            
            <div style="margin-top: 40px; padding: 20px; background: #fef9e7; border-radius: 15px; border-left: 5px solid #f39c12;">
                <p style="color: #2c3e50; font-size: 0.95em; margin: 0; line-height: 1.6;">
                    <strong>Tip:</strong> Move on to the next chapter to continue your learning journey!
                </p>
            </div>
        </div>
        
        <style>
            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-20px); }
            }
        </style>
    `;
    
    modal.classList.add('active');
}

// Open chapter detail modal (legacy support)
async function openChapter(chapterId) {
    await openChapterToRead(chapterId);
}

// Close chapter modal
function closeChapterModal() {
    document.getElementById('chapter-modal').classList.remove('active');
    // Don't reset currentChapter to null - it's needed for quiz submission
    // currentChapter will be reset when a new chapter is selected
}

// Start quiz
async function startQuiz(chapterId) {
    try {
        console.log('📝 Loading quiz for chapter:', chapterId);
        currentQuiz = await api.quizzes.getByChapterId(chapterId);
        console.log('✅ Quiz loaded:', currentQuiz);
        
        if (!currentQuiz || !currentQuiz.questions || currentQuiz.questions.length === 0) {
            console.error('❌ Quiz is empty or missing questions');
            alert('ಈ ಅಧ್ಯಾಯಕ್ಕೆ ಇನ್ನೂ ಪರೀಕ್ಷೆ ಇಲ್ಲ');
            return;
        }
        
        if (!currentQuiz.id) {
            console.warn('⚠️ Quiz is missing id field, using chapterId as fallback');
            currentQuiz.id = chapterId;
        }

        userAnswers = new Array(currentQuiz.questions.length).fill('');
        
        const modal = document.getElementById('quiz-modal');
        const quizContainer = document.getElementById('quiz-content');

        console.log(`\n📋 LOADING QUIZ FOR CHAPTER ${currentChapter.chapterNumber}:`);
        console.log(`Total Questions: ${currentQuiz.questions.length}`);
        
        currentQuiz.questions.forEach((q, idx) => {
            console.log(`  Q${idx + 1}: ${q.options.length} options - Correct: ${q.correctAnswer}`);
        });

        quizContainer.innerHTML = `
            <div class="quiz-container">
                <div class="quiz-header">
                    <h2>ಅಧ್ಯಾಯ ${currentChapter.chapterNumber} - ಪರೀಕ್ಷೆ</h2>
                    <p>ಒಟ್ಟು ಪ್ರಶ್ನೆಗಳು: ${currentQuiz.questions.length}</p>
                </div>

                <form id="quiz-form-student" onsubmit="submitQuiz(event)">
                    ${currentQuiz.questions.map((q, index) => {
                        // Validate question structure
                        if (!q.options || !Array.isArray(q.options)) {
                            console.error(`❌ Q${index + 1}: Missing or invalid options`);
                            return `<div class="quiz-question"><p>❌ Error loading question ${index + 1}</p></div>`;
                        }

                        console.log(`✅ Q${index + 1}: ${q.options.length} options loaded`);

                        return `
                            <div class="quiz-question">
                                <h4>ಪ್ರಶ್ನೆ ${index + 1}: ${q.question}</h4>
                                <div class="quiz-options">
                                    ${q.options.map((option, optIndex) => {
                                        const optionLetter = String.fromCharCode(65 + optIndex); // A, B, C, D
                                        return `
                                            <div class="quiz-option">
                                                <input 
                                                    type="radio" 
                                                    name="question-${index}" 
                                                    value="${optionLetter}"
                                                    id="q${index}-opt${optIndex}"
                                                    onchange="saveAnswer(${index}, '${optionLetter}')"
                                                >
                                                <label for="q${index}-opt${optIndex}">
                                                    ${optionLetter}. ${option}
                                                </label>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        `;
                    }).join('')}

                    <button type="submit" class="btn btn-primary btn-block">
                        ಪರೀಕ್ಷೆ ಸಲ್ಲಿಸಿ (Submit Quiz)
                    </button>
                </form>
            </div>
        `;

        // Close chapter modal and open quiz modal
        closeChapterModal();
        modal.classList.add('active');
    } catch (error) {
        alert('ಪರೀಕ್ಷೆಯನ್ನು ಲೋಡ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ');
        console.error('Error loading quiz:', error);
    }
}

// Save user answer
function saveAnswer(questionIndex, answer) {
    userAnswers[questionIndex] = answer;
    console.log(`Saved answer for Q${questionIndex + 1}: ${answer}`);
}

// Submit quiz - Complete rewrite
async function submitQuiz(event) {
    event.preventDefault();

    console.log('\n=== QUIZ SUBMISSION START ===');
    console.log('Current Chapter:', currentChapter);
    console.log('Current Quiz:', currentQuiz);
    console.log('User Answers:', userAnswers);

    // Validate chapter
    if (!currentChapter || !currentChapter.id) {
        console.error('❌ currentChapter is invalid');
        alert('Error: Chapter information is missing. Please start the quiz again.');
        return;
    }

    // Validate quiz
    if (!currentQuiz || !currentQuiz.questions || !Array.isArray(currentQuiz.questions)) {
        console.error('❌ currentQuiz is invalid');
        alert('Error: Quiz information is missing. Please start the quiz again.');
        return;
    }

    // Check all answered
    const unanswered = userAnswers.findIndex(ans => !ans || ans === '');
    if (unanswered !== -1) {
        alert(`ದಯವಿಟ್ಟು ಎಲ್ಲಾ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಿಸಿ. ಪ್ರಶ್ನೆ ${unanswered + 1} ಉತ್ತರಿಸಿಲ್ಲ.`);
        return;
    }

    try {
        console.log(`📤 Submitting to: /api/quizzes/${currentChapter.id}/submit`);
        console.log(`📝 Answers count: ${userAnswers.length}`);
        
        // Call backend
        const results = await api.quizzes.submit(currentChapter.id, userAnswers);
        
        if (!results.success) {
            throw new Error('Server returned success=false');
        }
        
        console.log('✅ Server response:', results);

        // Update progress
        updateChapterProgress(currentChapter.id, null, results.percentage);

        // Save to database
        await saveResultToDatabase(results);
        
        // CRITICAL: Persist progress to server so it survives page refreshes
        await saveProgressToServer();
        
        // Show results
        showResults(results);

        // Reload
        setTimeout(() => {
            loadChapters();
        }, 2000);

    } catch (error) {
        console.error('❌ Submission error:', error);
        alert(`❌ Failed:\n\n${error.message}`);
    }
}

// Save result to database
async function saveResultToDatabase(results) {
    try {
        if (!currentUser?.id) throw new Error('User data missing');
        if (!currentChapter?.id) throw new Error('Chapter data missing');

        console.log('\n=== SAVING RESULT TO DATABASE ===');
        
        const resultData = {
            userId: currentUser.id,
            userName: `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'Unknown',
            userEmail: currentUser.email || 'unknown@email.com',
            chapterId: currentChapter.id,
            chapterTitle: currentChapter.title || 'Unknown Chapter',
            quizId: currentQuiz?.id || currentChapter.id,
            answers: results.results || [],
            score: results.correctAnswers || 0,
            totalQuestions: results.totalQuestions || 0
        };

        console.log('Sending to database:', resultData);

        const savedResult = await api.results.submit(resultData);
        
        console.log('✅ Result saved successfully!');
        console.log('📊 Response:', savedResult);
        
        return savedResult;

    } catch (error) {
        console.error('❌ Error saving result:', error);
        // Don't throw - allow quiz to complete even if database save fails
        alert('⚠️ Result displayed but could not save to database. Please try again.');
    }
}

// Show quiz results
function showResults(results) {
    const modal = document.getElementById('results-modal');
    const resultsContainer = document.getElementById('results-content');

    const percentage = parseFloat(results.percentage);
    let emoji, message, bgGradient;
    
    if (percentage >= 90) {
        emoji = '🏆';
        message = 'Outstanding! Perfect score!';
        bgGradient = 'linear-gradient(135deg, #f093fb, #f5576c)';
    } else if (percentage >= 75) {
        emoji = '🎉';
        message = 'Excellent work!';
        bgGradient = 'linear-gradient(135deg, #43e97b, #38f9d7)';
    } else if (percentage >= 60) {
        emoji = '👍';
        message = 'Good job! Keep it up!';
        bgGradient = 'linear-gradient(135deg, #4facfe, #00f2fe)';
    } else if (percentage >= 50) {
        emoji = '💪';
        message = 'Good effort! You passed!';
        bgGradient = 'linear-gradient(135deg, #667eea, #764ba2)';
    } else {
        emoji = '📚';
        message = 'Keep practicing and retake the quiz!';
        bgGradient = 'linear-gradient(135deg, #fa709a, #fee140)';
    }

    resultsContainer.innerHTML = `
        <div style="max-width: 800px; margin: 0 auto;">
            <div style="text-align: center; padding: 50px; background: ${bgGradient}; border-radius: 25px; margin-bottom: 30px; color: white; box-shadow: 0 15px 40px rgba(0,0,0,0.2);">
                <div style="font-size: 5em; margin-bottom: 20px; animation: bounce 1s ease infinite;">${emoji}</div>
                <h2 style="font-size: 4em; margin-bottom: 15px; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);">
                    ${results.percentage}%
                </h2>
                <p style="font-size: 1.5em; margin-bottom: 10px;">
                    ${results.correctAnswers} / ${results.totalQuestions} ಸರಿಯಾದ ಉತ್ತರಗಳು
                </p>
                <p style="font-size: 1.3em; opacity: 0.95;">${message}</p>
            </div>

            <div style="background: white; padding: 30px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); margin-bottom: 30px;">
                <h3 style="color: #667eea; font-size: 1.5em; margin-bottom: 20px;">📝 ಪರೀಕ್ಷಾ ಫಲಿತಾಂಶಗಳು</h3>
                <p style="color: #666; font-size: 1.1em; line-height: 1.8;">
                    ✅ <strong>ನಿಮ್ಮ ಪರೀಕ್ಷೆ ಮೌಲ್ಯಮಾಪನ ಮುಗಿದಿದೆ।</strong>
                </p>
                <p style="color: #999; font-size: 1em; margin-top: 15px;">
                    ನಿಮ್ಮ ಉತ್ತರಗಳು ಮತ್ತು ವಿವರವಾದ ಫಲಿತಾಂಶಗಳು ಪ್ರಶಾಸಕರಿಂದ ಮಾತ್ರ ವೀಕ್ಷಿಸಬಹುದು।
                </p>
            </div>

            <div style="display: flex; gap: 20px; margin-top: 30px; justify-content: center;">
                <button onclick="closeResultsModal()" style="
                    padding: 18px 50px;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    border: none;
                    border-radius: 30px;
                    font-size: 1.2em;
                    font-weight: 600;
                    cursor: pointer;
                    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
                    transition: all 0.3s ease;
                " onmouseover="this.style.transform='translateY(-3px)'"
                   onmouseout="this.style.transform='translateY(0)'">
                    🏠 Back to Dashboard
                </button>
            </div>
        </div>

        <style>
            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-20px); }
            }
        </style>
    `;

    closeQuizModal();
    modal.classList.add('active');
}

// Close quiz modal
function closeQuizModal() {
    document.getElementById('quiz-modal').classList.remove('active');
    currentQuiz = null;
    userAnswers = [];
}

// Close results modal
function closeResultsModal() {
    document.getElementById('results-modal').classList.remove('active');
}

// User Profile Modal Functions
function openUserProfileModal() {
    // Fetch fresh user data from backend
    refreshUserDataFromBackend();
}

async function refreshUserDataFromBackend() {
    try {
        const token = localStorage.getItem('authToken');
        if (!token || !currentUser || !currentUser.id) {
            // Fallback to existing data if no token
            showUserProfileModal();
            return;
        }
        
        // Fetch user data from backend
        const response = await fetch(`${window.API_URL}/auth/user/${currentUser.id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const freshUserData = await response.json();
            console.log('Fresh user data from backend:', freshUserData);
            // Update currentUser with fresh data
            currentUser = {
                ...currentUser,
                ...freshUserData
            };
            // Update localStorage with fresh data
            localStorage.setItem('user', JSON.stringify(currentUser));
        }
    } catch (error) {
        console.error('Error refreshing user data:', error);
    } finally {
        // Show modal whether refresh succeeded or failed
        showUserProfileModal();
    }
}

function showUserProfileModal() {
    const modal = document.getElementById('user-profile-modal');
    if (!modal) {
        createUserProfileModal();
    } else {
        // Update the modal content with current data
        updateUserProfileModal();
        modal.style.display = 'block';
    }
}

function updateUserProfileModal() {
    // Update all fields with current user data
    if (document.getElementById('profile-firstname')) {
        document.getElementById('profile-firstname').value = currentUser.firstName || '';
    }
    if (document.getElementById('profile-lastname')) {
        document.getElementById('profile-lastname').value = currentUser.lastName || '';
    }
    if (document.getElementById('profile-email')) {
        document.getElementById('profile-email').value = currentUser.email || '';
    }
    if (document.getElementById('profile-mobile')) {
        document.getElementById('profile-mobile').value = currentUser.mobile || '';
    }
    if (document.getElementById('profile-school')) {
        document.getElementById('profile-school').value = currentUser.schoolCollege || 'Not provided';
    }
}

function createUserProfileModal() {
    const modal = document.createElement('div');
    modal.id = 'user-profile-modal';
    modal.style.cssText = `
        display: block;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(5px);
        animation: fadeIn 0.3s ease;
        overflow-y: auto;
    `;

    // Add scrollbar styling
    const style = document.createElement('style');
    style.textContent = `
        #user-profile-modal::-webkit-scrollbar {
            width: 8px;
        }
        #user-profile-modal::-webkit-scrollbar-track {
            background: transparent;
        }
        #user-profile-modal::-webkit-scrollbar-thumb {
            background: rgba(102, 126, 234, 0.5);
            border-radius: 4px;
        }
        #user-profile-modal::-webkit-scrollbar-thumb:hover {
            background: rgba(102, 126, 234, 0.8);
        }
    `;
    document.head.appendChild(style);

    modal.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            margin: 5% auto;
            padding: 40px;
            max-width: 600px;
            max-height: 85vh;
            border-radius: 30px;
            box-shadow: 0 25px 80px rgba(0, 0, 0, 0.4);
            animation: slideUp 0.4s ease;
            position: relative;
            overflow-y: auto;
        ">
            <span onclick="closeUserProfileModal()" style="
                position: absolute;
                right: 25px;
                top: 25px;
                font-size: 35px;
                font-weight: bold;
                color: #666;
                cursor: pointer;
                z-index: 10;
                width: 45px;
                height: 45px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.3s;
            " onmouseover="this.style.background='rgba(0,0,0,0.1)'" onmouseout="this.style.background='transparent'">&times;</span>

            <h2 style="
                color: #2c3e50;
                margin-top: 0;
                margin-bottom: 30px;
                font-size: 2em;
                border-bottom: 3px solid #667eea;
                padding-bottom: 15px;
            ">👤 My Profile</h2>

            <div id="profile-content" style="
                display: grid;
                gap: 20px;
            ">
                <div style="background: white; padding: 20px; border-radius: 15px; border-left: 5px solid #667eea;">
                    <label style="display: block; color: #7f8c8d; font-size: 0.9em; margin-bottom: 5px; font-weight: 600; text-transform: uppercase;">First Name</label>
                    <input type="text" id="profile-firstname" value="${currentUser.firstName}" disabled style="
                        width: 100%;
                        padding: 10px 15px;
                        border: 1px solid #bdc3c7;
                        border-radius: 8px;
                        background: #ecf0f1;
                        color: #2c3e50;
                        font-size: 1em;
                    ">
                    <p style="color: #e74c3c; font-size: 0.8em; margin: 8px 0 0 0; display: flex; align-items: center; gap: 5px;">
                        ℹ️ Contact admin to change this field
                    </p>
                </div>

                <div style="background: white; padding: 20px; border-radius: 15px; border-left: 5px solid #667eea;">
                    <label style="display: block; color: #7f8c8d; font-size: 0.9em; margin-bottom: 5px; font-weight: 600; text-transform: uppercase;">Last Name</label>
                    <input type="text" id="profile-lastname" value="${currentUser.lastName}" disabled style="
                        width: 100%;
                        padding: 10px 15px;
                        border: 1px solid #bdc3c7;
                        border-radius: 8px;
                        background: #ecf0f1;
                        color: #2c3e50;
                        font-size: 1em;
                    ">
                    <p style="color: #e74c3c; font-size: 0.8em; margin: 8px 0 0 0; display: flex; align-items: center; gap: 5px;">
                        ℹ️ Contact admin to change this field
                    </p>
                </div>

                <div style="background: white; padding: 20px; border-radius: 15px; border-left: 5px solid #667eea;">
                    <label style="display: block; color: #7f8c8d; font-size: 0.9em; margin-bottom: 5px; font-weight: 600; text-transform: uppercase;">Email Address</label>
                    <input type="email" id="profile-email" value="${currentUser.email}" disabled style="
                        width: 100%;
                        padding: 10px 15px;
                        border: 1px solid #bdc3c7;
                        border-radius: 8px;
                        background: #ecf0f1;
                        color: #2c3e50;
                        font-size: 1em;
                    ">
                    <p style="color: #e74c3c; font-size: 0.8em; margin: 8px 0 0 0; display: flex; align-items: center; gap: 5px;">
                        ℹ️ Contact admin to change this field
                    </p>
                </div>

                <div style="background: white; padding: 20px; border-radius: 15px; border-left: 5px solid #667eea;">
                    <label style="display: block; color: #7f8c8d; font-size: 0.9em; margin-bottom: 5px; font-weight: 600; text-transform: uppercase;">Mobile Number</label>
                    <input type="tel" id="profile-mobile" value="${currentUser.mobile || ''}" disabled style="
                        width: 100%;
                        padding: 10px 15px;
                        border: 1px solid #bdc3c7;
                        border-radius: 8px;
                        background: #ecf0f1;
                        color: #2c3e50;
                        font-size: 1em;
                    ">
                    <p style="color: #e74c3c; font-size: 0.8em; margin: 8px 0 0 0; display: flex; align-items: center; gap: 5px;">
                        ℹ️ Contact admin to change this field
                    </p>
                </div>

                <div style="background: white; padding: 20px; border-radius: 15px; border-left: 5px solid #43e97b;">
                    <label style="display: block; color: #7f8c8d; font-size: 0.9em; margin-bottom: 5px; font-weight: 600; text-transform: uppercase;">School/College</label>
                    <input type="text" id="profile-school" value="${currentUser.schoolCollege ? currentUser.schoolCollege : 'Not provided'}" disabled style="
                        width: 100%;
                        padding: 10px 15px;
                        border: 1px solid #bdc3c7;
                        border-radius: 8px;
                        background: #ecf0f1;
                        color: #2c3e50;
                        font-size: 1em;
                    ">
                </div>

                <div style="margin-top: 20px; display: flex; gap: 15px; flex-wrap: wrap;">
                    <button onclick="openChangePasswordModal()" style="
                        flex: 1;
                        min-width: 200px;
                        background: linear-gradient(135deg, #667eea, #764ba2);
                        color: white;
                        border: none;
                        padding: 14px 25px;
                        border-radius: 10px;
                        font-weight: 600;
                        font-size: 1em;
                        cursor: pointer;
                        transition: all 0.3s;
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
                    " onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 25px rgba(102, 126, 234, 0.5)'" 
                       onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(102, 126, 234, 0.3)'">
                        🔐 Change Password
                    </button>

                    <button onclick="openResetPasswordModal()" style="
                        flex: 1;
                        min-width: 200px;
                        background: linear-gradient(135deg, #fa709a, #fee140);
                        color: white;
                        border: none;
                        padding: 14px 25px;
                        border-radius: 10px;
                        font-weight: 600;
                        font-size: 1em;
                        cursor: pointer;
                        transition: all 0.3s;
                        box-shadow: 0 4px 15px rgba(250, 112, 154, 0.3);
                    " onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 25px rgba(250, 112, 154, 0.5)'" 
                       onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(250, 112, 154, 0.3)'">
                        🔄 Reset Password
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Close modal when clicking outside
    modal.onclick = function(event) {
        if (event.target === modal) {
            closeUserProfileModal();
        }
    };
}

function closeUserProfileModal() {
    const modal = document.getElementById('user-profile-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function openChangePasswordModal() {
    const modal = document.createElement('div');
    modal.id = 'change-password-modal';
    modal.style.cssText = `
        display: block;
        position: fixed;
        z-index: 1001;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(5px);
        animation: fadeIn 0.3s ease;
    `;

    modal.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            margin: 10% auto;
            padding: 40px;
            max-width: 500px;
            border-radius: 30px;
            box-shadow: 0 25px 80px rgba(0, 0, 0, 0.4);
            animation: slideUp 0.4s ease;
            position: relative;
        ">
            <span onclick="closeChangePasswordModal()" style="
                position: absolute;
                right: 25px;
                top: 25px;
                font-size: 35px;
                font-weight: bold;
                color: #666;
                cursor: pointer;
                z-index: 10;
                width: 45px;
                height: 45px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.3s;
            " onmouseover="this.style.background='rgba(0,0,0,0.1)'" onmouseout="this.style.background='transparent'">&times;</span>

            <h2 style="
                color: #2c3e50;
                margin-top: 0;
                margin-bottom: 25px;
                font-size: 1.8em;
                border-bottom: 3px solid #667eea;
                padding-bottom: 15px;
            ">🔐 Change Password</h2>

            <form id="change-password-form" style="display: grid; gap: 20px;">
                <div style="background: white; padding: 15px; border-radius: 10px; border-left: 5px solid #667eea;">
                    <label style="display: block; color: #7f8c8d; font-size: 0.85em; margin-bottom: 5px; font-weight: 600; text-transform: uppercase;">Current Password</label>
                    <input type="password" id="current-password" placeholder="Enter your current password" required style="
                        width: 100%;
                        padding: 10px 15px;
                        border: 1px solid #bdc3c7;
                        border-radius: 8px;
                        background: white;
                        color: #2c3e50;
                        font-size: 1em;
                    ">
                </div>

                <div style="background: white; padding: 15px; border-radius: 10px; border-left: 5px solid #667eea;">
                    <label style="display: block; color: #7f8c8d; font-size: 0.85em; margin-bottom: 5px; font-weight: 600; text-transform: uppercase;">New Password</label>
                    <input type="password" id="new-password" placeholder="Enter new password" required style="
                        width: 100%;
                        padding: 10px 15px;
                        border: 1px solid #bdc3c7;
                        border-radius: 8px;
                        background: white;
                        color: #2c3e50;
                        font-size: 1em;
                    ">
                </div>

                <div style="background: white; padding: 15px; border-radius: 10px; border-left: 5px solid #667eea;">
                    <label style="display: block; color: #7f8c8d; font-size: 0.85em; margin-bottom: 5px; font-weight: 600; text-transform: uppercase;">Confirm New Password</label>
                    <input type="password" id="confirm-password" placeholder="Confirm new password" required style="
                        width: 100%;
                        padding: 10px 15px;
                        border: 1px solid #bdc3c7;
                        border-radius: 8px;
                        background: white;
                        color: #2c3e50;
                        font-size: 1em;
                    ">
                </div>

                <div style="margin-top: 15px; display: flex; gap: 10px;">
                    <button type="submit" style="
                        flex: 1;
                        background: linear-gradient(135deg, #667eea, #764ba2);
                        color: white;
                        border: none;
                        padding: 12px 25px;
                        border-radius: 8px;
                        font-weight: 600;
                        font-size: 1em;
                        cursor: pointer;
                        transition: all 0.3s;
                    " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                        💾 Update Password
                    </button>
                    <button type="button" onclick="closeChangePasswordModal()" style="
                        flex: 1;
                        background: #95a5a6;
                        color: white;
                        border: none;
                        padding: 12px 25px;
                        border-radius: 8px;
                        font-weight: 600;
                        font-size: 1em;
                        cursor: pointer;
                        transition: all 0.3s;
                    " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    // Handle form submission
    document.getElementById('change-password-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (newPassword !== confirmPassword) {
            alert('New passwords do not match!');
            return;
        }

        if (newPassword.length < 6) {
            alert('Password must be at least 6 characters long!');
            return;
        }

        try {
            const response = await fetch(`${window.API_URL}/auth/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    userId: currentUser.id,
                    currentPassword: currentPassword,
                    newPassword: newPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('✅ Password changed successfully!');
                closeChangePasswordModal();
            } else {
                alert('❌ Error: ' + (data.error || 'Failed to change password'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error changing password. Please try again.');
        }
    });

    // Close modal when clicking outside
    modal.onclick = function(event) {
        if (event.target === modal) {
            closeChangePasswordModal();
        }
    };
}

function closeChangePasswordModal() {
    const modal = document.getElementById('change-password-modal');
    if (modal) {
        modal.remove();
    }
}

function openResetPasswordModal() {
    const modal = document.createElement('div');
    modal.id = 'reset-password-modal';
    modal.style.cssText = `
        display: block;
        position: fixed;
        z-index: 1001;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(5px);
        animation: fadeIn 0.3s ease;
    `;

    modal.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            margin: 10% auto;
            padding: 40px;
            max-width: 500px;
            border-radius: 30px;
            box-shadow: 0 25px 80px rgba(0, 0, 0, 0.4);
            animation: slideUp 0.4s ease;
            position: relative;
        ">
            <span onclick="closeResetPasswordModal()" style="
                position: absolute;
                right: 25px;
                top: 25px;
                font-size: 35px;
                font-weight: bold;
                color: #666;
                cursor: pointer;
                z-index: 10;
                width: 45px;
                height: 45px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.3s;
            " onmouseover="this.style.background='rgba(0,0,0,0.1)'" onmouseout="this.style.background='transparent'">&times;</span>

            <h2 style="
                color: #2c3e50;
                margin-top: 0;
                margin-bottom: 25px;
                font-size: 1.8em;
                border-bottom: 3px solid #fa709a;
                padding-bottom: 15px;
            ">🔄 Reset Password</h2>

            <form id="reset-password-form" style="display: grid; gap: 20px;">
                <div style="
                    background: #fff3cd;
                    padding: 15px;
                    border-radius: 10px;
                    border-left: 5px solid #ffc107;
                    color: #856404;
                    font-size: 0.95em;
                ">
                    <strong>ℹ️ How it works:</strong><br>
                    An OTP will be sent to your registered email. Use it to reset your password.
                </div>

                <div style="background: white; padding: 15px; border-radius: 10px; border-left: 5px solid #fa709a;">
                    <label style="display: block; color: #7f8c8d; font-size: 0.85em; margin-bottom: 5px; font-weight: 600; text-transform: uppercase;">Email Address</label>
                    <input type="email" id="reset-email" value="${currentUser.email}" disabled style="
                        width: 100%;
                        padding: 10px 15px;
                        border: 1px solid #bdc3c7;
                        border-radius: 8px;
                        background: #ecf0f1;
                        color: #2c3e50;
                        font-size: 1em;
                    ">
                </div>

                <div style="margin-top: 15px; display: flex; gap: 10px;">
                    <button type="button" onclick="sendResetOTP()" style="
                        flex: 1;
                        background: linear-gradient(135deg, #fa709a, #fee140);
                        color: white;
                        border: none;
                        padding: 12px 25px;
                        border-radius: 8px;
                        font-weight: 600;
                        font-size: 1em;
                        cursor: pointer;
                        transition: all 0.3s;
                    " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                        📧 Send OTP to Email
                    </button>
                    <button type="button" onclick="closeResetPasswordModal()" style="
                        flex: 1;
                        background: #95a5a6;
                        color: white;
                        border: none;
                        padding: 12px 25px;
                        border-radius: 8px;
                        font-weight: 600;
                        font-size: 1em;
                        cursor: pointer;
                        transition: all 0.3s;
                    " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    // Close modal when clicking outside
    modal.onclick = function(event) {
        if (event.target === modal) {
            closeResetPasswordModal();
        }
    };
}

function closeResetPasswordModal() {
    const modal = document.getElementById('reset-password-modal');
    if (modal) {
        modal.remove();
    }
}

async function sendResetOTP() {
    try {
        const response = await fetch(`${window.API_URL}/auth/request-password-reset`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: currentUser.email
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert('✅ OTP sent to your email! Check your inbox.');
            
            // Close reset modal and open OTP verification modal
            closeResetPasswordModal();
            openVerifyOTPModal();
        } else {
            alert('❌ Error: ' + (data.error || 'Failed to send OTP'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error sending OTP. Please try again.');
    }
}

function openVerifyOTPModal() {
    const modal = document.createElement('div');
    modal.id = 'verify-otp-modal';
    modal.style.cssText = `
        display: block;
        position: fixed;
        z-index: 1001;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(5px);
        animation: fadeIn 0.3s ease;
    `;

    modal.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            margin: 10% auto;
            padding: 40px;
            max-width: 500px;
            border-radius: 30px;
            box-shadow: 0 25px 80px rgba(0, 0, 0, 0.4);
            animation: slideUp 0.4s ease;
            position: relative;
        ">
            <span onclick="closeVerifyOTPModal()" style="
                position: absolute;
                right: 25px;
                top: 25px;
                font-size: 35px;
                font-weight: bold;
                color: #666;
                cursor: pointer;
                z-index: 10;
                width: 45px;
                height: 45px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.3s;
            " onmouseover="this.style.background='rgba(0,0,0,0.1)'" onmouseout="this.style.background='transparent'">&times;</span>

            <h2 style="
                color: #2c3e50;
                margin-top: 0;
                margin-bottom: 25px;
                font-size: 1.8em;
                border-bottom: 3px solid #43e97b;
                padding-bottom: 15px;
            ">✅ Verify OTP & Reset Password</h2>

            <form id="verify-otp-form" style="display: grid; gap: 20px;">
                <div style="background: white; padding: 15px; border-radius: 10px; border-left: 5px solid #43e97b;">
                    <label style="display: block; color: #7f8c8d; font-size: 0.85em; margin-bottom: 5px; font-weight: 600; text-transform: uppercase;">Enter OTP (6 digits)</label>
                    <input type="text" id="otp-code" placeholder="000000" maxlength="6" required style="
                        width: 100%;
                        padding: 10px 15px;
                        border: 1px solid #bdc3c7;
                        border-radius: 8px;
                        background: white;
                        color: #2c3e50;
                        font-size: 1.5em;
                        text-align: center;
                        font-weight: bold;
                        letter-spacing: 5px;
                    ">
                </div>

                <div style="background: white; padding: 15px; border-radius: 10px; border-left: 5px solid #43e97b;">
                    <label style="display: block; color: #7f8c8d; font-size: 0.85em; margin-bottom: 5px; font-weight: 600; text-transform: uppercase;">New Password</label>
                    <input type="password" id="reset-new-password" placeholder="Enter new password" required style="
                        width: 100%;
                        padding: 10px 15px;
                        border: 1px solid #bdc3c7;
                        border-radius: 8px;
                        background: white;
                        color: #2c3e50;
                        font-size: 1em;
                    ">
                </div>

                <div style="background: white; padding: 15px; border-radius: 10px; border-left: 5px solid #43e97b;">
                    <label style="display: block; color: #7f8c8d; font-size: 0.85em; margin-bottom: 5px; font-weight: 600; text-transform: uppercase;">Confirm Password</label>
                    <input type="password" id="reset-confirm-password" placeholder="Confirm new password" required style="
                        width: 100%;
                        padding: 10px 15px;
                        border: 1px solid #bdc3c7;
                        border-radius: 8px;
                        background: white;
                        color: #2c3e50;
                        font-size: 1em;
                    ">
                </div>

                <div style="margin-top: 15px; display: flex; gap: 10px;">
                    <button type="submit" style="
                        flex: 1;
                        background: linear-gradient(135deg, #43e97b, #38f9d7);
                        color: white;
                        border: none;
                        padding: 12px 25px;
                        border-radius: 8px;
                        font-weight: 600;
                        font-size: 1em;
                        cursor: pointer;
                        transition: all 0.3s;
                    " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                        🔐 Reset Password
                    </button>
                    <button type="button" onclick="closeVerifyOTPModal()" style="
                        flex: 1;
                        background: #95a5a6;
                        color: white;
                        border: none;
                        padding: 12px 25px;
                        border-radius: 8px;
                        font-weight: 600;
                        font-size: 1em;
                        cursor: pointer;
                        transition: all 0.3s;
                    " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    // Handle form submission
    document.getElementById('verify-otp-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const otp = document.getElementById('otp-code').value;
        const newPassword = document.getElementById('reset-new-password').value;
        const confirmPassword = document.getElementById('reset-confirm-password').value;

        if (newPassword !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        if (newPassword.length < 6) {
            alert('Password must be at least 6 characters long!');
            return;
        }

        try {
            const response = await fetch(`${window.API_URL}/auth/reset-password-with-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: currentUser.email,
                    otp: otp,
                    newPassword: newPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('✅ Password reset successfully! Please login again.');
                closeVerifyOTPModal();
                closeUserProfileModal();
                logout();
            } else {
                alert('❌ Error: ' + (data.error || 'Failed to reset password'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error resetting password. Please try again.');
        }
    });

    // Close modal when clicking outside
    modal.onclick = function(event) {
        if (event.target === modal) {
            closeVerifyOTPModal();
        }
    };
}

function closeVerifyOTPModal() {
    const modal = document.getElementById('verify-otp-modal');
    if (modal) {
        modal.remove();
    }
}

// Close results modal
function closeResultsModal() {
    document.getElementById('results-modal').classList.remove('active');
}

// Export functions
window.loadChapters = loadChapters;
window.openChapter = openChapter;
window.openChapterToRead = openChapterToRead;
window.startChapterQuiz = startChapterQuiz;
window.showReadFirstModal = showReadFirstModal;
window.markAsReadAndClose = markAsReadAndClose;
window.closeChapterModal = closeChapterModal;
window.startQuiz = startQuiz;
window.saveAnswer = saveAnswer;
window.submitQuiz = submitQuiz;
window.closeQuizModal = closeQuizModal;
window.closeResultsModal = closeResultsModal;
window.openUserProfileModal = openUserProfileModal;
window.closeUserProfileModal = closeUserProfileModal;
window.openChangePasswordModal = openChangePasswordModal;
window.closeChangePasswordModal = closeChangePasswordModal;
window.openResetPasswordModal = openResetPasswordModal;
window.closeResetPasswordModal = closeResetPasswordModal;
window.sendResetOTP = sendResetOTP;
window.openVerifyOTPModal = openVerifyOTPModal;
window.closeVerifyOTPModal = closeVerifyOTPModal;
