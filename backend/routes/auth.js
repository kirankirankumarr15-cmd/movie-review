const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../database');

const router = express.Router();

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function generateToken(user) {
  return jwt.sign({ sub: user.id }, process.env.SECRET_KEY, { expiresIn: '7d' });
}

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = await User.findByPk(decoded.sub);
  } catch (err) {
    req.user = null;
  }
  next();
};

const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  next();
};

router.post('/register', async (req, res) => {
  const { name = '', email = '', password = '', confirmPassword = '' } = req.body;
  const errors = {};
  
  if (!name.trim()) errors.name = 'Name is required.';
  if (!email || !EMAIL_RE.test(email)) errors.email = 'A valid email address is required.';
  if (password.length < 8) errors.password = 'Password must be at least 8 characters.';
  if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match.';
  
  if (Object.keys(errors).length > 0) return res.status(400).json({ errors });

  const existing = await User.findOne({ where: { email: email.toLowerCase() } });
  if (existing) {
    return res.status(409).json({ errors: { email: 'An account with this email already exists.' } });
  }

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase(),
    password_hash: hash
  });

  const token = generateToken(user);
  res.status(201).json({
    token,
    user: { id: user.id, name: user.name, email: user.email, created_at: user.createdAt }
  });
});

router.post('/login', async (req, res) => {
  const { email = '', password = '' } = req.body;
  if (!email || !password) {
    return res.status(400).json({ errors: { general: 'Email and password are required.' } });
  }

  const user = await User.findOne({ where: { email: email.toLowerCase() } });
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ errors: { general: 'Invalid email or password.' } });
  }

  const token = generateToken(user);
  res.status(200).json({
    token,
    user: { id: user.id, name: user.name, email: user.email, created_at: user.createdAt }
  });
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully.' });
});

router.get('/me', authMiddleware, requireAuth, (req, res) => {
  const user = req.user;
  res.json({ user: { id: user.id, name: user.name, email: user.email, created_at: user.createdAt } });
});

module.exports = { router, authMiddleware, requireAuth };
