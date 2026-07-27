/**
 * SELVAM MALIGAI STORE — API entrypoint (Phase 1).
 * Only auth + health routes are wired in this phase; product/cart/order/
 * admin routes are added in Phases 2-3 following the same pattern.
 */
'use strict';

const express = require('express');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const morgan = require('morgan');

const env = require('./src/config/env');
const db = require('./src/config/db');
const logger = require('./src/utils/logger');
const {
  helmetMiddleware,
  corsMiddleware,
  generalLimiter,
  hppMiddleware,
  xssMiddleware,
  sanitizeMiddleware,
  blockSqlInjectionPatterns,
} = require('./src/middlewares/security');
const { notFound, errorHandler } = require('./src/middlewares/errorHandler');

const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const { initializeDatabase } = require('./src/database/initPostgres');

const app = express();

// Trust first proxy (needed for correct req.ip / secure cookies behind a
// reverse proxy such as Nginx in production).
app.set('trust proxy', 1);

// ---- Security & parsing middleware (order matters) ----
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser(env.cookie.secret));
app.use(hppMiddleware);
app.use(xssMiddleware);
app.use(sanitizeMiddleware);
app.use(blockSqlInjectionPatterns);
app.use(generalLimiter);

app.use(morgan(env.isProduction ? 'combined' : 'dev', { stream: { write: (msg) => logger.info(msg.trim()) } }));

// Static uploads (product images) — served read-only, no directory listing.
app.use('/uploads', express.static('uploads', { dotfiles: 'deny', index: false }));

// ---- Health check ----
app.get('/api/health', async (req, res) => {
  try {
    await db.healthCheck();
    res.json({ success: true, status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(503).json({ success: false, status: 'degraded', db: 'unreachable' });
  }
});

// ---- Routes ----
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// ---- 404 + error handling (must be last) ----
app.use(notFound);
app.use(errorHandler);

if (require.main === module) {
  initializeDatabase()
    .then(() => {
      app.listen(env.port, '0.0.0.0', () => {
        logger.info(`SELVAM MALIGAI STORE API listening on port ${env.port} [${env.isProduction ? 'production' : 'development'}]`);
      });
    })
    .catch((err) => {
      logger.error('Database initialization failed', err);
      process.exit(1);
    });
}

module.exports = app;
