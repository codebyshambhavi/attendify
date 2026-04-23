const router = require('express').Router();
const { authenticate } = require('../middleware/authenticate');
const { markAttendance, getMyAttendance, getTodayStatus } = require('../controllers/attendanceController');

router.use(authenticate);
router.post('/mark', markAttendance);
router.get('/my', getMyAttendance);
router.get('/today', getTodayStatus);

module.exports = router;
