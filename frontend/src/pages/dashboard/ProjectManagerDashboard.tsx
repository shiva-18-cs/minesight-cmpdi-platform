import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Files, CheckCircle, AlertTriangle, MessageSquare, ArrowRight,
  Eye, Loader2, Bell, MessageCircle, X, BarChart3, Download,
  Sparkles, ShieldCheck, GitMerge,
} from 'lucide-react';
import api from '../../services/api';
import { MetricCard, CompactMetric, StatusBadge, SectionHeader } from './DashboardShared';

/* ─────────────────────────────────────────────────────────────
   PROJECT MANAGER DASHBOARD
   Focused on validation, reconciliation, and report generation.
   AI capabilities are surfaced as an assisting tool, not the
   primary workflow banner.
───────────────────────────────────────────────────────────── */

const ProjectManagerDashboard: React.FC<{ user: any }> = ({ user }) => {
  const navigate = useNavigate();

  const [pmStats, setPmStats] = useState<any>(null);
  const [pmQueries, setPmQueries] = useState<any[]>([]);
  const [incomingDocs, setIncomingDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Report state
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportProgress, setReportProgress] = useState('');
  const [generatedReport, setGeneratedReport] = useState<any>(null);
  const [isConfirmingSubmit, setIsConfirmingSubmit] = useState(false);

  // Modal state
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [selectedQuery, setSelectedQuery] = useState<any>(null);
  const [queryResponse, setQueryResponse] = useState('');

  /* ── Data fetching ─────────────────────────────────────── */
  useEffect(() => {
    fetchPMData();
  }, []);

  const fetchPMData = async () => {
    setLoading(true);
    try {
      const [statsRes, queriesRes, docsRes] = await Promise.all([
        api.get('/pm/stats'),
        api.get('/queries/pm'),
        api.get('/documents'),
      ]);
      setPmStats(statsRes.data);
      setPmQueries(queriesRes.data);
      const pmDocs = docsRes.data.filter((d: any) =>
        ['Submitted to Project Manager', 'Under Validation', 'Validated', 'Report Generated', 'Submitted to Administrator'].includes(d.status)
      );
      setIncomingDocs(pmDocs);
    } catch (err) {
      console.error('Error fetching PM data', err);
    } finally {
      setLoading(false);
    }
  };

  /* ── Handlers ──────────────────────────────────────────── */
  const handleValidateDoc = async (docId: number) => {
    if (!window.confirm('Have you reviewed the extracted information and resolved all required data issues?')) return;
    try {
      await api.put(`/documents/${docId}/validate`);
      alert('Data validated successfully.');
      fetchPMData();
      setSelectedDoc(null);
    } catch {
      alert('Error validating document.');
    }
  };

  const handleDownloadPdf = async (reportId: string | number, reportTitle?: string) => {
    try {
      const res = await api.get(`/reports/${reportId}/pdf`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      const safeTitle = (reportTitle || 'Report').replace(/[^a-zA-Z0-9_-]/g, '_');
      link.download = `${safeTitle}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch {
      alert('Failed to download report PDF.');
    }
  };

  const handleGenerateReport = async (doc: any) => {
    setIsGeneratingReport(true);
    setReportProgress('Preparing validated data from authentic sources...');
    setSelectedDoc(null);
    try {
      setReportProgress('Synthesizing Geological, Mining & Production data...');
      const payload = {
        title: `${doc.name} - Final Project Report`,
        report_type: doc.doc_type || 'Final Project Report',
        subsidiary: doc.subsidiary || 'MCL',
        year: doc.year ? parseInt(String(doc.year), 10) : new Date().getFullYear(),
        mine: doc.mine || '',
        created_by: user?.full_name || 'Project Manager',
      };
      const res = await api.post('/reports/generate', payload);
      setReportProgress('Finalizing report artifact...');
      setGeneratedReport(res.data);
    } catch {
      alert('Failed to generate report.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleSubmitReportAdmin = () => setIsConfirmingSubmit(true);

  const confirmSubmitReport = async () => {
    if (!generatedReport) return;
    try {
      const res = await api.put(`/reports/${generatedReport.id}/submit`, {
        submitted_by: user?.full_name || 'Project Manager',
      });
      setGeneratedReport({
        ...generatedReport,
        status: res.data.status || 'Submitted to Administrator',
        submitted_by: res.data.submitted_by,
        submitted_at: res.data.submitted_at,
      });
      fetchPMData();
      setIsConfirmingSubmit(false);
    } catch {
      alert('Error submitting report.');
      setIsConfirmingSubmit(false);
    }
  };

  const handleResolvePMQuery = async (queryId: number) => {
    if (!queryResponse) return alert('Please enter a response.');
    try {
      await api.post(`/queries/pm/${queryId}/resolve`, {
        resolution: queryResponse,
        resolved_by: user?.full_name || 'Project Manager',
      });
      alert('Query resolved and resubmitted successfully.');
      setPmQueries(pmQueries.filter((q) => q.id !== queryId));
      setSelectedQuery(null);
      setQueryResponse('');
    } catch {
      alert('Error submitting response.');
    }
  };

  /* ── Loading ───────────────────────────────────────────── */
  if (loading || !pmStats) {
    return (
      <div className="flex justify-center items-center h-full min-h-[60vh]">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 pb-20">

      {/* ── PAGE HEADER ─────────────────────────────────── */}
      <SectionHeader
        title="Validation & Reporting Workspace"
        subtitle="Validate submitted information, reconcile discrepancies and prepare reports."
        userName={user?.full_name}
      />

      {/* ── QUICK ACTIONS ───────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        <button
          id="pm-review-submissions"
          onClick={() => document.getElementById('verification-queue')?.scrollIntoView({ behavior: 'smooth' })}
          className="px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition shadow-sm flex items-center text-sm"
        >
          <Files size={16} className="mr-2" /> Review Submissions
        </button>
        <button
          id="pm-validate-data"
          onClick={() => navigate('/check-data')}
          className="px-4 py-2.5 bg-white text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition shadow-sm border border-slate-200 flex items-center text-sm"
        >
          <CheckCircle size={16} className="mr-2" /> Validate Data
        </button>
        <button
          id="pm-resolve-queries"
          onClick={() => document.getElementById('pm-queries')?.scrollIntoView({ behavior: 'smooth' })}
          className="px-4 py-2.5 bg-white text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition shadow-sm border border-slate-200 flex items-center text-sm"
        >
          <MessageSquare size={16} className="mr-2" /> Resolve Queries
        </button>
        <button
          id="pm-generate-report"
          onClick={() => navigate('/reports')}
          className="px-4 py-2.5 bg-white text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition shadow-sm border border-slate-200 flex items-center text-sm"
        >
          <BarChart3 size={16} className="mr-2" /> Generate Report
        </button>
      </div>

      {/* ── HERO: AI-ASSISTED DATA VERIFICATION ─────────── */}
      {/* Teal-toned gradient — distinct from Supervisor hero */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-lg border border-teal-900/40 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Banner header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-2">
                <ShieldCheck size={13} className="text-teal-400" /> AI-Assisted Verification
              </div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                AI-Assisted Data Verification
              </h2>
              <p className="text-sm md:text-base text-slate-300 mt-1 max-w-3xl">
                Review extracted information, validate evidence, and resolve discrepancies before reporting.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                id="pm-hero-review"
                onClick={() => document.getElementById('verification-queue')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Files size={15} /> Review Submissions
              </button>
              <button
                id="pm-hero-validate"
                onClick={() => navigate('/check-data')}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle size={15} /> Validate Data
              </button>
            </div>
          </div>

          {/* 4-step PM workflow */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { step: '1', color: 'teal', icon: <Sparkles size={18} className="text-teal-400" />, title: 'Extracted Data', desc: 'AI-extracted information from Supervisor submissions', tag: 'Source: OCR + AI' },
              { step: '2', color: 'blue', icon: <CheckCircle size={18} className="text-blue-400" />, title: 'Validate', desc: 'Cross-check values against source documents and historical data', tag: 'Data Validation' },
              { step: '3', color: 'amber', icon: <GitMerge size={18} className="text-amber-400" />, title: 'Reconcile', desc: 'Identify and resolve discrepancies in submitted information', tag: 'Discrepancy Resolution' },
              { step: '4', color: 'emerald', icon: <BarChart3 size={18} className="text-emerald-400" />, title: 'Report', desc: 'Generate finalized report and submit to Administrator', tag: 'Report Submission' },
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

      {/* ── SUMMARY METRIC CARDS ─────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard icon={<Files size={20} />} value={pmStats.pending_reviews} label="Pending Reviews" sublabel="Submissions awaiting review" iconBg="bg-yellow-50 text-yellow-600" />
        <MetricCard icon={<CheckCircle size={20} />} value={pmStats.under_validation} label="Under Validation" sublabel="Data being validated" iconBg="bg-blue-50 text-blue-600" />
        <MetricCard icon={<AlertTriangle size={20} />} value={'—'} label="Open Discrepancies" sublabel="View in Differences" iconBg="bg-orange-50 text-orange-600" onClick={() => navigate('/differences')} />
        <MetricCard icon={<MessageCircle size={20} />} value={pmStats.open_queries} label="Open Queries" sublabel="Require action" iconBg="bg-red-50 text-red-600" />
        <MetricCard icon={<BarChart3 size={20} />} value={pmStats.reports_generated} label="Reports Generated" sublabel="Reports generated" iconBg="bg-purple-50 text-purple-600" />
      </div>

      {/* ── MAIN CONTENT GRID ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT: Verification Queue + Queries */}
        <div className="lg:col-span-2 space-y-8">

          {/* Verification Queue — Prominent */}
          <div id="verification-queue" className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg"><AlertTriangle size={16} /></div>
                  <h2 className="text-lg font-bold text-slate-900">Verification Queue</h2>
                </div>
                <p className="text-sm text-slate-500">Incoming submissions from Supervisors requiring your review and validation.</p>
              </div>
              {incomingDocs.filter(d => ['Submitted to Project Manager', 'Under Validation'].includes(d.status)).length > 0 && (
                <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">
                  {incomingDocs.filter(d => ['Submitted to Project Manager', 'Under Validation'].includes(d.status)).length} pending
                </span>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-slate-500 uppercase tracking-wider text-xs">Submission</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-500 uppercase tracking-wider text-xs">Supervisor</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-500 uppercase tracking-wider text-xs">Status</th>
                    <th className="px-6 py-3 text-right font-semibold text-slate-500 uppercase tracking-wider text-xs">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {incomingDocs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-slate-500">No incoming submissions found.</td>
                    </tr>
                  ) : incomingDocs.map((doc: any) => (
                    <tr key={doc.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{doc.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{doc.subsidiary} • {doc.year}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{doc.uploaded_by}</td>
                      <td className="px-6 py-4"><StatusBadge status={doc.status} /></td>
                      <td className="px-6 py-4 text-right">
                        <button
                          id={`pm-review-doc-${doc.id}`}
                          onClick={() => setSelectedDoc(doc)}
                          className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded shadow-sm transition inline-flex items-center"
                        >
                          <Eye size={14} className="mr-1.5" /> Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Administrator Queries */}
          <div id="pm-queries" className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Administrator Queries</h2>
              <p className="text-sm text-slate-500 mt-1">Resolve queries raised during final Administrator review.</p>
            </div>
            <div className="p-6">
              {pmQueries.length === 0 ? (
                <div className="text-center py-10">
                  <CheckCircle size={40} className="mx-auto text-emerald-400 mb-3" />
                  <p className="text-slate-600 font-medium">No pending queries</p>
                  <p className="text-sm text-slate-400">All reports have been accepted.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pmQueries.map((q: any, idx: number) => (
                    <div key={idx} className="p-5 border border-red-100 bg-red-50/30 rounded-xl">
                      <div className="flex justify-between items-start mb-2">
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-bold uppercase tracking-wider">{q.id} • Action Required</span>
                        <span className="text-xs text-slate-500">{q.date}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900 mt-1">{q.query}</h3>
                      <div className="mt-3 text-xs text-slate-600 flex items-center space-x-4">
                        <span><b>Raised By:</b> {q.source}</span>
                        <span><b>Related Report:</b> {q.document}</span>
                      </div>
                      <div className="mt-4">
                        <button
                          id={`pm-resolve-query-${q.id}`}
                          onClick={() => setSelectedQuery(q)}
                          className="px-3 py-1.5 bg-white border border-slate-300 shadow-sm text-slate-700 text-xs font-semibold rounded hover:bg-slate-50 transition"
                        >
                          Resolve Query
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: AI Verification card + Report spinner + Notifications */}
        <div className="space-y-8">

          {/* AI-Assisted Verification card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 bg-teal-50 text-teal-700 rounded-lg"><Sparkles size={16} /></div>
                <h2 className="text-base font-bold text-slate-900">AI-Assisted Verification</h2>
              </div>
              <p className="text-xs text-slate-500">AI extracts and structures data — you validate it.</p>
            </div>
            <div className="p-5 space-y-3">
              {[
                { label: 'Extracted Information', color: 'bg-teal-100 text-teal-800', value: pmStats?.information_found ?? '—' },
                { label: 'Source Evidence', color: 'bg-blue-100 text-blue-800', value: pmStats?.total_documents ?? '—' },
                { label: 'Pending Validation', color: 'bg-amber-100 text-amber-800', value: pmStats?.pending_reviews ?? '—' },
                { label: 'Validated', color: 'bg-emerald-100 text-emerald-800', value: pmStats?.under_validation ?? '—' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${item.color}`}>{item.label}</span>
                  <span className="text-sm font-bold text-slate-900">{item.value}</span>
                </div>
              ))}
              <button
                id="pm-ai-validate"
                onClick={() => navigate('/check-data')}
                className="w-full mt-2 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-2"
              >
                <CheckCircle size={15} /> Validate Data
              </button>
            </div>
          </div>

          {/* Report generation spinner */}
          {isGeneratingReport && (
            <div className="bg-white rounded-2xl shadow-sm border border-blue-200 overflow-hidden relative">
              <div className="absolute inset-0 bg-blue-50/50" />
              <div className="p-8 relative z-10 text-center">
                <Loader2 className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4" />
                <h3 className="text-base font-bold text-slate-900">Automated Report Generation</h3>
                <p className="text-sm text-blue-600 font-semibold mt-2">{reportProgress}</p>
              </div>
            </div>
          )}

          {/* Notifications */}
          <div id="notifications" className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center space-x-2">
              <Bell size={18} className="text-slate-700" />
              <h2 className="text-base font-bold text-slate-900">Notifications</h2>
            </div>
            <div className="divide-y divide-slate-100">
              <div className="p-4 hover:bg-slate-50 transition flex items-start space-x-3">
                <div className="mt-0.5 h-2 w-2 bg-blue-600 rounded-full shrink-0" />
                <div>
                  <p className="text-sm text-slate-800">New submission received from Supervisor.</p>
                  <p className="text-xs text-slate-400 mt-1">10 minutes ago</p>
                </div>
              </div>
              <div className="p-4 hover:bg-slate-50 transition flex items-start space-x-3">
                <div className="mt-0.5 h-2 w-2 bg-emerald-500 rounded-full shrink-0" />
                <div>
                  <p className="text-sm text-slate-600">Data validation completed for WCL Mining Data.</p>
                  <p className="text-xs text-slate-400 mt-1">30 minutes ago</p>
                </div>
              </div>
              <div className="p-4 hover:bg-slate-50 transition flex items-start space-x-3">
                <div className="mt-0.5 h-2 w-2 bg-red-500 rounded-full shrink-0" />
                <div>
                  <p className="text-sm text-slate-600">Administrator raised a query on MCL Report.</p>
                  <p className="text-xs text-slate-400 mt-1">2 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── REVIEW & VALIDATION MODAL ───────────────────── */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">Review Submission: {selectedDoc.doc_id}</h3>
              <button onClick={() => setSelectedDoc(null)} className="text-slate-400 hover:text-slate-600 transition p-1"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h4 className="text-xl font-bold text-slate-900">{selectedDoc.name}</h4>
                  <p className="text-sm text-slate-500 mt-1">Submitted by: {selectedDoc.uploaded_by}</p>
                </div>
                <StatusBadge status={selectedDoc.status} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Subsidiary', value: selectedDoc.subsidiary },
                  { label: 'Reporting Period', value: selectedDoc.year },
                  { label: 'Document Type', value: selectedDoc.doc_type },
                  { label: 'Source', value: null, isLink: true },
                ].map((item, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{item.label}</p>
                    {item.isLink
                      ? <button className="text-sm font-medium text-blue-600 hover:underline">View PDF</button>
                      : <p className="text-sm font-medium text-slate-900">{item.value}</p>}
                  </div>
                ))}
              </div>
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                  <h4 className="text-sm font-bold text-slate-900">Data Validation Checks</h4>
                  <button onClick={() => navigate('/check-data')} className="text-xs font-semibold text-blue-600 hover:text-blue-800">Advanced Checks</button>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {['Required fields present', 'Data format valid', 'Reporting period identified', 'Production data extracted'].map((check) => (
                    <div key={check} className="flex items-center space-x-2 text-slate-700">
                      <CheckCircle size={16} className="text-emerald-500" /><span>{check}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                  <h4 className="text-sm font-bold text-slate-900">Data Differences / Inconsistencies</h4>
                  <button onClick={() => navigate('/differences')} className="text-xs font-semibold text-blue-600 hover:text-blue-800">View All Differences</button>
                </div>
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center text-emerald-800 text-sm">
                  <CheckCircle size={18} className="mr-2" />
                  <span>Consistent: Values match across historical records and current submission.</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
                {selectedDoc.status === 'Submitted to Project Manager' && (
                  <button
                    id="pm-validate-submit"
                    onClick={() => handleValidateDoc(selectedDoc.id)}
                    className="flex-1 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition flex items-center justify-center text-sm"
                  >
                    <CheckCircle size={16} className="mr-2" /> Validate Submission
                  </button>
                )}
                {selectedDoc.status === 'Validated' && (
                  <button
                    id="pm-generate-report-doc"
                    onClick={() => handleGenerateReport(selectedDoc)}
                    className="flex-1 py-2.5 bg-purple-600 text-white font-semibold rounded-lg shadow-sm hover:bg-purple-700 transition flex items-center justify-center text-sm"
                  >
                    <BarChart3 size={16} className="mr-2" /> Generate Automated Report
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── QUERY RESOLUTION MODAL ──────────────────────── */}
      {selectedQuery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">Resolve Query</h3>
              <button onClick={() => setSelectedQuery(null)} className="text-slate-400 hover:text-slate-600 transition p-1"><X size={20} /></button>
            </div>
            <div className="p-6">
              <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-100">
                <p className="text-sm font-semibold text-slate-900">{selectedQuery.query}</p>
                <p className="text-xs text-slate-500 mt-2">Raised by {selectedQuery.source} on {selectedQuery.date} regarding &quot;{selectedQuery.document}&quot;</p>
              </div>
              <div className="mb-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Resolution Workflow</p>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  {['Investigate', 'Update Data', 'Revalidate', 'Resubmit'].map((step, i) => (
                    <React.Fragment key={step}>
                      <span className={`flex flex-col items-center ${i === 0 ? 'text-blue-600' : ''}`}>
                        <span className={`h-6 w-6 rounded-full flex items-center justify-center mb-1 ${i === 0 ? 'bg-blue-100' : 'bg-slate-100'}`}>{i + 1}</span>
                        {step}
                      </span>
                      {i < 3 && <span className="text-slate-300 flex-1 border-t-2 border-dashed mx-2" />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Resolution / Action Taken</label>
              <textarea
                value={queryResponse}
                onChange={(e) => setQueryResponse(e.target.value)}
                rows={4}
                className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Detail the corrections made, data updated, or discrepancies resolved..."
              />
              <div className="mt-8 flex flex-wrap justify-end gap-3 pt-4 border-t border-slate-100">
                <button onClick={() => setSelectedQuery(null)} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 text-sm">Cancel</button>
                <button
                  id="pm-submit-resolution"
                  onClick={() => handleResolvePMQuery(selectedQuery.id)}
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-sm text-sm"
                >
                  Submit Resolved Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── GENERATED REPORT MODAL ──────────────────────── */}
      {generatedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">Generated Report Preview</h3>
              <button onClick={() => setGeneratedReport(null)} className="text-slate-400 hover:text-slate-600 transition p-1"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-center space-x-2 text-emerald-700 mb-2">
                  <CheckCircle size={18} />
                  <span className="text-xs font-bold uppercase tracking-wider">Report Generated Successfully</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">{generatedReport.title}</h2>
                <p className="text-sm text-slate-600 mt-2"><span className="font-semibold">Status:</span> Generated — Awaiting Administrator Submission</p>
              </div>
              <div className="border border-slate-200 rounded-xl p-4">
                <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-3">Report Sections</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {['Executive Summary', 'Project Information', 'Production Information', 'Mining Information', 'Geological Information', 'Key Findings'].map((s) => (
                    <div key={s} className="flex items-center space-x-2"><CheckCircle size={14} className="text-emerald-500" /><span>{s}</span></div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
                <button onClick={() => handleDownloadPdf(generatedReport.id, generatedReport.title)} className="flex-1 py-2.5 bg-white border border-slate-300 shadow-sm text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition text-sm flex items-center justify-center">
                  <Download size={16} className="mr-2 text-red-600" /> Download PDF
                </button>
                <button onClick={() => navigate('/reports', { state: { reportId: generatedReport.id } })} className="flex-1 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition text-sm flex items-center justify-center shadow-sm">
                  <Eye size={16} className="mr-2" /> View Full Report
                </button>
              </div>
              <div className="mt-4 border border-slate-200 bg-slate-50 rounded-xl p-5">
                <h4 className="text-sm font-bold text-slate-900 mb-1">Report Submission</h4>
                <p className="text-sm text-slate-600 mb-4">
                  {generatedReport.status === 'Submitted to Administrator'
                    ? 'This report has been successfully submitted to the Administrator.'
                    : 'This report has been validated and is ready to be submitted for analysis and approval.'}
                </p>
                {generatedReport.status !== 'Submitted to Administrator' ? (
                  <button id="pm-submit-to-admin" onClick={handleSubmitReportAdmin} className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg shadow-sm hover:bg-blue-700 transition flex items-center justify-center text-sm">
                    <ArrowRight size={18} className="mr-2" /> Submit to Administrator
                  </button>
                ) : (
                  <div className="w-full py-3 bg-slate-200 text-slate-500 font-bold rounded-lg flex items-center justify-center text-sm">
                    <CheckCircle size={18} className="mr-2" /> Submitted
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SUBMIT CONFIRMATION MODAL ───────────────────── */}
      {isConfirmingSubmit && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center">
              <ArrowRight size={20} className="text-blue-600 mr-2" />
              <h3 className="text-lg font-bold text-slate-900">Submit Report to Administrator?</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600">This report will be sent to the Administrator for analysis and final approval.</p>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button onClick={() => setIsConfirmingSubmit(false)} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 text-sm">Cancel</button>
              <button id="pm-confirm-submit" onClick={confirmSubmitReport} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 text-sm flex items-center">Submit Report</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProjectManagerDashboard;
