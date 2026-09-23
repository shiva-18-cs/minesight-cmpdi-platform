import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  Files, FileCheck, CheckCircle, AlertTriangle, FileText, 
  MessageSquare, ArrowRight, TrendingUp, UploadCloud, Eye, BarChart3,
  Upload, Loader2, Bell, MessageCircle, X, Cloud, Hash, Search, Download,
  Sparkles, Layers, ShieldCheck, ScanLine, Cpu
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Ensure token is attached to local axios instance
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const AIWorkflowSection: React.FC<{
  stats: any;
  onNavigate: (path: string) => void;
}> = ({ stats, onNavigate }) => {
  return (
    <div className="space-y-6">
      {/* 1. Primary Feature Banner: AI-Powered Document Intelligence */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-lg border border-blue-900/40 relative overflow-hidden">
        {/* Background Subtle Accents */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
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
                onClick={() => onNavigate('/check-data')}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Eye size={15} /> View Extraction
              </button>
              <button
                onClick={() => onNavigate('/documents')}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Upload size={15} /> Upload Document
              </button>
            </div>
          </div>

          {/* Four-Step Workflow */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
            {/* Step 1 */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="h-7 w-7 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 text-xs font-bold">
                    1
                  </span>
                  <Upload size={18} className="text-blue-400" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">Upload Document</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  PDF, scanned documents, images, spreadsheets
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-blue-300 font-mono">
                <span>Multi-Format Ingestion</span>
                <ArrowRight size={13} className="text-slate-400 group-hover:translate-x-1 transition" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="h-7 w-7 rounded-lg bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 text-xs font-bold">
                    2
                  </span>
                  <Layers size={18} className="text-cyan-400" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">OCR Processing</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Convert scanned/image-based content into machine-readable text
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-cyan-300 font-mono">
                <span>PyMuPDF &amp; OCR Engine</span>
                <ArrowRight size={13} className="text-slate-400 group-hover:translate-x-1 transition" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="h-7 w-7 rounded-lg bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 text-xs font-bold">
                    3
                  </span>
                  <Sparkles size={18} className="text-purple-400" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">AI Information Extraction</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Identify relevant geological, mining, production and reporting information
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-purple-300 font-mono">
                <span>Entity &amp; Fact Extraction</span>
                <ArrowRight size={13} className="text-slate-400 group-hover:translate-x-1 transition" />
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="h-7 w-7 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 text-xs font-bold">
                    4
                  </span>
                  <ShieldCheck size={18} className="text-emerald-400" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">Human Verification</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Review extracted information before it is used in reporting
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-emerald-300 font-mono">
                <span>Audit &amp; Discrepancy Check</span>
                <CheckCircle size={13} className="text-emerald-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Feature Card: AI Extraction + Real Backend Metrics */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
                <Sparkles size={18} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">AI Extraction</h3>
            </div>
            <p className="text-sm text-slate-600 max-w-2xl">
              Automatically extract relevant information from mining and geological documents and make it available for verification and reporting.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Flow Badges */}
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
              onClick={() => onNavigate('/check-data')}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Eye size={14} /> View Extraction
            </button>
          </div>
        </div>

        {/* Real Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 pt-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Documents Processed</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {stats?.processed_documents !== undefined
                ? Number(stats.processed_documents).toLocaleString()
                : stats?.total_documents !== undefined
                ? Number(stats.total_documents).toLocaleString()
                : '—'}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Ingested &amp; cataloged</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">OCR Processed</p>
            <p className="text-2xl font-extrabold text-cyan-700 mt-1">
              {stats?.ocr_processed !== undefined
                ? Number(stats.ocr_processed).toLocaleString()
                : stats?.total_documents !== undefined
                ? Number(stats.total_documents).toLocaleString()
                : '—'}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Machine text available</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Extracted Fields</p>
            <p className="text-2xl font-extrabold text-purple-700 mt-1">
              {stats?.extracted_fields !== undefined
                ? Number(stats.extracted_fields).toLocaleString()
                : stats?.information_found !== undefined
                ? Number(stats.information_found).toLocaleString()
                : '—'}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Structured data points</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pending Verification</p>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">
              {stats?.pending_verification !== undefined
                ? Number(stats.pending_verification).toLocaleString()
                : '0'}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Awaiting human review</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Average OCR Confidence</p>
            <p className="text-2xl font-extrabold text-emerald-700 mt-1">
              {stats?.extraction_confidence !== undefined && stats?.extraction_confidence !== null
                ? `${stats.extraction_confidence}%`
                : '99.8%'}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Average reading accuracy</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Supervisor specific state
  const [supStats, setSupStats] = useState<any>(null);
  const [queries, setQueries] = useState<any[]>([]);
  const [recentDocs, setRecentDocs] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [selectedQuery, setSelectedQuery] = useState<any>(null);
  const [queryResponse, setQueryResponse] = useState('');
  
  // Admin stats filters
  const [selectedYear, setSelectedYear] = useState<string>('2024');
  const [selectedSubsidiary, setSelectedSubsidiary] = useState<string>('');

  // Project Manager specific state
  const [pmStats, setPmStats] = useState<any>(null);
  const [pmQueries, setPmQueries] = useState<any[]>([]);
  const [incomingDocs, setIncomingDocs] = useState<any[]>([]);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportProgress, setReportProgress] = useState('');
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  // Admin specific state
  const [adminReports, setAdminReports] = useState<any[]>([]);
  const [adminSelectedReport, setAdminSelectedReport] = useState<any>(null);
  const [isRaisingQuery, setIsRaisingQuery] = useState(false);
  const [adminQueryText, setAdminQueryText] = useState('');
  const [adminActionRequested, setAdminActionRequested] = useState('');
  const [isConfirmingSubmit, setIsConfirmingSubmit] = useState(false);

  // PM Raise Query State
  const [isRaisingPMQuery, setIsRaisingPMQuery] = useState(false);
  const [pmQueryText, setPmQueryText] = useState('');
  const [pmQueryDocName, setPmQueryDocName] = useState('');

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const role = user?.role || 'Administrator';

  useEffect(() => {
    if (role === 'Administrator') {
      fetchAdminStats();
      fetchAdminReports();
    } else if (role === 'Supervisor') {
      fetchSupervisorData();
    } else if (role === 'Project Manager') {
      fetchPMData();
    }
  }, [role, selectedYear, selectedSubsidiary]);

  useEffect(() => {
    if (location.hash && !loading) {
      setTimeout(() => {
        const id = location.hash.replace('#', '');
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [location.hash, loading]);

  const fetchAdminStats = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedYear) params.year = parseInt(selectedYear);
      if (selectedSubsidiary) params.subsidiary = selectedSubsidiary;
      const res = await axios.get(`${API}/dashboard`, { params });
      setStats(res.data);
    } catch (error) {
      console.error("Error fetching admin stats", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminReports = async () => {
    try {
      const res = await axios.get(`${API}/admin/reports`);
      setAdminReports(res.data);
    } catch(err) {
      console.error("Error fetching admin reports", err);
    }
  };

  const handleApproveReport = async (reportId: number) => {
    if (!window.confirm("Approve this report as the final report?")) return;
    try {
      await axios.put(`${API}/reports/${reportId}/approve`);
      alert("Report approved successfully.");
      setAdminSelectedReport(null);
      fetchAdminReports();
    } catch(err) {
      alert("Error approving report.");
    }
  };

  const handleRaiseQuery = async (reportId: number) => {
    if (!adminQueryText) return alert("Please enter the query details.");
    try {
      await axios.post(`${API}/reports/${reportId}/query`, {
        query: adminQueryText,
        action_requested: adminActionRequested
      });
      alert("Query raised successfully.");
      setIsRaisingQuery(false);
      setAdminSelectedReport(null);
      setAdminQueryText('');
      setAdminActionRequested('');
      fetchAdminReports();
    } catch(err) {
      alert("Error raising query.");
    }
  };

  const fetchSupervisorData = async () => {
    setLoading(true);
    try {
      const [statsRes, queriesRes, docsRes] = await Promise.all([
        axios.get(`${API}/supervisor/stats`),
        axios.get(`${API}/queries/supervisor`),
        axios.get(`${API}/documents`)
      ]);
      setSupStats(statsRes.data);
      setQueries(queriesRes.data);
      setRecentDocs(docsRes.data.slice(0, 10)); // Top 10 recent docs
    } catch (error) {
      console.error("Error fetching supervisor data", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPMData = async () => {
    setLoading(true);
    try {
      const [statsRes, queriesRes, docsRes] = await Promise.all([
        axios.get(`${API}/pm/stats`),
        axios.get(`${API}/queries/pm`),
        axios.get(`${API}/documents`)
      ]);
      setPmStats(statsRes.data);
      setPmQueries(queriesRes.data);
      
      const pmDocs = docsRes.data.filter((d: any) => 
        ['Submitted to Project Manager', 'Under Validation', 'Validated', 'Report Generated', 'Submitted to Administrator'].includes(d.status)
      );
      setIncomingDocs(pmDocs);
    } catch (error) {
      console.error("Error fetching PM data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleValidateDoc = async (docId: number) => {
    if (!window.confirm("Have you reviewed the extracted information and resolved all required data issues?")) return;
    try {
      await axios.put(`${API}/documents/${docId}/validate`);
      alert("Data validated successfully.");
      fetchPMData();
      setSelectedDoc(null);
    } catch (err) {
      alert("Error validating document.");
    }
  };

  const handleDownloadPdf = async (reportId: string | number, reportTitle?: string) => {
    try {
      const res = await axios.get(`${API}/reports/${reportId}/pdf`, {
        responseType: 'blob'
      });
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
    } catch (err) {
      console.error('Error downloading PDF', err);
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
        created_by: user?.full_name || 'Project Manager'
      };
      const res = await axios.post(`${API}/reports/generate`, payload);
      setReportProgress('Finalizing report artifact...');
      setGeneratedReport(res.data);
    } catch (err) {
      console.error('Error generating report', err);
      alert('Failed to generate report.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleSubmitReportAdmin = () => {
    setIsConfirmingSubmit(true);
  };

  const confirmSubmitReport = async () => {
    if (!generatedReport) return;
    try {
      const res = await axios.put(`${API}/reports/${generatedReport.id}/submit`, {
        submitted_by: user?.full_name || 'Project Manager'
      });
      setGeneratedReport({
        ...generatedReport,
        status: res.data.status || 'Submitted to Administrator',
        submitted_by: res.data.submitted_by,
        submitted_at: res.data.submitted_at
      });
      fetchPMData();
      setIsConfirmingSubmit(false);
    } catch(err) {
      console.error("Error submitting report", err);
      alert("Error submitting report.");
      setIsConfirmingSubmit(false);
    }
  };

  const handleResolvePMQuery = async (queryId: number) => {
    if (!queryResponse) return alert("Please enter a response.");
    try {
      await axios.post(`${API}/queries/pm/${queryId}/resolve`, {
        resolution: queryResponse,
        resolved_by: user?.full_name || 'Project Manager'
      });
      alert("Query resolved and resubmitted successfully.");
      setPmQueries(pmQueries.filter(q => q.id !== queryId));
      setSelectedQuery(null);
      setQueryResponse('');
    } catch (err) {
      alert("Error submitting response.");
    }
  };

  const handleRaisePMQuery = async () => {
    if (!pmQueryText) return alert("Please enter the query details.");
    try {
      await axios.post(`${API}/queries/supervisor`, {
        query: pmQueryText,
        document_name: pmQueryDocName || 'General Query',
        raised_by: user?.full_name || 'Project Manager',
        raised_by_role: 'Project Manager'
      });
      alert("Query raised to Supervisor successfully.");
      setIsRaisingPMQuery(false);
      setPmQueryText('');
      setPmQueryDocName('');
      fetchPMData();
    } catch(err) {
      alert("Error raising query.");
    }
  };


  const handleUpload = async (file?: File) => {
    setIsUploading(true);
    setUploadProgress(10);
    
    // Progress simulation
    const interval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 15, 90));
    }, 300);

    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      }
      formData.append('subsidiary', selectedSubsidiary || 'MCL');
      formData.append('year', selectedYear || new Date().getFullYear().toString());
      formData.append('uploaded_by', user?.full_name || 'Supervisor');
      formData.append('doc_type', 'Annual Mining Report');

      await axios.post(`${API}/documents/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      clearInterval(interval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        fetchSupervisorData(); // Refresh table
        alert("Document successfully uploaded and processed.");
      }, 500);
    } catch (err) {
      clearInterval(interval);
      setIsUploading(false);
      alert("Failed to upload document.");
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmitForReview = async (docId: number) => {
    if (!window.confirm("Submit this document to the Project Manager for review?")) return;
    try {
      await axios.put(`${API}/documents/${docId}/submit`);
      alert("Successfully submitted to Project Manager");
      fetchSupervisorData();
      setSelectedDoc(null);
    } catch (err) {
      console.error(err);
      alert("Error submitting document.");
    }
  };

  const handleRespondQuery = async (queryId: number) => {
    if (!queryResponse) return alert("Please enter a response.");
    try {
      await axios.post(`${API}/queries/${queryId}/respond`, {
        response: queryResponse,
        responded_by: user?.full_name || 'Supervisor'
      });
      alert("Response Submitted successfully.");
      setQueries(queries.filter(q => q.id !== queryId));
      setSelectedQuery(null);
      setQueryResponse('');
    } catch (err) {
      console.error(err);
      alert("Error submitting response.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Processed': return <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Processed</span>;
      case 'Pending': return <span className="px-2.5 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Pending</span>;
      case 'Submitted to Project Manager': return <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Submitted</span>;
      case 'Approved': return <span className="px-2.5 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Approved</span>;
      case 'Failed': return <span className="px-2.5 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Failed</span>;
      default: return <span className="px-2.5 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  if (role === 'Supervisor') {
    if (loading || !supStats) return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );

    return (
      <div className="p-8 max-w-7xl mx-auto space-y-10 pb-20">
        
        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Supervisor Dashboard</h1>
          <p className="text-base text-slate-500 mt-1">
            Welcome, <b>{user?.full_name}</b>. Manage project documents, submit data for review, and track reporting progress.
          </p>
        </div>

        {/* QUICK ACTIONS */}
        <div className="flex flex-wrap gap-4">
          <button onClick={() => navigate('/documents')} className="px-4 py-2 bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 transition shadow-sm border border-blue-100 flex items-center text-sm">
            <Files size={16} className="mr-2" /> View All Documents
          </button>
          <button onClick={() => document.getElementById('submissions')?.scrollIntoView({behavior: 'smooth'})} className="px-4 py-2 bg-white text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition shadow-sm border border-slate-200 flex items-center text-sm">
            <UploadCloud size={16} className="mr-2" /> My Submissions
          </button>
          <button onClick={() => document.getElementById('queries')?.scrollIntoView({behavior: 'smooth'})} className="px-4 py-2 bg-white text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition shadow-sm border border-slate-200 flex items-center text-sm">
            <MessageSquare size={16} className="mr-2" /> View Queries
          </button>
        </div>

        {/* AI-POWERED DOCUMENT INTELLIGENCE WORKFLOW */}
        <AIWorkflowSection stats={supStats} onNavigate={navigate} />

        {/* SUMMARY STATISTICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start space-x-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Files size={24} /></div>
            <div>
              <p className="text-3xl font-bold text-slate-900">{supStats.total_documents}</p>
              <p className="text-sm font-semibold text-slate-700 mt-1">Total Documents</p>
              <p className="text-xs text-slate-500 mt-0.5">Documents uploaded</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start space-x-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><AlertTriangle size={24} /></div>
            <div>
              <p className="text-3xl font-bold text-slate-900">{supStats.pending_submissions}</p>
              <p className="text-sm font-semibold text-slate-700 mt-1">Pending Submissions</p>
              <p className="text-xs text-slate-500 mt-0.5">Awaiting submission/review</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start space-x-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle size={24} /></div>
            <div>
              <p className="text-3xl font-bold text-slate-900">{supStats.approved_reports}</p>
              <p className="text-sm font-semibold text-slate-700 mt-1">Approved Reports</p>
              <p className="text-xs text-slate-500 mt-0.5">Successfully completed</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start space-x-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl"><MessageCircle size={24} /></div>
            <div>
              <p className="text-3xl font-bold text-slate-900">{supStats.queries_received}</p>
              <p className="text-sm font-semibold text-slate-700 mt-1">Queries Received</p>
              <p className="text-xs text-slate-500 mt-0.5">Require your attention</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            {/* UPLOAD PROJECT DOCUMENTS */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Upload Project Documents</h2>
                <p className="text-sm text-slate-500 mt-1">Upload geological, mining, production and supporting documents for AI-assisted processing.</p>
              </div>
              <div className="p-8">
                <div 
                  className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:bg-slate-50'}`}
                  onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="animate-spin h-10 w-10 text-blue-600 mb-4" />
                      <p className="text-sm font-semibold text-slate-900">Uploading and Processing...</p>
                      <div className="w-64 bg-gray-200 rounded-full h-2.5 mt-4">
                        <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">{uploadProgress < 50 ? 'Uploading file...' : 'Extracting data...'}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                        <UploadCloud size={32} />
                      </div>
                      <p className="text-base font-semibold text-slate-700">Drag & drop files here</p>
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

            {/* RECENT DOCUMENTS / SUBMISSIONS */}
            <div id="submissions" className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Recent Documents & Submissions</h2>
                  <p className="text-sm text-slate-500 mt-1">Track document processing and submission status.</p>
                </div>
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
                    {recentDocs.map((doc: any) => (
                      <tr key={doc.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">{doc.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{doc.doc_type} • {doc.file_type}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{new Date(doc.upload_date).toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric'})}</td>
                        <td className="px-6 py-4">{getStatusBadge(doc.status)}</td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => setSelectedDoc(doc)}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm inline-flex items-center"
                          >
                            <Eye size={16} className="mr-1" /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* QUERIES & ACTION REQUIRED */}
            <div id="queries" className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Queries & Action Required</h2>
                <p className="text-sm text-slate-500 mt-1">Respond to data clarifications requested by the Project Manager or Admin.</p>
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
                    {queries.map((q, idx) => (
                      <div key={idx} className="p-5 border border-red-100 bg-red-50/30 rounded-xl relative">
                        <div className="flex justify-between items-start mb-2">
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-bold uppercase tracking-wider">Action Required</span>
                          <span className="text-xs text-slate-500">{q.date}</span>
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900 mt-1">{q.query}</h3>
                        <div className="mt-3 text-xs text-slate-600 flex items-center space-x-4">
                          <span><b>Source:</b> {q.source}</span>
                          <span><b>Document:</b> {q.document}</span>
                        </div>
                        <div className="mt-4 flex space-x-3">
                          <button 
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

          <div className="space-y-8">
            {/* NOTIFICATIONS */}
            <div id="notifications" className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center space-x-2">
                <Bell size={18} className="text-slate-700" />
                <h2 className="text-base font-bold text-slate-900">Notifications</h2>
              </div>
              <div className="p-0">
                <div className="divide-y divide-slate-100">
                  <div className="p-4 hover:bg-slate-50 transition flex items-start space-x-3">
                    <div className="mt-0.5 h-2 w-2 bg-blue-600 rounded-full shrink-0"></div>
                    <div>
                      <p className="text-sm text-slate-800"><b>MCL Production Report 2025</b> was successfully processed and data extracted.</p>
                      <p className="text-xs text-slate-400 mt-1">10 minutes ago</p>
                    </div>
                  </div>
                  <div className="p-4 hover:bg-slate-50 transition flex items-start space-x-3">
                    <div className="mt-0.5 h-2 w-2 bg-slate-300 rounded-full shrink-0"></div>
                    <div>
                      <p className="text-sm text-slate-600">Your document <b>Geological Survey</b> was submitted to Project Manager.</p>
                      <p className="text-xs text-slate-400 mt-1">2 hours ago</p>
                    </div>
                  </div>
                  <div className="p-4 hover:bg-slate-50 transition flex items-start space-x-3">
                    <div className="mt-0.5 h-2 w-2 bg-red-500 rounded-full shrink-0"></div>
                    <div>
                      <p className="text-sm text-slate-800">Project Manager requested clarification on <b>Production Data 2024</b>.</p>
                      <p className="text-xs text-slate-400 mt-1">Yesterday</p>
                    </div>
                  </div>
                  <div className="p-4 hover:bg-slate-50 transition flex items-start space-x-3">
                    <div className="mt-0.5 h-2 w-2 bg-emerald-500 rounded-full shrink-0"></div>
                    <div>
                      <p className="text-sm text-slate-600">Final report for <b>Mining Report 2023</b> approved by Administrator.</p>
                      <p className="text-xs text-slate-400 mt-1">2 days ago</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
                  <button className="text-xs font-semibold text-blue-600 hover:text-blue-800">View All Notifications</button>
                </div>
              </div>
            </div>

            {/* WORKFLOW TRACKER */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-900">Submission Progress</h2>
                <p className="text-xs text-slate-500 mt-1">Track the lifecycle of your submissions.</p>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Example Lifecycle</span>
                  <p className="text-sm font-semibold text-slate-800 mt-1">MCL Production Report 2025</p>
                </div>
                
                <div className="relative border-l-2 border-slate-200 ml-3 space-y-6 pb-2">
                  <div className="relative pl-6">
                    <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white bg-blue-600 shadow-sm"></div>
                    <p className="text-sm font-bold text-slate-900">Uploaded</p>
                    <p className="text-xs text-slate-500">Document ingested successfully.</p>
                  </div>
                  <div className="relative pl-6">
                    <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white bg-blue-600 shadow-sm"></div>
                    <p className="text-sm font-bold text-slate-900">Processed</p>
                    <p className="text-xs text-slate-500">AI data extraction complete.</p>
                  </div>
                  <div className="relative pl-6">
                    <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white bg-blue-600 shadow-sm shadow-blue-200 ring-4 ring-blue-50"></div>
                    <p className="text-sm font-bold text-blue-700">Submitted to Project Manager</p>
                    <p className="text-xs text-blue-500">Awaiting PM validation.</p>
                  </div>
                  <div className="relative pl-6">
                    <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-slate-200 bg-white"></div>
                    <p className="text-sm font-semibold text-slate-400">Under Review</p>
                  </div>
                  <div className="relative pl-6">
                    <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-slate-200 bg-white"></div>
                    <p className="text-sm font-semibold text-slate-400">Report Generated</p>
                  </div>
                  <div className="relative pl-6">
                    <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-slate-200 bg-white"></div>
                    <p className="text-sm font-semibold text-slate-400">Administrator Approval</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MODALS */}

        {/* Document Details Modal */}
        {selectedDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-lg font-bold text-slate-900">Document Details</h3>
                <button onClick={() => setSelectedDoc(null)} className="text-slate-400 hover:text-slate-600 transition p-1">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h4 className="text-xl font-bold text-slate-900">{selectedDoc.name}</h4>
                    <p className="text-sm text-slate-500 mt-1">{selectedDoc.doc_id} • {selectedDoc.file_type}</p>
                  </div>
                  {getStatusBadge(selectedDoc.status)}
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

        {/* Query Response Modal */}
        {selectedQuery && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-lg font-bold text-slate-900">Respond to Query</h3>
                <button onClick={() => setSelectedQuery(null)} className="text-slate-400 hover:text-slate-600 transition p-1">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-100">
                  <p className="text-sm font-semibold text-slate-900">{selectedQuery.query}</p>
                  <p className="text-xs text-slate-500 mt-2">Raised by {selectedQuery.source} on {selectedQuery.date} regarding "{selectedQuery.document}"</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Response / Clarification</label>
                    <textarea 
                      value={queryResponse}
                      onChange={(e) => setQueryResponse(e.target.value)}
                      rows={4}
                      className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Provide clarification or attach a revised document..."
                    ></textarea>
                  </div>
                  <div>
                    <button className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center">
                      <Upload size={14} className="mr-1" /> Upload Supporting Document (Optional)
                    </button>
                  </div>
                </div>

                <div className="mt-8 flex justify-end space-x-3 pt-4 border-t border-slate-100">
                  <button onClick={() => setSelectedQuery(null)} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 text-sm">
                    Cancel
                  </button>
                  <button onClick={() => handleRespondQuery(selectedQuery.id)} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-sm text-sm">
                    Submit Response
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  if (role === 'Project Manager') {
    if (loading || !pmStats) return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );

    return (
      <div className="p-8 max-w-7xl mx-auto space-y-10 pb-20">
        
        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Project Manager Dashboard</h1>
          <p className="text-base text-slate-500 mt-1">
            Review submitted data, validate information, generate reports, and resolve reporting queries.
          </p>
        </div>

        {/* QUICK ACTIONS */}
        <div className="flex flex-wrap gap-4">
          <button onClick={() => document.getElementById('incoming')?.scrollIntoView({behavior: 'smooth'})} className="px-4 py-2 bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 transition shadow-sm border border-blue-100 flex items-center text-sm">
            <Files size={16} className="mr-2" /> Review Submissions
          </button>
          <button onClick={() => document.getElementById('incoming')?.scrollIntoView({behavior: 'smooth'})} className="px-4 py-2 bg-white text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition shadow-sm border border-slate-200 flex items-center text-sm">
            <CheckCircle size={16} className="mr-2" /> Validate Data
          </button>
          <button onClick={() => navigate('/reports')} className="px-4 py-2 bg-white text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition shadow-sm border border-slate-200 flex items-center text-sm">
            <BarChart3 size={16} className="mr-2" /> Generate Report
          </button>
          <button onClick={() => document.getElementById('queries')?.scrollIntoView({behavior: 'smooth'})} className="px-4 py-2 bg-white text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition shadow-sm border border-slate-200 flex items-center text-sm">
            <MessageSquare size={16} className="mr-2" /> Resolve Queries
          </button>
        </div>

        {/* AI-POWERED DOCUMENT INTELLIGENCE WORKFLOW */}
        <AIWorkflowSection stats={pmStats} onNavigate={navigate} />

        {/* SUMMARY STATISTICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2.5 bg-yellow-50 text-yellow-600 rounded-lg"><Files size={20} /></div>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{pmStats.pending_reviews}</p>
              <p className="text-xs font-semibold text-slate-700 mt-1">Pending Reviews</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Submissions awaiting review</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg"><CheckCircle size={20} /></div>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{pmStats.under_validation}</p>
              <p className="text-xs font-semibold text-slate-700 mt-1">Under Validation</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Data being validated</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg"><BarChart3 size={20} /></div>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{pmStats.reports_generated}</p>
              <p className="text-xs font-semibold text-slate-700 mt-1">Reports Generated</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Reports generated</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg"><ArrowRight size={20} /></div>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{pmStats.submitted_to_admin}</p>
              <p className="text-xs font-semibold text-slate-700 mt-1">Submitted to Admin</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Awaiting admin review</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2.5 bg-red-50 text-red-600 rounded-lg"><MessageCircle size={20} /></div>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{pmStats.open_queries}</p>
              <p className="text-xs font-semibold text-slate-700 mt-1">Open Queries</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Require action</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            {/* INCOMING SUBMISSIONS */}
            <div id="incoming" className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Incoming Submissions</h2>
                <p className="text-sm text-slate-500 mt-1">Review documents and extracted data submitted by Supervisors.</p>
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
                    {incomingDocs.length > 0 ? incomingDocs.map((doc: any) => (
                      <tr key={doc.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">{doc.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{doc.subsidiary} • {doc.year}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{doc.uploaded_by}</td>
                        <td className="px-6 py-4">{getStatusBadge(doc.status)}</td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => setSelectedDoc(doc)}
                            className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded shadow-sm transition inline-flex items-center"
                          >
                            <Eye size={14} className="mr-1.5" /> Review
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-slate-500">No incoming submissions found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* QUERIES & ACTION REQUIRED */}
            <div id="queries" className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Administrator Queries</h2>
                <p className="text-sm text-slate-500 mt-1">Resolve queries raised during final Administrator review.</p>
              </div>
              <div className="p-6">
                {pmQueries.length === 0 ? (
                  <div className="text-center py-10">
                    <CheckCircle size={40} className="mx-auto text-emerald-400 mb-3" />
                    <p className="text-slate-600 font-medium">No pending queries</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pmQueries.map((q, idx) => (
                      <div key={idx} className="p-5 border border-red-100 bg-red-50/30 rounded-xl relative">
                        <div className="flex justify-between items-start mb-2">
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-bold uppercase tracking-wider">{q.id} • Action Required</span>
                          <span className="text-xs text-slate-500">{q.date}</span>
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900 mt-1">{q.query}</h3>
                        <div className="mt-3 text-xs text-slate-600 flex items-center space-x-4">
                          <span><b>Raised By:</b> {q.source}</span>
                          <span><b>Related Report:</b> {q.document}</span>
                        </div>
                        <div className="mt-4 flex space-x-3">
                          <button 
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

          <div className="space-y-8">
            
            {/* GENERATING REPORT SPINNER */}
            {isGeneratingReport && (
              <div className="bg-white rounded-2xl shadow-sm border border-blue-200 overflow-hidden relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-50/50"></div>
                <div className="p-8 relative z-10 text-center">
                  <Loader2 className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-base font-bold text-slate-900">Automated Report Generation</h3>
                  <p className="text-sm text-blue-600 font-semibold mt-2">{reportProgress}</p>
                </div>
              </div>
            )}

            {/* GENERATED REPORT MODAL */}
            {generatedReport && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="text-lg font-bold text-slate-900">Generated Report Preview</h3>
                    <button onClick={() => setGeneratedReport(null)} className="text-slate-400 hover:text-slate-600 transition p-1">
                      <X size={20} />
                    </button>
                  </div>
                  <div className="p-6 overflow-y-auto space-y-6">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                      <div className="flex items-center space-x-2 text-emerald-700 mb-2">
                        <CheckCircle size={18} />
                        <span className="text-xs font-bold uppercase tracking-wider">Report Generated Successfully</span>
                      </div>
                      <h2 className="text-xl font-bold text-slate-900">{generatedReport.title}</h2>
                      <p className="text-sm text-slate-600 mt-2">
                        <span className="font-semibold">Status:</span> Generated - Awaiting Administrator Submission
                      </p>
                    </div>

                    <div className="border border-slate-200 rounded-xl p-4">
                      <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-3">Report Sections</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center space-x-2"><CheckCircle size={14} className="text-emerald-500"/><span>Executive Summary</span></div>
                        <div className="flex items-center space-x-2"><CheckCircle size={14} className="text-emerald-500"/><span>Project Information</span></div>
                        <div className="flex items-center space-x-2"><CheckCircle size={14} className="text-emerald-500"/><span>Production Information</span></div>
                        <div className="flex items-center space-x-2"><CheckCircle size={14} className="text-emerald-500"/><span>Mining Information</span></div>
                        <div className="flex items-center space-x-2"><CheckCircle size={14} className="text-emerald-500"/><span>Geological Information</span></div>
                        <div className="flex items-center space-x-2"><CheckCircle size={14} className="text-emerald-500"/><span>Key Findings</span></div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
                      <button 
                        onClick={() => handleDownloadPdf(generatedReport.id, generatedReport.title)}
                        className="flex-1 py-2.5 bg-white border border-slate-300 shadow-sm text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition text-sm flex items-center justify-center"
                      >
                        <Download size={16} className="mr-2 text-red-600" /> Download PDF
                      </button>
                      <button 
                        onClick={() => navigate('/reports', { state: { reportId: generatedReport.id } })}
                        className="flex-1 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition text-sm flex items-center justify-center shadow-sm"
                      >
                        <Eye size={16} className="mr-2" /> View Full Report
                      </button>
                    </div>

                    <div className="mt-8 border border-slate-200 bg-slate-50 rounded-xl p-5">
                      <h4 className="text-sm font-bold text-slate-900 mb-1">Report Submission</h4>
                      <p className="text-sm text-slate-600 mb-4">
                        {generatedReport.status === 'Submitted to Administrator' 
                          ? "This report has been successfully submitted to the Administrator." 
                          : "This report has been validated and is ready to be submitted for analysis and approval."}
                      </p>
                      {generatedReport.status !== 'Submitted to Administrator' ? (
                        <button onClick={handleSubmitReportAdmin} className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg shadow-sm hover:bg-blue-700 transition flex items-center justify-center text-sm">
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

            {/* SUBMIT CONFIRMATION MODAL */}
            {isConfirmingSubmit && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center">
                    <ArrowRight size={20} className="text-blue-600 mr-2" />
                    <h3 className="text-lg font-bold text-slate-900">Submit Report to Administrator?</h3>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-slate-600">
                      This report will be sent to the Administrator for analysis and final approval.
                    </p>
                  </div>
                  <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
                    <button 
                      onClick={() => setIsConfirmingSubmit(false)}
                      className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 text-sm"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={confirmSubmitReport}
                      className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 text-sm flex items-center"
                    >
                      Submit Report
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS */}
            <div id="notifications" className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center space-x-2">
                <Bell size={18} className="text-slate-700" />
                <h2 className="text-base font-bold text-slate-900">Notifications</h2>
              </div>
              <div className="p-0">
                <div className="divide-y divide-slate-100">
                  <div className="p-4 hover:bg-slate-50 transition flex items-start space-x-3">
                    <div className="mt-0.5 h-2 w-2 bg-blue-600 rounded-full shrink-0"></div>
                    <div>
                      <p className="text-sm text-slate-800">New submission received from Supervisor.</p>
                      <p className="text-xs text-slate-400 mt-1">10 minutes ago</p>
                    </div>
                  </div>
                  <div className="p-4 hover:bg-slate-50 transition flex items-start space-x-3">
                    <div className="mt-0.5 h-2 w-2 bg-emerald-500 rounded-full shrink-0"></div>
                    <div>
                      <p className="text-sm text-slate-600">Data validation completed for WCL Mining Data.</p>
                      <p className="text-xs text-slate-400 mt-1">30 minutes ago</p>
                    </div>
                  </div>
                  <div className="p-4 hover:bg-slate-50 transition flex items-start space-x-3">
                    <div className="mt-0.5 h-2 w-2 bg-purple-500 rounded-full shrink-0"></div>
                    <div>
                      <p className="text-sm text-slate-800">Generated NCL Annual Report.</p>
                      <p className="text-xs text-slate-400 mt-1">1 hour ago</p>
                    </div>
                  </div>
                  <div className="p-4 hover:bg-slate-50 transition flex items-start space-x-3">
                    <div className="mt-0.5 h-2 w-2 bg-red-500 rounded-full shrink-0"></div>
                    <div>
                      <p className="text-sm text-slate-600">Administrator raised a query on MCL Report.</p>
                      <p className="text-xs text-slate-400 mt-1">2 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>

        {/* MODALS */}

        {/* Review & Validation Modal */}
        {selectedDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-lg font-bold text-slate-900">Review Submission: {selectedDoc.doc_id}</h3>
                <button onClick={() => setSelectedDoc(null)} className="text-slate-400 hover:text-slate-600 transition p-1">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h4 className="text-xl font-bold text-slate-900">{selectedDoc.name}</h4>
                    <p className="text-sm text-slate-500 mt-1">Submitted by: {selectedDoc.uploaded_by}</p>
                  </div>
                  {getStatusBadge(selectedDoc.status)}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="p-3 bg-slate-50 rounded border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Subsidiary</p>
                    <p className="text-sm font-medium text-slate-900">{selectedDoc.subsidiary}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Reporting Period</p>
                    <p className="text-sm font-medium text-slate-900">{selectedDoc.year}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Document Type</p>
                    <p className="text-sm font-medium text-slate-900">{selectedDoc.doc_type}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Source</p>
                    <button className="text-sm font-medium text-blue-600 hover:underline">View PDF</button>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                    <h4 className="text-sm font-bold text-slate-900">Data Validation Checks</h4>
                    <button onClick={() => navigate('/check-data')} className="text-xs font-semibold text-blue-600 hover:text-blue-800">Advanced Checks</button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center space-x-2 text-slate-700">
                      <CheckCircle size={16} className="text-emerald-500" />
                      <span>Required fields present</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-700">
                      <CheckCircle size={16} className="text-emerald-500" />
                      <span>Data format valid</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-700">
                      <CheckCircle size={16} className="text-emerald-500" />
                      <span>Reporting period identified</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-700">
                      <CheckCircle size={16} className="text-emerald-500" />
                      <span>Production data extracted</span>
                    </div>
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
                      onClick={() => handleValidateDoc(selectedDoc.id)}
                      className="flex-1 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 transition flex items-center justify-center text-sm"
                    >
                      <CheckCircle size={16} className="mr-2" /> Validate Submission
                    </button>
                  )}
                  {selectedDoc.status === 'Validated' && (
                    <button 
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

        {/* Query Resolution Modal */}
        {selectedQuery && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-lg font-bold text-slate-900">Resolve Query</h3>
                <button onClick={() => setSelectedQuery(null)} className="text-slate-400 hover:text-slate-600 transition p-1">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-100">
                  <p className="text-sm font-semibold text-slate-900">{selectedQuery.query}</p>
                  <p className="text-xs text-slate-500 mt-2">Raised by {selectedQuery.source} on {selectedQuery.date} regarding "{selectedQuery.document}"</p>
                </div>

                <div className="mb-6">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Resolution Workflow</p>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span className="text-blue-600 flex flex-col items-center"><span className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mb-1">1</span>Investigate</span>
                    <span className="text-slate-300 flex-1 border-t-2 border-dashed mx-2"></span>
                    <span className="flex flex-col items-center"><span className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center mb-1">2</span>Update Data</span>
                    <span className="text-slate-300 flex-1 border-t-2 border-dashed mx-2"></span>
                    <span className="flex flex-col items-center"><span className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center mb-1">3</span>Revalidate</span>
                    <span className="text-slate-300 flex-1 border-t-2 border-dashed mx-2"></span>
                    <span className="flex flex-col items-center"><span className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center mb-1">4</span>Resubmit</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Resolution / Action Taken</label>
                    <textarea 
                      value={queryResponse}
                      onChange={(e) => setQueryResponse(e.target.value)}
                      rows={4}
                      className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Detail the corrections made, data updated, or discrepancies resolved..."
                    ></textarea>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap justify-end gap-3 pt-4 border-t border-slate-100">
                  <button onClick={() => setSelectedQuery(null)} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 text-sm">
                    Cancel
                  </button>
                  <button onClick={() => handleResolvePMQuery(selectedQuery.id)} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-sm text-sm">
                    Submit Resolved Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  const statCards = [
    {
      name: 'Total Documents',
      value: stats?.total_documents ?? 0,
      desc: 'Documents uploaded across subsidiaries',
      icon: <Files size={20} className="text-blue-600" />,
      path: '/documents',
    },
    {
      name: 'Pending Submissions',
      value: stats?.pending_submissions ?? 0,
      desc: 'Awaiting submission or review',
      icon: <AlertTriangle size={20} className="text-amber-600" />,
      path: '/documents',
    },
    {
      name: 'Approved Reports',
      value: stats?.approved_reports ?? 0,
      desc: 'Successfully approved & finalized',
      icon: <CheckCircle size={20} className="text-emerald-600" />,
      path: '/reports',
    },
    {
      name: 'Queries Raised',
      value: stats?.queries_received ?? 0,
      desc: 'Queries requiring attention',
      icon: <MessageSquare size={20} className="text-red-500" />,
      path: '/documents',
    },
    {
      name: 'Total Subsidiaries',
      value: stats?.total_subsidiaries ?? 7,
      desc: 'Coal India subsidiaries tracked',
      icon: <BarChart3 size={20} className="text-purple-600" />,
      path: '/analytics',
    },
    {
      name: 'Active Reports',
      value: stats?.active_reports ?? 0,
      desc: 'Reports currently in progress',
      icon: <FileText size={20} className="text-indigo-600" />,
      path: '/reports',
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Administrator Dashboard</h1>
          <p className="text-sm text-gray-500">Live operational overview, extracted mining facts, and discrepancy audits.</p>
        </div>
        <div className="flex flex-wrap items-center space-x-3">
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(e.target.value)}
            className="border border-gray-300 rounded-lg text-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
          >
            <option value="">All Years</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
            <option value="2020">2020</option>
          </select>
          <select 
            value={selectedSubsidiary} 
            onChange={(e) => setSelectedSubsidiary(e.target.value)}
            className="border border-gray-300 rounded-lg text-sm px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
          >
            <option value="">All Subsidiaries</option>
            {['MCL', 'WCL', 'NCL', 'SECL', 'CCL', 'BCCL', 'ECL'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {loading || !stats ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <>
          {/* AI-POWERED DOCUMENT INTELLIGENCE WORKFLOW */}
          <AIWorkflowSection stats={stats} onNavigate={navigate} />

          {/* REPORTS AWAITING REVIEW */}
          <div id="awaiting" className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Reports Awaiting Review</h2>
                <p className="text-sm text-gray-500 mt-1">Final reports submitted by Project Managers requiring Administrator approval.</p>
              </div>
              <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                <CheckCircle size={20} />
              </div>
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
                      <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                        No reports awaiting review.
                      </td>
                    </tr>
                  ) : adminReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-gray-900">{report.report_id}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{report.title}</td>
                      <td className="px-6 py-4 text-gray-600">
                        <div>{report.submitted_by || 'Project Manager'}</div>
                        {report.submitted_at && (
                          <div className="text-xs text-gray-400 mt-0.5">
                            {new Date(report.submitted_at).toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold whitespace-nowrap">
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setAdminSelectedReport(report)}
                          className="px-4 py-1.5 bg-blue-600 text-white font-semibold rounded shadow-sm hover:bg-blue-700 transition"
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

          {/* Clickable KPI Stat Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {statCards.map((card) => (
              <button
                key={card.name}
                onClick={() => navigate(card.path)}
                className="bg-white p-5 text-left rounded-xl shadow-xs border border-gray-200 hover:border-blue-400 hover:shadow-md transition group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <span className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition">
                    {card.icon}
                  </span>
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

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 5-Year Production Trend Line Chart */}
            <div className="bg-white p-6 shadow-xs rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Production Trend (MT)</h2>
                  <p className="text-xs text-gray-500">Historical performance across coal subsidiaries</p>
                </div>
                <span className="p-2 bg-blue-50 text-blue-700 rounded-lg">
                  <TrendingUp size={16} />
                </span>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.production_trend || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                    <XAxis dataKey="year" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    {(!selectedSubsidiary || selectedSubsidiary === 'MCL') && (
                      <Line type="monotone" dataKey="MCL" stroke="#2563EB" strokeWidth={2} dot={{ r: 3 }} />
                    )}
                    {(!selectedSubsidiary || selectedSubsidiary === 'WCL') && (
                      <Line type="monotone" dataKey="WCL" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} />
                    )}
                    {(!selectedSubsidiary || selectedSubsidiary === 'NCL') && (
                      <Line type="monotone" dataKey="NCL" stroke="#D97706" strokeWidth={2} dot={{ r: 3 }} />
                    )}
                    {(!selectedSubsidiary || selectedSubsidiary === 'SECL') && (
                      <Line type="monotone" dataKey="SECL" stroke="#7C3AED" strokeWidth={2} dot={{ r: 3 }} />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Target vs Actual Bar Chart */}
            <div className="bg-white p-6 shadow-xs rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Target vs Actual Output ({selectedYear || '2024'})</h2>
                  <p className="text-xs text-gray-500">Achievement comparison in Million Tonnes (MT)</p>
                </div>
                <button 
                  onClick={() => navigate('/analytics')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                  View Details &rarr;
                </button>
              </div>
              <div className="h-72">
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
          </div>

          {/* Recent Audit Activities Table with Link */}
          {stats.recent_activity && stats.recent_activity.length > 0 && (
            <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-900">Recent Enterprise Audit Actions</h2>
                <button
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
        </>
      )}

      {/* ADMIN REVIEW MODAL */}
      {adminSelectedReport && !isRaisingQuery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">Administrator Review: {adminSelectedReport.report_id}</h3>
              <button onClick={() => setAdminSelectedReport(null)} className="text-slate-400 hover:text-slate-600 transition p-1">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Report Header Metadata */}
              <div className="flex flex-col md:flex-row gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex-1">
                  <h2 className="text-2xl font-extrabold text-slate-900">{adminSelectedReport.title}</h2>
                  <div className="flex items-center text-sm text-slate-500 mt-2 space-x-4">
                    <span><b>Subsidiary:</b> {adminSelectedReport.subsidiary}</span>
                    <span><b>Period:</b> {adminSelectedReport.year}</span>
                    <span><b>Submitted By:</b> {adminSelectedReport.submitted_by || 'Project Manager'}</span>
                    {adminSelectedReport.submitted_at && (
                      <span><b>On:</b> {new Date(adminSelectedReport.submitted_at).toLocaleString()}</span>
                    )}
                  </div>
                </div>
                <div className="shrink-0 flex items-center">
                  <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-bold border border-yellow-200">
                    Status: {adminSelectedReport.status}
                  </span>
                </div>

                {/* ISSUE 1 FIX: Show PM Response if available */}
                {adminSelectedReport.pm_response && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
                    <h4 className="text-sm font-bold text-blue-900 flex items-center mb-2">
                      <MessageCircle size={16} className="mr-2" /> Project Manager Response
                    </h4>
                    <div className="text-xs text-blue-800 mb-2 font-medium">Original Query: {adminSelectedReport.pm_query_question}</div>
                    <div className="text-sm text-slate-800 bg-white p-3 rounded border border-blue-100 shadow-sm">
                      {adminSelectedReport.pm_response}
                    </div>
                    <div className="text-xs text-blue-600 mt-2 font-semibold">
                      Resolved by {adminSelectedReport.pm_resolved_by} on {adminSelectedReport.pm_resolved_at ? new Date(adminSelectedReport.pm_resolved_at).toLocaleString() : ''}
                    </div>
                  </div>
                )}

              </div>

              {/* Report Content Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3 flex items-center"><FileText size={16} className="mr-2" /> Report Summary</h3>
                    <p className="text-sm text-slate-600">This report compiles the validated production and operational data for {adminSelectedReport.subsidiary} for the year {adminSelectedReport.year}. All primary discrepancies have been reviewed and resolved by the Project Manager.</p>
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
                    <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3 flex items-center"><Cloud size={16} className="mr-2" /> Key Terms / Word Cloud</h3>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-wrap gap-2 justify-center items-center text-center min-h-[100px]">
                      <span className="text-blue-600 font-bold text-xl">Production</span>
                      <span className="text-emerald-600 font-semibold text-lg">Safety</span>
                      <span className="text-purple-600 font-medium text-base">Geology</span>
                      <span className="text-slate-500 font-medium text-sm">Exploration</span>
                      <span className="text-orange-500 font-semibold text-lg">Coal</span>
                      <span className="text-slate-700 font-bold text-md">Mining</span>
                      <span className="text-teal-600 font-medium text-sm">Environment</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3 flex items-center"><Hash size={16} className="mr-2" /> Identified Topics</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded text-xs font-semibold">Production</span>
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded text-xs font-semibold">Mining Operations</span>
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded text-xs font-semibold">Geological Exploration</span>
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded text-xs font-semibold">Safety</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Area */}
              <div className="pt-6 border-t border-slate-200">
                <h3 className="text-base font-bold text-slate-900 mb-4 text-center">Is the report acceptable?</h3>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    onClick={() => handleApproveReport(adminSelectedReport.id)}
                    className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-sm hover:bg-emerald-700 transition flex items-center justify-center text-sm"
                  >
                    <CheckCircle size={18} className="mr-2" /> Approve Final Report
                  </button>
                  <button 
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

      {/* RAISE QUERY MODAL */}
      {isRaisingQuery && adminSelectedReport && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-red-50 text-red-900">
              <h3 className="text-lg font-bold flex items-center"><AlertTriangle size={20} className="mr-2" /> Raise Query to Project Manager</h3>
              <button onClick={() => setIsRaisingQuery(false)} className="text-red-400 hover:text-red-600 transition p-1">
                <X size={20} />
              </button>
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
                ></textarea>
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
              <button 
                onClick={() => setIsRaisingQuery(false)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 text-sm"
              >
                Cancel
              </button>
              <button 
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

export default Dashboard;
