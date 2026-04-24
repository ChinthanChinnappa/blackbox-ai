// Investigation controller
const Investigation = require('../models/Investigation');
const Log = require('../models/Log');
const { analyzePrompt, scoreToTag } = require('../services/anomalyDetection');
const { analyzeOutput } = require('../services/aiAnalysis');

// GET /api/investigations
const getAll = async (req, res, next) => {
  try {
    const { status, risk_level } = req.query;
    const investigations = await Investigation.getAll({ status, risk_level });
    res.json(investigations);
  } catch (err) { next(err); }
};

// GET /api/investigations/stats
const getStats = async (req, res, next) => {
  try {
    const [invStats, logStats] = await Promise.all([
      Investigation.getStats(),
      Log.getFlaggedStats(),
    ]);
    res.json({ investigations: invStats, logs: logStats });
  } catch (err) { next(err); }
};

// GET /api/investigations/:id
const getById = async (req, res, next) => {
  try {
    const inv = await Investigation.getById(req.params.id);
    if (!inv) return res.status(404).json({ error: 'Investigation not found.' });
    res.json(inv);
  } catch (err) { next(err); }
};

// POST /api/investigations
const create = async (req, res, next) => {
  try {
    const { title, description, risk_level, assigned_to } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required.' });
    const inv = await Investigation.create({ title, description, risk_level, assigned_to, created_by: req.user.id });
    res.status(201).json(inv);
  } catch (err) { next(err); }
};

// PUT /api/investigations/:id
const update = async (req, res, next) => {
  try {
    const allowed = ['title', 'description', 'status', 'risk_level', 'assigned_to'];
    const fields = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) fields[key] = req.body[key];
    }
    if (!Object.keys(fields).length) return res.status(400).json({ error: 'No valid fields to update.' });
    const inv = await Investigation.update(req.params.id, fields);
    if (!inv) return res.status(404).json({ error: 'Investigation not found.' });
    res.json(inv);
  } catch (err) { next(err); }
};

// DELETE /api/investigations/:id
const remove = async (req, res, next) => {
  try {
    await Investigation.delete(req.params.id);
    res.json({ message: 'Investigation deleted.' });
  } catch (err) { next(err); }
};

// GET /api/investigations/:id/logs
const getLogs = async (req, res, next) => {
  try {
    const { tag, limit, offset } = req.query;
    const logs = await Log.getByInvestigation(req.params.id, { tag, limit, offset });
    res.json(logs);
  } catch (err) { next(err); }
};

// POST /api/investigations/:id/logs
const addLog = async (req, res, next) => {
  try {
    const { prompt, response, source_ip, user_agent, session_id, expected_output } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required.' });

    // Run anomaly detection
    const { score, patterns } = analyzePrompt(prompt);
    const tag = scoreToTag(score);

    // Run AI output analysis if expected output provided
    let aiAnalysis = null;
    if (expected_output) {
      aiAnalysis = analyzeOutput(expected_output, response);
    }

    const log = await Log.create({
      investigation_id: req.params.id,
      prompt, response, source_ip, user_agent, session_id,
      anomaly_score: score,
      flagged_patterns: patterns,
      tag,
    });

    res.status(201).json({ log, aiAnalysis });
  } catch (err) { next(err); }
};

// PATCH /api/investigations/:id/logs/:logId/tag
const updateLogTag = async (req, res, next) => {
  try {
    const { tag } = req.body;
    if (!['safe', 'suspicious', 'critical'].includes(tag)) {
      return res.status(400).json({ error: 'Invalid tag value.' });
    }
    const log = await Log.updateTag(req.params.logId, tag);
    if (!log) return res.status(404).json({ error: 'Log not found.' });
    res.json(log);
  } catch (err) { next(err); }
};

// DELETE /api/investigations/:id/logs/:logId
const deleteLog = async (req, res, next) => {
  try {
    await Log.delete(req.params.logId);
    res.json({ message: 'Log deleted.' });
  } catch (err) { next(err); }
};

// GET /api/investigations/recent-activity
const getRecentActivity = async (req, res, next) => {
  try {
    const logs = await Log.getRecent(10);
    res.json(logs);
  } catch (err) { next(err); }
};

module.exports = { getAll, getStats, getById, create, update, remove, getLogs, addLog, updateLogTag, deleteLog, getRecentActivity };
