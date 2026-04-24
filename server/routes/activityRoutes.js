const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/activityController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/sessions', ctrl.getSessions);
router.get('/stats', ctrl.getStats);
router.post('/sessions', ctrl.trackSession);
router.patch('/sessions/:id/flag', authorize('admin', 'investigator'), ctrl.flagSession);

module.exports = router;
