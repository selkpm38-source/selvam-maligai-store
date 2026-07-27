/**
 * Centralized error handling.
 * - AppError: throw this for expected/operational errors with a clean message.
 * - notFound: 404 handler for unmatched routes.
 * - errorHandler: final middleware; never leaks stack traces in production.
 */
'use strict';

const logger = require('../utils/logger');
const env = require('../config/env');

class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

function notFound(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;

  logger.error(err.message, {
    statusCode,
    path: req.originalUrl,
    method: req.method,
    stack: err.stack,
  });

  res.status(statusCode).json({
    success: false,
    message: err.isOperational ? err.message : 'Internal server error.',
    ...(env.isProduction ? {} : { stack: err.stack }),
  });
}

module.exports = { AppError, notFound, errorHandler };
