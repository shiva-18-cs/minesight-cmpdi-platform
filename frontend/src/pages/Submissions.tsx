import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  FileText, CheckCircle, Clock, Eye, AlertCircle, ScanLine, Building2,
  Search, Filter, Send, ShieldCheck, X, Download, MessageSquare,
  Sparkles, CheckCircle2, ChevronRight, BarChart3, Layers
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface DocumentRecord {
  id: number;
  doc_id: string;
  name: string;
  doc_type: string;
  year: number;
  subsidiary: string;
  mine: string;
  department: string;
  upload_date: string;
  uploaded_by: string;
  status: string;
  reading_accuracy: number | null;
  pages: number | null;
  file_type: string;
  verification_status: string | null;
  data_provenance: string | null;
  is_official_raw_download: boolean;
}

const Submissions: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const isSupervisor = currentUser?.role === 'Supervisor';
  const isPM = currentUser?.role === 'Project Manager';
  const isAdmin = currentUser?.role === 'Administrator';

  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected document for full verification workflow
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [docDetails, setDocDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [selectedPage, setSelectedPage] = useState<number>(1);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // PM Query modal state from review
  const [queryModalOpen, setQueryModalOpen] = useState(false);
  const [queryText, setQueryText] = useState('');
  const [submittingQuery, setSubmittingQuery] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/documents`);
      setDocuments(res.data);
    } catch (err) {
      console.error('Error fetching submissions', err);
    } finally {
      setLoading(false);
    }
  };

  // Open inspection details
  const handleOpenReview = async (doc: DocumentRecord) => {
    setSelectedDoc(doc);
    setLoadingDetails(true);
    setSelectedPage(1);
    try {
      const res = await axios.get(`${API}/documents/${doc.id}`);
      setDocDetails(res.data);
    } catch (err) {
      console.error('Error fetching document details', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Auto-open if query param or state passed
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const targetDocId = params.get('review') || (location.state as any)?.reviewDocId;
    if (targetDocId && documents.length > 0) {
      const match = documents.find(d => d.doc_id === targetDocId || String(d.id) === targetDocId);
      if (match) {
        handleOpenReview(match);
      }
    }
  }, [location.search, location.state, documents]);

  // Supervisor submits document to PM
  const handleSubmitToPM = async (docId: number) => {
    if (!window.confirm('Submit this document to Project Manager for verification?')) return;
    try {
      const res = await axios.put(`${API}/documents/${docId}/submit`);
      setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: res.data.status } : d));
      if (selectedDoc?.id === docId) {
        setSelectedDoc((prev: any) => ({ ...prev, status: res.data.status }));
      }
      setActionMessage('Document submitted to Project Manager successfully.');
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err) {
      alert('Error submitting document to Project Manager.');
    }
  };

  // PM validates document
  const handleValidateDocument = async (docId: number) => {
    try {
      const res = await axios.put(`${API}/documents/${docId}/validate`);
      setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: res.data.status } : d));
      if (selectedDoc?.id === docId) {
        setSelectedDoc((prev: any) => ({ ...prev, status: res.data.status }));
      }
      setActionMessage('Document data validated successfully.');
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err) {
      alert('Error validating document.');
    }
  };

  // PM raises query to Supervisor
  const handleRaiseQuery = async () => {
    if (!queryText.trim() || !selectedDoc) return;
    setSubmittingQuery(true);
    try {
      await axios.post(
        `${API}/queries/supervisor`,
        {
          query: queryText,
          document_id: selectedDoc.id,
          document_name: selectedDoc.name,
          raised_by: currentUser?.full_name || 'Project Manager',
          raised_by_role: 'Project Manager'
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      setQueryModalOpen(false);
      setQueryText('');
      setActionMessage('Clarification query sent to Supervisor.');
      setTimeout(() => setActionMessage(null), 4000);
    } catch {
      alert('Failed to raise query.');
    } finally {
      setSubmittingQuery(false);
    }
  };

  // Filtered documents list
  const filteredSubmissions = useMemo(() => {
    return documents.filter(doc => {
      // Role-specific relevance:
      // If PM, show all submissions in pipeline (Submitted to PM, Validated, Under Validation, etc.)
      if (filterStatus === 'pending') {
        if (!['Submitted to Project Manager', 'Under Validation', 'Processed'].includes(doc.status)) {
          return false;
        }
      } else if (filterStatus === 'validated') {
        if (doc.status !== 'Validated') return false;
      } else if (filterStatus === 'submitted') {
        if (doc.status !== 'Submitted to Project Manager') return false;
      }

      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const match =
          doc.name.toLowerCase().includes(q) ||
          doc.doc_id.toLowerCase().includes(q) ||
          doc.subsidiary.toLowerCase().includes(q) ||
          (doc.mine && doc.mine.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    });
  }, [documents, filterStatus, searchTerm]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 w-full">
      {/* Action Notification Banner */}
      {actionMessage && (
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800 font-medium shadow-sm animate-fade-in-up">
          <CheckCircle size={18} className="shrink-0 text-emerald-600" />
          {actionMessage}
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isPM ? 'Incoming Submissions & Verification' : 'Document Submissions'}
          </h1>
          <p className="text-sm text-gray-500">
            {isPM
              ? 'Review incoming submissions from Supervisors, verify OCR extracted facts, and reconcile evidence.'
              : 'Track document submissions, monitor OCR accuracy, and submit records to the Project Manager.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isSupervisor && (
            <button
              onClick={() => navigate('/documents')}
              className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg text-sm shadow-xs transition cursor-pointer flex items-center gap-2"
            >
              <Send size={15} /> Upload &amp; Submit Document
            </button>
          )}
          {isPM && (
            <button
              onClick={() => navigate('/check-data')}
              className="px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg text-sm shadow-xs transition cursor-pointer flex items-center gap-2"
            >
              <CheckCircle size={15} className="text-blue-600" /> Validate Data
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, ID, or subsidiary..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Filter size={15} />
            <span className="font-medium">Filter:</span>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="py-2 px-3 border border-gray-300 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">All Submissions ({documents.length})</option>
            <option value="pending">Awaiting Review / Validation</option>
            <option value="submitted">Submitted to Project Manager</option>
            <option value="validated">Validated</option>
          </select>

          <span className="text-xs text-gray-500 font-medium">
            {filteredSubmissions.length} of {documents.length} submissions
          </span>
        </div>
      </div>

      {/* Submissions Table */}
      {loading ? (
        <div className="p-16 flex justify-center bg-white rounded-xl border border-gray-200">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Document Name &amp; ID</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Submission Date</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">OCR Status</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">OCR Confidence</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Extraction Status</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Verification Status</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Workflow Status</th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.03)] z-10">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      <div className="max-w-sm mx-auto text-center space-y-2">
                        <CheckCircle size={36} className="mx-auto text-emerald-400" />
                        <p className="font-semibold text-gray-800">No pending submissions</p>
                        <p className="text-xs text-gray-400">All submissions are current and up-to-date.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((doc) => {
                    const ocrState = doc.reading_accuracy || doc.status === 'Processed' || doc.status === 'Validated'
                      ? 'OCR Processed'
                      : doc.status === 'Pending'
                      ? 'OCR Pending'
                      : 'OCR Processed';

                    const verifStatus = doc.verification_status || (doc.status === 'Validated' ? 'Validated' : 'Pending Verification');

                    return (
                      <tr key={doc.id} className="group hover:bg-gray-50 transition">
                        {/* Document Name & ID */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg shrink-0">
                              <FileText size={18} />
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-xs" title={doc.name}>
                                {doc.name}
                              </div>
                              <div className="text-xs text-gray-400 font-mono">
                                {doc.doc_id} • {doc.subsidiary} • FY {doc.year}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Submission Date */}
                        <td className="px-4 py-3.5 text-xs text-gray-600 whitespace-nowrap">
                          {doc.upload_date ? new Date(doc.upload_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </td>

                        {/* OCR Status */}
                        <td className="px-4 py-3.5 text-xs whitespace-nowrap">
                          <span className={`px-2.5 py-1 inline-flex items-center text-xs font-semibold rounded-full border ${
                            ocrState === 'OCR Processed'
                              ? 'bg-cyan-50 text-cyan-800 border-cyan-200'
                              : ocrState === 'OCR Pending'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-red-50 text-red-800 border-red-200'
                          }`}>
                            <ScanLine size={12} className="mr-1 text-cyan-600" />
                            {ocrState}
                          </span>
                        </td>

                        {/* OCR Confidence */}
                        <td className="px-4 py-3.5 text-xs font-mono whitespace-nowrap">
                          {doc.reading_accuracy !== null && doc.reading_accuracy !== undefined ? (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded border border-emerald-200">
                              OCR Confidence: {doc.reading_accuracy}%
                            </span>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>

                        {/* Extraction Status */}
                        <td className="px-4 py-3.5 text-xs text-gray-700 whitespace-nowrap">
                          <span className="inline-flex items-center text-xs text-purple-700 font-medium">
                            <Sparkles size={12} className="mr-1 text-purple-600" />
                            {doc.pages ? `${doc.pages} pages extracted` : 'Facts Extracted'}
                          </span>
                        </td>

                        {/* Verification Status */}
                        <td className="px-4 py-3.5 text-xs whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            verifStatus === 'Validated'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {verifStatus}
                          </span>
                        </td>

                        {/* Workflow Status */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="px-2.5 py-0.5 inline-flex text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {doc.status}
                          </span>
                        </td>

                        {/* Actions — Sticky right, fully visible */}
                        <td className="px-4 py-3.5 whitespace-nowrap text-right sticky right-0 bg-white group-hover:bg-gray-50 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.03)] z-10">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Review Button */}
                            <button
                              id={`submission-review-${doc.doc_id}`}
                              onClick={() => handleOpenReview(doc)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer inline-flex items-center gap-1 shadow-xs"
                              title={`Review ${doc.doc_id}`}
                            >
                              <Eye size={13} /> Review
                            </button>

                            {/* Supervisor Submit button */}
                            {isSupervisor && doc.status === 'Processed' && (
                              <button
                                onClick={() => handleSubmitToPM(doc.id)}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer inline-flex items-center gap-1"
                                title="Submit to Project Manager"
                              >
                                <Send size={12} /> Submit
                              </button>
                            )}

                            {/* PM Quick Validate */}
                            {isPM && doc.status === 'Submitted to Project Manager' && (
                              <button
                                onClick={() => handleValidateDocument(doc.id)}
                                className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-semibold transition cursor-pointer inline-flex items-center gap-1"
                                title="Mark Validated"
                              >
                                <CheckCircle size={13} /> Validate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── FULL SUBMISSION VERIFICATION MODAL / DRAWER ──────────────── */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Verification Review: {selectedDoc.doc_id}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {selectedDoc.subsidiary} • FY {selectedDoc.year} • {selectedDoc.doc_type}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setSelectedDoc(null); setDocDetails(null); }}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Document Overview Strip */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{selectedDoc.name}</h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 mt-1">
                    <span>Uploaded by: <b className="text-gray-800">{selectedDoc.uploaded_by || 'Supervisor'}</b></span>
                    <span>•</span>
                    <span>Upload Date: <b className="text-gray-800">{selectedDoc.upload_date ? new Date(selectedDoc.upload_date).toLocaleDateString() : 'N/A'}</b></span>
                    <span>•</span>
                    <span>Status: <b className="text-blue-700">{selectedDoc.status}</b></span>
                  </div>
                </div>

                {/* OCR & Confidence Badge */}
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-cyan-50 text-cyan-800 border border-cyan-200 rounded-lg text-xs font-bold flex items-center gap-1.5">
                    <ScanLine size={14} className="text-cyan-600" />
                    OCR Processed
                  </span>
                  {selectedDoc.reading_accuracy !== null && (
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold font-mono">
                      OCR Confidence: {selectedDoc.reading_accuracy}%
                    </span>
                  )}
                </div>
              </div>

              {loadingDetails ? (
                <div className="py-12 flex justify-center">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                </div>
              ) : docDetails ? (
                <div className="space-y-6">
                  {/* Extracted Information Table */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Sparkles size={16} className="text-purple-600" /> Extracted Facts &amp; Values
                      </span>
                      <span className="text-xs font-normal text-gray-500">
                        {docDetails.extracted_information?.length || 0} fields identified
                      </span>
                    </h4>
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200 text-xs">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2.5 text-left font-semibold text-gray-500">Field</th>
                            <th className="px-4 py-2.5 text-left font-semibold text-gray-500">Value</th>
                            <th className="px-4 py-2.5 text-left font-semibold text-gray-500">Unit</th>
                            <th className="px-4 py-2.5 text-left font-semibold text-gray-500">Source Reference</th>
                            <th className="px-4 py-2.5 text-left font-semibold text-gray-500">Integrity</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {docDetails.extracted_information?.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-4 py-4 text-center text-gray-400">
                                No structured fields extracted yet.
                              </td>
                            </tr>
                          ) : (
                            docDetails.extracted_information?.map((info: any) => (
                              <tr key={info.id} className="hover:bg-gray-50">
                                <td className="px-4 py-2 font-medium text-gray-900">{info.field}</td>
                                <td className="px-4 py-2 font-bold font-mono text-gray-900">{info.value}</td>
                                <td className="px-4 py-2 text-gray-500">{info.unit}</td>
                                <td className="px-4 py-2 text-gray-500">{info.source_page || 'Page 1'}</td>
                                <td className="px-4 py-2">
                                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-semibold rounded text-[11px]">
                                    ✓ Verified
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* OCR Source Text Viewer */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                        <FileText size={16} className="text-blue-600" />
                        OCR Document Text &amp; Source Evidence
                      </h4>
                      {docDetails.document_text?.length > 1 && (
                        <div className="flex items-center gap-1">
                          {docDetails.document_text.map((t: any) => (
                            <button
                              key={t.page}
                              onClick={() => setSelectedPage(t.page)}
                              className={`px-2.5 py-1 text-xs rounded font-semibold transition cursor-pointer ${
                                selectedPage === t.page
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              Page {t.page}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="p-4 bg-slate-900 text-slate-100 font-mono text-xs rounded-xl max-h-56 overflow-y-auto leading-relaxed border border-slate-800">
                      {docDetails.document_text?.find((t: any) => t.page === selectedPage)?.text ||
                        docDetails.document_text?.[0]?.text ||
                        'No OCR text extracted for this document.'}
                    </div>
                  </div>

                  {/* Automated Sanity Checks */}
                  {docDetails.data_checks?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 mb-2">Automated Data Checks</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {docDetails.data_checks.map((chk: any) => (
                          <div key={chk.id} className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-2 text-emerald-800">
                            <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                            <span>{chk.check_type}: {chk.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-gray-500">
                Document ID: <span className="font-mono font-semibold text-gray-700">{selectedDoc.doc_id}</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Supervisor: Submit to PM */}
                {isSupervisor && selectedDoc.status === 'Processed' && (
                  <button
                    onClick={() => handleSubmitToPM(selectedDoc.id)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Send size={14} /> Submit to Project Manager
                  </button>
                )}

                {/* PM: Validate Submission */}
                {isPM && selectedDoc.status !== 'Validated' && (
                  <button
                    onClick={() => handleValidateDocument(selectedDoc.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle size={14} /> Validate Submission
                  </button>
                )}

                {/* PM: Raise clarification query to Supervisor */}
                {isPM && (
                  <button
                    onClick={() => setQueryModalOpen(true)}
                    className="px-3.5 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                  >
                    <MessageSquare size={14} className="text-amber-600" /> Raise Query
                  </button>
                )}

                {/* PM: Generate Report */}
                {isPM && selectedDoc.status === 'Validated' && (
                  <button
                    onClick={() => navigate('/reports')}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <BarChart3 size={14} /> Generate Report
                  </button>
                )}

                <button
                  onClick={() => { setSelectedDoc(null); setDocDetails(null); }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── PM QUERY MODAL ────────────────────────────────────── */}
      {queryModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <MessageSquare size={18} className="text-blue-600" />
                Request Supervisor Clarification
              </h3>
              <button onClick={() => setQueryModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-2">
                Document: <b className="text-gray-800">{selectedDoc?.name}</b> ({selectedDoc?.doc_id})
              </p>
              <textarea
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="Specify the data point, production value, or geological figure that requires verification..."
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setQueryModalOpen(false)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRaiseQuery}
                disabled={submittingQuery || !queryText.trim()}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition cursor-pointer"
              >
                {submittingQuery ? 'Sending...' : 'Send Query to Supervisor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Submissions;
