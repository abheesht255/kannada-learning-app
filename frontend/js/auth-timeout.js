/**
 * Auto-Logout Feature
 * Automatically logs out users after a period of inactivity
 */

class AuthTimeout {
    constructor(options = {}) {
        // Configuration
        this.timeoutDuration = options.timeoutDuration || 30 * 60 * 1000; // 30 minutes default
        this.warningDuration = options.warningDuration || 5 * 60 * 1000; // 5 minutes before timeout
        this.isAdmin = options.isAdmin || false;
        this.loginPage = options.loginPage || 'login.html';
        
        // State
        this.timeoutId = null;
        this.warningId = null;
        this.warningShown = false;
        
        // Initialize
        this.init();
    }

    init() {
        // Check if user is logged in
        const token = this.isAdmin 
            ? localStorage.getItem('adminToken') 
            : localStorage.getItem('authToken');
        
        if (!token) {
            return; // Not logged in, no need to track
        }

        // Set up activity listeners
        this.setupActivityListeners();
        
        // Start timeout
        this.resetTimeout();
    }

    setupActivityListeners() {
        // Events that indicate user activity
        const events = ['mousedown', 'keypress', 'scroll', 'touchstart', 'click'];
        
        events.forEach(event => {
            document.addEventListener(event, () => this.handleActivity(), true);
        });
    }

    handleActivity() {
        // Reset timeout on any activity
        this.resetTimeout();
        
        // Hide warning if shown
        if (this.warningShown) {
            this.hideWarning();
        }
    }

    resetTimeout() {
        // Clear existing timers
        if (this.timeoutId) clearTimeout(this.timeoutId);
        if (this.warningId) clearTimeout(this.warningId);
        
        // Set warning timer (5 minutes before logout)
        this.warningId = setTimeout(() => {
            this.showWarning();
        }, this.timeoutDuration - this.warningDuration);
        
        // Set logout timer
        this.timeoutId = setTimeout(() => {
            this.logout();
        }, this.timeoutDuration);
    }

    showWarning() {
        this.warningShown = true;
        
        // Create warning modal
        const modal = document.createElement('div');
        modal.id = 'timeout-warning-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                padding: 40px;
                border-radius: 20px;
                max-width: 500px;
                text-align: center;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                animation: slideUp 0.4s ease;
            ">
                <div style="font-size: 3em; margin-bottom: 20px;">⏰</div>
                <h2 style="color: #f39c12; margin-bottom: 15px; font-size: 1.8em;">
                    Session Expiring Soon
                </h2>
                <p style="color: #666; font-size: 1.1em; margin-bottom: 25px; line-height: 1.6;">
                    You will be automatically logged out in <strong id="countdown-timer">5:00</strong> due to inactivity.
                </p>
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button onclick="authTimeout.stayLoggedIn()" style="
                        background: linear-gradient(135deg, #27ae60, #2ecc71);
                        color: white;
                        border: none;
                        padding: 15px 40px;
                        border-radius: 30px;
                        font-size: 1.1em;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3);
                    ">
                        ✓ Stay Logged In
                    </button>
                    <button onclick="authTimeout.logout()" style="
                        background: linear-gradient(135deg, #e74c3c, #c0392b);
                        color: white;
                        border: none;
                        padding: 15px 40px;
                        border-radius: 30px;
                        font-size: 1.1em;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
                    ">
                        ✗ Logout Now
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Start countdown
        this.startCountdown();
    }

    startCountdown() {
        const countdownElement = document.getElementById('countdown-timer');
        if (!countdownElement) return;
        
        let timeLeft = Math.floor(this.warningDuration / 1000); // Convert to seconds
        
        const countdownInterval = setInterval(() => {
            if (!this.warningShown) {
                clearInterval(countdownInterval);
                return;
            }
            
            timeLeft--;
            
            if (timeLeft <= 0) {
                clearInterval(countdownInterval);
                return;
            }
            
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            countdownElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    hideWarning() {
        this.warningShown = false;
        const modal = document.getElementById('timeout-warning-modal');
        if (modal) {
            modal.remove();
        }
    }

    stayLoggedIn() {
        this.hideWarning();
        this.resetTimeout();
    }

    logout() {
        // Clear timers
        if (this.timeoutId) clearTimeout(this.timeoutId);
        if (this.warningId) clearTimeout(this.warningId);
        
        // Hide warning
        this.hideWarning();
        
        // Clear storage
        if (this.isAdmin) {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('role');
        } else {
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
        }
        
        // Show logout message
        alert('You have been logged out due to inactivity.');
        
        // Redirect to login page
        window.location.href = this.loginPage;
    }
}

// Global instance (will be initialized on each page)
let authTimeout = null;

// Initialize for student pages
function initStudentTimeout() {
    authTimeout = new AuthTimeout({
        timeoutDuration: 30 * 60 * 1000, // 30 minutes
        warningDuration: 5 * 60 * 1000,  // 5 minutes warning
        isAdmin: false,
        loginPage: 'login.html'
    });
}

// Initialize for admin pages
function initAdminTimeout() {
    authTimeout = new AuthTimeout({
        timeoutDuration: 30 * 60 * 1000, // 30 minutes
        warningDuration: 5 * 60 * 1000,  // 5 minutes warning
        isAdmin: true,
        loginPage: 'admin-login.html'
    });
}

// CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
    
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(50px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    #timeout-warning-modal button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    }
`;
document.head.appendChild(style);
