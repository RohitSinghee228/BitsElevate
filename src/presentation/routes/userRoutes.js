const express = require('express');
const router = express.Router();
const userService = require('../../application/services/UserService');
const { authenticateToken } = require('../../infrastructure/security');

// Google OAuth route
router.post('/google-auth', async (req, res) => {
  console.log('Google authentication request received:', req.body);
  try {
    const { email, name, uid, photoURL } = req.body;
    
    // Validate the email domain for BITS
    if (!email.endsWith('@pilani.bits-pilani.ac.in')) {
      return res.status(400).json({ message: 'Only BITS Pilani emails are allowed.' });
    }
    
    // Check if the user exists
    let user;
    try {
      user = await userService.getUserByEmail(email);
      console.log('Existing user found for Google auth:', user.email);
    } catch (error) {
      // If user doesn't exist, create a new one
      console.log('Creating new user for Google auth:', email);
      
      // Extract name parts and BITS ID
      const bitsId = email.split('@')[0];
      const [firstName, lastName] = name.split(' ');
      
      // Register the user with auto-generated password
      user = await userService.register({
        email,
        password: `bits${bitsId}`,
        firstName: firstName || bitsId,
        lastName: lastName || '',
        role: 'student',
        googleId: uid,
        profilePicture: photoURL
      });
    }
    
    // Generate authentication token
    const token = userService.generateToken(user);
    
    // Return user info and token
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Google auth error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// Auth routes - adjusted to match frontend paths
router.post('/auth/login', async (req, res) => {
  console.log('Login request received at /auth/login:', req.body);
  try {
    const { email, password } = req.body;
    const result = await userService.login(email, password);
    console.log('Login successful');
    res.json(result);
  } catch (error) {
    console.error('Login error at /auth/login:', error.message);
    res.status(401).json({ message: error.message });
  }
});

router.post('/auth/register', async (req, res) => {
  console.log('Registration request received at /auth/register:', req.body);
  try {
    const user = await userService.register(req.body);
    console.log('Registration successful');
    res.status(201).json(user);
  } catch (error) {
    console.error('Registration error at /auth/register:', error.message);
    res.status(400).json({ message: error.message });
  }
});

// Add token verification route
router.get('/auth/verify', authenticateToken, async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Token verification error:', error.message);
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Legacy routes to maintain backwards compatibility
router.post('/login', async (req, res) => {
  console.log('Login request received at /login:', req.body);
  try {
    const { email, password } = req.body;
    const result = await userService.login(email, password);
    console.log('Login successful');
    res.json(result);
  } catch (error) {
    console.error('Login error at /login:', error.message);
    res.status(401).json({ message: error.message });
  }
});

router.post('/register', async (req, res) => {
  console.log('Registration request received at /register:', req.body);
  try {
    const user = await userService.register(req.body);
    console.log('Registration successful');
    res.status(201).json(user);
  } catch (error) {
    console.error('Registration error at /register:', error.message);
    res.status(400).json({ message: error.message });
  }
});

// User management routes
router.get('/userManagement/getAll', authenticateToken, async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/userManagement/remove/:id', authenticateToken, async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/userManagement/update/:id', authenticateToken, async (req, res) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Profile routes
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.id);
    res.json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await userService.updateUser(req.user.id, req.body);
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/enroll/:courseId', authenticateToken, async (req, res) => {
  try {
    const user = await userService.enrollInCourse(req.user.id, req.params.courseId);
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 