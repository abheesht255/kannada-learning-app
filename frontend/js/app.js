// Main App Logic

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Load student view by default
    loadChapters();
});

// Show different views (student/admin)
function showView(viewName) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });

    // Show selected view
    const view = document.getElementById(`${viewName}-view`);
    if (view) {
        view.classList.add('active');
    }

    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Load appropriate content
    if (viewName === 'student') {
        loadChapters();
    } else if (viewName === 'admin') {
        loadAdminChapters();
        loadChapterDropdown();
    }
}

// Show admin tabs
function showAdminTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Show selected tab
    const tab = document.getElementById(`admin-${tabName}-tab`);
    if (tab) {
        tab.classList.add('active');
    }

    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

// Close modal on outside click
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.classList.remove('active');
        }
    });
};

// Export functions
window.showView = showView;
window.showAdminTab = showAdminTab;

// Check backend connection on load
async function checkBackendConnection() {
    try {
        const response = await fetch('http://localhost:3000/api/health');
        if (!response.ok) {
            console.warn('Backend server might not be running');
        }
    } catch (error) {
        console.error('Cannot connect to backend. Make sure the server is running on http://localhost:3000');
        // Show a warning to user
        setTimeout(() => {
            if (document.getElementById('chapters-list').children.length === 0) {
                alert('ಬ್ಯಾಕೆಂಡ್ ಸರ್ವರ್‌ಗೆ ಸಂಪರ್ಕಿಸಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ. ದಯವಿಟ್ಟು ಸರ್ವರ್ ರನ್ ಆಗುತ್ತಿದೆಯೇ ಎಂದು ಪರಿಶೀಲಿಸಿ.\n\nCannot connect to backend server. Please make sure the server is running:\ncd backend\nnpm install\nnpm start');
            }
        }, 1000);
    }
}

checkBackendConnection();
