import React from 'react';
import axios from 'axios';
import SupervisorDashboard from './dashboard/SupervisorDashboard';
import ProjectManagerDashboard from './dashboard/ProjectManagerDashboard';
import AdministratorDashboard from './dashboard/AdministratorDashboard';

// Attach auth token to every axios request (global interceptor kept here
// to avoid duplicating it in each role component, which use the api service).
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Dashboard — Role Router
 *
 * Reads the authenticated user's role from localStorage and renders the
 * appropriate role-specific dashboard component.
 *
 * Role mapping:
 *   Supervisor       → <SupervisorDashboard />
 *   Project Manager  → <ProjectManagerDashboard />
 *   Administrator    → <AdministratorDashboard />
 *
 * Each role dashboard is self-contained: it manages its own state, API calls,
 * handlers, and modals. Shared UI primitives (MetricCard, StatusBadge, etc.)
 * live in ./dashboard/DashboardShared.tsx.
 */
const Dashboard: React.FC = () => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const role: string = user?.role || 'Administrator';

  if (role === 'Supervisor') {
    return <SupervisorDashboard user={user} />;
  }

  if (role === 'Project Manager') {
    return <ProjectManagerDashboard user={user} />;
  }

  // Default: Administrator
  return <AdministratorDashboard user={user} />;
};

export default Dashboard;
