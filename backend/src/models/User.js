'use strict';

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const env = require('../config/env');

const localStorePath = path.resolve(__dirname, 'localUserStore.js');
let localStore = null;
let localStoreLoadAttempted = false;

function loadLocalStore() {
  if (localStoreLoadAttempted) return localStore;
  localStoreLoadAttempted = true;

  try {
    if (fs.existsSync(localStorePath)) {
      localStore = require(localStorePath);
    } else {
      localStore = null;
      console.warn(
        'LocalUserStore file not found, continuing without fallback:',
        localStorePath
      );
    }
  } catch (err) {
    localStore = null;
    console.warn('Failed to load LocalUserStore fallback:', err.message);
  }

  return localStore;
}

function getStore() {
  return env.isProduction ? null : loadLocalStore();
}

async function findByEmail(email) {
  const store = getStore();
  if (store) return store.findByEmail(email);

  try {
    const rows = await db.query(
      'SELECT * FROM users WHERE email = $1 LIMIT 1',
      [email]
    );

    return rows[0] || null;
  } catch (err) {
    const storeFallback = getStore();

    if (storeFallback) {
      return storeFallback.findByEmail(email);
    }

    throw err;
  }
}

async function findById(id) {
  const store = getStore();
  if (store) return store.findById(id);

  const rows = await db.query(
    `SELECT id, name, email, phone, status, created_at
     FROM users
     WHERE id = $1
     LIMIT 1`,
    [id]
  );

  return rows[0] || null;
}

async function create({
  name,
  email,
  phone,
  passwordHash,
  referralCode,
  referredBy,
}) {
  const store = getStore();

  if (store) {
    return store.create({
      name,
      email,
      phone,
      passwordHash,
      referralCode,
      referredBy,
    });
  }

  const id = uuidv4();

  await db.query(
    `INSERT INTO users
      (id, name, email, phone, password_hash, referral_code, referred_by)
     VALUES
      ($1, $2, $3, $4, $5, $6, $7)`,
    [
      id,
      name,
      email,
      phone || null,
      passwordHash,
      referralCode,
      referredBy || null,
    ]
  );

  return findById(id);
}

async function incrementFailedAttempts(id) {
  const store = getStore();

  if (store) {
    return store.incrementFailedAttempts(id);
  }

  await db.query(
    `UPDATE users
     SET failed_login_attempts = failed_login_attempts + 1
     WHERE id = $1`,
    [id]
  );
}

async function lockAccount(id, until) {
  const store = getStore();

  if (store) {
    return store.lockAccount(id, until);
  }

  await db.query(
    `UPDATE users
     SET locked_until = $1
     WHERE id = $2`,
    [until, id]
  );
}

async function resetFailedAttempts(id) {
  const store = getStore();

  if (store) {
    return store.resetFailedAttempts(id);
  }

  await db.query(
    `UPDATE users
     SET failed_login_attempts = 0,
         locked_until = NULL,
         last_login_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [id]
  );
}

module.exports = {
  findByEmail,
  findById,
  create,
  incrementFailedAttempts,
  lockAccount,
  resetFailedAttempts,
};