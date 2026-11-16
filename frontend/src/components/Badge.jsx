import React from 'react';

export const Badge = ({ status, children, size = 'sm' }) => {
  const normalized = (status || children || '').toString().toUpperCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';

  switch (normalized) {
    case 'AVAILABLE':
    case 'OK':
    case 'COMPLETED':
    case 'PAID':
    case 'ACTIVE_POSITIVE':
      styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      break;
    case 'RENTED':
    case 'ACTIVE':
    case 'PENDING':
    case 'PARTIALLY_PAID':
      styles = 'bg-sky-50 text-sky-700 border-sky-200';
      break;
    case 'MAINTENANCE':
    case 'NOT_OK':
    case 'UNPAID':
    case 'OVERDUE':
    case 'NEW_ISSUE':
      styles = 'bg-rose-50 text-rose-700 border-rose-200';
      break;
    case 'CANCELLED':
      styles = 'bg-amber-50 text-amber-700 border-amber-200';
      break;
    case 'NOT_APPLICABLE':
    case 'NA':
      styles = 'bg-slate-100 text-slate-500 border-slate-200';
      break;
    default:
      styles = 'bg-slate-100 text-slate-700 border-slate-200';
  }

  const sizeClasses = size === 'xs' ? 'px-1.5 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center font-semibold rounded-full border tracking-wide uppercase ${sizeClasses} ${styles}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {children || status}
    </span>
  );
};

