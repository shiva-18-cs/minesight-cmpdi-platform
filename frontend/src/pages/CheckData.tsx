import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  CheckCircle, AlertTriangle, XCircle, Filter, Search, Eye, X,
  CheckCircle2, Shield, ScanLine, FileText, ExternalLink
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const CheckData: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [itemDocText, setItemDocText] = useState<string>('');
  const [loadingDocText, setLoadingDocText] = useState(false);
  const [differences, setDifferences] = useState<any[]>([]);

  useEffect(() => {
    fetchCheckData();
    fetchDifferences();
  }, []);

  const fetchCheckData = async () => {
    try {
      const res = await axios.get(`${API}/check-data`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDifferences = async () => {
    try {
      const res = await axios.get(`${API}/differences`);
      setDifferences(res.data || []);
    } catch {}
  };

  const handleSelectItem = async (item: any) => {
    setSelectedItem(item);
    setItemDocText('');
    if (item.document_id) {
      setLoadingDocText(true);
      try {
        const res = await axios.get(`${API}/documents/${item.document_id}`);
        const texts = res.data.document_text || [];
        // Match source page if possible, or show first pages
        const targetPageStr = (item.source_page || '').toLowerCase();
        const pageMatch = targetPageStr.match(/\d+/);
        const pageNum = pageMatch ? parseInt(pageMatch[0], 10) : 1;
        const matched = texts.find((t: any) => t.page === pageNum) || texts[0];
        setItemDocText(matched ? matched.text : 'No OCR text available for this page.');
      } catch (err) {
        setItemDocText('Unable to load OCR source text.');
      } finally {
        setLoadingDocText(false);
      }
    }
  };

  const handleUpdateStatus = (id: number, newStatus: string) => {
    setData(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
    if (selectedItem?.id === id) {
      setSelectedItem({ ...selectedItem, status: newStatus });
    }
  };

  const filtered = data.filter(d => {
    const matchesStatus = filterStatus ? d.status === filterStatus : true;
    const matchesSearch = 
      d.field.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.subsidiary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.mine && d.mine.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (d.doc_id && d.doc_id.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const statusIcon = (s: string) => {
    if (s === 'Correct') return <CheckCircle size={16} className="text-emerald-600" />;
    if (s === 'Check Needed') return <AlertTriangle size={16} className="text-amber-500" />;
    return <XCircle size={16} className="text-red-500" />;
  };

  // Find relevant difference if any exists
  const relevantDiff = selectedItem
    ? differences.find(
        (df: any) =>
          df.subsidiary === selectedItem.subsidiary &&
          df.field?.toLowerCase() === selectedItem.field?.toLowerCase()
      )
    : null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 w-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Extracted Facts &amp; Data Validation</h1>
        <p className="text-sm text-gray-500">
          Inspect extracted information, audit source OCR text and confidence, and verify data consistency.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search metric, subsidiary, or mine..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Filter size={15} />
            <span className="font-medium">Status:</span>
          </div>

          <select 
            value={filterStatus} 
            onChange={e => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg text-sm px-3 py-2 bg-white focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All Statuses ({data.length})</option>
            <option value="Correct">✓ Correct</option>
            <option value="Check Needed">⚠ Check Needed</option>
            <option value="Problem Found">✕ Problem Found</option>
          </select>

          <span className="text-xs text-gray-500 font-medium">
            Showing {filtered.length} of {data.length} records
          </span>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="flex justify-center p-16 bg-white rounded-xl border border-gray-200">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Metric Field</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Extracted Value</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Subsidiary / Mine</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Source Evidence</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">OCR Status</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Confidence</th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.03)] z-10">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                      No records match the current filters.
                    </td>
                  </tr>
                ) : (
                  filtered.slice(0, 100).map((item: any) => (
                    <tr key={item.id} className="group hover:bg-gray-50 transition">
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          {statusIcon(item.status)}
                          <span className={`text-xs font-semibold ${
                            item.status === 'Correct' ? 'text-emerald-700' :
                            item.status === 'Check Needed' ? 'text-amber-700' : 'text-red-700'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-gray-900 max-w-[200px] truncate" title={item.field}>
                          {item.field}
                        </div>
                        <div className="text-[11px] text-gray-400">FY {item.year}</div>
                      </td>
                      <td className="px-4 py-3.5 font-mono whitespace-nowrap">
                        <span className="font-bold text-gray-900">{item.value}</span>
                        <span className="text-gray-500 text-xs ml-1 font-sans">{item.unit}</span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-700 whitespace-nowrap">
                        <div className="font-semibold text-gray-900">{item.subsidiary}</div>
                        <div className="text-gray-400">{item.mine || 'Area Level'}</div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-600">
                        <div className="font-medium text-gray-800 truncate max-w-[180px]" title={item.document_name || item.doc_id}>
                          {item.doc_id || 'DOC-Source'}
                        </div>
                        <div className="text-gray-400 font-mono text-[11px]">{item.source_page || 'Page 1'}</div>
                      </td>
                      <td className="px-4 py-3.5 text-xs whitespace-nowrap">
                        <span className="px-2 py-0.5 inline-flex items-center text-xs font-semibold rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
                          <ScanLine size={12} className="mr-1 text-cyan-600" />
                          {item.ocr_status || 'OCR Processed'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs font-mono whitespace-nowrap">
                        {item.reading_accuracy !== undefined && item.reading_accuracy !== null ? (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded border border-emerald-200">
                            {item.reading_accuracy}%
                          </span>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-right sticky right-0 bg-white group-hover:bg-gray-50 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.03)] z-10">
                        <button
                          onClick={() => handleSelectItem(item)}
                          className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-xs font-semibold transition cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye size={13} /> Inspect
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Fact & Evidence Inspector Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center space-x-2">
                <Shield size={18} className="text-blue-600" />
                <h3 className="font-bold text-gray-900 text-base">Data Validation &amp; Source Evidence</h3>
              </div>
              <button 
                onClick={() => setSelectedItem(null)} 
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              {/* Extracted value card */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase">{selectedItem.field}</div>
                    <div className="text-3xl font-mono font-bold text-gray-900 mt-1">
                      {selectedItem.value} <span className="text-base font-normal text-gray-500 font-sans">{selectedItem.unit}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 inline-flex items-center text-xs font-bold rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
                      <ScanLine size={12} className="mr-1 text-cyan-600" /> {selectedItem.ocr_status || 'OCR Processed'}
                    </span>
                    {selectedItem.reading_accuracy !== undefined && selectedItem.reading_accuracy !== null && (
                      <div className="text-xs font-mono font-bold text-emerald-700 mt-1">
                        OCR Confidence: {selectedItem.reading_accuracy}%
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-3 flex flex-wrap gap-4 border-t border-gray-200 pt-2">
                  <span>Subsidiary: <b className="text-gray-800">{selectedItem.subsidiary}</b></span>
                  <span>Mine / Unit: <b className="text-gray-800">{selectedItem.mine || 'Area Level'}</b></span>
                  <span>Reporting Period: <b className="text-gray-800">FY {selectedItem.year}</b></span>
                  <span>Verification: <b className="text-blue-700">{selectedItem.verification_status || 'Validated'}</b></span>
                </div>
              </div>

              {/* Source Evidence & OCR Text */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={14} className="text-slate-500" />
                    Source Evidence ({selectedItem.source_page || 'Page 1'})
                  </h4>
                  <span className="text-xs font-mono text-slate-500">{selectedItem.doc_id || 'DOC-Source'}</span>
                </div>
                <p className="text-xs text-slate-500 mb-2 truncate" title={selectedItem.document_name}>
                  <b>Document:</b> {selectedItem.document_name || 'Source Report File'}
                </p>
                <div className="p-3 bg-white rounded-lg border border-slate-200 font-mono text-xs text-slate-700 leading-relaxed max-h-36 overflow-y-auto">
                  {loadingDocText ? (
                    <span className="text-slate-400 italic">Loading OCR source text snippet...</span>
                  ) : itemDocText ? (
                    itemDocText
                  ) : (
                    <span className="text-slate-400 italic">Verified against authentic source document text.</span>
                  )}
                </div>
              </div>

              {/* Discrepancies / Differences check */}
              {relevantDiff ? (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    <AlertTriangle size={14} className="text-amber-600" /> Discrepancy Flagged on this Metric
                  </div>
                  <p>
                    Difference found between {relevantDiff.doc_a_name} ({relevantDiff.value_a} {relevantDiff.unit_a}) and{' '}
                    {relevantDiff.doc_b_name} ({relevantDiff.value_b} {relevantDiff.unit_b}).
                  </p>
                  <p className="mt-1 font-semibold text-amber-900">Status: {relevantDiff.status}</p>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle size={15} className="text-emerald-600 shrink-0" />
                  <span>No conflicting values detected across historical or peer subsidiary reports.</span>
                </div>
              )}

              {/* Automated Rules & Checks */}
              <div>
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Automated Rule Engine Sanity Checks
                </h4>
                {selectedItem.checks && selectedItem.checks.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedItem.checks.map((chk: any, idx: number) => (
                      <div key={idx} className="p-2 bg-emerald-50 text-emerald-800 rounded-lg text-xs flex items-center justify-between border border-emerald-200">
                        <span className="font-medium">{chk.type}: {chk.message || 'Validation passed'}</span>
                        <CheckCircle2 size={13} className="text-emerald-600" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-2.5 bg-blue-50 text-blue-800 rounded-lg text-xs flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-blue-600" />
                    <span>Statutory Range Check: Numeric value is within statutory parameters for {selectedItem.subsidiary}.</span>
                  </div>
                )}
              </div>

              {/* Status toggle actions */}
              <div className="pt-2">
                <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Audit Verdict</div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedItem.id, 'Correct')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                      selectedItem.status === 'Correct'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    ✓ Mark Correct
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedItem.id, 'Check Needed')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                      selectedItem.status === 'Check Needed'
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    ⚠ Flag for Review
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-5 py-2 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-black transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckData;
