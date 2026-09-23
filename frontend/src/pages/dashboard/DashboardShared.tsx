import React from 'react';

/* ─────────────────────────────────────────────────────────────
   STATUS BADGE
   Consistent coloring for all document / report statuses.
───────────────────────────────────────────────────────────── */
export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'Processed':
      return <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Processed</span>;
    case 'Pending':
      return <span className="px-2.5 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Pending</span>;
    case 'Submitted to Project Manager':
      return <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Submitted</span>;
    case 'Under Validation':
      return <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">Under Validation</span>;
    case 'Validated':
      return <span className="px-2.5 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-medium">Validated</span>;
    case 'Report Generated':
      return <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">Report Generated</span>;
    case 'Submitted to Administrator':
      return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">Submitted to Admin</span>;
    case 'Approved':
      return <span className="px-2.5 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Approved</span>;
    case 'Failed':
      return <span className="px-2.5 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Failed</span>;
    default:
      return <span className="px-2.5 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{status}</span>;
  }
};

/* ─────────────────────────────────────────────────────────────
   METRIC CARD
   Large stat card with icon, value, label and optional click.
───────────────────────────────────────────────────────────── */
interface MetricCardProps {
  icon: React.ReactNode;
  value: string | number | null | undefined;
  label: string;
  sublabel?: string;
  iconBg?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  value,
  label,
  sublabel,
  iconBg = 'bg-blue-50 text-blue-600',
  onClick,
}) => (
  <div
    onClick={onClick}
    className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start space-x-4 ${
      onClick ? 'cursor-pointer hover:border-blue-300 hover:shadow-md transition' : ''
    }`}
  >
    <div className={`p-3 rounded-xl shrink-0 ${iconBg}`}>{icon}</div>
    <div>
      <p className="text-3xl font-bold text-slate-900">{value ?? '—'}</p>
      <p className="text-sm font-semibold text-slate-700 mt-1">{label}</p>
      {sublabel && <p className="text-xs text-slate-500 mt-0.5">{sublabel}</p>}
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   COMPACT METRIC
   Smaller stat tile used inside cards / overview sections.
───────────────────────────────────────────────────────────── */
interface CompactMetricProps {
  label: string;
  value: string | number | null | undefined;
  valueColor?: string;
  sublabel?: string;
}

export const CompactMetric: React.FC<CompactMetricProps> = ({
  label,
  value,
  valueColor = 'text-slate-900',
  sublabel,
}) => (
  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
    <p className={`text-2xl font-extrabold mt-1 ${valueColor}`}>{value ?? '—'}</p>
    {sublabel && <p className="text-[10px] text-slate-400 mt-0.5">{sublabel}</p>}
  </div>
);

/* ─────────────────────────────────────────────────────────────
   SECTION HEADER
   Top-of-page role title block.
───────────────────────────────────────────────────────────── */
interface SectionHeaderProps {
  title: string;
  subtitle: string;
  userName?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, userName }) => (
  <div>
    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
    <p className="text-base text-slate-500 mt-1">
      {userName ? (
        <>Welcome, <b>{userName}</b>. {subtitle}</>
      ) : subtitle}
    </p>
  </div>
);
