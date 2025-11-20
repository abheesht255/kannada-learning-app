# Auto-Logout Feature Documentation

## 🔐 Overview
The auto-logout feature automatically logs out users (both students and admins) after a period of inactivity to enhance security and protect user sessions.

## ⚙️ Configuration

### Default Settings
- **Timeout Duration:** 30 minutes of inactivity
- **Warning Duration:** 5 minutes before auto-logout
- **Activity Tracking:** Mouse, keyboard, scroll, touch, and click events

### Timeout Periods
- **Students:** 30 minutes → Warning at 25 minutes → Logout at 30 minutes
- **Admins:** 30 minutes → Warning at 25 minutes → Logout at 30 minutes

## 🎯 Features

### 1. **Activity Detection**
The system monitors user activity through:
- Mouse movements
- Keyboard input
- Scrolling
- Touch events
- Clicks

Any detected activity resets the timeout timer.

### 2. **Warning Modal**
5 minutes before auto-logout, users see an attractive warning modal with:
- ⏰ Countdown timer showing remaining time
- Clear message about impending logout
- Two action buttons:
  - **"✓ Stay Logged In"** - Resets the timer and continues session
  - **"✗ Logout Now"** - Immediately logs out

### 3. **Automatic Logout**
If no action is taken, the system:
- Clears authentication tokens
- Removes user data from localStorage
- Shows an alert message
- Redirects to appropriate login page

## 💻 Implementation

### File Structure
```
frontend/
└── js/
    └── auth-timeout.js    (Main timeout implementation)
```

### Integration Points

**Student Pages:**
- `index.html` - Main student dashboard
```javascript
initStudentTimeout();
```

**Admin Pages:**
- `admin-dashboard.html` - Admin hub
- `admin-students.html` - Student management
- `admin-quiz.html` - Quiz management
- `admin-results.html` - Results viewer
```javascript
initAdminTimeout();
```

## 🎨 User Experience

### Warning Modal Design
- Modern, attractive modal with gradient buttons
- Smooth fade-in and slide-up animations
- Live countdown timer (MM:SS format)
- Semi-transparent backdrop
- High z-index (10000) to ensure visibility

### Visual Elements
- ⏰ Clock emoji for visual emphasis
- Color-coded buttons:
  - Green gradient for "Stay Logged In"
  - Red gradient for "Logout Now"
- Professional styling with shadows and hover effects

## 🔄 Flow Diagram

```
User Login
    ↓
Activity Detected → Reset Timer (30 min)
    ↓
No Activity for 25 min
    ↓
Show Warning Modal with 5 min Countdown
    ↓
User Clicks "Stay Logged In" → Reset Timer
    OR
User Clicks "Logout Now" → Immediate Logout
    OR
Countdown Reaches 0 → Auto Logout
    ↓
Clear Tokens → Show Alert → Redirect to Login
```

## 🛡️ Security Benefits

1. **Prevents Unauthorized Access**
   - Protects sessions when users leave devices unattended
   - Automatically closes vulnerable sessions

2. **Token Management**
   - Clears JWT tokens from localStorage
   - Removes user data on logout

3. **Session Hygiene**
   - Forces periodic re-authentication
   - Reduces risk of token theft

## 🔧 Customization

### Changing Timeout Duration

**For Students:**
```javascript
authTimeout = new AuthTimeout({
    timeoutDuration: 45 * 60 * 1000, // 45 minutes
    warningDuration: 5 * 60 * 1000,  // 5 minutes warning
    isAdmin: false,
    loginPage: 'login.html'
});
```

**For Admins:**
```javascript
authTimeout = new AuthTimeout({
    timeoutDuration: 20 * 60 * 1000, // 20 minutes
    warningDuration: 3 * 60 * 1000,  // 3 minutes warning
    isAdmin: true,
    loginPage: 'admin-login.html'
});
```

### Customizable Parameters
- `timeoutDuration` - Total inactivity time before logout (milliseconds)
- `warningDuration` - Time before logout to show warning (milliseconds)
- `isAdmin` - Boolean flag for admin vs student sessions
- `loginPage` - Redirect URL after logout

## 📱 Responsive Behavior

- Modal is fully responsive and mobile-friendly
- Touch events are tracked on mobile devices
- Countdown timer updates in real-time
- Buttons are touch-optimized with adequate size

## 🧪 Testing

### Test Scenarios

1. **Normal Activity**
   - User actively using the app
   - Timer should reset with each action
   - No warning should appear

2. **Idle Session**
   - Stop all activity for 25 minutes
   - Warning modal should appear
   - Countdown should start from 5:00

3. **Stay Logged In**
   - Wait for warning modal
   - Click "Stay Logged In"
   - Modal should close, timer should reset

4. **Manual Logout**
   - Wait for warning modal
   - Click "Logout Now"
   - Should redirect to login page immediately

5. **Auto Logout**
   - Wait for warning modal
   - Don't interact
   - Should auto-logout after countdown reaches 0

## 📊 User Scenarios

### Student Using Quiz
- Student starts quiz at 2:00 PM
- No activity detected from 2:15 PM to 2:45 PM
- At 2:45 PM: Warning appears (5 min left)
- Student clicks "Stay Logged In"
- Session extends, quiz continues

### Admin Reviewing Results
- Admin logs in at 9:00 AM
- Reviews results, then attends meeting
- At 9:25 AM: Warning appears
- No response from admin
- At 9:30 AM: Auto-logout occurs
- Data remains secure

## ⚠️ Important Notes

1. **Activity Tracking**
   - Only tracks client-side activity
   - Server token expiry should be configured separately
   - Consider JWT token expiry aligned with timeout

2. **Multiple Tabs**
   - Each tab has independent timeout tracking
   - Activity in one tab doesn't affect others
   - Consider implementing shared session tracking if needed

3. **Browser Compatibility**
   - Uses localStorage (IE8+ support)
   - Modern event listeners (IE9+ support)
   - CSS animations (IE10+ support)

## 🚀 Benefits

✅ **Enhanced Security** - Automatic session termination
✅ **User-Friendly** - Clear warnings with action options
✅ **Configurable** - Easy to adjust timeout periods
✅ **Professional** - Beautiful, modern UI
✅ **Lightweight** - No external dependencies
✅ **Universal** - Works for both student and admin sessions

## 🔮 Future Enhancements

Potential improvements:
- Server-side session validation
- Shared timeout across multiple tabs
- Remember device option (extend timeout)
- Activity logging for security audit
- Configurable timeout per user role
- Browser notification before logout

---

**Note:** The auto-logout feature is now active on all authenticated pages. Users will be notified 5 minutes before automatic logout and can choose to extend their session.
