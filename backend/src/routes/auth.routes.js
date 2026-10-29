const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { query, get, run } = require('../config/db');
const { JWT_SECRET, authenticate } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const user = get(`SELECT * FROM users WHERE username = ?`, [username]);
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role, full_name: user.full_name },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      full_name: user.full_name
    }
  });
});

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// GET /api/auth/users
router.get('/users', authenticate, (req, res) => {
  const users = query(`SELECT id, username, email, role, full_name, created_at FROM users ORDER BY username ASC`);
  res.json({ users });
});

module.exports = router;
