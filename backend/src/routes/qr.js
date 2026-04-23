const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/authenticate');
const { generateQR, scanQR, getSessions } = require('../controllers/qrController');

router.post('/generate', authenticate, authorize('admin'), generateQR);
router.post('/scan/:token', authenticate, scanQR);
router.get('/sessions', authenticate, authorize('admin'), getSessions);

module.exports = router;
