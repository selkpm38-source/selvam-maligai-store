/**
 * SELVAM MALIGAI STORE — API entrypoint
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

app.set('trust proxy', 1);

// ---------------- Security ----------------
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

app.use(
  morgan(env.isProduction ? 'combined' : 'dev', {
    stream: {
      write: (msg) => logger.info(msg.trim()),
    },
  })
);

// ---------------- Static ----------------
app.use(
  '/uploads',
  express.static('uploads', {
    dotfiles: 'deny',
    index: false,
  })
);

// ---------------- Database ----------------
const dbInitPromise = initializeDatabase().catch((err) => {
  console.error('DATABASE INITIALIZATION FAILED');
  console.error(err);

  logger.error('Database initialization failed', err);

  throw err;
});

app.use(async (req, res, next) => {
  try {
    await dbInitPromise;
    next();
  } catch (err) {
    next(err);
  }
});

// ---------------- Health ----------------
app.get('/api/health', async (req, res) => {
  try {
    await db.healthCheck();

    res.json({
      success: true,
      status: 'ok',
      db: 'connected',
      message: 'Backend is working',
    });
  } catch (err) {
    console.error('==============================');
    console.error('HEALTH CHECK FAILED');
    console.error(err);
    console.error('==============================');

    res.status(500).json({
      success: false,
      status: 'error',
      message: err.message,
      stack:
        process.env.NODE_ENV === 'production'
          ? undefined
          : err.stack,
    });
  }
});

// ---------------- Routes ----------------
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// ---------------- Error Handling ----------------
app.use(notFound);
app.use(errorHandler);

// ---------------- Local Server ----------------
async function startServer() {
  try {
    await dbInitPromise;

    app.listen(env.port, '0.0.0.0', () => {
      console.log(
        `Server running on port ${env.port}`
      );
    });
  } catch (err) {
    console.error('SERVER START FAILED');
    console.error(err);
    process.exit(1);
  }
}

if (require.main === module && process.env.VERCEL !== '1') {
  startServer();
}

module.exports = app;