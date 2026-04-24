const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/investigationController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/stats', ctrl.getStats);
router.get('/recent-activity', ctrl.getRecentActivity);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', authorize('admin'), ctrl.remove);

// Log sub-routes
router.get('/:id/logs', ctrl.getLogs);
router.post('/:id/logs', ctrl.addLog);
router.patch('/:id/logs/:logId/tag', ctrl.updateLogTag);
router.delete('/:id/logs/:logId', authorize('admin'), ctrl.deleteLog);

module.exports = router;
