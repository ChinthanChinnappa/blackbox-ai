import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const NAV_LINKS = [
  { to: '/', label: '> Dashboard' },
  { to: '/investigation', label: '> Investigations' },
  { to: '/scanner', label: '> Dataset Scanner' },
  { to: '/activity', label: '> Activity' },
];

export default function Navbar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  return (
    <nav className="bg-cyber-dark border-b border-cyber-border px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link to="/" className="text-cyber-green font-bold text-lg tracking-widest text-glow cursor-blink">
          BLACK_AI
        </Link>
        <div className="hidden md:flex gap-6">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`text-sm transition-colors ${
                location.pathname === to
                  ? 'text-cyber-green'
                  : 'text-gray-500 hover:text-cyber-green'
              }`}
            >
              {label}
            </Link>
          ))}
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className={`text-sm transition-colors ${
                location.pathname === '/admin' ? 'text-cyber-red' : 'text-gray-500 hover:text-cyber-red'
              }`}
            >
              > Admin
            </Link>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs text-gray-500">
          [{user?.role?.toUpperCase()}] {user?.username}
        </span>
        <button
          onClick={handleLogout}
          className="text-xs text-cyber-red hover:text-red-300 border border-red-900 px-3 py-1 rounded transition-colors"
        >
          LOGOUT
        </button>
      </div>
    </nav>
  );
}
