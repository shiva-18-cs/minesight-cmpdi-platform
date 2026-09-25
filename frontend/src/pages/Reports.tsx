import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  BarChart2, 
  Plus, 
  Download, 
  FileText, 
  CheckCircle, 
  Calendar, 
  Building2, 
  X, 
  ExternalLink, 
  ChevronRight, 
  Send, 
  User, 
  Clock, 
  AlertCircle 
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface ReportSummary {
  id: number;
  report_id: string;
  title: string;
  report_type: string;
  year: number;
  subsidiary: string;
  mine?: string;
  created_by: string;
  created_at: string;
  status: string;
  source_count: number;
  submitted_by?: string;
  submitted_at?: string;
}

// ─── Toast Notification Component ───────────────────────────────────────────
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-emerald-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
  };

  const icons = {
    success: <CheckCircle size={18} className="mr-2 shrink-0" />,
    error: <AlertCircle size={18} className="mr-2 shrink-0" />,
    info: <AlertCircle size={18} className="mr-2 shrink-0" />,
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] flex items-center px-5 py-3.5 rounded-xl shadow-xl text-white text-sm font-semibold ${colors[type]} animate-fade-in-up`}
      style={{ minWidth: '300px', maxWidth: '420px' }}
    >
      {icons[type]}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="ml-4 text-white/80 hover:text-white">
        <X size={16} />
      </button>
    </div>
  );
};

// ─── Main Reports Component ──────────────────────────────────────────────────
const Reports: React.FC = () => {
  const location = useLocation();
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Submit to Administration state
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    report_type: 'Production Report',
    subsidiary: 'MCL',
    year: 2024,
    mine: ''
  });

  // Get current logged-in user
  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  })();

  useEffect(() => {
    fetchReports();
  }, [location.state]);

  const fetchReports = async () => {
    try {
      const res = await axios.get(`${API}/reports`);
      setReports(res.data);
      const targetId = location.state?.reportId;
      if (targetId) {
        viewReport(targetId);
      } else if (res.data.length > 0 && !selectedReport) {
        viewReport(res.data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const viewReport = async (id: number | string) => {
    try {
      const res = await axios.get(`${API}/reports/${id}`);
      setSelectedReport(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const payload = {
        ...formData,
        created_by: user.full_name || 'R.K. Sharma'
      };
      const res = await axios.post(`${API}/reports/generate`, payload);
      setModalOpen(false);
      await fetchReports();
      viewReport(res.data.id);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = (fmt: string) => {
    if (!selectedReport) return;
    const url = `${API}/reports/${selectedReport.id}/export/${fmt}`;
    window.open(url, '_blank');
  };

  // ─── Submit to Administrator Handler ──────────────────────────────────────
  const isAlreadySubmitted = selectedReport?.status === 'Submitted to Administrator';

  const handleSubmitToAdmin = () => {
    if (!selectedReport) return;
    setSubmitModalOpen(true);
  };

  const confirmSubmitToAdmin = async () => {
    if (!selectedReport) return;
    setSubmitting(true);
    try {
      const submitterName = currentUser?.full_name || 'Project Manager';
      const res = await axios.put(`${API}/reports/${selectedReport.id}/submit`, {
        submitted_by: submitterName
      });

      // Update the selected report in state with submission info
      const updatedReport = {
        ...selectedReport,
        status: res.data.status,
        submitted_by: res.data.submitted_by,
        submitted_at: res.data.submitted_at,
      };
      setSelectedReport(updatedReport);

      // Also update in the reports list
      setReports(prev => prev.map(r =>
        r.id === selectedReport.id
          ? { ...r, status: res.data.status, submitted_by: res.data.submitted_by, submitted_at: res.data.submitted_at }
          : r
      ));

      setSubmitModalOpen(false);
      setToast({ message: 'Report submitted to Administrator successfully.', type: 'success' });
    } catch (err: any) {
      setSubmitModalOpen(false);
      if (err?.response?.status === 400) {
        setToast({ message: 'This report has already been submitted to Administrator.', type: 'error' });
      } else {
        setToast({ message: 'Failed to submit report. Please try again.', type: 'error' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const dismissToast = useCallback(() => setToast(null), []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={dismissToast} />}

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Generated Reports</h1>
          <p className="text-sm text-gray-500">
            Synthesize and download comprehensive mining intelligence and subsidiary review reports.
          </p>
        </div>
        {/* Action Buttons */}
        {currentUser?.role !== 'Administrator' && (
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {/* Submit to Administrator Button */}
            {selectedReport && (
              isAlreadySubmitted ? (
                <button
                  disabled
                  className="flex items-center px-4 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium rounded-lg text-sm cursor-not-allowed opacity-80 shadow-sm"
                >
                  <CheckCircle size={16} className="mr-1.5" />
                  Submitted to Administrator
                </button>
              ) : (
                <button
                  onClick={handleSubmitToAdmin}
                  className="flex items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition shadow-sm"
                >
                  <Send size={16} className="mr-1.5" />
                  Submit to Administrator
                </button>
              )
            )}
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg text-sm transition shadow-sm"
            >
              <Plus size={16} className="mr-1.5" />
              Generate New Report
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center p-16">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Report List */}
          <div className="lg:col-span-5 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[750px]">
            <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Available Reports</span>
              <span className="text-xs bg-blue-100 text-blue-800 font-medium px-2 py-0.5 rounded-full">
                {reports.length} Total
              </span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {reports.map((r) => {
                const isSelected = selectedReport?.id === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => viewReport(r.id)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition flex items-start justify-between ${
                      isSelected ? 'bg-blue-50/70 border-l-4 border-blue-600' : ''
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-semibold">
                          {r.report_id}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">FY {r.year}</span>
                        {r.status === 'Submitted to Administrator' && (
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-medium">
                            Submitted
                          </span>
                        )}
                      </div>
                      <h3 className={`text-sm font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                        {r.title}
                      </h3>
                      <div className="flex items-center text-xs text-gray-500 space-x-3">
                        <span className="flex items-center">
                          <Building2 size={12} className="mr-1 text-gray-400" />
                          {r.subsidiary}
                        </span>
                        <span>•</span>
                        <span>{r.source_count} sources</span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-400 mt-2" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Report Viewer / Details */}
          <div className="lg:col-span-7">
            {selectedReport ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-[750px] overflow-y-auto">
                {/* Header info */}
                <div className="border-b border-gray-200 pb-5 mb-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                          selectedReport.status === 'Submitted to Administrator'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {selectedReport.status}
                        </span>
                        <span className="text-xs text-gray-500 font-mono">
                          {selectedReport.report_id}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedReport.title}</h2>
                      <p className="text-xs text-gray-500 mt-1">
                        Author: {selectedReport.created_by} • Created: {new Date(selectedReport.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Export Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleExport('pdf')}
                        className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded text-xs font-semibold flex items-center transition"
                      >
                        <Download size={13} className="mr-1" /> PDF
                      </button>
                      <button
                        onClick={() => handleExport('docx')}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded text-xs font-semibold flex items-center transition"
                      >
                        <Download size={13} className="mr-1" /> DOCX
                      </button>
                      <button
                        onClick={() => handleExport('csv')}
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded text-xs font-semibold flex items-center transition"
                      >
                        <Download size={13} className="mr-1" /> CSV
                      </button>
                      <button
                        onClick={() => handleExport('json')}
                        className="px-3 py-1.5 bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 rounded text-xs font-semibold flex items-center transition"
                      >
                        <Download size={13} className="mr-1" /> JSON
                      </button>
                    </div>
                  </div>

                  {/* Submission Info Banner — shown after submission */}
                  {selectedReport.status === 'Submitted to Administrator' && (
                    <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex items-center text-emerald-700">
                        <CheckCircle size={18} className="mr-2 shrink-0" />
                        <span className="font-semibold text-sm">Submitted to Administrator</span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-emerald-800 sm:ml-auto">
                        <span className="flex items-center">
                          <User size={12} className="mr-1" />
                          <b>Submitted by:</b>&nbsp;{selectedReport.submitted_by || 'Project Manager'}
                        </span>
                        {selectedReport.submitted_at && (
                          <span className="flex items-center">
                            <Clock size={12} className="mr-1" />
                            <b>On:</b>&nbsp;{new Date(selectedReport.submitted_at).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Report Content Body */}
                <div className="space-y-6 flex-1 text-sm text-gray-700">
                  {/* Executive Summary */}
                  {selectedReport.content?.executive_summary && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-1">Executive Summary</h3>
                      <p className="text-gray-600 leading-relaxed">
                        {selectedReport.content.executive_summary}
                      </p>
                    </div>
                  )}

                  {/* Production Stats Summary */}
                  {selectedReport.content?.production && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                        <span className="text-xs text-blue-600 font-medium">Actual Production</span>
                        <p className="text-xl font-bold text-gray-900 mt-1">
                          {selectedReport.content.production.actual} <span className="text-xs font-normal">MT</span>
                        </p>
                      </div>
                      <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                        <span className="text-xs text-blue-600 font-medium">Target</span>
                        <p className="text-xl font-bold text-gray-900 mt-1">
                          {selectedReport.content.production.target} <span className="text-xs font-normal">MT</span>
                        </p>
                      </div>
                      <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg">
                        <span className="text-xs text-emerald-700 font-medium">Achievement</span>
                        <p className="text-xl font-bold text-emerald-800 mt-1">
                          {selectedReport.content.production.achievement}%
                        </p>
                      </div>
                      <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-lg">
                        <span className="text-xs text-purple-700 font-medium">Dispatch</span>
                        <p className="text-xl font-bold text-gray-900 mt-1">
                          {selectedReport.content.production.dispatch} <span className="text-xs font-normal">MT</span>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Report Sections */}
                  {selectedReport.content?.sections && (
                    <div className="space-y-4">
                      {selectedReport.content.sections.map((sec: any, idx: number) => (
                        <div key={idx} className="border-b border-gray-100 pb-3">
                          <h4 className="font-semibold text-gray-900 mb-1">{sec.title}</h4>
                          <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                            {sec.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Referenced Sources */}
                  {selectedReport.content?.sources && selectedReport.content.sources.length > 0 && (
                    <div className="pt-2">
                      <h4 className="font-semibold text-gray-800 text-xs uppercase tracking-wider mb-2">
                        Referenced Documents & Data Sources ({selectedReport.content.sources.length})
                      </h4>
                      <div className="space-y-2">
                        {selectedReport.content.sources.map((src: any, i: number) => (
                          <div key={i} className="flex items-center text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
                            <FileText size={14} className="text-blue-600 mr-2 shrink-0" />
                            <span className="font-medium text-gray-800">{src.document}</span>
                            <span className="mx-2 text-gray-300">|</span>
                            <span className="font-mono text-gray-500">{src.doc_id}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-500">
                Select a report to view details and export options.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Generate Report Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Generate New Report</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Report Type
                </label>
                <select
                  value={formData.report_type}
                  onChange={(e) => setFormData({ ...formData, report_type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-600"
                >
                  <option value="Production Report">Production Report</option>
                  <option value="Target Achievement Report">Target Achievement Report</option>
                  <option value="Subsidiary Annual Review">Subsidiary Annual Review</option>
                  <option value="Safety & Environment Audit">Safety & Environment Audit</option>
                  <option value="Executive Summary Brief">Executive Summary Brief</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Subsidiary
                </label>
                <select
                  value={formData.subsidiary}
                  onChange={(e) => setFormData({ ...formData, subsidiary: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-600"
                >
                  {['MCL', 'WCL', 'NCL', 'SECL', 'CCL', 'BCCL', 'ECL'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Financial Year
                </label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-600"
                >
                  {[2025, 2024, 2023, 2022, 2021, 2020].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Mine Focus (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bharatpur OCP, Dipka OC..."
                  value={formData.mine}
                  onChange={(e) => setFormData({ ...formData, mine: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="px-5 py-2 text-sm bg-blue-700 hover:bg-blue-800 text-white rounded-md font-semibold transition disabled:opacity-50"
                >
                  {generating ? 'Compiling Report...' : 'Generate Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit to Administrator Confirmation Modal */}
      {submitModalOpen && selectedReport && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 max-w-md w-full p-6">
            {/* Modal Header */}
            <div className="flex items-center mb-5">
              <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                <Send size={20} className="text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Submit this report to Administrator?</h3>
              </div>
              <button
                onClick={() => setSubmitModalOpen(false)}
                className="ml-auto text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Report name */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-5">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-mono text-xs text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-semibold">
                  {selectedReport.report_id}
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-900">{selectedReport.title}</p>
              <p className="text-xs text-gray-500 mt-1">
                {selectedReport.subsidiary} • FY {selectedReport.year} • {selectedReport.source_count} sources
              </p>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              This report will be sent to the Administrator for review, approval, or revision. This action cannot be undone.
            </p>

            {/* Workflow info */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mb-6">
              <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded font-semibold">Project Manager</span>
              <span>→</span>
              <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded font-semibold">Administrator</span>
              <span>→</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded font-medium">Review / Approve</span>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSubmitModalOpen(false)}
                disabled={submitting}
                className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmSubmitToAdmin}
                disabled={submitting}
                className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition disabled:opacity-50 flex items-center"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={15} className="mr-1.5" />
                    Submit
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
