import React, { useEffect, useState } from 'react';
import { getStats, getRecentActivity } from '../services/investigationService';
import { getRiskBadgeClass, formatDate, truncate, scoreBar } from '../utils/helpers';

const StatCard = ({ label, value, color = 'text-cyber-green' }) => (
  <div className="bg-cyber-card border border-cyber-border rounded p-4">
    <div className="text-xs text-gray-500 mb-1">{label}</div>
    <div className={`text-2xl font-bold ${color}`}>{value ?? '—'}</div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, a] = await Promise.all([getStats(), getRecentActivity()]);
        setStats(s.data);
        setActivity(a.data);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="text-cyber-green p-8 animate-pulse">Loading system data...</div>;

  const inv = stats?.investigations || {};
  const logs = stats?.logs || {};

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-cyber-green text-xl font-bold tracking-widest">// SYSTEM OVERVIEW</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="ACTIVE INVESTIGATIONS" value={inv.active_count} />
        <StatCard label="CRITICAL CASES" value={inv.critical_count} color="text-red-400" />
        <StatCard label="FLAGGED PROMPTS" value={Number(logs.critical || 0) + Number(logs.suspicious || 0)} color="text-yellow-400" />
        <StatCard label="AVG ANOMALY SCORE" value={logs.avg_anomaly_score} color="text-orange-400" />
      </div>

      {/* Risk level bar */}
      <div className="bg-cyber-card border border-cyber-border rounded p-4">
        <div className="text-xs text-gray-500 mb-3">SYSTEM RISK LEVEL</div>
        <div className="flex gap-2 items-center">
          <div className="flex-1 bg-gray-800 rounded h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all"
              style={{ width: scoreBar(logs.avg_anomaly_score) }}
            />
          </div>
          <span className="text-xs text-gray-400">{Math.round((logs.avg_anomaly_score || 0) * 100)}%</span>
        </div>
      </div>

      {/* Log breakdown */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'SAFE', val: logs.safe, color: 'text-green-400' },
          { label: 'SUSPICIOUS', val: logs.suspicious, color: 'text-yellow-400' },
          { label: 'CRITICAL', val: logs.critical, color: 'text-red-400' },
        ].map(({ label, val, color }) => (
          <div key={label} className="bg-cyber-card border border-cyber-border rounded p-3 text-center">
            <div className="text-xs text-gray-500">{label}</div>
            <div className={`text-xl font-bold ${color}`}>{val ?? 0}</div>
          </div>
        ))}
      </div>

      {/* Recent activity timeline */}
      <div className="bg-cyber-card border border-cyber-border rounded p-4">
        <div className="text-xs text-gray-500 mb-4">RECENT ACTIVITY TIMELINE</div>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {activity.length === 0 && <div className="text-gray-600 text-sm">No recent activity.</div>}
          {activity.map((log) => (
            <div key={log.id} className="flex gap-3 items-start border-l-2 border-cyber-border pl-3">
              <span className={`text-xs px-2 py-0.5 rounded ${getRiskBadgeClass(log.tag)}`}>
                {log.tag || 'unreviewed'}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-300 truncate">{truncate(log.prompt, 60)}</div>
                <div className="text-xs text-gray-600">{log.investigation_title} · {formatDate(log.created_at)}</div>
              </div>
              <span className="text-xs text-orange-400 shrink-0">{log.anomaly_score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
