import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/authService';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cyber-black">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-cyber-green text-3xl font-bold tracking-widest text-glow cursor-blink mb-2">BLACK_AI</div>
          <div className="text-gray-500 text-xs tracking-widest">INVESTIGATION PLATFORM v1.0</div>
        </div>

        <form onSubmit={handleSubmit} className="bg-cyber-card border border-cyber-border rounded p-6 space-y-4">
          <div className="text-xs text-gray-500 mb-2">// AUTHENTICATE</div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">EMAIL</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-black border border-cyber-border rounded px-3 py-2 text-sm text-gray-200 font-mono focus:outline-none focus:border-cyber-green transition-colors"
              placeholder="investigator@blackai.local"
              required
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">PASSWORD</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-black border border-cyber-border rounded px-3 py-2 text-sm text-gray-200 font-mono focus:outline-none focus:border-cyber-green transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <div className="text-xs text-red-400 bg-red-950/30 border border-red-900 rounded px-3 py-2">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-cyber-green/10 border border-cyber-green text-cyber-green text-sm font-bold rounded hover:bg-cyber-green/20 disabled:opacity-50 transition-colors tracking-widest"
          >
            {loading ? 'AUTHENTICATING...' : 'LOGIN'}
          </button>

          <div className="text-center text-xs text-gray-600">
            No account?{' '}
            <Link to="/register" className="text-cyber-green hover:underline">Register</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
