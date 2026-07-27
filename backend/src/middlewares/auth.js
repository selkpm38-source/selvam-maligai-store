/**
 * Authentication & role-based access control middleware.
 * `authenticate` verifies the access token from the Authorization header.
 * `authorize(...roles)` restricts a route to specific roles (e.g. admin roles).
 */
'use strict';

const { verifyAccessToken } = require('../utils/jwt');
const { AppError } = require('./errorHandler');

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return next(new AppError('Authentication required.', 401));
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded; // { id, role, type: 'customer' | 'admin' }
    next();
  } catch (err) {
    return next(new AppError('Invalid or expired session. Please log in again.', 401));
  }
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    next();
  };
}

function ownerOnly(req, res, next) {
  if (!req.user) return next(new AppError('Authentication required.', 401));
  if (req.user.role !== 'owner') return next(new AppError('Owner access required.', 403));
  next();
}

module.exports = { authenticate, authorize, ownerOnly };
