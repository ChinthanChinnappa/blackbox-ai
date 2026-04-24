// Dataset leak scanner service — detects sensitive data in uploaded files

const SENSITIVE_PATTERNS = [
  { label: 'email', pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, weight: 0.3 },
  { label: 'password_field', pattern: /"?password"?\s*[:=]\s*"?[^",\s]{6,}"?/gi, weight: 0.8 },
  { label: 'api_key', pattern: /[a-zA-Z0-9_\-]{20,40}/g, weight: 0.5 },
  { label: 'jwt_token', pattern: /eyJ[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+/g, weight: 0.9 },
  { label: 'credit_card', pattern: /\b(?:\d[ -]?){13,16}\b/g, weight: 0.95 },
  { label: 'ssn', pattern: /\b\d{3}-\d{2}-\d{4}\b/g, weight: 1.0 },
  { label: 'private_key', pattern: /-----BEGIN (RSA |EC )?PRIVATE KEY-----/g, weight: 1.0 },
  // EDGE CASE: api_key pattern is too broad — may produce false positives on long IDs
];

/**
 * Scans raw text content for sensitive data patterns.
 * @param {string} content - raw file content as string
 * @returns {{ findings: Array, riskScore: number }}
 */
const scanContent = (content) => {
  if (!content || typeof content !== 'string') {
    return { findings: [], riskScore: 0 };
  }

  const findings = [];
  let totalWeight = 0;

  for (const { label, pattern, weight } of SENSITIVE_PATTERNS) {
    // Reset regex state for global patterns
    pattern.lastIndex = 0;
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      findings.push({
        type: label,
        count: matches.length,
        // EDGE CASE: actual matched values not redacted before storing
        sample: matches[0].substring(0, 20) + (matches[0].length > 20 ? '...' : ''),
        severity: weight >= 0.8 ? 'high' : weight >= 0.5 ? 'medium' : 'low',
      });
      totalWeight += weight;
    }
  }

  // Normalize risk score to 0-1
  const riskScore = Math.min(totalWeight / SENSITIVE_PATTERNS.length, 1.0);

  return { findings, riskScore: parseFloat(riskScore.toFixed(2)) };
};

module.exports = { scanContent };
