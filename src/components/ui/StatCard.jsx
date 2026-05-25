export default function StatCard({ label, value, hint, tone = 'text-ink' }) {
  return (
    <div className="panel p-4 sm:p-5">
      <p className="text-xs font-bold uppercase tracking-normal text-muted">{label}</p>
      <p className={`mt-3 text-2xl font-black sm:text-3xl ${tone}`}>{value}</p>
      {hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
    </div>
  );
}

