const { getDatabase } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'mp-secret-key-change-in-production-2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const SALT_ROUNDS = 10;

/**
 * Hash a plain-text password.
 */
function hashPassword(plainPassword) {
  return bcrypt.hashSync(plainPassword, SALT_ROUNDS);
}

/**
 * Compare a plain-text password with a hash.
 */
function verifyPassword(plainPassword, hash) {
  return bcrypt.compareSync(plainPassword, hash);
}

/**
 * Generate a JWT token for a user.
 */
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Verify and decode a JWT token.
 */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/**
 * Find user by email.
 */
function findUserByEmail(email) {
  const db = getDatabase();
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
}

/**
 * Find user by id.
 */
function findUserById(id) {
  const db = getDatabase();
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

/**
 * Create a new user.
 */
function createUser({ email, password, full_name, role = 'user' }) {
  const db = getDatabase();

  // Check if email already exists
  const existing = findUserByEmail(email);
  if (existing) {
    return { error: 'البريد الإلكتروني مستخدم بالفعل' };
  }

  const password_hash = hashPassword(password);
  const nowIso = new Date().toISOString();

  const result = db.prepare(`
    INSERT INTO users (email, password_hash, full_name, role, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, 1, ?, ?)
  `).run(email.toLowerCase().trim(), password_hash, full_name, role, nowIso, nowIso);

  const newUser = findUserById(result.lastInsertRowid);
  return { user: sanitizeUser(newUser) };
}

/**
 * Authenticate a user with email + password.
 */
function authenticateUser(email, password) {
  const user = findUserByEmail(email);

  if (!user) {
    return { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
  }

  if (!user.is_active) {
    return { error: 'هذا الحساب معطّل. تواصل مع المسؤول.' };
  }

  if (!verifyPassword(password, user.password_hash)) {
    return { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
  }

  const token = generateToken(user);
  return { user: sanitizeUser(user), token };
}

/**
 * Remove sensitive fields from user object before sending to client.
 */
function sanitizeUser(user) {
  if (!user) return null;
  const { password_hash, ...safe } = user;
  return safe;
}

/**
 * Seed the default admin user if it doesn't exist.
 */
function seedAdmin() {
  const existing = findUserByEmail('admin@admin.com');
  if (!existing) {
    createUser({
      email: 'admin@admin.com',
      password: 'maalyplus2026',
      full_name: 'مدير النظام',
      role: 'admin'
    });
    console.log('✅ Default admin user seeded: admin@admin.com');
  }
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  findUserByEmail,
  findUserById,
  createUser,
  authenticateUser,
  sanitizeUser,
  seedAdmin,
  JWT_SECRET
};
