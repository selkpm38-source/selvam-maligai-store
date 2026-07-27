'use strict';

const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const db = require('../config/db');

async function ensureOwnerAccount() {
  const ownerEmail = (process.env.OWNER_EMAIL || 'owner@selvammaligai.store').toLowerCase();
  const ownerPassword = process.env.OWNER_PASSWORD || 'Owner@1234';
  const passwordHash = await bcrypt.hash(ownerPassword, 10);
  const ownerId = uuidv4();

  await db.query(
    `INSERT INTO users
     (id, name, email, phone, password_hash, role, status, referral_code)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (email) DO UPDATE SET
       name = EXCLUDED.name,
       password_hash = EXCLUDED.password_hash,
       role = EXCLUDED.role,
       status = EXCLUDED.status`,
    [ownerId, 'Store Owner', ownerEmail, null, passwordHash, 'owner', 'active', null]
  );
}

async function initializeDatabase() {
  const statements = [
    `CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(190) NOT NULL UNIQUE,
      phone VARCHAR(20) UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'customer',
      status VARCHAR(30) NOT NULL DEFAULT 'active',
      failed_login_attempts INT NOT NULL DEFAULT 0,
      locked_until TIMESTAMP NULL,
      last_login_at TIMESTAMP NULL,
      referral_code VARCHAR(20) UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS categories (
      id VARCHAR(36) PRIMARY KEY,
      parent_id VARCHAR(36) NULL,
      name VARCHAR(120) NOT NULL,
      slug VARCHAR(140) NOT NULL UNIQUE,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      display_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(36) PRIMARY KEY,
      category_id VARCHAR(36) NOT NULL REFERENCES categories(id),
      name VARCHAR(200) NOT NULL,
      slug VARCHAR(220) NOT NULL UNIQUE,
      sku VARCHAR(60) NOT NULL UNIQUE,
      unit VARCHAR(30) NOT NULL DEFAULT 'pcs',
      mrp NUMERIC(10,2) NOT NULL,
      selling_price NUMERIC(10,2) NOT NULL,
      discount_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
      stock_status VARCHAR(30) NOT NULL DEFAULT 'in_stock',
      is_featured BOOLEAN NOT NULL DEFAULT FALSE,
      is_trending BOOLEAN NOT NULL DEFAULT FALSE,
      is_bestseller BOOLEAN NOT NULL DEFAULT FALSE,
      is_new_arrival BOOLEAN NOT NULL DEFAULT FALSE,
      status VARCHAR(30) NOT NULL DEFAULT 'active',
      avg_rating NUMERIC(3,2) NOT NULL DEFAULT 0,
      rating_count INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) NOT NULL DEFAULT 'customer'`,
    `ALTER TABLE users DROP CONSTRAINT IF EXISTS users_phone_key`,
    `CREATE INDEX IF NOT EXISTS idx_users_email ON users (email)`,
    `CREATE INDEX IF NOT EXISTS idx_products_category ON products (category_id)`,
    `CREATE INDEX IF NOT EXISTS idx_products_status ON products (status)`
  ];

  for (const statement of statements) {
    try {
      await db.query(statement);
    } catch (err) {
      const message = err && err.message ? err.message : '';
      if (message.includes('already exists') || message.includes('duplicate') || message.includes('relation')) {
        continue;
      }
      throw err;
    }
  }

  await ensureOwnerAccount();
}

module.exports = { initializeDatabase };
