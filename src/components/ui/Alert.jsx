export default function Alert({ type = 'info', children }) {
  const classes = {
    success: 'border-green-200 bg-green-50 text-green-800',
    error: 'border-red-200 bg-red-50 text-red-800',
    warning: 'border-amber-200 bg-amber-50 text-amber-800',
    info: 'border-blue-200 bg-blue-50 text-blue-800',
  };

  return (
    <div className={`break-words rounded-lg border px-4 py-3 text-sm [overflow-wrap:anywhere] ${classes[type] || classes.info}`}>
      {children}
    </div>
  );
}
