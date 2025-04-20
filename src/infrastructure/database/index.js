const mongoose = require('mongoose');

const setupDatabase = async () => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: process.env.MONGODB_POOL_SIZE || 10,
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 60000,
    };

    // Remove appName from the URI if it exists
    let mongoURI = process.env.MONGODB_URI;
    if (mongoURI.includes('appName=')) {
      mongoURI = mongoURI.replace(/&appName=[^&]+/, '');
    }

    // Check if we have a valid connection string
    if (!mongoURI || !mongoURI.includes('mongodb')) {
      console.error('Invalid MongoDB connection string. Please check your .env file');
      return;
    }

    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(mongoURI, options);
    console.log('Connected to MongoDB successfully');
    
    // Add event listeners for connection issues
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected, attempting to reconnect...');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully');
    });
    
  } catch (error) {
    console.error('MongoDB connection error:', error);
    
    // Don't exit the process on connection failure, allow the app to keep running
    console.log('Application will continue running without database functionality');
  }
};

module.exports = { setupDatabase }; 