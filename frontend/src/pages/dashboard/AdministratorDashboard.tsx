import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Files, CheckCircle, AlertTriangle, MessageSquare, ArrowRight,
  FileText, TrendingUp, Eye, Cloud, Hash, Loader2, X,
  Sparkles, Layers, History, PieChart, MessageCircle,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer, LineChart, Line,
} from 'recharts';
import api from '../../services/api';
import { MetricCard, CompactMetric, StatusBadge, SectionHeader } from './DashboardShared';

/* ─────────────────────────────────────────────────────────────
   ADMINISTRATOR DASHBOARD
   Executive oversight: report review, approvals, analytics.
   OCR/AI surfaces only as a compact intelligence card — NOT
   the primary workflow hero.
───────────────────────────────────────────────────────────── */

const AdministratorDashboard: React.FC<{ user: any }> = ({ user }) => {
  const navigate = useNavigate();

  const [stats, setStats] = useState<any>(null);
  const [adminReports, setAdminReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [selectedYear, setSelectedYear] = useState<string>('2024');
  const [selectedSubsidiary, setSelectedSubsidiary] = useState<string>('');

  // Modal state
  const [adminSelectedReport, setAdminSelectedReport] = useState<any>(null);
  const [isRaisingQuery, setIsRaisingQuery] = useState(false);
  const [adminQueryText, setAdminQueryText] = useState('');
  const [adminActionRequested, setAdminActionRequested] = useState('');

  /* ── Data fetching ─────────────────────────────────────── */
  useEffect(() => {
    fetchAdminStats();
    fetchAdminReports();
  }, [selectedYear, selectedSubsidiary]);

  const fetchAdminStats = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedYear) params.year = parseInt(selectedYear);
      if (selectedSubsidiary) params.subsidiary = selectedSubsidiary;
      const res = await api.get('/dashboard', { params });
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching admin stats', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminReports = async () => {
    try {
      const res = await api.get('/admin/reports');
      setAdminReports(res.data);
    } catch (err) {
      console.error('Error fetching admin reports', err);
    }
  };

  /* ── Handlers ──────────────────────────────────────────── */
  const handleApproveReport = async (reportId: number) => {
    if (!window.confirm('Approve this report as the final report?')) return;
    try {
      await api.put(`/reports/${reportId}/approve`);
      alert('Report approved successfully.');
      setAdminSelectedReport(null);
      fetchAdminReports();
    } catch {
      alert('Error approving report.');
    }
  };

  const handleRaiseQuery = async (reportId: number) => {
    if (!adminQueryText) return alert('Please enter the query details.');
    try {
      await api.post(`/reports/${reportId}/query`, {
        query: adminQueryText,
        action_requested: adminActionRequested,
      });
      alert('Query raised successfully.');
      setIsRaisingQuery(false);
      setAdminSelectedReport(null);
      setAdminQueryText('');
      setAdminActionRequested('');
      fetchAdminReports();
    } catch {
      alert('Error raising query.');
    }
  };

  /* ── Loading ───────────────────────────────────────────── */
  if (loading || !stats) {
    return (
      <div className="flex justify-center items-center h-full min-h-[60vh]">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  const reportsAwaitingReview = adminReports.filter(
    (r) => r.status === 'Submitted to Administrator' || r.status === 'Resubmitted'
  ).length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-20">

      {/* ── PAGE HEADER + FILTERS ───────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <SectionHeader
          title="Reporting & Oversight"
          subtitle="Review finalized information, reports and system activity."
          userName={user?.full_name}
        />
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="border border-gray-300 rounded-lg text-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
          >
            <option value="">All Years</option>
            {['2025', '2024', '2023', '2022', '2021', '2020'].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select
            value={selectedSubsidiary}
            onChange={(e) => setSelectedSubsidiary(e.target.value)}
            className="border border-gray-300 rounded-lg text-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
          >
            <option value="">All Subsidiaries</option>
            {['MCL', 'WCL', 'NCL', 'SECL', 'CCL', 'BCCL', 'ECL'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── QUICK ACTIONS ───────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        <button
          id="admin-review-reports"
          onClick={() => document.getElementById('awaiting')?.scrollIntoView({ behavior: 'smooth' })}
          className="px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition shadow-sm flex items-center text-sm"
        >
          <FileText size={16} className="mr-2" /> Review Reports
        </button>
        <button
          id="admin-resolve-queries"
          onClick={() => document.getElementById('admin-queries-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="px-4 py-2.5 bg-white text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition shadow-sm border border-slate-200 flex items-center text-sm"
        >
          <MessageSquare size={16} className="mr-2" /> Resolve Queries
        </button>
        <button
          id="admin-view-analytics"
          onClick={() => navigate('/analytics')}
          className="px-4 py-2.5 bg-white text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition shadow-sm border border-slate-200 flex items-center text-sm"
        >
          <PieChart size={16} className="mr-2" /> View Analytics
        </button>
        <button
          id="admin-activity-history"
          onClick={() => navigate('/activity')}
          className="px-4 py-2.5 bg-white text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition shadow-sm border border-slate-200 flex items-center text-sm"
        >
          <History size={16} className="mr-2" /> Activity History
        </button>
      </div>

      {/* ── HERO: REPORTING & INTELLIGENCE OVERVIEW ─────── */}
      {/* Indigo-toned gradient — distinct from Supervisor and PM */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-lg border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-2">
                <Sparkles size={13} className="text-indigo-400" /> Reporting Intelligence
              </div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                Reporting &amp; Intelligence Overview
              </h2>
              <p className="text-sm md:text-base text-slate-300 mt-1 max-w-3xl">
                Monitor verified information, reports, queries and system activity.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                id="admin-hero-review"
                onClick={() => document.getElementById('awaiting')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <FileText size={15} /> Review Reports
              </button>
              <button
                id="admin-hero-analytics"
                onClick={() => navigate('/analytics')}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <PieChart size={15} /> View Analytics
              </button>
            </div>
          </div>

          {/* 4-step Admin approval workflow */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { step: '1', color: 'indigo', icon: <CheckCircle size={18} className="text-indigo-400" />, title: 'Verified Data', desc: 'PM-validated information and reconciled discrepancies', tag: 'Source: PM Validation' },
              { step: '2', color: 'blue', icon: <FileText size={18} className="text-blue-400" />, title: 'Report Review', desc: 'Review finalized reports submitted by Project Manager', tag: 'Report Analysis' },
              { step: '3', color: 'amber', icon: <Eye size={18} className="text-amber-400" />, title: 'Administrator Review', desc: 'Raise queries if discrepancies remain; approve if acceptable', tag: 'Query or Approve' },
              { step: '4', color: 'emerald', icon: <CheckCircle size={18} className="text-emerald-400" />, title: 'Final Approval', desc: 'Approve the final report for official record', tag: 'Approval & Audit' },
            ].map(({ step, color, icon, title, desc, tag }) => (
              <div key={step} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`h-7 w-7 rounded-lg bg-${color}-500/20 border border-${color}-400/30 flex items-center justify-center text-${color}-300 text-xs font-bold`}>
                      {step}
                    </span>
                    {icon}
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">{title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{desc}</p>
                </div>
                <div className={`mt-4 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-${color}-300 font-mono`}>
                  <span>{tag}</span>
                  <ArrowRight size={13} className="text-slate-400 group-hover:translate-x-1 transition" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── KPI STAT CARDS ──────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[
          { name: 'Reports Awaiting Review', value: reportsAwaitingReview, desc: 'Submitted by Project Manager', icon: <FileText size={20} className="text-indigo-600" />, path: '/#awaiting', iconBg: 'bg-indigo-50' },
          { name: 'Approved Reports', value: stats?.approved_reports ?? 0, desc: 'Successfully approved & finalized', icon: <CheckCircle size={20} className="text-emerald-600" />, path: '/reports', iconBg: 'bg-emerald-50' },
          { name: 'Open Queries', value: stats?.queries_received ?? 0, desc: 'Queries requiring attention', icon: <MessageSquare size={20} className="text-red-500" />, path: '/', iconBg: 'bg-red-50' },
          { name: 'Total Documents', value: stats?.total_documents ?? 0, desc: 'Across all subsidiaries', icon: <Files size={20} className="text-blue-600" />, path: '/documents', iconBg: 'bg-blue-50' },
          { name: 'Active Reports', value: stats?.active_reports ?? 0, desc: 'Reports currently in progress', icon: <TrendingUp size={20} className="text-purple-600" />, path: '/reports', iconBg: 'bg-purple-50' },
          { name: 'Subsidiaries', value: stats?.total_subsidiaries ?? 7, desc: 'Coal India subsidiaries tracked', icon: <Hash size={20} className="text-cyan-600" />, path: '/analytics', iconBg: 'bg-cyan-50' },
        ].map((card) => (
          <button
            key={card.name}
            id={`admin-kpi-${card.name.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={() => navigate(card.path)}
            className="bg-white p-5 text-left rounded-xl shadow-xs border border-gray-200 hover:border-blue-400 hover:shadow-md transition group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between w-full mb-3">
              <span className={`p-2 ${card.iconBg} rounded-lg group-hover:scale-110 transition`}>{card.icon}</span>
              <ArrowRight size={14} className="text-gray-300 group-hover:text-blue-600 transition" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{card.value}</div>
              <div className="text-xs font-semibold text-gray-700 mt-0.5">{card.name}</div>
              <div className="text-[11px] text-gray-400 mt-1">{card.desc}</div>
            </div>
          </button>
        ))}
      </div>

      {/* ── REPORTS AWAITING REVIEW ──────────────────────── */}
      <div id="awaiting" className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Reports Awaiting Review</h2>
            <p className="text-sm text-gray-500 mt-1">Final reports submitted by Project Managers requiring Administrator approval.</p>
          </div>
          <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><CheckCircle size={20} /></div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-500 uppercase tracking-wider text-xs">Report ID</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-500 uppercase tracking-wider text-xs">Title</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-500 uppercase tracking-wider text-xs">Submitted By</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-500 uppercase tracking-wider text-xs">Status</th>
                <th className="px-6 py-4 text-right font-semibold text-gray-500 uppercase tracking-wider text-xs">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {adminReports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">No reports awaiting review.</td>
                </tr>
              ) : adminReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-900">{report.report_id}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{report.title}</td>
                  <td className="px-6 py-4 text-gray-600">
                    <div>{report.submitted_by || 'Project Manager'}</div>
                    {report.submitted_at && <div className="text-xs text-gray-400 mt-0.5">{new Date(report.submitted_at).toLocaleString()}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold whitespace-nowrap">{report.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      id={`admin-review-report-${report.id}`}
                      onClick={() => setAdminSelectedReport(report)}
                      className="px-4 py-1.5 bg-blue-600 text-white font-semibold rounded shadow-sm hover:bg-blue-700 transition text-xs"
                    >
                      Review Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── CHARTS + DOCUMENT INTELLIGENCE ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Production Trend */}
        <div className="lg:col-span-1 bg-white p-6 shadow-xs rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">Production Trend (MT)</h2>
              <p className="text-xs text-gray-500">Historical performance across coal subsidiaries</p>
            </div>
            <span className="p-2 bg-blue-50 text-blue-700 rounded-lg"><TrendingUp size={16} /></span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.production_trend || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="year" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                {(!selectedSubsidiary || selectedSubsidiary === 'MCL') && <Line type="monotone" dataKey="MCL" stroke="#2563EB" strokeWidth={2} dot={{ r: 3 }} />}
                {(!selectedSubsidiary || selectedSubsidiary === 'WCL') && <Line type="monotone" dataKey="WCL" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} />}
                {(!selectedSubsidiary || selectedSubsidiary === 'NCL') && <Line type="monotone" dataKey="NCL" stroke="#D97706" strokeWidth={2} dot={{ r: 3 }} />}
                {(!selectedSubsidiary || selectedSubsidiary === 'SECL') && <Line type="monotone" dataKey="SECL" stroke="#7C3AED" strokeWidth={2} dot={{ r: 3 }} />}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Target vs Actual */}
        <div className="lg:col-span-1 bg-white p-6 shadow-xs rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">Target vs Actual ({selectedYear || '2024'})</h2>
              <p className="text-xs text-gray-500">Achievement comparison in Million Tonnes</p>
            </div>
            <button onClick={() => navigate('/analytics')} className="text-xs font-semibold text-blue-600 hover:text-blue-800">View Details &rarr;</button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.target_vs_actual || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="target" name="Target (MT)" fill="#93C5FD" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" name="Actual (MT)" fill="#1D4ED8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Compact: Document Intelligence Overview */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 flex flex-col">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg"><Layers size={16} /></div>
              <h2 className="text-base font-bold text-gray-900">Document Intelligence Overview</h2>
            </div>
            <p className="text-xs text-gray-500">Platform OCR and AI extraction at a glance.</p>
          </div>
          <div className="p-5 grid grid-cols-1 gap-3 flex-1">
            <CompactMetric
              label="OCR Processed"
              value={stats?.total_documents !== undefined ? Number(stats.total_documents).toLocaleString() : '—'}
              valueColor="text-indigo-700"
              sublabel="Machine-readable text available"
            />
            <CompactMetric
              label="Extracted Information"
              value={stats?.information_found !== undefined ? Number(stats.information_found).toLocaleString() : stats?.extracted_fields !== undefined ? Number(stats.extracted_fields).toLocaleString() : '—'}
              valueColor="text-purple-700"
              sublabel="Structured data points"
            />
            <CompactMetric
              label="Verification Status"
              value={stats?.pending_submissions !== undefined ? `${stats.pending_submissions} pending` : '—'}
              valueColor="text-amber-600"
              sublabel="Awaiting human review"
            />
          </div>
          <div className="p-5 pt-0">
            <button
              id="admin-view-documents"
              onClick={() => navigate('/documents')}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-2"
            >
              <Files size={14} /> View Documents
            </button>
          </div>
        </div>
      </div>

      {/* ── RECENT AUDIT ACTIVITY ───────────────────────── */}
      {stats.recent_activity && stats.recent_activity.length > 0 && (
        <div id="admin-queries-section" className="bg-white rounded-xl shadow-xs border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Recent Enterprise Audit Actions</h2>
            <button
              id="admin-full-activity-log"
              onClick={() => navigate('/activity')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center"
            >
              Full Activity Log <ArrowRight size={13} className="ml-1" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Action</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Details</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.recent_activity.slice(0, 5).map((act: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-medium text-gray-900 text-xs">{act.user}</td>
                    <td className="px-4 py-2.5 font-semibold text-blue-700 text-xs">{act.action}</td>
                    <td className="px-4 py-2.5 text-gray-600 text-xs truncate max-w-sm">{act.details || '—'}</td>
                    <td className="px-4 py-2.5 text-gray-400 text-xs">{new Date(act.timestamp).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── ADMIN REVIEW MODAL ──────────────────────────── */}
      {adminSelectedReport && !isRaisingQuery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">Administrator Review: {adminSelectedReport.report_id}</h3>
              <button onClick={() => setAdminSelectedReport(null)} className="text-slate-400 hover:text-slate-600 transition p-1"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="flex flex-col md:flex-row gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex-1">
                  <h2 className="text-2xl font-extrabold text-slate-900">{adminSelectedReport.title}</h2>
                  <div className="flex items-center text-sm text-slate-500 mt-2 space-x-4">
                    <span><b>Subsidiary:</b> {adminSelectedReport.subsidiary}</span>
                    <span><b>Period:</b> {adminSelectedReport.year}</span>
                    <span><b>Submitted By:</b> {adminSelectedReport.submitted_by || 'Project Manager'}</span>
                    {adminSelectedReport.submitted_at && <span><b>On:</b> {new Date(adminSelectedReport.submitted_at).toLocaleString()}</span>}
                  </div>
                </div>
                <div className="shrink-0 flex items-center">
                  <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-bold border border-yellow-200">Status: {adminSelectedReport.status}</span>
                </div>
              </div>

              {adminSelectedReport.pm_response && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="text-sm font-bold text-blue-900 flex items-center mb-2">
                    <MessageCircle size={16} className="mr-2" /> Project Manager Response
                  </h4>
                  <div className="text-xs text-blue-800 mb-2 font-medium">Original Query: {adminSelectedReport.pm_query_question}</div>
                  <div className="text-sm text-slate-800 bg-white p-3 rounded border border-blue-100 shadow-sm">{adminSelectedReport.pm_response}</div>
                  <div className="text-xs text-blue-600 mt-2 font-semibold">
                    Resolved by {adminSelectedReport.pm_resolved_by} on {adminSelectedReport.pm_resolved_at ? new Date(adminSelectedReport.pm_resolved_at).toLocaleString() : ''}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3 flex items-center"><FileText size={16} className="mr-2" /> Report Summary</h3>
                    <p className="text-sm text-slate-600">
                      This report compiles the validated production and operational data for {adminSelectedReport.subsidiary} for the year {adminSelectedReport.year}. All primary discrepancies have been reviewed and resolved by the Project Manager.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3 flex items-center"><CheckCircle size={16} className="mr-2" /> Validation Status</h3>
                    <div className="text-sm text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-100 flex items-start">
                      <CheckCircle size={18} className="mr-2 shrink-0 mt-0.5" />
                      Data successfully validated against {adminSelectedReport.source_count || 3} source documents. No pending discrepancies.
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3 flex items-center"><Cloud size={16} className="mr-2" /> Key Terms</h3>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-wrap gap-2 justify-center items-center min-h-[80px]">
                      {['Production', 'Safety', 'Geology', 'Exploration', 'Coal', 'Mining', 'Environment'].map((term) => (
                        <span key={term} className="px-2.5 py-1 bg-white text-slate-700 rounded text-xs font-semibold border border-slate-200">{term}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3 flex items-center"><Hash size={16} className="mr-2" /> Identified Topics</h3>
                    <div className="flex flex-wrap gap-2">
                      {['Production', 'Mining Operations', 'Geological Exploration', 'Safety'].map((t) => (
                        <span key={t} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded text-xs font-semibold">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200">
                <h3 className="text-base font-bold text-slate-900 mb-4 text-center">Is the report acceptable?</h3>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    id="admin-approve-report"
                    onClick={() => handleApproveReport(adminSelectedReport.id)}
                    className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-sm hover:bg-emerald-700 transition flex items-center justify-center text-sm"
                  >
                    <CheckCircle size={18} className="mr-2" /> Approve Final Report
                  </button>
                  <button
                    id="admin-raise-query"
                    onClick={() => setIsRaisingQuery(true)}
                    className="px-6 py-3 bg-white border-2 border-red-200 text-red-600 font-bold rounded-xl shadow-sm hover:bg-red-50 transition flex items-center justify-center text-sm"
                  >
                    <AlertTriangle size={18} className="mr-2" /> Raise Query
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── RAISE QUERY MODAL ───────────────────────────── */}
      {isRaisingQuery && adminSelectedReport && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-red-50 text-red-900">
              <h3 className="text-lg font-bold flex items-center"><AlertTriangle size={20} className="mr-2" /> Raise Query to Project Manager</h3>
              <button onClick={() => setIsRaisingQuery(false)} className="text-red-400 hover:text-red-600 transition p-1"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-1">Related Report:</p>
                <p className="text-sm font-bold text-slate-900 bg-slate-50 p-2 rounded border border-slate-200">{adminSelectedReport.title}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Query / Issue <span className="text-red-500">*</span></label>
                <textarea
                  value={adminQueryText}
                  onChange={(e) => setAdminQueryText(e.target.value)}
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  placeholder="Describe the discrepancy or issue..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Requested Action</label>
                <input
                  type="text"
                  value={adminActionRequested}
                  onChange={(e) => setAdminActionRequested(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  placeholder="e.g. Verify production value for 2024"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button onClick={() => setIsRaisingQuery(false)} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 text-sm">Cancel</button>
              <button
                id="admin-submit-query"
                onClick={() => handleRaiseQuery(adminSelectedReport.id)}
                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-sm hover:bg-red-700 text-sm"
              >
                Submit Query
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdministratorDashboard;
