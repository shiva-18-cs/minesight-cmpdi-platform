import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Files, CheckCircle, AlertTriangle, MessageSquare, ArrowRight,
  UploadCloud, Eye, Upload, Loader2, Bell, MessageCircle, X,
  Sparkles, Layers, ShieldCheck,
} from 'lucide-react';
import api from '../../services/api';
import { MetricCard, CompactMetric, StatusBadge, SectionHeader } from './DashboardShared';

/* ─────────────────────────────────────────────────────────────
   SUPERVISOR DASHBOARD
   Primary workspace for document upload, OCR/AI extraction,
   and responding to queries from the Project Manager.
───────────────────────────────────────────────────────────── */

const SupervisorDashboard: React.FC<{ user: any }> = ({ user }) => {
  const navigate = useNavigate();

  const [supStats, setSupStats] = useState<any>(null);
  const [queries, setQueries] = useState<any[]>([]);
  const [recentDocs, setRecentDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  // Modal state
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [selectedQuery, setSelectedQuery] = useState<any>(null);
  const [queryResponse, setQueryResponse] = useState('');

  /* ── Data fetching ─────────────────────────────────────── */
  useEffect(() => {
    fetchSupervisorData();
  }, []);

  const fetchSupervisorData = async () => {
    setLoading(true);
    try {
      const [statsRes, queriesRes, docsRes] = await Promise.all([
        api.get('/supervisor/stats'),
        api.get('/queries/supervisor'),
        api.get('/documents'),
      ]);
      setSupStats(statsRes.data);
      setQueries(queriesRes.data);
      setRecentDocs(docsRes.data.slice(0, 10));
    } catch (err) {
      console.error('Error fetching supervisor data', err);
    } finally {
      setLoading(false);
    }
  };

  /* ── Handlers ──────────────────────────────────────────── */
  const handleUpload = async (file?: File) => {
    setIsUploading(true);
    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 15, 90));
    }, 300);
    try {
      const formData = new FormData();
      if (file) formData.append('file', file);
      formData.append('subsidiary', 'MCL');
      formData.append('year', new Date().getFullYear().toString());
      formData.append('uploaded_by', user?.full_name || 'Supervisor');
      formData.append('doc_type', 'Annual Mining Report');
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      clearInterval(interval);
      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        fetchSupervisorData();
        alert('Document successfully uploaded and processed.');
      }, 500);
    } catch {
      clearInterval(interval);
      setIsUploading(false);
      alert('Failed to upload document.');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleUpload(e.dataTransfer.files[0]);
  };

  const handleSubmitForReview = async (docId: number) => {
    if (!window.confirm('Submit this document to the Project Manager for review?')) return;
    try {
      await api.put(`/documents/${docId}/submit`);
      alert('Successfully submitted to Project Manager');
      fetchSupervisorData();
      setSelectedDoc(null);
    } catch {
      alert('Error submitting document.');
    }
  };

  const handleRespondQuery = async (queryId: number) => {
    if (!queryResponse) return alert('Please enter a response.');
    try {
      await api.post(`/queries/${queryId}/respond`, {
        response: queryResponse,
        responded_by: user?.full_name || 'Supervisor',
      });
      alert('Response submitted successfully.');
      setQueries(queries.filter((q) => q.id !== queryId));
      setSelectedQuery(null);
      setQueryResponse('');
    } catch {
      alert('Error submitting response.');
    }
  };

  /* ── Loading ───────────────────────────────────────────── */
  if (loading || !supStats) {
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
        title="Submission & Data Workspace"
        subtitle="Submit source information, review extracted data and respond to queries."
        userName={user?.full_name}
      />

      {/* ── QUICK ACTIONS ───────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        <button
          id="sup-upload-doc"
          onClick={() => navigate('/documents')}
          className="px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition shadow-sm flex items-center text-sm"
        >
          <Upload size={16} className="mr-2" /> Upload Document
        </button>
        <button
          id="sup-review-extraction"
          onClick={() => navigate('/check-data')}
          className="px-4 py-2.5 bg-white text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition shadow-sm border border-slate-200 flex items-center text-sm"
        >
          <Eye size={16} className="mr-2" /> Review Extraction
        </button>
        <button
          id="sup-respond-queries"
          onClick={() => document.getElementById('queries')?.scrollIntoView({ behavior: 'smooth' })}
          className="px-4 py-2.5 bg-white text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition shadow-sm border border-slate-200 flex items-center text-sm"
        >
          <MessageSquare size={16} className="mr-2" /> Respond to Queries
        </button>
        <button
          id="sup-view-submissions"
          onClick={() => document.getElementById('submissions')?.scrollIntoView({ behavior: 'smooth' })}
          className="px-4 py-2.5 bg-white text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition shadow-sm border border-slate-200 flex items-center text-sm"
        >
          <UploadCloud size={16} className="mr-2" /> View Submissions
        </button>
      </div>

      {/* ── HERO: AI-POWERED DOCUMENT INTELLIGENCE ──────── */}
      <div className="space-y-6">
        {/* Dark gradient banner */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-lg border border-blue-900/40 relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Banner header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-2">
                  <Sparkles size={13} className="text-blue-400" /> AI Document Intelligence
                </div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                  AI-Powered Document Intelligence
                </h2>
                <p className="text-sm md:text-base text-slate-300 mt-1 max-w-3xl">
                  Transform unstructured mining and geological documents into verified, structured information.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  id="sup-hero-view-extraction"
                  onClick={() => navigate('/check-data')}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye size={15} /> View Extraction
                </button>
                <button
                  id="sup-hero-upload"
                  onClick={() => navigate('/documents')}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload size={15} /> Upload Document
                </button>
              </div>
            </div>

            {/* 4-step workflow */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { step: '1', color: 'blue', icon: <Upload size={18} className="text-blue-400" />, title: 'Upload Document', desc: 'PDF, scanned documents, images, spreadsheets', tag: 'Multi-Format Ingestion' },
                { step: '2', color: 'cyan', icon: <Layers size={18} className="text-cyan-400" />, title: 'OCR Processing', desc: 'Convert scanned/image-based content into machine-readable text', tag: 'PyMuPDF & OCR Engine' },
                { step: '3', color: 'purple', icon: <Sparkles size={18} className="text-purple-400" />, title: 'AI Information Extraction', desc: 'Identify geological, mining, production and reporting information', tag: 'Entity & Fact Extraction' },
                { step: '4', color: 'emerald', icon: <ShieldCheck size={18} className="text-emerald-400" />, title: 'Human Verification', desc: 'Review extracted information before it is used in reporting', tag: 'Audit & Discrepancy Check' },
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
                  <div className="mt-4 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono" style={{ color: `var(--tw-${color}-300)` }}>
                    <span className={`text-${color}-300`}>{tag}</span>
                    <ArrowRight size={13} className="text-slate-400 group-hover:translate-x-1 transition" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Extraction metrics card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-700 rounded-lg"><Sparkles size={18} /></div>
                <h3 className="text-lg font-bold text-slate-900">AI Extraction Metrics</h3>
              </div>
              <p className="text-sm text-slate-600 max-w-2xl">
                Real-time extraction statistics for your document submissions.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700">
                <span className="px-2 py-0.5 bg-cyan-100 text-cyan-800 rounded">OCR</span>
                <span className="text-slate-400">&rarr;</span>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded">Extract</span>
                <span className="text-slate-400">&rarr;</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">Verify</span>
                <span className="text-slate-400">&rarr;</span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded">Report</span>
              </div>
              <button
                id="sup-view-extraction-2"
                onClick={() => navigate('/check-data')}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Eye size={14} /> View Extraction
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pt-6">
            <CompactMetric
              label="Documents Processed"
              value={supStats?.total_documents !== undefined ? Number(supStats.total_documents).toLocaleString() : '—'}
              sublabel="Ingested & cataloged"
            />
            <CompactMetric
              label="OCR Processed"
              value={supStats?.ocr_processed !== undefined ? Number(supStats.ocr_processed).toLocaleString() : supStats?.total_documents !== undefined ? Number(supStats.total_documents).toLocaleString() : '—'}
              valueColor="text-cyan-700"
              sublabel="Machine text available"
            />
            <CompactMetric
              label="Extracted Fields"
              value={supStats?.information_found !== undefined ? Number(supStats.information_found).toLocaleString() : '—'}
              valueColor="text-purple-700"
              sublabel="Structured data points"
            />
            <CompactMetric
              label="Pending Verification"
              value={supStats?.pending_verification !== undefined ? Number(supStats.pending_verification).toLocaleString() : '0'}
              valueColor="text-amber-600"
              sublabel="Awaiting human review"
            />
          </div>
        </div>
      </div>

      {/* ── SUMMARY METRIC CARDS ─────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard icon={<Files size={24} />} value={supStats.total_documents} label="Total Documents" sublabel="Documents uploaded" iconBg="bg-blue-50 text-blue-600" />
        <MetricCard icon={<AlertTriangle size={24} />} value={supStats.pending_submissions} label="Pending Submissions" sublabel="Awaiting submission/review" iconBg="bg-amber-50 text-amber-600" />
        <MetricCard icon={<CheckCircle size={24} />} value={supStats.approved_reports} label="Approved Reports" sublabel="Successfully completed" iconBg="bg-emerald-50 text-emerald-600" />
        <MetricCard icon={<MessageCircle size={24} />} value={supStats.queries_received} label="Queries Received" sublabel="Require your attention" iconBg="bg-red-50 text-red-600" />
      </div>

      {/* ── MAIN CONTENT GRID ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT: Upload + Submissions + Queries */}
        <div className="lg:col-span-2 space-y-8">

          {/* Upload zone */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Upload Project Documents</h2>
              <p className="text-sm text-slate-500 mt-1">Upload geological, mining, production and supporting documents for AI-assisted processing.</p>
            </div>
            <div className="p-8">
              <div
                className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:bg-slate-50'}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="animate-spin h-10 w-10 text-blue-600 mb-4" />
                    <p className="text-sm font-semibold text-slate-900">Uploading and Processing...</p>
                    <div className="w-64 bg-gray-200 rounded-full h-2.5 mt-4">
                      <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">{uploadProgress < 50 ? 'Uploading file...' : 'Extracting data...'}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                      <UploadCloud size={32} />
                    </div>
                    <p className="text-base font-semibold text-slate-700">Drag &amp; drop files here</p>
                    <p className="text-sm text-slate-500 mt-1 mb-4">or</p>
                    <label className="cursor-pointer px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 transition text-sm">
                      Browse Files
                      <input type="file" className="hidden" onChange={(e) => e.target.files && handleUpload(e.target.files[0])} />
                    </label>
                    <p className="text-xs text-slate-400 mt-6">Supported formats: PDF, Scanned PDF, Excel / XLSX, Word / DOCX, PNG, JPG / JPEG</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submissions table */}
          <div id="submissions" className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Recent Documents &amp; Submissions</h2>
              <p className="text-sm text-slate-500 mt-1">Track document processing and submission status.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-slate-500 uppercase tracking-wider text-xs">Document Name</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-500 uppercase tracking-wider text-xs">Uploaded Date</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-500 uppercase tracking-wider text-xs">Status</th>
                    <th className="px-6 py-3 text-right font-semibold text-slate-500 uppercase tracking-wider text-xs">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentDocs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-slate-500">No documents found.</td>
                    </tr>
                  ) : recentDocs.map((doc: any) => (
                    <tr key={doc.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{doc.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{doc.doc_type} • {doc.file_type}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{new Date(doc.upload_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td className="px-6 py-4"><StatusBadge status={doc.status} /></td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => setSelectedDoc(doc)} className="text-blue-600 hover:text-blue-800 font-medium text-sm inline-flex items-center">
                          <Eye size={16} className="mr-1" /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Queries */}
          <div id="queries" className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Queries &amp; Action Required</h2>
              <p className="text-sm text-slate-500 mt-1">Respond to data clarifications requested by the Project Manager or Administrator.</p>
            </div>
            <div className="p-6">
              {queries.length === 0 ? (
                <div className="text-center py-10">
                  <CheckCircle size={40} className="mx-auto text-emerald-400 mb-3" />
                  <p className="text-slate-600 font-medium">No pending queries</p>
                  <p className="text-sm text-slate-400">All submissions are looking good!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {queries.map((q: any, idx: number) => (
                    <div key={idx} className="p-5 border border-red-100 bg-red-50/30 rounded-xl">
                      <div className="flex justify-between items-start mb-2">
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-bold uppercase tracking-wider">Action Required</span>
                        <span className="text-xs text-slate-500">{q.date}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900 mt-1">{q.query}</h3>
                      <div className="mt-3 text-xs text-slate-600 flex items-center space-x-4">
                        <span><b>Source:</b> {q.source}</span>
                        <span><b>Document:</b> {q.document}</span>
                      </div>
                      <div className="mt-4">
                        <button
                          id={`sup-respond-query-${q.id}`}
                          onClick={() => setSelectedQuery(q)}
                          className="px-3 py-1.5 bg-white border border-slate-300 shadow-sm text-slate-700 text-xs font-semibold rounded hover:bg-slate-50 transition"
                        >
                          Respond to Query
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Notifications + Submission Progress */}
        <div className="space-y-8">

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
                  <p className="text-sm text-slate-800"><b>MCL Production Report 2025</b> was successfully processed and data extracted.</p>
                  <p className="text-xs text-slate-400 mt-1">10 minutes ago</p>
                </div>
              </div>
              <div className="p-4 hover:bg-slate-50 transition flex items-start space-x-3">
                <div className="mt-0.5 h-2 w-2 bg-slate-300 rounded-full shrink-0" />
                <div>
                  <p className="text-sm text-slate-600">Your document <b>Geological Survey</b> was submitted to Project Manager.</p>
                  <p className="text-xs text-slate-400 mt-1">2 hours ago</p>
                </div>
              </div>
              <div className="p-4 hover:bg-slate-50 transition flex items-start space-x-3">
                <div className="mt-0.5 h-2 w-2 bg-red-500 rounded-full shrink-0" />
                <div>
                  <p className="text-sm text-slate-800">Project Manager requested clarification on <b>Production Data 2024</b>.</p>
                  <p className="text-xs text-slate-400 mt-1">Yesterday</p>
                </div>
              </div>
              <div className="p-4 hover:bg-slate-50 transition flex items-start space-x-3">
                <div className="mt-0.5 h-2 w-2 bg-emerald-500 rounded-full shrink-0" />
                <div>
                  <p className="text-sm text-slate-600">Final report for <b>Mining Report 2023</b> approved by Administrator.</p>
                  <p className="text-xs text-slate-400 mt-1">2 days ago</p>
                </div>
              </div>
            </div>
          </div>

          {/* Your Submission Workflow */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Your Submission Workflow</h2>
              <p className="text-xs text-slate-500 mt-1">Track the full lifecycle of your documents.</p>
            </div>
            <div className="p-6">
              <div className="relative border-l-2 border-slate-200 ml-3 space-y-6 pb-2">
                {[
                  { label: 'Upload', desc: 'Document ingested successfully.', done: true },
                  { label: 'OCR Processing', desc: 'Machine-readable text generated.', done: true },
                  { label: 'AI Extraction', desc: 'Structured data extracted.', done: true },
                  { label: 'Human Verification', desc: 'Review extracted fields.', done: true },
                  { label: 'Submitted to PM', desc: 'Awaiting PM validation.', done: false, active: true },
                  { label: 'Report Generated', desc: '', done: false },
                  { label: 'Administrator Approval', desc: '', done: false },
                ].map((step, i) => (
                  <div key={i} className="relative pl-6">
                    <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 ${
                      step.active
                        ? 'border-white bg-blue-600 shadow-sm shadow-blue-200 ring-4 ring-blue-50'
                        : step.done
                        ? 'border-white bg-blue-600 shadow-sm'
                        : 'border-slate-200 bg-white'
                    }`} />
                    <p className={`text-sm font-bold ${step.active ? 'text-blue-700' : step.done ? 'text-slate-900' : 'text-slate-400'}`}>{step.label}</p>
                    {step.desc && <p className={`text-xs ${step.active ? 'text-blue-500' : step.done ? 'text-slate-500' : 'text-slate-400'}`}>{step.desc}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── DOCUMENT DETAILS MODAL ──────────────────────── */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">Document Details</h3>
              <button onClick={() => setSelectedDoc(null)} className="text-slate-400 hover:text-slate-600 transition p-1"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h4 className="text-xl font-bold text-slate-900">{selectedDoc.name}</h4>
                  <p className="text-sm text-slate-500 mt-1">{selectedDoc.doc_id} • {selectedDoc.file_type}</p>
                </div>
                <StatusBadge status={selectedDoc.status} />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Subsidiary / Mine</p>
                  <p className="text-sm font-medium text-slate-900">{selectedDoc.subsidiary} {selectedDoc.mine ? `— ${selectedDoc.mine}` : ''}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Fiscal Year</p>
                  <p className="text-sm font-medium text-slate-900">{selectedDoc.year}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Document Type</p>
                  <p className="text-sm font-medium text-slate-900">{selectedDoc.doc_type}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Upload Date</p>
                  <p className="text-sm font-medium text-slate-900">{new Date(selectedDoc.upload_date).toLocaleString()}</p>
                </div>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2">AI Extraction Summary</h4>
              <p className="text-sm text-slate-600 mb-6 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                Data has been extracted with {selectedDoc.reading_accuracy}% accuracy. The AI identified production values, targets, and operational metrics.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="flex-1 py-2.5 bg-white border border-slate-300 shadow-sm text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition flex items-center justify-center text-sm">
                  <Eye size={16} className="mr-2" /> View Source Document
                </button>
                {selectedDoc.status === 'Processed' && (
                  <button
                    onClick={() => handleSubmitForReview(selectedDoc.id)}
                    className="flex-1 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition flex items-center justify-center text-sm"
                  >
                    <ArrowRight size={16} className="mr-2" /> Submit for Review
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── QUERY RESPONSE MODAL ────────────────────────── */}
      {selectedQuery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">Respond to Query</h3>
              <button onClick={() => setSelectedQuery(null)} className="text-slate-400 hover:text-slate-600 transition p-1"><X size={20} /></button>
            </div>
            <div className="p-6">
              <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-100">
                <p className="text-sm font-semibold text-slate-900">{selectedQuery.query}</p>
                <p className="text-xs text-slate-500 mt-2">Raised by {selectedQuery.source} on {selectedQuery.date} regarding &quot;{selectedQuery.document}&quot;</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Response / Clarification</label>
                <textarea
                  value={queryResponse}
                  onChange={(e) => setQueryResponse(e.target.value)}
                  rows={4}
                  className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Provide clarification or attach a revised document..."
                />
              </div>
              <div className="mt-8 flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button onClick={() => setSelectedQuery(null)} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 text-sm">Cancel</button>
                <button
                  id="sup-submit-query-response"
                  onClick={() => handleRespondQuery(selectedQuery.id)}
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-sm text-sm"
                >
                  Submit Response
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SupervisorDashboard;
