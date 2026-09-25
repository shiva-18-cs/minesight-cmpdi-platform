import React, { useState, useEffect, useCallback } from 'react';
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
  LogOut,
  Mail,
  X,
} from 'lucide-react';
import { messageService } from '../services/api';

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const [unreadMessages, setUnreadMessages] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const fetchUnread = useCallback(async () => {
    try {
      const data = await messageService.getUnreadCount();
      setUnreadMessages(data.unread_count ?? data.unread ?? 0);
    } catch {}
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const { default: axios } = await import('axios');
      const res = await axios.get((import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/notifications', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(res.data);
    } catch (e) { console.error(e); }
  }, []);

  // Poll unread count every 30 seconds
  useEffect(() => {
    if (!user) return;
    fetchUnread();
    fetchNotifications();
    const id = setInterval(() => {
      fetchUnread();
      fetchNotifications();
    }, 30000);
    return () => clearInterval(id);
  }, [fetchUnread, fetchNotifications, user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Messages nav item shared across all roles
  const messagesItem = {
    name: 'Messages',
    path: '/messages',
    icon: <Mail size={20} />,
    badge: unreadMessages,
  };

  const baseMenuItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} />, badge: 0 },
    { name: 'Documents', path: '/documents', icon: <Files size={20} />, badge: 0 },
    { name: 'Check Data', path: '/check-data', icon: <CheckCircle size={20} />, badge: 0 },
    { name: 'Differences', path: '/differences', icon: <AlertTriangle size={20} />, badge: 0 },
    { name: 'Resolve Differences', path: '/resolve', icon: <GitMerge size={20} />, badge: 0 },
    { name: 'Smart Search', path: '/search', icon: <Search size={20} />, badge: 0 },
    { name: 'Ask AI', path: '/ask-ai', icon: <MessageSquare size={20} />, badge: 0 },
    { name: 'Topics', path: '/topics', icon: <Hash size={20} />, badge: 0 },
    { name: 'Word Cloud', path: '/wordcloud', icon: <Cloud size={20} />, badge: 0 },
    { name: 'Reports', path: '/reports', icon: <BarChart2 size={20} />, badge: 0 },
    { name: 'Analytics', path: '/analytics', icon: <PieChart size={20} />, badge: 0 },
    { name: 'Activity History', path: '/activity', icon: <History size={20} />, badge: 0 },
    { name: 'Users', path: '/users', icon: <Users size={20} />, badge: 0, adminOnly: true },
    messagesItem,
  ];

  const unreadNotifs = notifications.filter((n: any) => !n.is_read).length;

  let menuItems: typeof baseMenuItems;
  if (user?.role === 'Supervisor') {
    menuItems = [
      { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} />, badge: 0 },
      { name: 'Documents', path: '/documents', icon: <Files size={20} />, badge: 0 },
      { name: 'Submissions', path: '/submissions', icon: <CheckCircle size={20} />, badge: 0 },
      { name: 'Queries', path: '/#queries', icon: <MessageSquare size={20} />, badge: 0 },
      { name: 'Notifications', path: '/#notifications', icon: <AlertTriangle size={20} />, badge: unreadNotifs },
      messagesItem,
    ];
  } else if (user?.role === 'Administrator') {
    menuItems = [
      { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} />, badge: 0 },
      { name: 'Reports Awaiting Review', path: '/#awaiting', icon: <CheckCircle size={20} />, badge: 0 },
      { name: 'Report Analysis', path: '/analytics', icon: <PieChart size={20} />, badge: 0 },
      { name: 'Word Cloud', path: '/wordcloud', icon: <Cloud size={20} />, badge: 0 },
      { name: 'Topics', path: '/topics', icon: <Hash size={20} />, badge: 0 },
      { name: 'Queries', path: '/#queries', icon: <MessageSquare size={20} />, badge: 0 },
      { name: 'Final Reports', path: '/reports', icon: <BarChart2 size={20} />, badge: 0 },
      { name: 'Notifications', path: '/#notifications', icon: <AlertTriangle size={20} />, badge: unreadNotifs },
      messagesItem,
    ];
  } else if (user?.role === 'Project Manager') {
    menuItems = [
      { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} />, badge: 0 },
      { name: 'Incoming Submissions', path: '/submissions', icon: <Files size={20} />, badge: 0 },
      { name: 'Documents', path: '/documents', icon: <Files size={20} />, badge: 0 },
      { name: 'Data Validation', path: '/check-data', icon: <CheckCircle size={20} />, badge: 0 },
      { name: 'Reports', path: '/reports', icon: <BarChart2 size={20} />, badge: 0 },
      { name: 'Queries', path: '/#queries', icon: <MessageSquare size={20} />, badge: 0 },
      { name: 'Notifications', path: '/#notifications', icon: <AlertTriangle size={20} />, badge: unreadNotifs },
      messagesItem,
    ];
  } else {
    menuItems = baseMenuItems;
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-900">MineSight</h1>
          <p className="text-xs text-gray-500">Mining &amp; Reporting Intelligence</p>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              if ((item as any).adminOnly && user.role !== 'Administrator') return null;

              const isHashLink = item.path.includes('#');
              const isActive = !isHashLink && location.pathname === item.path;

              return (
                <li key={item.name}>
                  <button
                    onClick={() => {
                      if (item.name === 'Notifications') {
                        setShowNotifications(true);
                        return;
                      }
                      if (isHashLink) {
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
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span className="flex-1 text-left">{item.name}</span>
                    {item.badge > 0 && (
                      <span className="ml-1 h-5 min-w-[20px] px-1 rounded-full bg-blue-700 text-white text-[10px] font-bold flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
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
      <main className="flex-1 min-w-0 overflow-y-auto">
        <Outlet />
      </main>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200 animate-slide-in">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle size={18} className="text-blue-600" /> Notifications
            </h3>
            <button onClick={() => setShowNotifications(false)} className="p-1 hover:bg-gray-200 rounded text-gray-500 cursor-pointer"><X size={18} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500 text-center italic mt-10">No notifications.</p>
            ) : notifications.map((n: any) => (
              <div key={n.id} className={`p-4 rounded-xl border text-sm shadow-sm transition ${!n.is_read ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
                <p className="font-semibold text-gray-900 flex items-start gap-2">
                  {!n.is_read && <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>}
                  {n.title || n.message}
                </p>
                {n.title && <p className="text-gray-600 mt-2 ml-4">{n.message}</p>}
                <p className="text-[10px] text-gray-400 mt-3 ml-4 uppercase font-bold">{new Date(n.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;
