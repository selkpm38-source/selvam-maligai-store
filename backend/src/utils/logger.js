/**
 * Application + audit logging via Winston.
 * - app.log / console: operational logs (errors, warnings, info)
 * - audit.log: security-relevant events (logins, order changes, admin actions)
 *   Audit logs are append-only from the app's perspective — never overwritten,
 *   never deleted through the API, feeding the `audit_logs` DB table too.
 */
'use strict';

const winston = require('winston');
const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';

const baseFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  format: baseFormat,
  transports: [
    new winston.transports.File({ filename: path.join(__dirname, '../../logs/error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(__dirname, '../../logs/app.log') }),
  ],
});

if (!isProduction) {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    })
  );
}

const auditLogger = winston.createLogger({
  level: 'info',
  format: baseFormat,
  transports: [new winston.transports.File({ filename: path.join(__dirname, '../../logs/audit.log') })],
});

module.exports = logger;
module.exports.audit = (event) => auditLogger.info(event);
