// Dataset controller — upload and scan datasets
const Dataset = require('../models/Dataset');
const { scanContent } = require('../services/leakScanner');
const path = require('path');

// GET /api/datasets
const getAll = async (req, res, next) => {
  try {
    // Admins see all, others see only their own
    const userId = req.user.role === 'admin' ? null : req.user.id;
    const datasets = await Dataset.getAll(userId);
    res.json(datasets);
  } catch (err) { next(err); }
};

// GET /api/datasets/:id
const getById = async (req, res, next) => {
  try {
    const dataset = await Dataset.getById(req.params.id);
    if (!dataset) return res.status(404).json({ error: 'Dataset not found.' });
    res.json(dataset);
  } catch (err) { next(err); }
};

// POST /api/datasets/upload
const upload = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

    const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '');

    const dataset = await Dataset.create({
      name: req.file.originalname,
      file_type: ext,
      file_size: req.file.size,
      uploaded_by: req.user.id,
    });

    const raw = req.file.buffer.toString('utf-8');
    const parsed = JSON.parse(raw);
    const content = typeof parsed === 'object' ? JSON.stringify(parsed) : raw;
    const { findings, riskScore } = scanContent(content);

    const updated = await Dataset.updateScanResult(dataset.id, {
      risk_score: riskScore,
      findings,
      scan_status: 'complete',
    });

    res.status(201).json(updated);
  } catch (err) { next(err); }
};

// DELETE /api/datasets/:id
const remove = async (req, res, next) => {
  try {
    await Dataset.delete(req.params.id);
    res.json({ message: 'Dataset deleted.' });
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, upload, remove };
