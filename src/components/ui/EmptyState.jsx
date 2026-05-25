export default function EmptyState({ title = 'No records found', message = 'Try adjusting the filters or add a new record.' }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <h3 className="text-base font-bold text-ink">{title}</h3>
      <p className="mt-2 text-sm text-muted">{message}</p>
    </div>
  );
}

