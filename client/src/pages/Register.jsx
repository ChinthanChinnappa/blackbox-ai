import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/authService';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cyber-black">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-cyber-green text-3xl font-bold tracking-widest text-glow cursor-blink mb-2">BLACK_AI</div>
          <div className="text-gray-500 text-xs tracking-widest">CREATE ACCOUNT</div>
        </div>

        <form onSubmit={handleSubmit} className="bg-cyber-card border border-cyber-border rounded p-6 space-y-4">
          <div className="text-xs text-gray-500 mb-2">// NEW INVESTIGATOR</div>

          {['username', 'email', 'password'].map((field) => (
            <div key={field}>
              <label className="text-xs text-gray-500 block mb-1">{field.toUpperCase()}</label>
              <input
                type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                className="w-full bg-black border border-cyber-border rounded px-3 py-2 text-sm text-gray-200 font-mono focus:outline-none focus:border-cyber-green transition-colors"
                required
              />
            </div>
          ))}

          {error && <div className="text-xs text-red-400 bg-red-950/30 border border-red-900 rounded px-3 py-2">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-cyber-green/10 border border-cyber-green text-cyber-green text-sm font-bold rounded hover:bg-cyber-green/20 disabled:opacity-50 transition-colors tracking-widest"
          >
            {loading ? 'CREATING...' : 'REGISTER'}
          </button>

          <div className="text-center text-xs text-gray-600">
            Have an account?{' '}
            <Link to="/login" className="text-cyber-green hover:underline">Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
