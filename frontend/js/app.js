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
    const apiUrl = window.API_URL || 'http://localhost:3000/api';
    try {
        const response = await fetch(apiUrl.replace('/api', '/health'));
        if (!response.ok) {
            console.warn('Backend server might not be responding');
        } else {
            console.log('✅ Backend server connection successful');
        }
    } catch (error) {
        console.error('❌ Cannot connect to backend at:', apiUrl);
        console.error('Error:', error.message);
        console.log('📝 To fix this:');
        console.log('1. Make sure backend is running: npm start (in backend folder)');
        console.log('2. Update api-config.js with correct backend URL');
        console.log('3. Check if firewall is blocking port 3000');
        
        // Show a warning to user
        setTimeout(() => {
            if (document.getElementById('chapters-list') && document.getElementById('chapters-list').children.length === 0) {
                alert('⚠️ Backend Server Connection Error\n\nCannot connect to: ' + apiUrl + '\n\nPlease:\n1. Start the backend server\n2. Or update the API URL in js/api-config.js\n\nCheck browser console for details.');
            }
        }, 2000);
    }
}

checkBackendConnection();
