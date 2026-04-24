import React, { useEffect, useState, useRef } from 'react';
import { getDatasets, uploadDataset, deleteDataset } from '../services/investigationService';
import { getRiskBadgeClass, formatDate, scoreBar } from '../utils/helpers';
import { useAuth } from '../hooks/useAuth';

const SEVERITY_COLOR = { high: 'text-red-400', medium: 'text-yellow-400', low: 'text-green-400' };

export default function DatasetScanner() {
  const { user } = useAuth();
  const [datasets, setDatasets] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const load = async () => {
    try {
      const res = await getDatasets();
      setDatasets(res.data);
    } catch (err) {
      console.error('Failed to load datasets:', err);
    }
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = fileRef.current?.files[0];
    if (!file) return setError('Select a file first.');
    setError('');
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      await uploadDataset(form);
      fileRef.current.value = '';
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this dataset?')) return;
    try {
      await deleteDataset(id);
      setDatasets((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-cyber-green text-lg font-bold tracking-widest">// DATASET LEAK SCANNER</h2>

      {/* Upload form */}
      <form onSubmit={handleUpload} className="bg-cyber-card border border-cyber-border rounded p-4 flex gap-3 items-center">
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.json"
          className="text-sm text-gray-400 file:mr-3 file:py-1 file:px-3 file:rounded file:border file:border-cyber-green file:bg-transparent file:text-cyber-green file:text-xs file:cursor-pointer"
        />
        <button
          type="submit"
          disabled={uploading}
          className="text-xs px-4 py-2 bg-cyber-green/10 border border-cyber-green text-cyber-green rounded hover:bg-cyber-green/20 disabled:opacity-50 transition-colors"
        >
          {uploading ? 'SCANNING...' : 'UPLOAD & SCAN'}
        </button>
        {error && <span className="text-xs text-red-400">{error}</span>}
      </form>

      {/* Dataset list */}
      <div className="space-y-3">
        {datasets.length === 0 && <div className="text-gray-600 text-sm">No datasets uploaded yet.</div>}
        {datasets.map((ds) => (
          <div key={ds.id} className="bg-cyber-card border border-cyber-border rounded p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-sm text-gray-200 font-mono">{ds.name}</span>
                <span className="ml-2 text-xs text-gray-600">{ds.file_type?.toUpperCase()} · {(ds.file_size / 1024).toFixed(1)}KB</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded ${getRiskBadgeClass(ds.scan_status === 'complete' ? (ds.risk_score > 0.7 ? 'critical' : ds.risk_score > 0.3 ? 'medium' : 'low') : 'active')}`}>
                  {ds.scan_status}
                </span>
                {user?.role === 'admin' && (
                  <button onClick={() => handleDelete(ds.id)} className="text-xs text-red-500 hover:text-red-300">DELETE</button>
                )}
              </div>
            </div>

            {/* Risk score bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>RISK SCORE</span>
                <span className={ds.risk_score > 0.7 ? 'text-red-400' : ds.risk_score > 0.3 ? 'text-yellow-400' : 'text-green-400'}>
                  {Math.round((ds.risk_score || 0) * 100)}%
                </span>
              </div>
              <div className="bg-gray-800 rounded h-2 overflow-hidden">
                <div
                  className={`h-full transition-all ${ds.risk_score > 0.7 ? 'bg-red-500' : ds.risk_score > 0.3 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: scoreBar(ds.risk_score) }}
                />
              </div>
            </div>

            {/* Findings */}
            {ds.findings?.length > 0 && (
              <div className="space-y-1">
                <div className="text-xs text-gray-500 mb-2">FINDINGS</div>
                {ds.findings.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs">
                    <span className={`w-16 ${SEVERITY_COLOR[f.severity] || 'text-gray-400'}`}>{f.severity?.toUpperCase()}</span>
                    <span className="text-gray-300 w-32">{f.type}</span>
                    <span className="text-gray-500">×{f.count}</span>
                    <span className="text-gray-600 font-mono truncate">{f.sample}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="text-xs text-gray-600 mt-2">{formatDate(ds.created_at)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
