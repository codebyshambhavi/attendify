const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const normalizeRole = (role) => (role === 'admin' ? 'faculty' : role || 'student');

// POST /api/auth/signup
const signup = async (req, res) => {
  const { name, email, password, studentId, department, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All required fields missing' });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0]?.msg || 'Validation failed';
    return res.status(400).json({ message: firstError });
  }

  try {
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: normalizeRole(role),
      studentId,
      department,
    });
    const token = generateToken(user._id, normalizeRole(user.role));

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { ...user.toJSON(), role: normalizeRole(user.role) },
    });
  } catch (err) {
    console.error('[SIGNUP_ERROR]', {
      message: err.message,
      name: err.name,
      code: err.code,
      stack: err.stack,
    });

    if (err.code === 11000) {
      return res.status(400).json({ message: 'User already exists' });
    }

    if (err.name === 'ValidationError') {
      const fieldMessage = Object.values(err.errors || {})[0]?.message || 'Validation failed';
      return res.status(400).json({ message: fieldMessage });
    }

    if (err instanceof TypeError) {
      return res.status(500).json({
        message: 'Internal server error',
        debug: { name: err.name, code: err.code || null, detail: err.message },
      });
    }

    return res.status(500).json({
      message: 'Internal server error',
      debug: { name: err.name, code: err.code || null, detail: err.message },
    });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (!user.isActive) return res.status(403).json({ message: 'Account deactivated' });

    const role = normalizeRole(user.role);
    const token = generateToken(user._id, role);
    const safeUser = { ...user.toJSON(), role }; // removes password

    res.json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ user: req.user });
};

// PUT /api/auth/update-profile
const updateProfile = async (req, res) => {
  const { name, studentId, department } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, studentId, department },
      { new: true, runValidators: true }
    );
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/auth/change-password
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ message: 'Current password incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { signup, login, getMe, updateProfile, changePassword };
