import React, { useEffect, useState } from 'react';
import { getInvestigations, createInvestigation, updateInvestigation } from '../services/investigationService';
import InvestigationPanel from '../components/InvestigationPanel';
import { getRiskBadgeClass, formatDate } from '../utils/helpers';

const RISK_LEVELS = ['low', 'medium', 'high', 'critical'];

export default function Investigation() {
  const [investigations, setInvestigations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', risk_level: 'low' });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await getInvestigations();
      setInvestigations(res.data);
    } catch (err) {
      console.error('Failed to load investigations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await createInvestigation(form);
      setInvestigations((prev) => [res.data, ...prev]);
      setForm({ title: '', description: '', risk_level: 'low' });
      setShowForm(false);
    } catch (err) {
      console.error('Create failed:', err);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const res = await updateInvestigation(id, { status });
      setInvestigations((prev) => prev.map((i) => i.id === id ? res.data : i));
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  if (loading) return <div className="text-cyber-green animate-pulse p-8">Loading investigations...</div>;

  return (
    <div className="p-6 flex gap-6 h-[calc(100vh-60px)]">
      {/* Left panel — investigation list */}
      <div className="w-80 shrink-0 flex flex-col gap-3 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-cyber-green text-sm font-bold tracking-widest">// INVESTIGATIONS</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-xs px-2 py-1 border border-cyber-green text-cyber-green rounded hover:bg-cyber-green/10"
          >
            + NEW
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-cyber-card border border-cyber-border rounded p-3 space-y-2">
            <input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-black border border-cyber-border rounded px-2 py-1 text-xs text-gray-200 focus:outline-none focus:border-cyber-green"
              required
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-black border border-cyber-border rounded px-2 py-1 text-xs text-gray-200 focus:outline-none focus:border-cyber-green resize-none h-16"
            />
            <select
              value={form.risk_level}
              onChange={(e) => setForm({ ...form, risk_level: e.target.value })}
              className="w-full bg-black border border-cyber-border rounded px-2 py-1 text-xs text-gray-200 focus:outline-none"
            >
              {RISK_LEVELS.map((r) => <option key={r} value={r}>{r.toUpperCase()}</option>)}
            </select>
            <button type="submit" className="w-full text-xs py-1 bg-cyber-green/10 border border-cyber-green text-cyber-green rounded">
              CREATE
            </button>
          </form>
        )}

        {investigations.map((inv) => (
          <div
            key={inv.id}
            onClick={() => setSelected(inv)}
            className={`bg-cyber-card border rounded p-3 cursor-pointer transition-colors ${selected?.id === inv.id ? 'border-cyber-green' : 'border-cyber-border hover:border-gray-500'}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs px-1.5 py-0.5 rounded ${getRiskBadgeClass(inv.risk_level)}`}>{inv.risk_level}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded ${getRiskBadgeClass(inv.status)}`}>{inv.status}</span>
            </div>
            <div className="text-sm text-gray-200 font-medium truncate">{inv.title}</div>
            <div className="text-xs text-gray-600 mt-1">{formatDate(inv.created_at)}</div>
            {/* Quick status toggle */}
            {inv.status === 'active' && (
              <button
                onClick={(e) => { e.stopPropagation(); handleStatusChange(inv.id, 'closed'); }}
                className="mt-2 text-xs text-gray-500 hover:text-gray-300"
              >
                Mark closed
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Right panel — logs */}
      <div className="flex-1 overflow-y-auto">
        {selected ? (
          <div>
            <div className="mb-4">
              <h3 className="text-cyber-green font-bold">{selected.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{selected.description}</p>
            </div>
            <InvestigationPanel investigationId={selected.id} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-600 text-sm">
            Select an investigation to view logs
          </div>
        )}
      </div>
    </div>
  );
}
