const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Password hashing
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

// Password verification
const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Generate JWT token
const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'your_jwt_secret_for_testing';
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// Authenticate JWT token middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'your_jwt_secret_for_testing';
    const user = jwt.verify(token, secret);
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

const setupSecurity = (app) => {
  // Add security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });
};

module.exports = { 
  authenticateToken, 
  setupSecurity,
  hashPassword,
  verifyPassword,
  generateToken
}; 