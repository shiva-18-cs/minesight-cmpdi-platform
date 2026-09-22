import React from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Files, 
  CheckCircle, 
  AlertTriangle, 
  GitMerge, 
  Search, 
  MessageSquare, 
  Hash, 
  Cloud, 
  BarChart2, 
  PieChart, 
  History, 
  Users, 
  Settings,
  LogOut
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const baseMenuItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Documents', path: '/documents', icon: <Files size={20} /> },
    { name: 'Check Data', path: '/check-data', icon: <CheckCircle size={20} /> },
    { name: 'Differences', path: '/differences', icon: <AlertTriangle size={20} /> },
    { name: 'Resolve Differences', path: '/resolve', icon: <GitMerge size={20} /> },
    { name: 'Smart Search', path: '/search', icon: <Search size={20} /> },
    { name: 'Ask AI', path: '/ask-ai', icon: <MessageSquare size={20} /> },
    { name: 'Topics', path: '/topics', icon: <Hash size={20} /> },
    { name: 'Word Cloud', path: '/wordcloud', icon: <Cloud size={20} /> },
    { name: 'Reports', path: '/reports', icon: <BarChart2 size={20} /> },
    { name: 'Analytics', path: '/analytics', icon: <PieChart size={20} /> },
    { name: 'Activity History', path: '/activity', icon: <History size={20} /> },
    { name: 'Users', path: '/users', icon: <Users size={20} />, adminOnly: true },
  ];

  let menuItems = baseMenuItems;
  if (user && user.role === 'Supervisor') {
    menuItems = [
      { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
      { name: 'Documents', path: '/documents', icon: <Files size={20} /> },
      { name: 'Submissions', path: '/#submissions', icon: <CheckCircle size={20} /> },
      { name: 'Queries', path: '/#queries', icon: <MessageSquare size={20} /> },
      { name: 'Notifications', path: '/#notifications', icon: <AlertTriangle size={20} /> },
    ];
  } else if (user && user.role === 'Administrator') {
    menuItems = [
      { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
      { name: 'Reports Awaiting Review', path: '/#awaiting', icon: <CheckCircle size={20} /> },
      { name: 'Report Analysis', path: '/analytics', icon: <PieChart size={20} /> },
      { name: 'Word Cloud', path: '/wordcloud', icon: <Cloud size={20} /> },
      { name: 'Topics', path: '/topics', icon: <Hash size={20} /> },
      { name: 'Queries', path: '/#queries', icon: <MessageSquare size={20} /> },
      { name: 'Final Reports', path: '/reports', icon: <BarChart2 size={20} /> },
      { name: 'Notifications', path: '/#notifications', icon: <AlertTriangle size={20} /> },
    ];
  } else if (user && user.role === 'Project Manager') {
    menuItems = [
      { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
      { name: 'Incoming Submissions', path: '/#incoming', icon: <Files size={20} /> },
      { name: 'Documents', path: '/documents', icon: <Files size={20} /> },
      { name: 'Data Validation', path: '/#validation', icon: <CheckCircle size={20} /> },
      { name: 'Reports', path: '/reports', icon: <BarChart2 size={20} /> },
      { name: 'Queries', path: '/#queries', icon: <MessageSquare size={20} /> },
      { name: 'Notifications', path: '/#notifications', icon: <AlertTriangle size={20} /> },
    ];
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-900">MineSight</h1>
          <p className="text-xs text-gray-500">Mining & Reporting Intelligence</p>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              if (item.adminOnly && user.role !== 'Administrator') return null;

              
              const isActive = location.pathname === item.path && (item.path !== '/' || location.hash === item.path.replace('/', ''));
              // Fallback active state for hash links
              const isHashActive = location.hash === item.path.replace('/', '');
              const actuallyActive = isActive || isHashActive;

              return (
                <li key={item.name}>
                  <button
                    onClick={() => {
                      if (item.path.includes('#')) {
                        navigate('/');
                        setTimeout(() => {
                          const element = document.getElementById(item.path.split('#')[1]);
                          if (element) element.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      } else {
                        navigate(item.path);
                      }
                    }}
                    className={`w-full flex items-center px-4 py-2 text-sm font-medium ${
                      actuallyActive 
                        ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
            <button onClick={handleLogout} className="text-gray-500 hover:text-red-600">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
