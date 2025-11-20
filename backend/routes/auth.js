const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const path = require('path');
const nodemailer = require('nodemailer');

const JWT_SECRET = 'kannada-learning-secret-key-2024'; // Change this in production
const USERS_FILE = path.join(__dirname, '../data/users.json');

// In-memory OTP storage (in production, use Redis or database)
const otpStore = new Map();

// Email configuration (using Gmail - configure with your credentials)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com', // Configure this
        pass: process.env.EMAIL_PASS || 'your-app-password'      // Use App Password
    }
});

// Helper functions
async function readUsers() {
    try {
        const data = await fs.readFile(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return { users: [] };
    }
}

async function writeUsers(data) {
    await fs.writeFile(USERS_FILE, JSON.stringify(data, null, 2));
}

// Generate 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via Email
async function sendEmailOTP(email, otp) {
    const mailOptions = {
        from: process.env.EMAIL_USER || 'your-email@gmail.com',
        to: email,
        subject: 'Password Reset OTP - Kannada Learning App',
        html: `
            <h2>Password Reset Request</h2>
            <p>Your OTP for password reset is:</p>
            <h1 style="color: #4CAF50; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
            <p>This OTP is valid for 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email OTP sent to ${email}: ${otp}`);
        return true;
    } catch (error) {
        console.error('Email send error:', error);
        // Fallback: Log OTP to console for development/demo purposes
        console.log(`⚠️  Email service unavailable. Demo OTP for ${email}: ${otp}`);
        console.log('📝 NOTE: In development, copy this OTP to test password reset');
        return true; // Return true to allow demo mode to proceed
    }
}

// STUDENT SIGNUP
router.post('/signup', async (req, res) => {
    try {
        const { firstName, lastName, schoolCollege, email, mobile, password } = req.body;

        // Validation
        if (!firstName || !lastName || !email || !mobile || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Mobile validation (10 digits)
        const mobileRegex = /^[0-9]{10}$/;
        if (!mobileRegex.test(mobile)) {
            return res.status(400).json({ error: 'Mobile number must be 10 digits' });
        }

        const usersData = await readUsers();

        // Check if user already exists
        const existingUser = usersData.users.find(u => u.email === email || u.mobile === mobile);
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email or mobile already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            firstName,
            lastName,
            schoolCollege: schoolCollege || '',
            email,
            mobile,
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };

        usersData.users.push(newUser);
        await writeUsers(usersData);

        // Generate JWT token
        const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            success: true,
            message: 'Registration successful',
            token,
            user: {
                id: newUser.id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                mobile: newUser.mobile,
                schoolCollege: newUser.schoolCollege
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// STUDENT LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const usersData = await readUsers();
        const user = usersData.users.find(u => u.email === email);

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                mobile: user.mobile,
                schoolCollege: user.schoolCollege
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// ADMIN LOGIN
router.post('/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Hardcoded admin credentials
        if (username === 'admin' && password === 'admin@123') {
            const token = jwt.sign({ role: 'admin', username }, JWT_SECRET, { expiresIn: '24h' });
            
            res.json({
                success: true,
                message: 'Admin login successful',
                token,
                role: 'admin'
            });
        } else {
            res.status(401).json({ error: 'Invalid admin credentials' });
        }
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ error: 'Admin login failed' });
    }
});

