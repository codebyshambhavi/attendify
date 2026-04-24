const router = require('express').Router();
const { authenticate } = require('../middleware/authenticate');
const isAdmin = require('../middleware/isAdmin');
const { generateQR, scanQR, getSessions } = require('../controllers/qrController');

router.post('/generate', authenticate, isAdmin, generateQR);
router.post('/scan/:token', authenticate, scanQR);
router.get('/sessions', authenticate, isAdmin, getSessions);

module.exports = router;
