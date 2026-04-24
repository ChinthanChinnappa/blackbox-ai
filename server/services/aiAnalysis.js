// AI behavior analysis service — compares expected vs actual output

/**
 * Detects potential hallucinations or abnormal outputs.
 * Heuristic-based — not a real ML model.
 * EDGE CASE: Very short responses always score low regardless of content.
 */
const analyzeOutput = (expected, actual) => {
  if (!actual) return { hallucination: false, divergenceScore: 0, flags: [] };

  const flags = [];
  let divergenceScore = 0;

  // Check for confident false claims (simple heuristic)
  const confidentPhrases = [
    /absolutely (true|correct|certain)/i,
    /I (am|can) (100%|definitely|certainly)/i,
    /this is a fact/i,
  ];
  for (const p of confidentPhrases) {
    if (p.test(actual)) {
      flags.push('overconfident_claim');
      divergenceScore += 0.3;
    }
  }

  // Check for refusal when expected to respond
  if (expected && actual.toLowerCase().includes("i can't") && !expected.toLowerCase().includes("refuse")) {
    flags.push('unexpected_refusal');
    divergenceScore += 0.2;
  }

  // Check for length divergence
  if (expected) {
    const expectedLen = expected.length;
    const actualLen = actual.length;
    const ratio = actualLen / (expectedLen || 1);
    if (ratio > 5 || ratio < 0.1) {
      flags.push('length_divergence');
      divergenceScore += 0.25;
    }
  }

  // Check for repeated phrases (sign of looping/hallucination)
  const words = actual.split(/\s+/);
  const wordFreq = {};
  for (const w of words) {
    wordFreq[w] = (wordFreq[w] || 0) + 1;
  }
  const maxFreq = Math.max(...Object.values(wordFreq));
  if (maxFreq > 10 && words.length > 20) {
    flags.push('repetition_loop');
    divergenceScore += 0.4;
  }

  divergenceScore = Math.min(divergenceScore, 1.0);

  return {
    hallucination: divergenceScore > 0.5,
    divergenceScore: parseFloat(divergenceScore.toFixed(2)),
    flags,
  };
};

module.exports = { analyzeOutput };
