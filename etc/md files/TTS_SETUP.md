# Google Text-to-Speech Setup Guide

## 🎯 Read-Aloud Feature Added!

Your Kannada Learning App now has **Read-Aloud functionality** with two modes:

1. **Google Cloud Text-to-Speech** (High quality, requires setup)
2. **Browser Fallback** (Free, works immediately, lower quality)

---

## 🔊 How It Works

**Current Status:** The app will work immediately using **Browser TTS** (no setup required).

**With Google TTS:** For better Kannada voice quality, follow the setup below.

---

## ✅ Quick Test (Browser TTS - No Setup)

1. Restart your backend server:
   ```bash
   cd backend
   npm install
   npm start
   ```

2. Open `frontend/index.html`

3. Go to Students → Click any chapter

4. You'll see **"🔊 ಓದಿ"** buttons:
   - Next to title
   - Above study material
   - Above summary

5. Click any button to hear the text!

---

## 🚀 Optional: Google Cloud TTS Setup (Better Quality)

### Step 1: Create Google Cloud Account

1. Go to: https://cloud.google.com/
2. Click "Get Started for Free"
3. Sign up (you get $300 free credit)
4. No credit card required for trial

### Step 2: Enable Text-to-Speech API

1. Go to: https://console.cloud.google.com/
2. Create a new project (e.g., "Kannada-Learning")
3. Go to **APIs & Services** → **Library**
4. Search for "**Cloud Text-to-Speech API**"
5. Click **Enable**

### Step 3: Create Service Account

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **Service Account**
3. Name it: "kannada-tts-service"
4. Click **Create and Continue**
5. Skip the role assignment (click Continue)
6. Click **Done**

### Step 4: Generate API Key

1. Click on the service account you just created
2. Go to **Keys** tab
3. Click **Add Key** → **Create New Key**
4. Choose **JSON** format
5. Click **Create**
6. A JSON file will download (e.g., `kannada-learning-xxxxx.json`)

### Step 5: Configure Your App

**Option A: Environment Variable (Recommended)**

```powershell
# Windows PowerShell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\your\kannada-learning-xxxxx.json"
```

**Option B: Place in Project**

1. Copy the downloaded JSON file to: `backend/google-credentials.json`
2. Add to `.gitignore` to keep it private
3. Set environment variable:
   ```powershell
   $env:GOOGLE_APPLICATION_CREDENTIALS="./google-credentials.json"
   ```

### Step 6: Restart Server

```bash
cd backend
npm install
npm start
```

You should see: **"TTS: Google Cloud Enabled"**

---

## 📊 Feature Details

### Read-Aloud Buttons Added:

1. **Chapter Title** - Hear the chapter name
2. **Study Material** - Hear the full content
3. **Summary** - Hear the summary

### How to Use:

- Click **"🔊 ಓದಿ"** to start reading
- Click **"⏸️ ನಿಲ್ಲಿಸಿ"** to stop
- Only one audio plays at a time

### Voice Settings:

- **Language:** Kannada (kn-IN)
- **Voice:** Female (Standard-A)
- **Speed:** 0.85x (slower for learning)
- **Pitch:** Normal

---

## 💰 Pricing (Google Cloud TTS)

**Free Tier:**
- First 1 million characters/month: **FREE**
- Perfect for 10 users!

**After Free Tier:**
- Standard voices: $4 per 1 million characters
- You'll get warnings before charges

**Estimate for 10 users:**
- Average chapter: ~500 characters
- 10 chapters × 10 users × 5 reads = 250,000 characters
- **Well within free tier!**

---

## 🔧 Troubleshooting

### "Google TTS not configured" message

**Solution:** App works fine with browser TTS! No action needed.

**To enable Google TTS:** Follow setup steps above.

### No sound when clicking button

1. Check browser permissions (allow sound)
2. Check speaker volume
3. Open browser console (F12) for errors
4. Try browser TTS first (it's automatic)

### Google TTS not working after setup

1. Verify credentials file path
2. Check environment variable is set:
   ```powershell
   echo $env:GOOGLE_APPLICATION_CREDENTIALS
   ```
3. Restart backend server
4. Check API is enabled in Google Cloud Console

### Poor voice quality

- Browser TTS quality varies by OS/browser
- For best quality, set up Google Cloud TTS
- Chrome/Edge have better Kannada support

---

## 📱 Browser Compatibility

**Browser TTS Support:**
- ✅ Chrome/Edge (Best)
- ✅ Firefox (Good)
- ⚠️ Safari (Limited Kannada)
- ✅ Opera (Good)

**Google TTS:** Works in all browsers!

---

## 🎯 Testing Checklist

- [ ] Install updated dependencies: `npm install`
- [ ] Restart backend server
- [ ] Open chapter in student view
- [ ] Click "🔊 ಓದಿ" button
- [ ] Hear Kannada audio
- [ ] Click again to stop
- [ ] Test all three buttons (title, material, summary)

---

## 📝 Current Files Updated

1. **backend/package.json** - Added Google TTS dependency
2. **backend/server.js** - Added TTS API endpoint
3. **frontend/js/student.js** - Added TTS functions
4. **frontend/css/styles.css** - Added button styles

---

## 🎉 Ready to Use!

The feature works **immediately** with browser TTS.

**To test:**
1. `cd backend && npm install`
2. `npm start`
3. Open `frontend/index.html`
4. Click any chapter → Click 🔊 buttons!

**Optional:** Set up Google Cloud TTS for better quality.

---

## 🔮 Future Enhancements

Possible additions:
- [ ] Read quiz questions aloud
- [ ] Speed control (slow/normal/fast)
- [ ] Male/Female voice selection
- [ ] Auto-play chapters
- [ ] Download audio files
- [ ] Pronunciation practice mode

---

**Enjoy the read-aloud feature! 🎧📚**
