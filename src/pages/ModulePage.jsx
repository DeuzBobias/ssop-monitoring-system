import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Download, Plus, Printer } from 'lucide-react';
import Alert from '../components/ui/Alert';
import Filters from '../components/ui/Filters';
import Loading from '../components/ui/Loading';
import PrintableRecords from '../components/ui/PrintableRecords';
import RecordForm from '../components/ui/RecordForm';
import RecordTable from '../components/ui/RecordTable';
import Badge from '../components/ui/Badge';
import { useAuth } from '../hooks/useAuth';
import { deleteRecord, fetchRecord, fetchRecords, logActivity, saveRecord } from '../services/records';
import { downloadCsv, formatDateTime } from '../utils/formatters';
import { canCreate, canDelete, canEdit, isQa } from '../utils/permissions';

export default function ModulePage({ module }) {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || (id ? 'view' : 'list');
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const actorId = profile?.id || user?.id;
  const [records, setRecords] = useState([]);
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [filters, setFilters] = useState({ search: '', startDate: '', endDate: '', status: '' });

  const loadRecords = async () => {
    setLoading(true);
    const data = await fetchRecords(module, filters);
    setRecords(data);
    setLoading(false);
  };

  useEffect(() => {
    if (mode === 'list' || mode === 'print') {
      loadRecords().catch((error) => {
        console.error(error);
        setLoading(false);
      });
    }
  }, [module.key, filters.search, filters.startDate, filters.endDate, filters.status, mode]);

  useEffect(() => {
    if (id && (mode === 'view' || mode === 'edit')) {
      setLoading(true);
      fetchRecord(module, id).then((data) => {
        setRecord(data);
        setLoading(false);
      }).catch((error) => {
        console.error(error);
        setLoading(false);
      });
    }
  }, [id, mode, module.key]);

  const exportCsv = () => {
    const headers = ['ID', ...module.fields.map((field) => field.label), 'Created At', 'Updated At'];
    const rows = records.map((item) => [
      item.id,
      ...module.fields.map((field) => item[field.name] || ''),
      item.created_at,
      item.updated_at,
    ]);
    downloadCsv(`${module.key}-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    logActivity({ userId: actorId, action: 'Export CSV', module: module.shortTitle, description: `Exported ${module.shortTitle} records.` });
  };

  const submitRecord = async (values) => {
    setSaving(true);
    try {
      const saved = await saveRecord(module, values, actorId, mode === 'edit' ? id : null);
      await logActivity({
        userId: actorId,
        action: mode === 'edit' ? 'Edit' : 'Add',
        module: module.shortTitle,
        recordId: saved.id,
        description: `${mode === 'edit' ? 'Updated' : 'Added'} ${module.shortTitle} record.`,
      });
      setMessage('Record saved successfully.');
      navigate(`${module.route}/${saved.id}`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  const removeRecord = async (item) => {
    if (!canDelete(profile) || !confirm('Delete this record? This action cannot be undone.')) return;
    await deleteRecord(module, item.id);
    await logActivity({ userId: actorId, action: 'Delete', module: module.shortTitle, recordId: item.id, description: `Deleted ${module.shortTitle} record.` });
    setMessage('Record deleted.');
    loadRecords();
  };

  const verifyRecord = async () => {
    if (!isQa(profile) && profile?.role !== 'Admin') return;
    const verifiedBy = profile?.full_name || profile?.email || user?.email;
    const saved = await saveRecord(module, { ...record, [module.qaField]: verifiedBy }, actorId, record.id);
    setRecord(saved);
    await logActivity({ userId: actorId, action: 'Verify', module: module.shortTitle, recordId: record.id, description: `QA verified ${module.shortTitle} record.` });
    setMessage('Record verified.');
  };

  if (loading) return <Loading />;

  if (mode === 'print') {
    return (
      <div className="space-y-4">
        <div className="no-print flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button className="btn btn-secondary" type="button" onClick={() => navigate(module.route)}>Back</button>
          <button className="btn btn-primary" type="button" onClick={() => window.print()}><Printer size={18} /> Print</button>
        </div>
        <PrintableRecords module={module} records={records} />
      </div>
    );
  }

  if (mode === 'new' || mode === 'edit') {
    if (mode === 'new' && !canCreate(profile)) return <Alert type="error">You do not have permission to add records.</Alert>;
    if (mode === 'edit' && !canEdit(profile, record)) return <Alert type="error">You do not have permission to edit this record.</Alert>;
    return (
      <RecordForm
        module={module}
        initialRecord={mode === 'edit' ? record : null}
        saving={saving}
        onCancel={() => navigate(id ? `${module.route}/${id}` : module.route)}
        onSubmit={submitRecord}
      />
    );
  }

  if (mode === 'view' && record) {
    return (
      <div className="space-y-4">
        {message && <Alert type={message.includes('success') || message.includes('verified') ? 'success' : 'info'}>{message}</Alert>}
        <section className="panel p-4 sm:p-5">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-black text-ink">{module.title}</h2>
              <p className="text-sm text-muted">Record #{record.id.slice(0, 8)} · Updated {formatDateTime(record.updated_at)}</p>
            </div>
            <div className="no-print flex flex-wrap gap-2">
              {module.qaField && !record[module.qaField] && (isQa(profile) || profile?.role === 'Admin') && (
                <button className="btn btn-primary" type="button" onClick={verifyRecord}>Verify</button>
              )}
              {canEdit(profile, record) && <button className="btn btn-secondary" type="button" onClick={() => navigate(`${module.route}/${record.id}?mode=edit`)}>Edit</button>}
              <button className="btn btn-secondary" type="button" onClick={() => window.print()}><Printer size={18} /> Print</button>
              <button className="btn btn-secondary" type="button" onClick={() => navigate(module.route)}>Back</button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {module.fields.map((field) => (
              <div key={field.name} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-bold uppercase text-muted">{field.label}</p>
                <div className="mt-1 text-sm font-semibold text-ink">
                  {field.type === 'select' ? <Badge value={record[field.name]} /> : record[field.name] || '—'}
                </div>
              </div>
            ))}
            {module.key === 'oil-temperature' && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-bold uppercase text-muted">Status</p>
                <div className="mt-1"><Badge value={record.status} /></div>
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {message && <Alert type="success">{message}</Alert>}
      <section className="panel p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-black text-ink">{module.title}</h2>
            <p className="text-sm text-muted">{module.instructions || 'Digitized monitoring record based on the uploaded SSOP template.'}</p>
          </div>
          <div className="no-print flex flex-col gap-2 sm:flex-row">
            <button className="btn btn-secondary" type="button" onClick={() => navigate(`${module.route}?mode=print`)}><Printer size={18} /> Print</button>
            <button className="btn btn-secondary" type="button" onClick={exportCsv}><Download size={18} /> Export CSV</button>
            {canCreate(profile) && <button className="btn btn-primary" type="button" onClick={() => navigate(`${module.route}?mode=new`)}><Plus size={18} /> Add Record</button>}
          </div>
        </div>
      </section>

      <Filters module={module} filters={filters} setFilters={setFilters} onReset={() => setFilters({ search: '', startDate: '', endDate: '', status: '' })} />
      <RecordTable
        module={module}
        records={records}
        profile={profile}
        onView={(item) => navigate(`${module.route}/${item.id}`)}
        onEdit={(item) => navigate(`${module.route}/${item.id}?mode=edit`)}
        onDelete={removeRecord}
      />
    </div>
  );
}
