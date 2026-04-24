// Utility helpers

/**
 * Returns Tailwind color class based on risk/tag level.
 * EDGE CASE: unknown values fall through to gray — no error thrown
 */
export const getRiskColor = (level) => {
  const map = {
    critical: 'text-red-400',
    high: 'text-orange-400',
    medium: 'text-yellow-400',
    low: 'text-green-400',
    safe: 'text-cyber-green',
    suspicious: 'text-yellow-400',
  };
  return map[level] || 'text-cyber-gray';
};

export const getRiskBadgeClass = (level) => {
  const map = {
    critical: 'bg-red-900/40 text-red-400 border border-red-700',
    high: 'bg-orange-900/40 text-orange-400 border border-orange-700',
    medium: 'bg-yellow-900/40 text-yellow-400 border border-yellow-700',
    low: 'bg-green-900/40 text-green-400 border border-green-700',
    safe: 'bg-green-900/40 text-green-400 border border-green-700',
    suspicious: 'bg-yellow-900/40 text-yellow-400 border border-yellow-700',
    active: 'bg-blue-900/40 text-blue-400 border border-blue-700',
    closed: 'bg-gray-800 text-gray-400 border border-gray-600',
    archived: 'bg-gray-900 text-gray-500 border border-gray-700',
  };
  return map[level] || 'bg-gray-800 text-gray-400 border border-gray-600';
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

export const truncate = (str, len = 80) => {
  if (!str) return '';
  return str.length > len ? str.substring(0, len) + '...' : str;
};

export const scoreBar = (score) => {
  // Returns width percentage string for progress bars
  return `${Math.round((score || 0) * 100)}%`;
};
