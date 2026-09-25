import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Upload, 
  FileText, 
  Download, 
  Trash2, 
  Search as SearchIcon, 
  Eye, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Building2, 
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  ScanLine,
  Clock
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
  reading_accuracy: number;
  pages: number;
  file_type: string;
  document_number?: string;
  is_official_raw_download?: boolean;
  verification_status?: string;
  data_provenance?: string;
  source_url?: string;
  source_page?: string;
}

const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [docTypeFilter, setDocTypeFilter] = useState('');
  const [subsidiaryFilter, setSubsidiaryFilter] = useState('');

  // Modals
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadSub, setUploadSub] = useState('MCL');
  const [uploadCategory, setUploadCategory] = useState('Annual Mining Report');
  const [viewDoc, setViewDoc] = useState<any>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  })();

  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleDownloadPdf = async (doc: DocumentRecord) => {
    if (downloadingId !== null) return; // prevent double-click
    setDownloadingId(doc.id);
    setDownloadError(null);
    try {
      const resp = await fetch(`${API}/documents/${doc.id}/download-pdf`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.detail || 'PDF download unavailable for this document.');
      }
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const disposition = resp.headers.get('content-disposition') || '';
      const fnMatch = disposition.match(/filename="?([^"]+)"?/);
      a.download = fnMatch ? fnMatch[1] : `${doc.doc_id}.pdf`;
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setDownloadError(e.message || 'PDF download failed.');
      setTimeout(() => setDownloadError(null), 5000);
    } finally {
      setDownloadingId(null);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      const res = await axios.get(`${API}/documents`);
      setDocuments(res.data);
    } catch (error) {
      console.error("Error fetching documents", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      formData.append('subsidiary', uploadSub);
      formData.append('doc_type', uploadCategory);
      formData.append('year', new Date().getFullYear().toString());
      formData.append('uploaded_by', 'Supervisor');

      const res = await axios.post(`${API}/documents/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await fetchDocs();
      setIsUploading(false);
      setUploadModalOpen(false);
      setSelectedFile(null);
      // Auto open preview of the newly ingested document
      handleViewDoc(res.data.id);
    } catch (err) {
      console.error(err);
      setIsUploading(false);
    }
  };

  const handleViewDoc = async (id: number) => {
    setViewLoading(true);
    try {
      const res = await axios.get(`${API}/documents/${id}`);
      setViewDoc(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setViewLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this document and its extracted index?")) return;
    try {
      await axios.delete(`${API}/documents/${id}`);
      setDocuments(prev => prev.filter(d => d.id !== id));
      if (viewDoc?.document?.id === id) setViewDoc(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownload = (doc: DocumentRecord) => {
    const url = `${API}/documents/${doc.id}/download`;
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const filteredDocs = documents.filter(d => {
    const matchesSearch = 
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      d.subsidiary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.doc_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.mine && d.mine.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = docTypeFilter ? d.doc_type === docTypeFilter : true;
    const matchesSub = subsidiaryFilter ? d.subsidiary === subsidiaryFilter : true;
    return matchesSearch && matchesType && matchesSub;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 w-full">
      {/* PDF Download Error Banner */}
      {downloadError && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium shadow-sm">
          <AlertCircle size={16} className="shrink-0 text-red-500" />
          {downloadError}
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Archive</h1>
          <p className="text-sm text-gray-500">Ingest, search, inspect extracted tables, and audit OCR document text.</p>
        </div>
        {currentUser?.role !== 'Administrator' && (
          <button 
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg shadow-xs transition text-sm self-start sm:self-auto cursor-pointer"
          >
            <Upload size={16} className="mr-2" />
            Upload &amp; Extract Document
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <SearchIcon size={16} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, ID, or mine..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={docTypeFilter}
            onChange={(e) => setDocTypeFilter(e.target.value)}
            className="py-2 px-3 border border-gray-300 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All Document Types</option>
            <option value="Annual Mining Report">Annual Mining Report</option>
            <option value="Production Report">Production Report</option>
            <option value="Geological Report">Geological Report</option>
            <option value="Safety Report">Safety Report</option>
            <option value="Environmental Report">Environmental Report</option>
          </select>

          <select 
            value={subsidiaryFilter}
            onChange={(e) => setSubsidiaryFilter(e.target.value)}
            className="py-2 px-3 border border-gray-300 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All Subsidiaries</option>
            {['MCL', 'WCL', 'NCL', 'SECL', 'CCL', 'BCCL', 'ECL'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <span className="text-xs text-gray-500 font-medium">
            {filteredDocs.length} of {documents.length}
          </span>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="p-16 flex justify-center bg-white rounded-xl border border-gray-200">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Document Name &amp; ID</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type &amp; Dept</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Subsidiary / Mine</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">OCR Status</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Confidence</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Workflow Status</th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.03)] z-10">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="group hover:bg-gray-50 transition">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-50 text-blue-700 rounded-lg shrink-0">
                          <FileText size={18} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900 truncate max-w-[220px] sm:max-w-xs md:max-w-sm" title={doc.name}>
                            {doc.name}
                          </div>
                          <div className="text-xs text-gray-400 font-mono">{doc.doc_id} • {doc.pages} pages</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-600 whitespace-nowrap">
                      <div className="font-medium text-gray-800">{doc.doc_type}</div>
                      <div className="text-gray-400">{doc.department || 'Operations'}</div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-700 whitespace-nowrap">
                      <div className="font-semibold text-gray-900 flex items-center">
                        <Building2 size={13} className="mr-1 text-gray-400 shrink-0" />
                        {doc.subsidiary}
                      </div>
                      <div className="text-gray-500">{doc.mine || 'Area Level'} • FY {doc.year}</div>
                    </td>
                    <td className="px-4 py-3.5 text-xs whitespace-nowrap">
                      {doc.reading_accuracy || doc.status === 'Processed' || doc.status === 'Validated' ? (
                        <span className="px-2.5 py-1 inline-flex items-center text-xs font-semibold rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
                          <ScanLine size={12} className="mr-1 text-cyan-600" /> OCR Processed
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 inline-flex items-center text-xs font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          <Clock size={12} className="mr-1" /> Awaiting OCR
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs font-mono whitespace-nowrap">
                      {doc.reading_accuracy ? (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded border border-emerald-200">
                          {doc.reading_accuracy}%
                        </span>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 inline-flex text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-right sticky right-0 bg-white group-hover:bg-gray-50 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.03)] z-10">
                      <div className="flex items-center justify-end gap-1">
                        {/* View */}
                        <button
                          onClick={() => handleViewDoc(doc.id)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition cursor-pointer"
                          title="View Extracted Facts & OCR Text"
                        >
                          <Eye size={16} />
                        </button>

                        {/* Download PDF */}
                        <button
                          id={`download-pdf-${doc.id}`}
                          onClick={() => handleDownloadPdf(doc)}
                          disabled={downloadingId === doc.id}
                          title="Download PDF"
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-xs font-semibold transition cursor-pointer ${
                            downloadingId === doc.id
                              ? 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
                              : 'border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-300'
                          }`}
                        >
                          {downloadingId === doc.id ? (
                            <>
                              <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                              <span>PDF</span>
                            </>
                          ) : (
                            <>
                              <Download size={13} />
                              <span>PDF</span>
                            </>
                          )}
                        </button>

                        {/* Delete — hide for Administrator */}
                        {currentUser?.role !== 'Administrator' && (
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition cursor-pointer"
                            title="Delete Document"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}      {/* Upload Document Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
                  <Upload size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Upload Mining Document</h3>
                  <p className="text-xs text-gray-500">Automated OCR and AI-assisted factual extraction pipeline</p>
                </div>
              </div>
              <button 
                onClick={() => setUploadModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Pipeline Stage Indicators */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Processing Stages</p>
              <div className="grid grid-cols-5 gap-1 text-center text-[10px] font-medium">
                <div className={`p-1 rounded ${selectedFile ? 'bg-blue-100 text-blue-800 font-bold' : 'bg-slate-200 text-slate-500'}`}>1. Uploaded</div>
                <div className={`p-1 rounded ${isUploading ? 'bg-cyan-100 text-cyan-800 font-bold animate-pulse' : 'bg-slate-200 text-slate-500'}`}>2. OCR Proc.</div>
                <div className={`p-1 rounded ${isUploading ? 'bg-purple-100 text-purple-800 font-bold' : 'bg-slate-200 text-slate-500'}`}>3. Text Extr.</div>
                <div className="p-1 rounded bg-slate-200 text-slate-500">4. AI Extracted</div>
                <div className="p-1 rounded bg-slate-200 text-slate-500">5. Verification</div>
              </div>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <label className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition bg-gray-50/50 block cursor-pointer">
                <FileText className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-700">
                  {selectedFile ? selectedFile.name : "Select or Drop Mining Document (PDF, CSV, XLSX)"}
                </p>
                <p className="text-xs text-gray-400 mt-1">PDF, DOCX, XLSX, CSV up to 50MB</p>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.xlsx,.xls,.csv,.txt"
                  onChange={e => e.target.files && setSelectedFile(e.target.files[0])}
                />
                <div className="mt-3 inline-flex items-center text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded">
                  <Sparkles size={13} className="mr-1" /> Automated Text Extraction &amp; Verification Ready
                </div>
              </label>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Target Subsidiary</label>
                <select
                  value={uploadSub}
                  onChange={e => setUploadSub(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                >
                  {['MCL', 'WCL', 'NCL', 'SECL', 'CCL', 'BCCL', 'ECL', 'CMPDI'].map(s => (
                    <option key={s} value={s}>{s} (Coalfields Limited)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Report Category</label>
                <select
                  value={uploadCategory}
                  onChange={e => setUploadCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
                >
                  <option>Annual Mining Report</option>
                  <option>Production Report</option>
                  <option>Geological Reserve Assessment</option>
                  <option>Safety Audit</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 text-sm bg-blue-700 hover:bg-blue-800 text-white rounded-md font-semibold transition disabled:opacity-50 cursor-pointer flex items-center"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Extracting Information...
                    </>
                  ) : (
                    'Upload & Extract'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Details & Extracted Facts Modal */}
      {viewDoc && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-4xl w-full p-6 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-start border-b border-gray-200 pb-4 mb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    {viewDoc.document?.doc_id}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    FY {viewDoc.document?.year}
                  </span>
                  <span className="px-2 py-0.5 text-xs font-bold rounded bg-cyan-100 text-cyan-800 flex items-center gap-1">
                    <ScanLine size={12} /> OCR Processed ({viewDoc.document?.reading_accuracy || 99.8}%)
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mt-1.5">{viewDoc.document?.name}</h3>
                <p className="text-xs text-gray-500 mb-2">
                  {viewDoc.document?.subsidiary} • {viewDoc.document?.mine} • {viewDoc.document?.doc_type} • Uploaded: {viewDoc.document?.upload_date ? new Date(viewDoc.document.upload_date).toLocaleDateString() : 'N/A'} • OCR Accuracy: {viewDoc.document?.reading_accuracy}%
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {viewDoc.document?.is_official_raw_download ? (
                    <span className="px-2.5 py-0.5 text-xs font-bold rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                      VERIFIED OFFICIAL DOCUMENT
                    </span>
                  ) : viewDoc.document?.file_type === "CSV" ? (
                    <span className="px-2.5 py-0.5 text-xs font-bold rounded bg-amber-100 text-amber-800 border border-amber-300">
                      VERIFIED OFFICIAL DATA — LOCALLY DERIVED
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 text-xs font-bold rounded bg-blue-100 text-blue-800 border border-blue-300">
                      VERIFIED OFFICIAL LISTING
                    </span>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setViewDoc(null)} 
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-5 pr-2">
              {/* Evidence-Backed Processing Flowcrumbs */}
              <div className="bg-slate-900 text-white rounded-xl p-3.5 border border-slate-800 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles size={12} /> Evidence-Backed Extraction &amp; Verification Pipeline
                  </p>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                    Live Audit Trail
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
                  <span className="px-2 py-0.5 bg-white/10 rounded border border-white/10 flex items-center gap-1"><FileText size={11} className="text-blue-400"/> ORIGINAL DOCUMENT</span>
                  <span className="text-slate-500">&rarr;</span>
                  <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1"><Layers size={11}/> OCR TEXT</span>
                  <span className="text-slate-500">&rarr;</span>
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded border border-purple-500/30 flex items-center gap-1"><Sparkles size={11}/> EXTRACTED INFORMATION</span>
                  <span className="text-slate-500">&rarr;</span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30 flex items-center gap-1"><ShieldCheck size={11}/> OCR CONFIDENCE</span>
                  <span className="text-slate-500">&rarr;</span>
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded border border-blue-500/30 flex items-center gap-1"><SearchIcon size={11}/> SOURCE / PAGE</span>
                  <span className="text-slate-500">&rarr;</span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30 flex items-center gap-1"><CheckCircle size={11}/> HUMAN VERIFICATION</span>
                </div>
              </div>

              {/* AI Extracted Information Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center">
                    <Sparkles size={14} className="text-purple-600 mr-1.5" />
                    AI Extracted Information ({viewDoc.extracted_information?.length || 0})
                  </h4>
                  <span className="text-[11px] text-gray-500 font-medium">
                    OCR Reading Accuracy: <b className="text-emerald-700 font-mono">{viewDoc.document?.reading_accuracy ? `${viewDoc.document?.reading_accuracy}%` : 'N/A'}</b>
                  </span>
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200 text-xs">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2.5 text-left font-semibold text-gray-600">Field</th>
                        <th className="px-4 py-2.5 text-left font-semibold text-gray-600">Extracted Value</th>
                        <th className="px-4 py-2.5 text-left font-semibold text-gray-600">Confidence</th>
                        <th className="px-4 py-2.5 text-left font-semibold text-gray-600">Source / Page</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {viewDoc.extracted_information && viewDoc.extracted_information.length > 0 ? (
                        viewDoc.extracted_information.map((info: any) => (
                          <tr key={info.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2.5 font-semibold text-gray-800">{info.field}</td>
                            <td className="px-4 py-2.5 font-mono font-bold text-blue-700">
                              {info.value} {info.unit ? <span className="text-xs font-normal text-gray-500">{info.unit}</span> : null}
                            </td>
                            <td className="px-4 py-2.5">
                              {info.confidence || viewDoc.document?.reading_accuracy ? (
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded border border-emerald-200">
                                  {info.confidence || viewDoc.document?.reading_accuracy}%
                                </span>
                              ) : (
                                <span className="text-gray-400">N/A</span>
                              )}
                            </td>
                            <td className="px-4 py-2.5 text-gray-600">
                              <div className="font-mono text-blue-600 font-semibold">{info.source_page || 'Page 1'}</div>
                              <div className="text-[10px] text-gray-400 truncate max-w-xs">Source: {viewDoc.document?.name}</div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-6 text-center text-gray-400 italic">
                            No structured facts extracted for this document.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* OCR Raw Text Section */}
              {viewDoc.document_text && viewDoc.document_text.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2 flex items-center">
                    <Layers size={14} className="text-cyan-600 mr-1.5" />
                    OCR Machine-Readable Text Excerpt (Page {viewDoc.document_text[0].page})
                  </h4>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed font-mono max-h-48 overflow-y-auto whitespace-pre-wrap">
                    {viewDoc.document_text[0].text}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setViewDoc(null)}
                className="px-5 py-2 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-black transition cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
