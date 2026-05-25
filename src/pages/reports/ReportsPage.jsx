import { useMemo, useState } from 'react';
import { Download, Printer } from 'lucide-react';
import PrintableRecords from '../../components/ui/PrintableRecords';
import { fetchRecords, logActivity } from '../../services/records';
import { useAuth } from '../../hooks/useAuth';
import { downloadCsv, hasCorrectiveAction } from '../../utils/formatters';
import { modules } from '../../utils/modules';
import StatCard from '../../components/ui/StatCard';
import Loading from '../../components/ui/Loading';

function isNonCompliant(module, record) {
  const value = record[module.statusField];
  if (module.key === 'oil-temperature') return value !== 'Normal';
  if (module.key === 'pest-control') return value === 'Yes';
  if (module.key === 'delivery-truck') return value === 'Yes';
  if (module.key === 'cleaning-sanitation') return value === 'No';
  return ['Needs Attention', 'Damaged', 'Rejected', 'No', 'Dirty', 'Unusual'].includes(value);
}

export default function ReportsPage() {
  const { profile } = useAuth();
  const [moduleKey, setModuleKey] = useState(modules[0].key);
  const [filters, setFilters] = useState({ startDate: '', endDate: '' });
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const module = modules.find((item) => item.key === moduleKey);

  const summary = useMemo(() => {
    const nonCompliant = records.filter((record) => isNonCompliant(module, record)).length;
    const corrective = records.filter((record) => hasCorrectiveAction(record, module)).length;
    const verified = records.filter((record) => module.qaField && record[module.qaField]).length;
    return {
      total: records.length,
      compliant: records.length - nonCompliant,
      nonCompliant,
      corrective,
      verified,
      pending: Math.max(0, records.length - verified),
    };
  }, [records, module]);

  const generate = async () => {
    setLoading(true);
    const data = await fetchRecords(module, filters);
    setRecords(data);
    setLoading(false);
    await logActivity({ userId: profile.id, action: 'Generate Report', module: 'Reports', description: `Generated report for ${module.shortTitle}.` });
  };

  const exportCsv = () => {
    const headers = ['ID', ...module.fields.map((field) => field.label), 'Created At'];
    const rows = records.map((record) => [record.id, ...module.fields.map((field) => record[field.name] || ''), record.created_at]);
    downloadCsv(`report-${module.key}.csv`, headers, rows);
    logActivity({ userId: profile.id, action: 'Export Report', module: 'Reports', description: `Exported report for ${module.shortTitle}.` });
  };

  return (
    <div className="space-y-4">
      <section className="panel no-print p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <label className="xl:col-span-2">
            <span className="label">Record Type</span>
            <select className="field" value={moduleKey} onChange={(event) => setModuleKey(event.target.value)}>
              {modules.map((item) => <option key={item.key} value={item.key}>{item.shortTitle}</option>)}
            </select>
          </label>
          <label>
            <span className="label">Start Date</span>
            <input className="field" type="date" value={filters.startDate} onChange={(event) => setFilters((prev) => ({ ...prev, startDate: event.target.value }))} />
          </label>
          <label>
            <span className="label">End Date</span>
            <input className="field" type="date" value={filters.endDate} onChange={(event) => setFilters((prev) => ({ ...prev, endDate: event.target.value }))} />
          </label>
          <div className="flex items-end">
            <button className="btn btn-primary w-full" type="button" onClick={generate}>Generate</button>
          </div>
        </div>
      </section>

      {loading ? <Loading label="Generating report..." /> : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
            <StatCard label="Total Records" value={summary.total} />
            <StatCard label="Compliant" value={summary.compliant} tone="text-success" />
            <StatCard label="Non-compliant" value={summary.nonCompliant} tone="text-danger" />
            <StatCard label="Corrective Actions" value={summary.corrective} tone="text-warning" />
            <StatCard label="QA Verified" value={summary.verified} tone="text-primary" />
            <StatCard label="Pending Verification" value={summary.pending} tone="text-warning" />
          </div>

          <div className="no-print flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button className="btn btn-secondary" type="button" onClick={exportCsv} disabled={!records.length}><Download size={18} /> Export CSV</button>
            <button className="btn btn-primary" type="button" onClick={() => window.print()} disabled={!records.length}><Printer size={18} /> Print Report</button>
          </div>

          {records.length > 0 && <PrintableRecords module={module} records={records} />}
        </>
      )}
    </div>
  );
}