// REQUEST PASSWORD RESET (Send OTP)
router.post('/forgot-password', async (req, res) => {
    try {
        const { email, mobile, method } = req.body; // method: 'email' or 'mobile'

        const usersData = await readUsers();
        let user;

        if (method === 'email' && email) {
            user = usersData.users.find(u => u.email === email);
        } else if (method === 'mobile' && mobile) {
            user = usersData.users.find(u => u.mobile === mobile);
        }

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate OTP
        const otp = generateOTP();
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

        // Store OTP
        const otpKey = method === 'email' ? user.email : user.mobile;
        otpStore.set(otpKey, { otp, expiresAt, userId: user.id });

        // Send OTP
        if (method === 'email') {
            const sent = await sendEmailOTP(user.email, otp);
            // Allow demo mode to proceed even if email fails
            res.json({ 
                success: true, 
                message: 'OTP sent to your email. Check console/terminal for demo OTP if email is not configured.', 
                method: 'email',
                demo_otp: otp  // Include for development/demo purposes
            });
        } else {
            // For mobile, we'll simulate sending (integrate Twilio or other SMS service)
            console.log(`OTP for ${mobile}: ${otp}`); // For testing
            res.json({ 
                success: true, 
                message: 'OTP sent to your mobile (Check console for demo)', 
                method: 'mobile',
                demo_otp: otp // Remove this in production!
            });
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
});

// VERIFY OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, mobile, otp, method } = req.body;
        
        const key = method === 'email' ? email : mobile;
        const stored = otpStore.get(key);

        if (!stored) {
            return res.status(400).json({ error: 'No OTP request found' });
        }

        if (Date.now() > stored.expiresAt) {
            otpStore.delete(key);
            return res.status(400).json({ error: 'OTP expired' });
        }

        if (stored.otp !== otp) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        // OTP verified - generate reset token
        const resetToken = jwt.sign({ userId: stored.userId, purpose: 'reset' }, JWT_SECRET, { expiresIn: '15m' });
        
        res.json({ 
            success: true, 
            message: 'OTP verified',
            resetToken 
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
});

// RESET PASSWORD
router.post('/reset-password', async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;

        if (!resetToken || !newPassword) {
            return res.status(400).json({ error: 'Reset token and new password are required' });
        }

        // Verify reset token
        let decoded;
        try {
            decoded = jwt.verify(resetToken, JWT_SECRET);
        } catch (error) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        if (decoded.purpose !== 'reset') {
            return res.status(400).json({ error: 'Invalid token' });
        }

        const usersData = await readUsers();
        const userIndex = usersData.users.findIndex(u => u.id === decoded.userId);

        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        usersData.users[userIndex].password = hashedPassword;

        await writeUsers(usersData);

        // Clear OTP from store
        const user = usersData.users[userIndex];
        otpStore.delete(user.email);
        otpStore.delete(user.mobile);

        res.json({ success: true, message: 'Password reset successful' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Password reset failed' });
    }
});

// VERIFY TOKEN (for protected routes)
router.get('/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ success: true, user: decoded });
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

// GET ALL STUDENTS (for admin)
router.get('/students', async (req, res) => {
    try {
        const usersData = await readUsers();
        // Return all users except password field
        const students = usersData.users.map(user => {
            const { password, ...studentData } = user;
            return studentData;
        });
        res.json(students);
    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
});

// GET USER BY ID (for refreshing user data)
router.get('/user/:id', async (req, res) => {
    try {
        const usersData = await readUsers();
        const user = usersData.users.find(u => u.id === req.params.id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Return user data without password
        const { password, ...userData } = user;
        res.json(userData);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to fetch user data' });
    }
});

// CHANGE PASSWORD (for logged-in users)
router.post('/change-password', async (req, res) => {
    try {
        const { userId, currentPassword, newPassword } = req.body;

        if (!userId || !currentPassword || !newPassword) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters' });
        }

        const usersData = await readUsers();
        const user = usersData.users.find(u => u.id === userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        // Hash and update new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.updatedAt = new Date().toISOString();

        await writeUsers(usersData);

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

// REQUEST PASSWORD RESET (Send OTP to email)
router.post('/request-password-reset', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const usersData = await readUsers();
        const user = usersData.users.find(u => u.email === email);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate OTP
        const otp = generateOTP();
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

        // Store OTP
        otpStore.set(email, { otp, expiresAt, userId: user.id });

        // Send OTP via email
        const sent = await sendEmailOTP(email, otp);
        if (!sent) {
            return res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
        }

        res.json({ success: true, message: 'OTP sent to your email' });
    } catch (error) {
        console.error('Request password reset error:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
});

// RESET PASSWORD WITH OTP (New endpoint for student password reset)
router.post('/reset-password-with-otp', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ error: 'Email, OTP, and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters' });
        }

        const stored = otpStore.get(email);

        if (!stored) {
            return res.status(400).json({ error: 'No OTP request found. Please request a new OTP.' });
        }

        if (Date.now() > stored.expiresAt) {
            otpStore.delete(email);
            return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
        }

        if (stored.otp !== otp) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        // OTP verified - update password
        const usersData = await readUsers();
        const userIndex = usersData.users.findIndex(u => u.id === stored.userId);

        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        usersData.users[userIndex].password = hashedPassword;
        usersData.users[userIndex].updatedAt = new Date().toISOString();

        await writeUsers(usersData);

        // Clear OTP from store
        otpStore.delete(email);

        res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        console.error('Reset password with OTP error:', error);
        res.status(500).json({ error: 'Password reset failed' });
    }
});

// Update user details (for admin to edit student information)
router.put('/user/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, email, mobile, schoolCollege, progress } = req.body;

        // Validate required fields for profile update (progress is optional)
        if (firstName === undefined && lastName === undefined && email === undefined && 
            mobile === undefined && schoolCollege === undefined && progress === undefined) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        const usersData = await readUsers();
        const userIndex = usersData.users.findIndex(u => u.id === id);

        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update profile fields if provided
        if (firstName) usersData.users[userIndex].firstName = firstName;
        if (lastName) usersData.users[userIndex].lastName = lastName;
        
        // Email validation if email is provided
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ error: 'Invalid email format' });
            }
            
            // Check if new email is already taken by another user
            if (email !== usersData.users[userIndex].email) {
                const emailExists = usersData.users.some((u, idx) => 
                    u.email === email && idx !== userIndex
                );
                if (emailExists) {
                    return res.status(400).json({ error: 'Email already in use' });
                }
            }
            usersData.users[userIndex].email = email;
        }
        
        if (mobile) usersData.users[userIndex].mobile = mobile;
        if (schoolCollege !== undefined) usersData.users[userIndex].schoolCollege = schoolCollege || '';
        
        // Update progress if provided (from student.js after quiz submission)
        if (progress !== undefined) {
            usersData.users[userIndex].progress = progress;
            console.log(`✅ Progress updated for user ${id}:`, progress);
        }
        
        usersData.users[userIndex].updatedAt = new Date().toISOString();

        await writeUsers(usersData);

        res.json({
            success: true,
            message: 'User updated successfully',
            user: usersData.users[userIndex]
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Delete user (for admin to remove student from system)
router.delete('/user/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const usersData = await readUsers();
        const userIndex = usersData.users.findIndex(u => u.id === id);

        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Remove user from array
        const deletedUser = usersData.users.splice(userIndex, 1)[0];

        // Write updated users back to file
        await writeUsers(usersData);

        res.json({
            success: true,
            message: 'User deleted successfully',
            deletedUser: {
                id: deletedUser.id,
                firstName: deletedUser.firstName,
                lastName: deletedUser.lastName,
                email: deletedUser.email
            }
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

module.exports = router;
