const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/authenticate');
const { validate, bulkMarkRules } = require('../middleware/validate');
const ctrl = require('../controllers/adminController');

router.use(authenticate, authorize('admin'));

router.get('/users',           ctrl.getUsers);
router.put('/users/:id',       ctrl.updateUser);
router.delete('/users/:id',    ctrl.deleteUser);
router.get('/user-stats/:id',  ctrl.getUserStats);

router.get('/attendance',                                    ctrl.getAllAttendance);
router.put('/attendance/:id',                                ctrl.updateAttendance);
router.post('/attendance/bulk-mark', bulkMarkRules, validate, ctrl.bulkMark);

router.get('/export/csv', ctrl.exportCSV);
router.get('/export/pdf', ctrl.exportPDF);
router.get('/stats',      ctrl.getStats);

module.exports = router;
