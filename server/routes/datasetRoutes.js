const express = require('express');
const router = express.Router();
const multer = require('multer');
const ctrl = require('../controllers/datasetController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Store file in memory for immediate scanning
// EDGE CASE: no file size limit set — large files can exhaust memory
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticate);

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/upload', upload.single('file'), ctrl.upload);
router.delete('/:id', authorize('admin'), ctrl.remove);

module.exports = router;
