# Reset Feature Testing Guide - QUICK START

## ⚡ Quick Test (2 minutes)

### 1. Open Admin Results Page
```
URL: http://localhost:3000/frontend/admin-results.html
```

### 2. Open Browser Console
```
F12 → Console Tab
```

### 3. Click Reset Button
```
Look for 🔄 Reset button on any student result row
Click it
```

### 4. Check Console Logs
```
You should see:
✅ "Reset clicked: { userId: ..., chapterId: ..., studentName: ... }"
✅ "Sending reset request to: http://localhost:3000/api/results/reset-quiz"
```

### 5. Confirm in Modal
```
Modal appears: "⚠️ Reset Quiz Attempts?"
Shows: Student name
Buttons: "Yes, Reset" | "Cancel"
Click: "Yes, Reset"
```

### 6. Verify Success
```
✅ Green toast: "✅ Quiz reset successfully for [Name]!"
✅ Console shows: "Response status: 200"
✅ Page reloads automatically
```

---

## 🔍 Full Debugging if Issues Occur

### Issue 1: Nothing happens when you click Reset

**Check These:**
1. Is the button actually being clicked?
   - Try clicking very deliberately
   
2. Open browser console (F12)
   - Do you see ANY logs?
   - If not, button click isn't firing
   
3. Check page source
   - Right-click → Inspect
   - Find reset button
   - Verify `onclick="confirmResetQuiz(...)"`

**Solution:**
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh page (Ctrl+Shift+F5)
- Try a different browser
- Check if JavaScript is enabled

---

### Issue 2: Console shows "Reset clicked" but modal doesn't appear

**Check These:**
1. Look in console for errors
2. Search for "Confirmation modal not found!"
3. Check if CSS is loading

**Solution:**
- In console, run: `document.getElementById('confirmationModal')`
- Should return the modal element
- If null, refresh page
- Check admin-results.html has the modal HTML

---

### Issue 3: Modal appears but "Yes, Reset" doesn't work

**Check These:**
1. Click "Yes, Reset"
2. In console, look for:
   - "Reset confirmed with data:"
   - "Sending reset request to:"

**Solution:**
- Check network tab (F12 → Network)
- Look for POST to /results/reset-quiz
- Check response (should be 200)
- If 400/404, check userId/chapterId values

---

### Issue 4: API Error Response

**Check Network Tab:**
```
F12 → Network Tab → Click Reset → Look for "reset-quiz" request
```

**Check Response:**
```
200 OK = Success ✅
400 = Bad request (missing data)
401 = Unauthorized (bad token)
404 = User not found (bad userId)
500 = Server error
```

**Solution:**
- Check student exists in users.json
- Verify userId/chapterId in API request
- Restart backend server
- Check backend logs

---

## 📋 Console Log Reference

### Successful Flow Logs:

```
Step 1: Click Reset Button
────────────────────────────
Reset clicked: {
  userId: "1763448262211",
  chapterId: "1",
  studentName: "Abheesht Bagalkot"
}

Step 2: Click "Yes, Reset"
────────────────────────────
Reset confirmed with data: {
  userId: "1763448262211",
  chapterId: "1",
  studentName: "Abheesht Bagalkot"
}
Sending reset request to: http://localhost:3000/api/results/reset-quiz

Step 3: API Response
────────────────────────────
Response status: 200
Response data: {
  success: true,
  message: "Quiz attempts reset successfully",
  userId: "1763448262211",
  chapterId: "1",
  previousAttempts: 2
}
```

### Error Flow Logs:

```
Missing token:
───────────────
Admin token not found - Please login again

Modal not found:
────────────────
Confirmation modal not found!
Error: Confirmation dialog not found

Missing data:
─────────────
Missing data: {
  userId: null,
  chapterId: null,
  studentName: null
}

API Error:
──────────
Response status: 404
Response data: {
  error: "User not found"
}
Reset error response: { error: 'User not found' }
```

---

## 🔧 Manual Testing Commands

### Test API Endpoint Directly

```powershell
# PowerShell command to test reset endpoint

$body = @{
    userId = '1763448262211'
    chapterId = '1'
} | ConvertTo-Json

curl -X POST http://localhost:3000/api/results/reset-quiz `
  -H "Content-Type: application/json" `
  -d $body
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Quiz attempts reset successfully",
  "userId": "1763448262211",
  "chapterId": "1",
  "previousAttempts": 2
}
```

If this works, backend is fine. If not, restart backend server.

---

## ✅ Sign-off Checklist

- [ ] Reset button visible on results table
- [ ] Console shows "Reset clicked" when button clicked
- [ ] Modal appears with student name
- [ ] "Yes, Reset" makes API request
- [ ] Console shows "Response status: 200"
- [ ] Success toast appears with student name
- [ ] Page reloads after 1.5 seconds
- [ ] Student's quiz button unlocks after reset
- [ ] Student can retake quiz normally

---

## 📞 Support

If issue persists after troubleshooting:

1. **Check Backend Logs:**
   ```
   Terminal where npm start is running
   Look for error messages
   ```

2. **Clear Everything:**
   - Clear browser cache (Ctrl+Shift+Delete)
   - Restart backend server
   - Hard refresh page (Ctrl+Shift+F5)
   - Try again

3. **Check Files Modified:**
   - `frontend/admin-results.html` ← Updated with logging
   - `backend/routes/results.js` ← Should be unchanged
   - No other files needed

---

**Status: Feature should work with enhanced debugging! 🚀**
