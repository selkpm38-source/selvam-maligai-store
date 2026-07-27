/**
 * Reusable express-validator chains + a helper to run them and
 * short-circuit with a clean 400 response on failure.
 */
'use strict';

const { body, validationResult } = require('express-validator');
const { AppError } = require('../middlewares/errorHandler');

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array().map((e) => e.msg).join(' ');
    return next(new AppError(message, 422));
  }
  next();
}

const registerValidators = [
  body('name').optional({ values: 'null' }).trim().isLength({ min: 2, max: 120 }).withMessage('Name must be 2-120 characters.'),
  body('email').optional({ values: 'null' }).trim().isEmail().withMessage('A valid email is required.').normalizeEmail(),
  body('phone').optional({ checkFalsy: true }).trim().isMobilePhone('any').withMessage('A valid phone number is required.'),
  body('password')
    .optional({ values: 'null' })
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters.'),
];

const loginValidators = [
  body('email').trim().isEmail().withMessage('A valid email is required.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
];

module.exports = { handleValidation, registerValidators, loginValidators };
