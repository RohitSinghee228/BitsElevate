const winston = require('winston');
const path = require('path');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error'
    }),
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log')
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

const setupLogging = (app) => {
  // Request logging middleware
  app.use((req, res, next) => {
    logger.info({
      method: req.method,
      path: req.path,
      ip: req.ip
    });
    next();
  });

  // Error logging middleware
  app.use((err, req, res, next) => {
    logger.error({
      message: err.message,
      stack: err.stack,
      method: req.method,
      path: req.path
    });
    next(err);
  });
};

module.exports = { setupLogging, logger }; 