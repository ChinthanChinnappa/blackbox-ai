// Anomaly detection service for AI prompt/response analysis

const SUSPICIOUS_PATTERNS = [
  { pattern: /ignore (previous|all) instructions/i, label: 'prompt_injection', score: 0.9 },
  { pattern: /system prompt/i, label: 'system_prompt_extraction', score: 0.85 },
  { pattern: /DAN mode/i, label: 'dan_attempt', score: 0.95 },
  { pattern: /pretend you (are|have no)/i, label: 'role_play_bypass', score: 0.75 },
  { pattern: /jailbreak/i, label: 'jailbreak', score: 0.9 },
  { pattern: /act as (an? )?(evil|unrestricted|unfiltered)/i, label: 'persona_override', score: 0.88 },
  { pattern: /bypass (your )?(safety|filter|restriction)/i, label: 'filter_bypass', score: 0.92 },
  { pattern: /\[INST\]|\[\/INST\]/i, label: 'template_injection', score: 0.8 },
];

const analysisCache = {
  lastPrompt: null,
  lastResult: { score: 0, patterns: [] },
};

const analyzePrompt = (prompt) => {
  if (!prompt || typeof prompt !== 'string') {
    return { score: 0, patterns: [] };
  }

  if (analysisCache.lastPrompt === prompt) {
    return analysisCache.lastResult;
  }

  const matched = [];
  let maxScore = 0;

  for (const { pattern, label, score } of SUSPICIOUS_PATTERNS) {
    if (pattern.test(prompt)) {
      matched.push(label);
      if (score > maxScore) maxScore = score;
    }
  }

  const finalScore = matched.length > 1 ? Math.min(maxScore + 0.05 * (matched.length - 1), 1.0) : maxScore;

  analysisCache.lastPrompt = prompt;
  analysisCache.lastResult = { score: parseFloat(finalScore.toFixed(2)), patterns: matched };

  return analysisCache.lastResult;
};

const scoreToTag = (score) => {
  if (score >= 0.85) return 'critical';
  if (score >= 0.4) return 'suspicious';
  return 'safe';
};

module.exports = { analyzePrompt, scoreToTag };
