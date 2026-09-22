import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { Lock, ArrowLeft, ShieldCheck, ClipboardCheck, BarChart3 } from 'lucide-react';

type Role = 'Supervisor' | 'Project Manager' | 'Administrator' | null;

const Login: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If already logged in, go straight to dashboard
    const user = localStorage.getItem('user');
    if (user) {
      navigate('/');
    }
  }, [navigate]);

  const performLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await authService.login({ username, password });
      
      if (response.role !== selectedRole) {
        setError(`Access Denied. You are not authorized for the ${selectedRole} dashboard.`);
        setLoading(false);
        return;
      }

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify({
        id: response.id,
        username: response.username,
        role: response.role,
        full_name: response.full_name
      }));
      navigate('/');
    } catch (err) {
      setError('Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setError('');
    // Auto-fill for prototype demo purposes based on selected role
    if (role === 'Supervisor') {
      setUsername('supervisor');
      setPassword('supervisor123');
    } else if (role === 'Project Manager') {
      setUsername('projectmanager');
      setPassword('manager123');
    } else if (role === 'Administrator') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-3xl text-center">
        <div className="mx-auto h-14 w-14 bg-blue-700 text-white flex items-center justify-center rounded-2xl shadow-md">
          <Lock size={28} />
        </div>
        <h1 className="mt-5 text-center text-3xl font-extrabold text-slate-900 tracking-tight">MineSight</h1>
        <p className="mt-2 text-center text-sm text-slate-600">
          AI-Powered Geological &amp; Mining Reporting Intelligence Platform
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-3xl">
        {!selectedRole ? (
          <div className="space-y-6">
            <h2 className="text-center text-lg font-semibold text-slate-700 tracking-wide">
              SELECT YOUR ROLE
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Supervisor Card */}
              <button
                onClick={() => handleRoleSelect('Supervisor')}
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-500 hover:shadow-md transition flex flex-col items-center text-center group"
              >
                <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <ClipboardCheck size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Supervisor</h3>
                <p className="text-sm text-slate-500 mt-2 font-medium">Data Provider</p>
                <p className="text-xs text-slate-400 mt-2">Upload documents and submit reports for approval.</p>
              </button>

              {/* Project Manager Card */}
              <button
                onClick={() => handleRoleSelect('Project Manager')}
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-purple-500 hover:shadow-md transition flex flex-col items-center text-center group"
              >
                <div className="h-16 w-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <BarChart3 size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Project Manager</h3>
                <p className="text-sm text-slate-500 mt-2 font-medium">Review &amp; Report</p>
                <p className="text-xs text-slate-400 mt-2">Validate data, generate automated reports, and submit.</p>
              </button>

              {/* Administrator Card */}
              <button
                onClick={() => handleRoleSelect('Administrator')}
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-emerald-500 hover:shadow-md transition flex flex-col items-center text-center group"
              >
                <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Administrator</h3>
                <p className="text-sm text-slate-500 mt-2 font-medium">Analysis &amp; Approval</p>
                <p className="text-xs text-slate-400 mt-2">Final analysis, semantic search, and approval workflows.</p>
              </button>

            </div>
          </div>
        ) : (
          <div className="bg-white py-8 px-6 shadow-sm sm:rounded-2xl sm:px-10 border border-slate-200 max-w-md mx-auto relative">
            <button 
              onClick={() => setSelectedRole(null)}
              className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 flex items-center text-sm font-medium transition"
            >
              <ArrowLeft size={16} className="mr-1" /> Back
            </button>
            
            <div className="text-center mb-8 mt-4">
              <h2 className="text-xl font-bold text-slate-900">Login to {selectedRole}</h2>
              <p className="text-sm text-slate-500 mt-1">Please enter your credentials</p>
            </div>

            <form className="space-y-5" onSubmit={performLogin}>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Username
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg shadow-xs focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg shadow-xs focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm outline-none"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 font-medium">
                  {error}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-xs text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition disabled:opacity-50"
                >
                  {loading ? 'Authenticating...' : `LOGIN TO ${selectedRole.toUpperCase()} DASHBOARD`}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
