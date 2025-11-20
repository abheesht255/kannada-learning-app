# Authentication & OTP Setup Guide

## Email OTP Configuration (Free)

### Using Gmail (Recommended for Demo)

1. **Enable 2-Factor Authentication** on your Gmail account:
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Create App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password

3. **Configure Environment Variables**:
   ```bash
   # Windows PowerShell
   $env:EMAIL_USER = "your-email@gmail.com"
   $env:EMAIL_PASS = "your-16-char-app-password"
   
   # OR create a .env file in backend folder:
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

### Alternative Free Email Services:

**1. SendGrid (100 emails/day free)**
- Sign up: https://sendgrid.com/
- Get API key
- Install: `npm install @sendgrid/mail`
- Update backend/routes/auth.js to use SendGrid

**2. Mailgun (5,000 emails/month free)**
- Sign up: https://www.mailgun.com/
- Get API credentials
- Install: `npm install mailgun.js`

**3. Brevo (300 emails/day free)**
- Sign up: https://www.brevo.com/
- Get SMTP credentials
- Use with nodemailer

## SMS OTP Configuration (Free Options)

### 1. Twilio (Free Trial - $15 credit)
```bash
npm install twilio
```

Update `backend/routes/auth.js`:
```javascript
const twilio = require('twilio');
const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

async function sendSMSOTP(mobile, otp) {
    await client.messages.create({
        body: `Your Kannada Learning App OTP is: ${otp}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: `+91${mobile}` // Add country code
    });
}
```

### 2. MSG91 (Free tier available)
- Sign up: https://msg91.com/
- Get auth key
- Free for testing

### 3. TextLocal (25 SMS free trial)
- Sign up: https://www.textlocal.in/
- Get API key

### 4. Fast2SMS (India - Free tier)
- Sign up: https://www.fast2sms.com/
- Good for Indian numbers

## Current Demo Mode

The app currently logs OTP to console for testing. To test:

1. Go to forgot password
2. Select "Mobile" method
3. Enter registered mobile
4. Check terminal/console for OTP
5. Enter OTP to reset password

## Production Deployment

Before deploying:

1. **Remove demo_otp from responses** in `backend/routes/auth.js`
2. **Set up proper email service**
3. **Configure SMS service** (if using mobile OTP)
4. **Change JWT_SECRET** in auth.js
5. **Use HTTPS** for secure token transmission
6. **Set secure: true** in cookie options

## Login Credentials

### Admin:
- Username: `admin`
- Password: `admin@123`

### Students:
- Students need to sign up using the signup form
- Fields required:
  - First Name
  - Last Name
  - School/College (optional)
  - Email
  - Mobile (10 digits)
  - Password

## Features

✅ Student signup with validation
✅ Secure password hashing (bcrypt)
✅ JWT token-based authentication
✅ Email OTP for password reset
✅ Mobile OTP for password reset
✅ Admin authentication
✅ Quiz results tracking
✅ PDF export of results
✅ Student-wise performance analytics

## API Endpoints

### Authentication:
- POST /api/auth/signup - Register new student
- POST /api/auth/login - Student login
- POST /api/auth/admin/login - Admin login
- POST /api/auth/forgot-password - Request OTP
- POST /api/auth/verify-otp - Verify OTP
- POST /api/auth/reset-password - Set new password

### Results:
- POST /api/results/submit - Submit quiz result
- GET /api/results/all - Get all results (Admin)
- GET /api/results/user/:userId - Get user results
- GET /api/results/statistics - Get dashboard stats
- GET /api/results/download-pdf/:resultId - Download PDF
- GET /api/results/download-csv - Download all results CSV

## Quick Start

1. Install dependencies (already done):
   ```bash
   cd backend
   npm install
   ```

2. Configure email (optional - works in demo mode):
   ```bash
   $env:EMAIL_USER = "your-email@gmail.com"
   $env:EMAIL_PASS = "your-app-password"
   ```

3. Start server:
   ```bash
   node server.js
   ```

4. Open browser:
   - Student Portal: http://localhost:3000 (redirects to login)
   - Admin Login: http://localhost:3000/admin-login.html
   - Admin Results: http://localhost:3000/admin-results.html

## Security Notes

⚠️ Current setup is for development/demo
⚠️ For production:
- Use environment variables for all secrets
- Enable HTTPS
- Add rate limiting
- Implement CSRF protection
- Add input sanitization
- Use a real database (MongoDB, PostgreSQL)
- Set up proper session management
- Add email verification on signup
