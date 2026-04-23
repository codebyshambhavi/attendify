const router = require('express').Router();
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { signup, login, getMe, updateProfile, changePassword } = require('../controllers/authController');
const { authenticate } = require('../middleware/authenticate');

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

router.post('/signup', limiter, [
  body('name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
], signup);

router.post('/login', limiter, [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], login);

router.get('/me', authenticate, getMe);
router.put('/update-profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);

module.exports = router;
