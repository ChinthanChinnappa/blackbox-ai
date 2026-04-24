import React, { useEffect, useState } from 'react';
import { getLogs, updateLogTag, deleteLog } from '../services/investigationService';
import { getRiskBadgeClass, formatDate, truncate } from '../utils/helpers';
import { useAuth } from '../hooks/useAuth';

const TAG_OPTIONS = ['safe', 'suspicious', 'critical'];

export default function InvestigationPanel({ investigationId }) {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const load = async () => {
    try {
      const res = await getLogs(investigationId, filter ? { tag: filter } : {});
      setLogs(res.data);
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [investigationId, filter]);

  const handleTag = async (logId, tag) => {
    try {
      const res = await updateLogTag(investigationId, logId, tag);
      setLogs((prev) => prev.map((l) => (l.id === logId ? res.data : l)));
    } catch (err) {
      console.error('Tag update failed:', err);
    }
  };

  const handleDelete = async (logId) => {
    if (!confirm('Delete this log entry?')) return;
    try {
      await deleteLog(investigationId, logId);
      setLogs((prev) => prev.filter((l) => l.id !== logId));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // Highlight suspicious patterns in prompt text
  const highlightPrompt = (text) => {
    if (!text) return '';
    const patterns = [
      /ignore (previous|all) instructions/gi,
      /system prompt/gi,
      /DAN mode/gi,
      /jailbreak/gi,
      /bypass/gi,
    ];
    let result = text;
    for (const p of patterns) {
      result = result.replace(p, (m) => `<mark class="bg-red-900/60 text-red-300 px-0.5 rounded">${m}</mark>`);
    }
    return result;
  };

  if (loading) return <div className="text-cyber-green animate-pulse p-4">Loading logs...</div>;

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('')}
          className={`text-xs px-3 py-1 rounded border transition-colors ${!filter ? 'border-cyber-green text-cyber-green' : 'border-cyber-border text-gray-500 hover:border-gray-400'}`}
        >
          ALL
        </button>
        {TAG_OPTIONS.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`text-xs px-3 py-1 rounded border transition-colors ${filter === t ? getRiskBadgeClass(t) : 'border-cyber-border text-gray-500 hover:border-gray-400'}`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {logs.length === 0 && <div className="text-gray-600 text-sm">No logs found.</div>}

      {/* Log entries */}
      {logs.map((log) => (
        <div key={log.id} className="bg-cyber-card border border-cyber-border rounded overflow-hidden">
          <div
            className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white/5"
            onClick={() => setExpanded(expanded === log.id ? null : log.id)}
          >
            <span className={`text-xs px-2 py-0.5 rounded shrink-0 ${getRiskBadgeClass(log.tag)}`}>
              {log.tag || 'unreviewed'}
            </span>
            <span className="text-xs text-gray-300 flex-1 truncate font-mono">{truncate(log.prompt, 70)}</span>
            <span className="text-xs text-orange-400 shrink-0">score: {log.anomaly_score}</span>
            <span className="text-xs text-gray-600 shrink-0">{formatDate(log.created_at)}</span>
          </div>

          {expanded === log.id && (
            <div className="border-t border-cyber-border p-4 space-y-3 bg-black/30">
              {/* Prompt with highlights */}
              <div>
                <div className="text-xs text-gray-500 mb-1">PROMPT</div>
                <div
                  className="text-sm text-gray-200 font-mono bg-black/40 p-3 rounded leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: highlightPrompt(log.prompt) }}
                />
              </div>

              {/* Response */}
              {log.response && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">RESPONSE</div>
                  <div className="text-sm text-gray-400 font-mono bg-black/40 p-3 rounded">{log.response}</div>
                </div>
              )}

              {/* Flagged patterns */}
              {log.flagged_patterns?.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  <span className="text-xs text-gray-500">PATTERNS:</span>
                  {log.flagged_patterns.map((p) => (
                    <span key={p} className="text-xs bg-red-900/30 text-red-400 border border-red-800 px-2 py-0.5 rounded">
                      {p}
                    </span>
                  ))}
                </div>
              )}

              {/* Meta */}
              <div className="text-xs text-gray-600 flex gap-4">
                <span>IP: {log.source_ip || '—'}</span>
                <span>Session: {log.session_id || '—'}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                {TAG_OPTIONS.map((t) => (
                  <button
                    key={t}
                    onClick={() => handleTag(log.id, t)}
                    className={`text-xs px-3 py-1 rounded border transition-colors ${log.tag === t ? getRiskBadgeClass(t) : 'border-cyber-border text-gray-500 hover:border-gray-400'}`}
                  >
                    {t}
                  </button>
                ))}
                {user?.role === 'admin' && (
                  <button
                    onClick={() => handleDelete(log.id)}
                    className="text-xs px-3 py-1 rounded border border-red-900 text-red-500 hover:bg-red-900/20 ml-auto"
                  >
                    DELETE
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
