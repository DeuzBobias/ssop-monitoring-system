export function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-PH', { year: 'numeric', month: 'short', day: '2-digit' }).format(new Date(value));
}

export function formatDateTime(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function csvEscape(value) {
  const text = value == null ? '' : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export function downloadCsv(filename, headers, rows) {
  const csv = [
    headers.map(csvEscape).join(','),
    ...rows.map((row) => row.map(csvEscape).join(',')),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function statusTone(value) {
  const tones = {
    Good: 'success',
    Clean: 'success',
    Normal: 'success',
    Yes: 'success',
    Accepted: 'success',
    Active: 'success',
    Admin: 'primary',
    'QA Personnel': 'accent',
    Inspector: 'warning',
    Viewer: 'muted',
    No: 'muted',
    'Needs Attention': 'warning',
    Damaged: 'danger',
    Dirty: 'danger',
    Unusual: 'warning',
    Rejected: 'danger',
    'Below Range': 'warning',
    'Above Range': 'danger',
    Inactive: 'muted',
  };
  return tones[value] || 'muted';
}

export function computeOilStatus(value) {
  const temperature = Number(value);
  if (Number.isNaN(temperature)) return '';
  if (temperature < 180) return 'Below Range';
  if (temperature > 190) return 'Above Range';
  return 'Normal';
}

export function hasCorrectiveAction(record, module) {
  const field = module.correctiveField;
  return Boolean(String(record?.[field] || '').trim());
}

