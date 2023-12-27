import winston from 'winston';

// Define the log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.simple()
);

// Create a logger with a console transport and file transport
const logger = winston.createLogger({
  format: logFormat,
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'app.log' })
  ]
});

export default logger;
