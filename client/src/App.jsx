import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Investigation from './pages/Investigation';
import Scanner from './pages/Scanner';
import Activity from './pages/Activity';
import Admin from './pages/Admin';

// Protected route wrapper
const Protected = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />

        {/* Protected layout */}
        <Route path="/*" element={
          <Protected>
            <div className="min-h-screen bg-cyber-black">
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/investigation" element={<Investigation />} />
                <Route path="/scanner" element={<Scanner />} />
                <Route path="/activity" element={<Activity />} />
                <Route path="/admin" element={<Protected adminOnly><Admin /></Protected>} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </Protected>
        } />
      </Routes>
    </BrowserRouter>
  );
}
