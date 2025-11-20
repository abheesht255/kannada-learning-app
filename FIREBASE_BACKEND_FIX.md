# Firebase Hosting + Backend Server Connection Guide

## Problem
Your frontend is hosted on Firebase, but trying to connect to `http://localhost:3000` which doesn't exist on Firebase.

## Solution: Two Options

### ✅ Option 1: Keep Backend Running Locally (Easiest for Development)

**Requirements:**
- Backend server running on your local machine on port 3000
- Frontend on Firebase
- They communicate via HTTP

**Steps:**

1. **Start your backend server** (keep it running):
```bash
cd backend
npm install
npm start
```

2. **Update API configuration** in `frontend/js/api-config.js`:
```javascript
// If backend is on different machine/port, use:
PRODUCTION: 'http://your-machine-ip:3000/api'  // e.g., http://192.168.1.100:3000/api
```

3. **Enable CORS** - Already configured in backend/server.js ✅

4. **Test connection**:
   - Open browser console (F12)
   - Check for "Using API URL:" message
   - Try logging in

---

### ⭐ Option 2: Deploy Backend to Cloud (Production Ready)

**Services:**
- **Railway.app** (Recommended - free tier available)
- **Render.com** (Free tier with sleeping)
- **Heroku** (Paid now, but simple)
- **AWS** (Complex but powerful)

**Steps for Railway:**

1. Go to: https://railway.app
2. Sign up with GitHub
3. Create new project → Deploy from GitHub
4. Select your `kannada-learning-app` repository
5. Railway detects Node.js automatically
6. Deploy ✅
7. Get your URL: `https://your-project.railway.app`

2. **Update API config**:
```javascript
PRODUCTION: 'https://your-project.railway.app/api'
```

3. **Test**: Try logging in from Firebase

---

## Configuration Files

### `frontend/js/api-config.js` (NEW)
```javascript
const API_CONFIG = {
    LOCAL: 'http://localhost:3000/api',
    PRODUCTION: 'https://your-backend-url.com/api',  // ← UPDATE THIS
    CURRENT: 'LOCAL'  // Change to 'PRODUCTION' when deployed
};

function getApiUrl() {
    if (window.location.hostname === 'localhost') return API_CONFIG.LOCAL;
    return API_CONFIG.PRODUCTION;
}

window.API_URL = getApiUrl();
```

### Files Updated
- ✅ `frontend/login.html` - Uses `window.API_URL`
- ✅ `frontend/js/app.js` - Uses config
- ⏳ Need to update: `student.js`, `admin.js`, `auth.js`

---

## Quick Troubleshooting

**Error: "Cannot connect to server"**
1. Is backend running? Check: `curl http://localhost:3000/api/health`
2. Is CORS enabled? Check server console
3. Is firewall blocking port 3000?

**Error: "CORS policy error"**
- Backend already has CORS enabled ✅
- Make sure `const cors = require('cors');` and `app.use(cors());` are in server.js

**Error: "Wrong URL"**
- Check api-config.js
- Wrong IP address? Use `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
- Port number correct? (3000 by default)

---

## For Now: Quick Fix

1. **Keep backend running locally**:
```bash
cd d:\VS\Learn\kannada-learning-app\backend
npm start
```

2. **Update `api-config.js` PRODUCTION URL** to your local IP:
```bash
# Get your local IP (Windows):
ipconfig

# Find IPv4 Address (e.g., 192.168.1.100)
```

3. **Set in `api-config.js`**:
```javascript
PRODUCTION: 'http://192.168.1.100:3000/api'  // Your actual IP
```

4. **Firebase frontend can now connect!**

---

## Next Steps

- [ ] Update all remaining JS files to use `window.API_URL`
- [ ] Test login/signup
- [ ] Deploy backend to cloud service
- [ ] Update production URL in config
- [ ] Push changes to GitHub and Firebase

---

**Questions?** Check browser console (F12) for error messages with details.
