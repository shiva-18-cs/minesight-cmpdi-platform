import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Cloud, Filter, RotateCw, Search, ArrowRight, BarChart3, Info, BookOpen, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface WordItem {
  word: string;
  count: number;
}

interface CloudData {
  words: WordItem[];
  total_unique: number;
  top_n: number;
  max_count: number;
  min_count: number;
  filters_applied: {
    subsidiary: string | null;
    year: number | null;
    dataset_type: string | null;
  };
}

const WordCloud: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<CloudData | null>(null);
  const [loading, setLoading] = useState(true);
  const [subsidiary, setSubsidiary] = useState('');
  const [year, setYear] = useState('');
  const [viewMode, setViewMode] = useState<'cloud' | 'table'>('cloud');
  const [hoveredWord, setHoveredWord] = useState<WordItem | null>(null);

  useEffect(() => {
    fetchWordCloud();
  }, [subsidiary, year]);

  const fetchWordCloud = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (subsidiary) params.subsidiary = subsidiary;
      if (year) params.year = parseInt(year);
      const res = await axios.get(`${API}/wordcloud`, { params });
      
      // Handle both old array format and new object format gracefully during transition
      if (Array.isArray(res.data)) {
         setData({
            words: res.data,
            total_unique: res.data.length,
            top_n: 80,
            max_count: res.data[0]?.count || 1,
            min_count: res.data[res.data.length - 1]?.count || 1,
            filters_applied: { subsidiary: null, year: null, dataset_type: null }
         });
      } else {
         setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load word cloud', err);
    } finally {
      setLoading(false);
    }
  };

  // Government/PSU Professional Palette - Deep Navy, Slate, Teal accents
  const colors = [
    'text-slate-900', 'text-slate-800', 'text-slate-700', 
    'text-blue-900', 'text-blue-800', 'text-sky-800', 
    'text-teal-900', 'text-teal-800'
  ];

  const words = data?.words || [];
  const maxCount = data?.max_count || 1;
  const minCount = data?.min_count || 1;

  const getFontSize = (count: number) => {
    if (maxCount === minCount) return 18;
    const normalized = (count - minCount) / (maxCount - minCount);
    return Math.round(14 + normalized * 32); // 14px to 46px range for professional look
  };

  const getOpacity = (count: number) => {
    if (maxCount === minCount) return 1;
    const normalized = (count - minCount) / (maxCount - minCount);
    return 0.6 + (normalized * 0.4); // 60% to 100% opacity
  };

  // Thematic Analysis Logic
  const identifyThemes = () => {
    if (!words.length) return [];
    
    const themes = [];
    const topWords = words.slice(0, 15).map(w => w.word.toLowerCase());
    
    const geoKeywords = ['exploration', 'drilling', 'geological', 'seam', 'survey', 'borehole', 'core'];
    const prodKeywords = ['production', 'output', 'target', 'capacity', 'dispatch', 'excavation', 'machinery'];
    const civilKeywords = ['civil', 'construction', 'repair', 'maintenance', 'building', 'water', 'pump'];
    const envKeywords = ['environment', 'clearance', 'forest', 'pollution', 'reclamation', 'green', 'planting'];

    let geoScore = topWords.filter(w => geoKeywords.includes(w)).length;
    let prodScore = topWords.filter(w => prodKeywords.includes(w)).length;
    let civilScore = topWords.filter(w => civilKeywords.includes(w)).length;
    let envScore = topWords.filter(w => envKeywords.includes(w)).length;

    if (geoScore > 0) themes.push({ name: 'Geological & Exploration', score: geoScore, icon: <Layers size={16} /> });
    if (prodScore > 0) themes.push({ name: 'Production Operations', score: prodScore, icon: <BarChart3 size={16} /> });
    if (civilScore > 0) themes.push({ name: 'Civil & Maintenance', score: civilScore, icon: <BookOpen size={16} /> });
    if (envScore > 0) themes.push({ name: 'Environmental & Sustainability', score: envScore, icon: <Cloud size={16} /> });

    if (themes.length === 0) themes.push({ name: 'General Administration', score: 1, icon: <Info size={16} /> });
    
    return themes.sort((a, b) => b.score - a.score).slice(0, 3);
  };

  const activeThemes = identifyThemes();

  return (
    <div className="p-8 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      {/* Header Area */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-wider uppercase">CMPDI Analytics</span>
            <span className="text-slate-500 text-sm">| Semantic Intelligence</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Terminology Analytics</h1>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl">
            Lexical frequency and thematic extraction across the central repository. 
            Utilize this dashboard to identify prevalent operational focuses, procurement trends, and strategic initiatives.
          </p>
        </div>

        {/* Filter Controls (Right aligned on desktop) */}
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-center space-x-4 self-start">
          <div className="flex items-center space-x-2 text-sm text-slate-700 border-r border-slate-200 pr-4">
            <Filter size={16} className="text-blue-700" />
            <span className="font-semibold">Context Filters</span>
          </div>

          <select
            value={subsidiary}
            onChange={(e) => setSubsidiary(e.target.value)}
            className="border-none bg-slate-50 rounded px-3 py-1.5 text-sm font-medium text-slate-800 focus:ring-1 focus:ring-blue-800 cursor-pointer outline-none"
          >
            <option value="">All Subsidiaries</option>
            {['CMPDI', 'MCL', 'WCL', 'NCL', 'SECL', 'CCL', 'BCCL', 'ECL'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="border-none bg-slate-50 rounded px-3 py-1.5 text-sm font-medium text-slate-800 focus:ring-1 focus:ring-blue-800 cursor-pointer outline-none"
          >
            <option value="">All Financial Years</option>
            {[2026, 2025, 2024, 2023, 2022, 2021, 2020].map(y => (
              <option key={y} value={y}>FY {y}</option>
            ))}
          </select>

          <button
            onClick={fetchWordCloud}
            className="p-1.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
            title="Refresh Data"
          >
            <RotateCw size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-32">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin h-10 w-10 border-4 border-slate-800 border-t-transparent rounded-full"></div>
            <p className="text-slate-600 font-medium">Computing lexical frequencies...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Visualization Column (spanning 2 cols on lg) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
              
              {/* Viz Header */}
              <div className="bg-slate-900 px-6 py-4 flex justify-between items-center">
                <h2 className="text-white font-semibold flex items-center">
                  <BarChart3 size={18} className="mr-2 text-blue-400" />
                  Frequency Distribution map
                </h2>
                <div className="flex bg-slate-800 p-1 rounded-md">
                  <button
                    onClick={() => setViewMode('cloud')}
                    className={`px-3 py-1 text-xs font-medium rounded transition ${
                      viewMode === 'cloud' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Spatial View
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-3 py-1 text-xs font-medium rounded transition ${
                      viewMode === 'table' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Tabular View
                  </button>
                </div>
              </div>

              {/* Viz Content */}
              <div className="p-6 flex-1 bg-white relative">
                {viewMode === 'cloud' ? (
                  <div className="min-h-[400px] flex flex-wrap items-center justify-center gap-x-6 gap-y-4 py-8 px-4">
                    {words.length === 0 ? (
                      <p className="text-slate-500 italic">No significant terminology found for this filter combination.</p>
                    ) : (
                      words.map((item, idx) => {
                        const fontSize = getFontSize(item.count);
                        const opacity = getOpacity(item.count);
                        const colorClass = colors[idx % colors.length];
                        return (
                          <button
                            key={item.word}
                            onClick={() => navigate(`/search?q=${encodeURIComponent(item.word)}`)}
                            onMouseEnter={() => setHoveredWord(item)}
                            onMouseLeave={() => setHoveredWord(null)}
                            style={{ fontSize: `${fontSize}px`, opacity }}
                            className={`font-bold transition-all duration-200 cursor-pointer select-none px-2 py-1 rounded-md hover:bg-slate-100 hover:opacity-100 hover:scale-105 ${colorClass}`}
                            title={`Keyword: ${item.word} | Occurrences: ${item.count}`}
                          >
                            {item.word}
                          </button>
                        );
                      })
                    )}
                  </div>
                ) : (
                  <div className="overflow-auto max-h-[460px]">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                      <thead className="bg-slate-50 sticky top-0">
                        <tr>
                          <th className="px-6 py-3 text-left font-semibold text-slate-700 uppercase text-xs">Rank</th>
                          <th className="px-6 py-3 text-left font-semibold text-slate-700 uppercase text-xs">Lexical Item</th>
                          <th className="px-6 py-3 text-left font-semibold text-slate-700 uppercase text-xs">Density</th>
                          <th className="px-6 py-3 text-right font-semibold text-slate-700 uppercase text-xs">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {words.map((item, index) => (
                          <tr key={item.word} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-3 font-mono text-slate-500 text-xs">{(index + 1).toString().padStart(2, '0')}</td>
                            <td className="px-6 py-3 font-bold text-slate-900">{item.word}</td>
                            <td className="px-6 py-3">
                              <div className="flex items-center space-x-3">
                                <span className="font-mono font-medium text-slate-700 w-12">{item.count}</span>
                                <div className="w-32 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className="bg-blue-600 h-full rounded-full"
                                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-3 text-right">
                              <button
                                onClick={() => navigate(`/search?q=${encodeURIComponent(item.word)}`)}
                                className="text-xs text-blue-700 hover:text-blue-900 font-bold inline-flex items-center bg-blue-50 px-2 py-1 rounded"
                              >
                                Query <ArrowRight size={12} className="ml-1" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              
              {/* Interactive Tooltip Footer */}
              <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between h-14">
                {hoveredWord ? (
                  <div className="flex items-center text-sm font-medium text-slate-800 animate-in fade-in">
                    <Search size={14} className="text-blue-600 mr-2" />
                    Focus: <span className="text-blue-700 font-bold ml-1 text-base">{hoveredWord.word}</span>
                    <span className="mx-3 text-slate-300">|</span>
                    Identified in <span className="font-bold font-mono mx-1">{hoveredWord.count}</span> context records
                  </div>
                ) : (
                  <div className="text-sm text-slate-500 italic flex items-center">
                    <Info size={14} className="mr-2" /> Hover over terminology nodes to view precise frequency metrics.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Key Insights Column (Right Side) */}
          <div className="flex flex-col gap-6">
            
            {/* Summary Statistics Panel */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 border-t-4 border-t-blue-700">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Analysis Metadata</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Total Unique Terms Extracted</span>
                  <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    {data?.total_unique?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Terms Displayed (Top N)</span>
                  <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    {words.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Peak Frequency Marker</span>
                  <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    {maxCount.toLocaleString()}
                  </span>
                </div>
                
                {words.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <span className="text-xs text-slate-500 block mb-2">Dominant Lexical Item</span>
                    <div className="flex items-center justify-between bg-slate-800 text-white p-3 rounded-lg">
                      <span className="font-bold text-lg">{words[0].word}</span>
                      <span className="font-mono text-blue-300">{words[0].count}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Thematic Grouping Panel */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex-1">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Primary Thematic Drivers</h3>
              
              {activeThemes.length > 0 ? (
                <div className="space-y-4">
                  {activeThemes.map((theme, i) => (
                    <div key={theme.name} className="flex items-start">
                      <div className={`mt-0.5 p-2 rounded-lg ${i === 0 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                        {theme.icon}
                      </div>
                      <div className="ml-3">
                        <p className={`text-sm font-bold ${i === 0 ? 'text-slate-900' : 'text-slate-700'}`}>{theme.name}</p>
                        <p className="text-xs text-slate-500 mt-1 leading-snug">
                          {i === 0 
                            ? "Highest concentration of operational terminology falls under this domain based on recent text extraction."
                            : "Secondary theme identified through lexical clustering analysis."}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  <div className="mt-6 bg-slate-50 rounded p-3 text-xs text-slate-500 border border-slate-100 italic">
                    Note: Themes are dynamically derived using heuristic matching against the top 15 highest-density keywords in the current view.
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">Insufficient data to extract themes.</p>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default WordCloud;
