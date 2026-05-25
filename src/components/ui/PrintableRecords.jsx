import { formatDate } from '../../utils/formatters';

export default function PrintableRecords({ module, records }) {
  return (
    <section className="panel bg-white p-4 print:border-0 sm:p-6">
      <div className="mb-5 text-center">
        <h1 className="text-xl font-black uppercase text-ink">Ilocos Food Products</h1>
        <p className="text-sm text-slate-700">Taleb, Bantay, Ilocos Sur</p>
        <p className="mt-2 text-sm font-black uppercase text-ink">SSOP Monitoring Record</p>
        <h2 className="text-lg font-black uppercase text-ink">{module.title}</h2>
      </div>

      <div className="mobile-table">
        <table className="min-w-[980px] w-full border-collapse text-xs">
          <thead>
            <tr>
              {module.fields.map((field) => (
                <th key={field.name} className="border border-slate-400 bg-slate-100 px-2 py-2 text-left font-bold">
                  {field.label}
                </th>
              ))}
              {module.key === 'oil-temperature' && <th className="border border-slate-400 bg-slate-100 px-2 py-2 text-left font-bold">Status</th>}
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id}>
                {module.fields.map((field) => (
                  <td key={field.name} className="border border-slate-400 px-2 py-2 align-top">
                    {field.type === 'date' ? formatDate(record[field.name]) : record[field.name] || ''}
                  </td>
                ))}
                {module.key === 'oil-temperature' && <td className="border border-slate-400 px-2 py-2 align-top">{record.status}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        <div className="border-t border-slate-700 pt-2 text-center text-sm">
          <p className="font-bold">Prepared & Reviewed by</p>
          <p>Catherin A. Alviar</p>
          <p>Food Safety Compliance Officer</p>
        </div>
        <div className="border-t border-slate-700 pt-2 text-center text-sm">
          <p className="font-bold">Approved by</p>
          <p>Clemencia A. Padre</p>
          <p>Owner</p>
        </div>
      </div>
      <p className="mt-6 text-center text-sm">Date: April 1, 2025</p>
    </section>
  );
}

