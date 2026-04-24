import React, { useEffect, useState } from 'react';
import { getInvestigations, deleteInvestigation, updateInvestigation } from '../services/investigationService';
import api from '../services/api';
import { getRiskBadgeClass, formatDate } from '../utils/helpers';

export default function Admin() {
  const [investigations, setInvestigations] = useState([]);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('investigations');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [invRes, userRes] = await Promise.all([
          getInvestigations(),
          api.get('/auth/users').catch(() => ({ data: [] })), // may 403 if not admin
        ]);
        setInvestigations(invRes.data);
        setUsers(userRes.data);
      } catch (err) {
        console.error('Admin load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Permanently delete this investigation and all its logs?')) return;
    try {
      await deleteInvestigation(id);
      setInvestigations((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleArchive = async (id) => {
    try {
      const res = await updateInvestigation(id, { status: 'archived' });
      setInvestigations((prev) => prev.map((i) => i.id === id ? res.data : i));
    } catch (err) {
      console.error('Archive failed:', err);
    }
  };

  if (loading) return <div className="text-cyber-green animate-pulse p-8">Loading admin panel...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-red-400 text-xl font-bold tracking-widest">// ADMIN PANEL</h1>

      {/* Tabs */}
      <div className="flex gap-2">
        {['investigations', 'users'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-xs px-4 py-2 rounded border transition-colors ${tab === t ? 'border-red-600 text-red-400' : 'border-cyber-border text-gray-500 hover:border-gray-400'}`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {tab === 'investigations' && (
        <div className="bg-cyber-card border border-cyber-border rounded overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-cyber-border text-gray-500">
                <th className="text-left p-3">TITLE</th>
                <th className="text-left p-3">RISK</th>
                <th className="text-left p-3">STATUS</th>
                <th className="text-left p-3">CREATED</th>
                <th className="p-3">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {investigations.map((inv) => (
                <tr key={inv.id} className="border-b border-cyber-border/50 hover:bg-white/5">
                  <td className="p-3 text-gray-200">{inv.title}</td>
                  <td className="p-3"><span className={`px-2 py-0.5 rounded ${getRiskBadgeClass(inv.risk_level)}`}>{inv.risk_level}</span></td>
                  <td className="p-3"><span className={`px-2 py-0.5 rounded ${getRiskBadgeClass(inv.status)}`}>{inv.status}</span></td>
                  <td className="p-3 text-gray-500">{formatDate(inv.created_at)}</td>
                  <td className="p-3 flex gap-2 justify-center">
                    {inv.status !== 'archived' && (
                      <button onClick={() => handleArchive(inv.id)} className="text-yellow-500 hover:text-yellow-300 border border-yellow-900 px-2 py-0.5 rounded">
                        ARCHIVE
                      </button>
                    )}
                    <button onClick={() => handleDelete(inv.id)} className="text-red-500 hover:text-red-300 border border-red-900 px-2 py-0.5 rounded">
                      DELETE
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'users' && (
        <div className="bg-cyber-card border border-cyber-border rounded overflow-hidden">
          {users.length === 0 ? (
            <div className="p-4 text-gray-600 text-sm">No user data available (requires admin API endpoint).</div>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-cyber-border text-gray-500">
                  <th className="text-left p-3">USERNAME</th>
                  <th className="text-left p-3">EMAIL</th>
                  <th className="text-left p-3">ROLE</th>
                  <th className="text-left p-3">LAST LOGIN</th>
                  <th className="text-left p-3">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-cyber-border/50 hover:bg-white/5">
                    <td className="p-3 text-gray-200">{u.username}</td>
                    <td className="p-3 text-gray-400">{u.email}</td>
                    <td className="p-3"><span className={`px-2 py-0.5 rounded ${u.role === 'admin' ? 'text-red-400 border border-red-800' : 'text-blue-400 border border-blue-800'}`}>{u.role}</span></td>
                    <td className="p-3 text-gray-500">{formatDate(u.last_login)}</td>
                    <td className="p-3">{u.is_active ? <span className="text-green-400">ACTIVE</span> : <span className="text-red-400">INACTIVE</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
