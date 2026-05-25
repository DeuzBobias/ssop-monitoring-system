import { statusTone } from '../../utils/formatters';

export default function Badge({ value }) {
  const tone = statusTone(value);
  const classes = {
    primary: 'bg-blue-100 text-blue-700',
    accent: 'bg-teal-100 text-teal-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-red-100 text-red-700',
    muted: 'bg-slate-100 text-slate-600',
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${classes[tone] || classes.muted}`}>
      {value || '—'}
    </span>
  );
}

