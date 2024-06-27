import winston from 'winston';

// Log format defined
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.simple()
);

// Logger with a console transport and file transport created
const logger = winston.createLogger({
  format: logFormat,
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'audit.log' })
  ]
});

export default logger;
