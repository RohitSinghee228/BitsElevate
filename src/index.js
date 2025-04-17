require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { setupDatabase } = require('./infrastructure/database');
const { setupSecurity } = require('./infrastructure/security');
const { setupLogging } = require('./infrastructure/logging');
const { setupExternalServices } = require('./infrastructure/external-services');
const fs = require('fs');

// Import routes
const userRoutes = require('./presentation/routes/userRoutes');
const courseRoutes = require('./presentation/routes/courseRoutes');
const paymentRoutes = require('./presentation/routes/paymentRoutes');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // This is needed for the React app to work properly
}));

// Enhanced CORS configuration
app.use(cors({
  origin: '*', // Allow all origins for development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(morgan('combined'));

// Setup infrastructure
setupDatabase();
setupSecurity(app);
setupLogging(app);
setupExternalServices();

// API Routes - all under /api prefix
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/payments', paymentRoutes);

// Serve static files from the React app in the presentation layer
const staticPath = path.join(__dirname, 'presentation/build');
console.log('Static files path:', staticPath);

app.use(express.static(staticPath, {
  maxAge: '1h',
  index: ['index.html'],
  redirect: false,
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      // Don't cache HTML files
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// Handle 404 errors for API routes
app.use('/api/*', (req, res) => {
  console.log('API route not found:', req.originalUrl);
  res.status(404).json({ 
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Serve React app for all other non-API routes
app.get('*', (req, res) => {
  console.log('Serving index.html for:', req.originalUrl);
  
  // Check if the specific file exists in the static folder
  const filePath = path.join(staticPath, req.path);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    console.log('Serving existing file:', filePath);
    return res.sendFile(filePath);
  }
  
  // First check if 404.html exists
  const notFoundPath = path.join(staticPath, '404.html');
  if (req.path !== '/' && fs.existsSync(notFoundPath)) {
    console.log('Serving 404.html for not found path:', req.path);
    return res.status(404).sendFile(notFoundPath);
  }
  
  // Otherwise fall back to index.html
  console.log('Serving index.html as fallback');
  res.sendFile(path.join(staticPath, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  console.error('Error stack:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// Start the server
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
  console.log(`💻 API available at http://localhost:${port}/api`);
  console.log(`🌐 UI available at http://localhost:${port}`);
}); 