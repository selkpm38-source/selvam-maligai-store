/**
 * Local fallback user store for development when MySQL is unavailable.
 * This is not intended for production use.
 */
'use strict';

const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const storagePath = path.resolve(__dirname, '../../data/local-users.json');

async function ensureStorageFile() {
  try {
    await fs.access(storagePath);
  } catch {
    await fs.mkdir(path.dirname(storagePath), { recursive: true });
    await fs.writeFile(storagePath, '[]', 'utf8');
  }
}

async function loadUsers() {
  await ensureStorageFile();
  const contents = await fs.readFile(storagePath, 'utf8');
  try {
    return JSON.parse(contents);
  } catch {
    return [];
  }
}

async function saveUsers(users) {
  await ensureStorageFile();
  await fs.writeFile(storagePath, JSON.stringify(users, null, 2), 'utf8');
}

async function findByEmail(email) {
  const users = await loadUsers();
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase()) || null;
}

async function findById(id) {
  const users = await loadUsers();
  return users.find((user) => user.id === id) || null;
}

async function create({ name, email, phone, passwordHash, referralCode, referredBy }) {
  const users = await loadUsers();
  const id = uuidv4();
  const now = new Date().toISOString();
  const user = {
    id,
    name,
    email,
    phone: phone || null,
    password_hash: passwordHash,
    referral_code: referralCode,
    referred_by: referredBy || null,
    status: 'active',
    failed_login_attempts: 0,
    locked_until: null,
    last_login_at: null,
    created_at: now,
    updated_at: now,
  };
  users.push(user);
  await saveUsers(users);
  return findById(id);
}

async function incrementFailedAttempts(id) {
  const users = await loadUsers();
  const user = users.find((item) => item.id === id);
  if (!user) return;
  user.failed_login_attempts = (user.failed_login_attempts || 0) + 1;
  user.updated_at = new Date().toISOString();
  await saveUsers(users);
}

async function lockAccount(id, until) {
  const users = await loadUsers();
  const user = users.find((item) => item.id === id);
  if (!user) return;
  user.locked_until = until instanceof Date ? until.toISOString() : until;
  user.updated_at = new Date().toISOString();
  await saveUsers(users);
}

async function resetFailedAttempts(id) {
  const users = await loadUsers();
  const user = users.find((item) => item.id === id);
  if (!user) return;
  user.failed_login_attempts = 0;
  user.locked_until = null;
  user.last_login_at = new Date().toISOString();
  user.updated_at = new Date().toISOString();
  await saveUsers(users);
}

module.exports = {
  findByEmail,
  findById,
  create,
  incrementFailedAttempts,
  lockAccount,
  resetFailedAttempts,
};
