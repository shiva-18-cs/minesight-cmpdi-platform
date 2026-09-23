import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import CheckData from './pages/CheckData';
import Differences from './pages/Differences';
import ResolveDifferences from './pages/ResolveDifferences';
import SmartSearch from './pages/SmartSearch';
import AskAI from './pages/AskAI';
import Topics from './pages/Topics';
import WordCloud from './pages/WordCloud';
import Reports from './pages/Reports';
import Analytics from './pages/Analytics';
import ActivityHistory from './pages/ActivityHistory';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Messages from './pages/Messages';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="documents" element={<Documents />} />
          <Route path="check-data" element={<CheckData />} />
          <Route path="differences" element={<Differences />} />
          <Route path="resolve" element={<ResolveDifferences />} />
          <Route path="search" element={<SmartSearch />} />
          <Route path="ask-ai" element={<AskAI />} />
          <Route path="topics" element={<Topics />} />
          <Route path="wordcloud" element={<WordCloud />} />
          <Route path="reports" element={<Reports />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="activity" element={<ActivityHistory />} />
          <Route path="users" element={<Users />} />
          <Route path="settings" element={<Settings />} />
          <Route path="messages" element={<Messages />} />
          {/* Fallback to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
