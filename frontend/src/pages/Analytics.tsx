import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { PieChart as ChartIcon, TrendingUp, AlertTriangle, FileText, Filter } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Analytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subsidiary, setSubsidiary] = useState('');
  const [year, setYear] = useState('2024');

  useEffect(() => {
    fetchAnalytics();
  }, [subsidiary, year]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (subsidiary) params.subsidiary = subsidiary;
      if (year) params.year = parseInt(year);
      const res = await axios.get(`${API}/analytics`, { params });
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Enterprise Analytics</h1>
        <p className="text-sm text-gray-500">
          Comparative mining production trends, target vs actual performance, and audit discrepancy resolution metrics.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Filter size={16} />
            <span className="font-medium">Filter Data:</span>
          </div>

          <select
            value={subsidiary}
            onChange={(e) => setSubsidiary(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-600"
          >
            <option value="">All Subsidiaries</option>
            {['MCL', 'WCL', 'NCL', 'SECL', 'CCL', 'BCCL', 'ECL'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-600"
          >
            {[2025, 2024, 2023, 2022, 2021, 2020].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div className="text-xs text-gray-500">
          Data synchronized across {data?.total_documents?.toLocaleString() ?? '...'} historical documents & reports
        </div>
      </div>

      {loading || !data ? (
        <div className="flex justify-center p-16">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Target vs Actual Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Target vs Actual Production ({year})</h3>
                <p className="text-xs text-gray-500">Figures displayed in Million Tonnes (MT)</p>
              </div>
              <span className="p-2 bg-blue-50 text-blue-700 rounded-lg">
                <TrendingUp size={18} />
              </span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.target_vs_actual} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', color: '#FFF', borderRadius: '6px', fontSize: '12px' }}
                    itemStyle={{ color: '#FFF' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="target" name="Target (MT)" fill="#93C5FD" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actual" name="Actual (MT)" fill="#1D4ED8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 5-Year Production Trend Area Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Production Growth Trend (2020 - 2025)</h3>
                <p className="text-xs text-gray-500">Annual aggregate output trajectory</p>
              </div>
              <span className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                <ChartIcon size={18} />
              </span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.production_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="prodColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="year" stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', color: '#FFF', borderRadius: '6px', fontSize: '12px' }}
                    itemStyle={{ color: '#FFF' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    name="Total Output (MT)" 
                    stroke="#059669" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#prodColor)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Differences Resolved vs Found */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Discrepancy Audit Resolution</h3>
                <p className="text-xs text-gray-500">Total differences detected vs resolved</p>
              </div>
              <span className="p-2 bg-amber-50 text-amber-700 rounded-lg">
                <AlertTriangle size={18} />
              </span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.difference_stats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="year" stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', color: '#FFF', borderRadius: '6px', fontSize: '12px' }}
                    itemStyle={{ color: '#FFF' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="total" name="Total Found" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="resolved" name="Resolved" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Document Ingestion History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Report Ingestion Volume</h3>
                <p className="text-xs text-gray-500">Documents archived and indexed per fiscal year</p>
              </div>
              <span className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
                <FileText size={18} />
              </span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.document_stats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="year" stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', color: '#FFF', borderRadius: '6px', fontSize: '12px' }}
                    itemStyle={{ color: '#FFF' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    name="Documents" 
                    stroke="#4F46E5" 
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#4F46E5' }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
