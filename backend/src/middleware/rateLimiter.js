const rateLimit = require('express-rate-limit');

// Generic API limiter — 100 req / 15 min
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});

// Strict limiter for auth endpoints — 20 req / 15 min
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many auth attempts, please try again in 15 minutes.' },
});

// QR scan limiter — 30 req / 5 min (prevent script abuse)
const qrLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many QR scan attempts.' },
});

module.exports = { apiLimiter, authLimiter, qrLimiter };
