import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { Lock } from 'lucide-react';

// Professional two‑panel login – no role selection, role is derived from backend token
const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // If already logged in, redirect to dashboard (role‑aware UI will handle routing)
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) navigate('/');
  }, [navigate]);

  const performLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await authService.login({ username, password });
      // Store token & user info – role comes from backend
      localStorage.setItem('token', response.token);
      localStorage.setItem(
        'user',
        JSON.stringify({
          id: response.id,
          username: response.username,
          role: response.role,
          full_name: response.full_name,
        })
      );
      navigate('/');
    } catch (err) {
      setError('Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoUsername: string, demoPassword: string) => {
    setError('');
    setLoading(true);
    try {
      const response = await authService.login({ username: demoUsername, password: demoPassword });
      localStorage.setItem('token', response.token);
      localStorage.setItem(
        'user',
        JSON.stringify({
          id: response.id,
          username: response.username,
          role: response.role,
          full_name: response.full_name,
        })
      );
      navigate('/');
    } catch (err) {
      setError('Authentication failed for demo account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Left branding panel */}
      <div className="sm:mx-auto sm:w-full sm:max-w-3xl text-center mb-8">
        <div className="mx-auto h-16 w-16 bg-blue-800 text-white flex items-center justify-center rounded-2xl shadow-md">
          <Lock size={32} />
        </div>
        <h1 className="mt-5 text-3xl font-extrabold text-slate-900 tracking-tight">MineSight</h1>
        <p className="mt-2 text-sm text-slate-600">
          Enterprise‑grade geological & mining reporting platform
        </p>
      </div>

      {/* Credential form */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <form className="space-y-6" onSubmit={performLogin}>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="mt-1 w-full px-3.5 py-2.5 border border-slate-300 rounded-lg shadow-xs focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm outline-none"
            />
          </div>
          <div>
            <div className="flex justify-between items-center">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="text-xs text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="mt-1 w-full px-3.5 py-2.5 border border-slate-300 rounded-lg shadow-xs focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm outline-none"
            />
          </div>
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 font-medium">
              {error}
            </div>
          )}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-xs text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition disabled:opacity-50"
            >
              {loading ? 'Authenticating…' : 'Sign In'}
            </button>
          </div>
        </form>

        {/* Prototype Demo Access */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center mb-3">
            Prototype Demo Access
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoLogin('supervisor', 'supervisor123')}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-emerald-600 transition shadow-xs text-center disabled:opacity-50"
            >
              Supervisor Demo
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoLogin('projectmanager', 'manager123')}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-purple-600 transition shadow-xs text-center disabled:opacity-50"
            >
              Project Manager Demo
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleDemoLogin('admin', 'admin123')}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-blue-600 transition shadow-xs text-center disabled:opacity-50"
            >
              Administrator Demo
            </button>
          </div>
          <p className="text-[11px] text-slate-400 text-center mt-2.5">
            Authenticates via existing backend /auth/login with preconfigured system roles
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
