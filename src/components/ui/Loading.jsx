export default function Loading({ label = 'Loading records...' }) {
  return (
    <div className="panel flex min-h-48 items-center justify-center p-8 text-sm font-semibold text-muted">
      {label}
    </div>
  );
}

