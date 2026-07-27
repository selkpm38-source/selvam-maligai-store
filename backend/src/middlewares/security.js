/**
 * Central security middleware stack.
 * Mounted in server.js in this order: helmet -> cors -> compression ->
 * body parsers -> sanitizers -> rate limiters -> csrf.
 */
'use strict';

const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const xss = require('xss');
const mongoSanitize = require('express-mongo-sanitize'); // also strips $/. keys from bodies, harmless for SQL apps, blocks NoSQL-style operator injection in JSON payloads
const { doubleCsrf } = require('csrf-csrf');
const env = require('../config/env');

// ---- Helmet: secure HTTP headers (clickjacking, MIME sniffing, etc.) ----
const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"], // extra clickjacking defense alongside X-Frame-Options
    },
  },
  crossOriginResourcePolicy: { policy: 'same-site' },
  hsts: env.isProduction ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
});

// ---- CORS: only the configured client origin, credentials allowed ----
const corsMiddleware = cors({
  origin: env.clientUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
});

// ---- Rate limiting ----
const generalLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

// Stricter limiter for auth endpoints — mitigates brute force / credential stuffing.
const authLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { success: false, message: 'Too many authentication attempts. Please try again later.' },
});

// ---- CSRF (double-submit cookie pattern) ----
const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf({
  getSecret: () => env.csrfSecret,
  cookieName: env.isProduction ? '__Host-csrf' : 'csrf-token',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'strict',
    secure: env.cookie.secure,
    path: '/',
  },
  size: 64,
  getTokenFromRequest: (req) => req.headers['x-csrf-token'],
});

/**
 * XSS sanitization: recursively strips dangerous HTML/script content from
 * every string in req.body/query/params using the actively-maintained
 * `xss` library (the older `xss-clean` package is unmaintained and was
 * deliberately avoided here).
 */
function deepSanitize(value) {
  if (typeof value === 'string') return xss(value);
  if (Array.isArray(value)) return value.map(deepSanitize);
  if (value && typeof value === 'object') {
    const out = {};
    for (const key of Object.keys(value)) out[key] = deepSanitize(value[key]);
    return out;
  }
  return value;
}

function xssMiddlewareFn(req, res, next) {
  if (req.body) req.body = deepSanitize(req.body);
  if (req.params) req.params = deepSanitize(req.params);
  // req.query is a getter-only property on some Express versions; mutate in place instead of reassigning.
  if (req.query) {
    const sanitizedQuery = deepSanitize(req.query);
    for (const key of Object.keys(req.query)) delete req.query[key];
    Object.assign(req.query, sanitizedQuery);
  }
  next();
}

/**
 * SQL injection is primarily prevented at the query layer (parameterized
 * queries in config/db.js). This middleware is a defense-in-depth net that
 * rejects requests containing classic SQL meta-sequences in query/body
 * string values, in case a future route ever forgets to parameterize.
 */
const SQLI_PATTERN = /(\b(select|insert|update|delete|drop|union|exec)\b.*\b(from|into|table|where)\b)|(--)|(;--)|(\/\*)/i;

function blockSqlInjectionPatterns(req, res, next) {
  const values = [
    ...Object.values(req.query || {}),
    ...Object.values(req.body || {}),
    ...Object.values(req.params || {}),
  ];
  for (const v of values) {
    if (typeof v === 'string' && SQLI_PATTERN.test(v)) {
      return res.status(400).json({ success: false, message: 'Invalid input detected.' });
    }
  }
  next();
}

module.exports = {
  helmetMiddleware,
  corsMiddleware,
  generalLimiter,
  authLimiter,
  hppMiddleware: hpp(), // prevents HTTP parameter pollution
  xssMiddleware: xssMiddlewareFn, // strips <script> etc. from req.body/query/params
  sanitizeMiddleware: mongoSanitize(),
  blockSqlInjectionPatterns,
  doubleCsrfProtection,
  generateCsrfToken,
};
