/**
 * Centralized, validated environment configuration.
 */
'use strict';

require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
const productionClientUrl = 'https://selvammaligai.vercel.app';
const vercelClientUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL.replace(/\/$/, '')}` : null;
const defaultDatabaseUrl = process.env.DATABASE_URL || process.env.DIRECT_URL || 'postgresql://postgres.ctxpqkmuosezyvyjubwa:a7IIGPLECGGekjkO@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true';
const defaultJwtAccessSecret = process.env.JWT_ACCESS_SECRET || '7d7345c49cd774f828cd59ede2fbfa87024431964d2c9fd04b89ad7ff31a1f0f15905bbf02b97f00bc404eed2de8ea947a8af61cbf67d4ffaa5faeb68c6eebe8';
const defaultJwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'bf286d2c591e33a128d3baca5af91b48692f67964baeea4f9af7d2abf4fe3714ce87770cf4dd92aff85db13dcdf0a771245caf921c4a2fd588f8973571e00b03';
const defaultCookieSecret = process.env.COOKIE_SECRET || '26fed0bb0d8a5664567e1d6396afca0973c2f3dd3a11e14975062c05a43c8cb3eab3c117edc963d3abf13ba2645a8ec850e871ea780c622a081c2b6da4c286fe';
const defaultCsrfSecret = process.env.CSRF_SECRET || '08e7fbb04ec4d91af113d1bcbc9274bdf7155a7c861521e97ef159d6af52ef8eba2dfe4d46f6f8ea34b49d4941bcfec30da2ba20b198c631938df125c33249f5';

if (isProduction) {
  const defaultClientUrl = process.env.CLIENT_URL || vercelClientUrl || productionClientUrl;
  const configuredClientUrl = defaultClientUrl.replace(/\/$/, '');
  const localClientValues = ['http://localhost', 'http://127.0.0.1', 'http://0.0.0.0', 'https://localhost'];

  if (
    !configuredClientUrl.startsWith('https://') ||
    localClientValues.some((value) => configuredClientUrl.startsWith(value))
  ) {
    process.env.CLIENT_URL = productionClientUrl;
  } else {
    process.env.CLIENT_URL = configuredClientUrl;
  }

  if (process.env.COOKIE_SECURE !== 'true') {
    process.env.COOKIE_SECURE = 'true';
  }
}

module.exports = {
  isProduction,

  port: parseInt(process.env.PORT, 10) || 5000,

  clientUrl: (
    process.env.CLIENT_URL || (isProduction ? 'https://selvammaligai.vercel.app' : 'http://localhost:5173')
  ).replace(/\/$/, ''),

  ownerEmail: (
    process.env.OWNER_EMAIL || 'owner@selvammaligai.store'
  ).toLowerCase(),

  // PostgreSQL connection
  databaseUrl: defaultDatabaseUrl,

  jwt: {
    accessSecret: defaultJwtAccessSecret,

    refreshSecret: defaultJwtRefreshSecret,

    accessExpiresIn:
      process.env.JWT_ACCESS_EXPIRES_IN || '15m',

    refreshExpiresIn:
      process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  cookie: {
    secret: defaultCookieSecret,

    secure: process.env.COOKIE_SECURE === 'true' || isProduction,

    sameSite:
      process.env.COOKIE_SAME_SITE ||
      (isProduction ? 'none' : 'lax'),
  },

  csrfSecret: defaultCsrfSecret,

  rateLimit: {
    windowMs:
      parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) ||
      15 * 60 * 1000,

    max:
      parseInt(process.env.RATE_LIMIT_MAX, 10) ||
      200,

    authMax:
      parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) ||
      100,
  },

  lockout: {
    maxFailedAttempts:
      parseInt(process.env.MAX_FAILED_LOGIN_ATTEMPTS, 10) ||
      5,

    durationMinutes:
      parseInt(process.env.LOCKOUT_DURATION_MINUTES, 10) ||
      15,
  },

  upload: {
    dir:
      process.env.UPLOAD_DIR ||
      'uploads/products',

    maxSizeMb:
      parseInt(process.env.MAX_UPLOAD_SIZE_MB, 10) ||
      5,
  },
};