import { useEffect, useMemo, useState } from 'react';
import Badge from '../../components/ui/Badge';
import Loading from '../../components/ui/Loading';
import { supabase } from '../../services/supabaseClient';
import { formatDateTime } from '../../utils/formatters';

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*, profiles:user_id(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(300);
      if (error) console.error(error);
      setLogs(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return logs;
    return logs.filter((log) => [log.action, log.module, log.description, log.profiles?.full_name, log.profiles?.email]
      .some((value) => String(value || '').toLowerCase().includes(q)));
  }, [logs, search]);

  if (loading) return <Loading label="Loading activity logs..." />;

  return (
    <div className="space-y-4">
      <section className="panel p-4 sm:p-5">
        <label>
          <span className="label">Search Logs</span>
          <input className="field" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by action, user, module, or description" />
        </label>
      </section>

      <section className="panel mobile-table">
        <table className="min-w-[900px] w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-bold uppercase text-slate-500">
            <tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">User</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Module</th><th className="px-4 py-3">Record</th><th className="px-4 py-3">Description</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((log) => (
              <tr key={log.id}>
                <td className="px-4 py-3">{formatDateTime(log.created_at)}</td>
                <td className="px-4 py-3">{log.profiles?.full_name || log.profiles?.email || 'System'}</td>
                <td className="px-4 py-3"><Badge value={log.action} /></td>
                <td className="px-4 py-3">{log.module}</td>
                <td className="px-4 py-3">{log.record_id ? log.record_id.slice(0, 8) : '—'}</td>
                <td className="px-4 py-3">{log.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

