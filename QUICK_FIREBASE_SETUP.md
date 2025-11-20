# Quick Start Guide - Firebase + Backend Server Setup

## 🚀 Problem Solved!

Your frontend is now configured to connect to your backend server (local or cloud).

## ✅ What Was Fixed

1. **Created `frontend/js/api-config.js`** - Central configuration file
2. **Updated all frontend files** to use `window.API_URL` instead of hardcoded URLs:
   - ✅ `login.html`
   - ✅ `admin-login.html`
   - ✅ `index.html`
   - ✅ `js/api.js`
   - ✅ `js/app.js`
   - ✅ `js/student.js`

3. **Better error messages** - Now shows which URL it's trying to connect to

## 🔧 How to Use

### Option 1: Run Backend Locally (Easiest)

**On your local machine:**

```bash
cd d:\VS\Learn\kannada-learning-app\backend
npm install
npm start
```

Backend runs on: `http://localhost:3000`

**From Firebase (no changes needed):**
- Open your Firebase-hosted app
- It will auto-detect localhost:3000 and connect
- Works if on same network!

---

### Option 2: Use Remote IP (Connect from anywhere)

**Find your machine IP:**

```bash
# Windows - Open Command Prompt:
ipconfig

# Look for IPv4 Address (e.g., 192.168.1.100)
```

**Update `frontend/js/api-config.js`:**

```javascript
PRODUCTION: 'http://192.168.1.100:3000/api'  // Your actual IP
```

**Test:** Visit Firebase app from any device on your network!

---

### Option 3: Deploy Backend to Cloud (Production)

**Best for: Public hosting, always-on access**

**Services (choose one):**
- Railway.app (Recommended)
- Render.com
- Heroku
- AWS

**Steps:**

1. Deploy backend to your chosen service
2. Get the URL (e.g., `https://my-app-backend.railway.app`)
3. Update `api-config.js`:

```javascript
PRODUCTION: 'https://my-app-backend.railway.app/api'
```

4. Firebase will now use cloud URL

---

## 📋 Configuration File

### `frontend/js/api-config.js`

```javascript
const API_CONFIG = {
    // Local development (backend on localhost)
    LOCAL: 'http://localhost:3000/api',
    
    // Cloud deployment
    PRODUCTION: 'https://your-backend-url.com/api',  // ← UPDATE THIS
    
    CURRENT: 'LOCAL'  // Change to 'PRODUCTION' when ready
};

function getApiUrl() {
    if (window.location.hostname === 'localhost') return API_CONFIG.LOCAL;
    return API_CONFIG.PRODUCTION;
}

window.API_URL = getApiUrl();
```

---

## ✨ Features

**Auto-detection:**
```javascript
// Automatically switches based on where it's hosted:
// - localhost → Uses LOCAL config
// - Firebase  → Uses PRODUCTION config
```

**Better errors:**
- Shows exact URL it's trying to connect to
- Tells you if backend is not running
- Logs connection status to console

**Easy to switch:**
- Just update one file
- All endpoints automatically use correct URL

---

## 🔍 Troubleshooting

### "Cannot connect to server"

1. **Is backend running?**
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **Check console (F12):**
   - Look for "Using API URL:" message
   - See exact URL it's trying

3. **Check firewall:**
   - Port 3000 might be blocked
   - Windows Firewall → Allow port 3000

4. **Wrong IP?**
   - Use actual IP from `ipconfig`
   - Not 127.0.0.1 (that's localhost only)
   - Use 192.168.x.x (local network)

### CORS Error

Already fixed! Backend has `cors()` middleware.

### Firebase can't reach local machine

- Both must be on **same network** (same WiFi)
- Use **local IP** (192.168.x.x), not localhost
- Firewall might block - add exception for port 3000

---

## 📱 Testing Checklist

- [ ] Backend running: `npm start` (backend folder)
- [ ] Open Firebase URL in browser
- [ ] Click "Let's Learn!" button
- [ ] Check console (F12) - should see "Using API URL:"
- [ ] Try login/signup
- [ ] Should work!

---

## 📊 Current Setup

**Frontend:** Firebase Hosting (deployed)
**Backend:** Local Node.js server (port 3000)
**Database:** JSON files (backend/data/)
**Configuration:** `frontend/js/api-config.js`

---

## 🎯 Next Steps

1. Start backend server locally
2. Test Firebase app
3. If working, deploy backend to cloud
4. Update api-config.js with cloud URL

**That's it! 🎉**

---

For detailed troubleshooting, see: `FIREBASE_BACKEND_FIX.md`
