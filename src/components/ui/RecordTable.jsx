import { Eye, Pencil, Trash2 } from 'lucide-react';
import Badge from './Badge';
import EmptyState from './EmptyState';
import { formatDate } from '../../utils/formatters';
import { canDelete, canEdit } from '../../utils/permissions';

function renderCell(field, value) {
  if (field.type === 'select') return <Badge value={value} />;
  if (field.type === 'date') return formatDate(value);
  return value || '—';
}

export default function RecordTable({ module, records, profile, onView, onEdit, onDelete }) {
  if (!records.length) return <EmptyState />;

  const visibleFields = module.fields.slice(0, 6);

  return (
    <div className="panel mobile-table">
      <table className="min-w-[920px] w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3">Record</th>
            {visibleFields.map((field) => <th key={field.name} className="px-4 py-3">{field.label}</th>)}
            <th className="px-4 py-3">{module.statusLabel}</th>
            <th className="px-4 py-3 text-right no-print">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {records.map((record) => (
            <tr key={record.id} className="hover:bg-slate-50">
              <td className="px-4 py-3">
                <p className="font-bold text-ink">#{record.id.slice(0, 8)}</p>
                <p className="text-xs text-muted">{formatDate(record[module.dateField])}</p>
              </td>
              {visibleFields.map((field) => (
                <td key={field.name} className="max-w-48 px-4 py-3 text-slate-700">
                  <span className="line-clamp-2">{renderCell(field, record[field.name])}</span>
                </td>
              ))}
              <td className="px-4 py-3"><Badge value={record[module.statusField]} /></td>
              <td className="px-4 py-3 text-right no-print">
                <div className="inline-flex gap-1">
                  <button className="btn btn-secondary px-3" type="button" onClick={() => onView(record)} aria-label="View">
                    <Eye size={16} />
                  </button>
                  {canEdit(profile, record) && (
                    <button className="btn btn-secondary px-3" type="button" onClick={() => onEdit(record)} aria-label="Edit">
                      <Pencil size={16} />
                    </button>
                  )}
                  {canDelete(profile) && (
                    <button className="btn btn-danger px-3" type="button" onClick={() => onDelete(record)} aria-label="Delete">
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
  );
}

