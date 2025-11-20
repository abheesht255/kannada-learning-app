// API Configuration File
// Update this based on your environment

const API_CONFIG = {
    // Local development (backend running on localhost)
    LOCAL: 'http://localhost:3000/api',
    
    // Remote deployment (change this to your deployed backend URL)
    PRODUCTION: 'https://your-backend-url.com/api',  // UPDATE THIS WITH YOUR ACTUAL BACKEND URL
    
    // Current environment - change this to switch
    CURRENT: 'LOCAL'  // Change to 'PRODUCTION' when backend is deployed
};

// Get the active API URL
function getApiUrl() {
    // Check if running on localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return API_CONFIG.LOCAL;
    }
    // On Firebase or remote hosting, use production URL
    return API_CONFIG.PRODUCTION;
}

// Export for use in other files
window.API_URL = getApiUrl();
