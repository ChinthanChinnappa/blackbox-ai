import React, { useEffect, useState } from 'react';
import { getSessions, getActivityStats, flagSession } from '../services/investigationService';
import { formatDate } from '../utils/helpers';

export default function ActivityTracker() {
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [showFlagged, setShowFlagged] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [s, st] = await Promise.all([
        getSessions(showFlagged ? { flagged: true } : {}),
        getActivityStats(),
      ]);
      setSessions(s.data);
      setStats(st.data);
    } catch (err) {
      console.error('Activity load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [showFlagged]);

  const handleFlag = async (id) => {
    try {
      await flagSession(id, 'manual_flag');
      setSessions((prev) => prev.map((s) => s.id === id ? { ...s, is_flagged: true } : s));
    } catch (err) {
      console.error('Flag failed:', err);
    }
  };

  if (loading) return <div className="text-cyber-green animate-pulse p-4">Loading sessions...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-cyber-green text-lg font-bold tracking-widest">// USER ACTIVITY TRACKING</h2>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'TOTAL SESSIONS', val: stats.total_sessions },
            { label: 'FLAGGED', val: stats.flagged_sessions, color: 'text-red-400' },
            { label: 'TOTAL REQUESTS', val: stats.total_requests },
            { label: 'UNIQUE IPs', val: stats.unique_ips, color: 'text-blue-400' },
          ].map(({ label, val, color = 'text-cyber-green' }) => (
            <div key={label} className="bg-cyber-card border border-cyber-border rounded p-3">
              <div className="text-xs text-gray-500">{label}</div>
              <div className={`text-xl font-bold ${color}`}>{val ?? 0}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowFlagged(false)}
          className={`text-xs px-3 py-1 rounded border transition-colors ${!showFlagged ? 'border-cyber-green text-cyber-green' : 'border-cyber-border text-gray-500'}`}
        >
          ALL SESSIONS
        </button>
        <button
          onClick={() => setShowFlagged(true)}
          className={`text-xs px-3 py-1 rounded border transition-colors ${showFlagged ? 'border-red-600 text-red-400' : 'border-cyber-border text-gray-500'}`}
        >
          FLAGGED ONLY
        </button>
      </div>

      {/* Sessions table */}
      <div className="bg-cyber-card border border-cyber-border rounded overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-cyber-border text-gray-500">
              <th className="text-left p-3">USER</th>
              <th className="text-left p-3">IP</th>
              <th className="text-left p-3">REQUESTS</th>
              <th className="text-left p-3">FLAGS</th>
              <th className="text-left p-3">LAST ACTIVE</th>
              <th className="text-left p-3">STATUS</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 && (
              <tr><td colSpan={7} className="p-4 text-gray-600">No sessions found.</td></tr>
            )}
            {sessions.map((s) => (
              <tr key={s.id} className={`border-b border-cyber-border/50 hover:bg-white/5 ${s.is_flagged ? 'bg-red-950/20' : ''}`}>
                <td className="p-3 text-gray-300">{s.username || 'anonymous'}</td>
                <td className="p-3 font-mono text-gray-400">{s.ip_address || '—'}</td>
                <td className="p-3 text-cyber-green">{s.request_count}</td>
                <td className="p-3">
                  <div className="flex gap-1 flex-wrap">
                    {(s.anomaly_flags || []).map((f, i) => (
                      <span key={i} className="bg-red-900/30 text-red-400 border border-red-800 px-1 rounded">{f}</span>
                    ))}
                  </div>
                </td>
                <td className="p-3 text-gray-500">{formatDate(s.last_active)}</td>
                <td className="p-3">
                  {s.is_flagged
                    ? <span className="text-red-400">⚠ FLAGGED</span>
                    : <span className="text-green-400">NORMAL</span>
                  }
                </td>
                <td className="p-3">
                  {!s.is_flagged && (
                    <button
                      onClick={() => handleFlag(s.id)}
                      className="text-xs text-yellow-500 hover:text-yellow-300 border border-yellow-900 px-2 py-0.5 rounded"
                    >
                      FLAG
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
