const { body, param, query, validationResult } = require('express-validator');

// Reusable handler — send first error as 400
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }
  next();
};

// Auth rules
const signupRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
];

// Attendance rules
const markAttendanceRules = [
  body('date')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Date must be in YYYY-MM-DD format'),
  body('status')
    .optional()
    .isIn(['present', 'absent', 'late'])
    .withMessage('Status must be present, absent, or late'),
];

// QR rules
const generateQRRules = [
  body('subject').optional().trim().isLength({ max: 80 }).withMessage('Subject too long'),
  body('expiresInMinutes')
    .optional()
    .isInt({ min: 1, max: 120 })
    .withMessage('Expiry must be between 1 and 120 minutes'),
];

const scanTokenRules = [
  param('token').isHexadecimal().isLength({ min: 40 }).withMessage('Invalid QR token'),
];

// Admin rules
const bulkMarkRules = [
  body('userIds').isArray({ min: 1 }).withMessage('At least one user ID required'),
  body('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Date must be in YYYY-MM-DD format'),
  body('status').isIn(['present', 'absent', 'late']).withMessage('Invalid status'),
];

module.exports = {
  validate,
  signupRules,
  loginRules,
  changePasswordRules,
  markAttendanceRules,
  generateQRRules,
  scanTokenRules,
  bulkMarkRules,
};
