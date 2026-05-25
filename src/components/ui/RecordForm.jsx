import { useMemo, useState } from 'react';
import Alert from './Alert';
import Badge from './Badge';
import { computeOilStatus } from '../../utils/formatters';
import { emptyRecord } from '../../utils/modules';

function validate(module, values) {
  const errors = [];
  module.fields.forEach((field) => {
    if (field.required && !String(values[field.name] || '').trim()) {
      errors.push(`${field.label} is required.`);
    }
    if (field.type === 'number' && values[field.name] !== '' && Number.isNaN(Number(values[field.name]))) {
      errors.push(`${field.label} must be numeric.`);
    }
  });

  if (module.key === 'oil-temperature') {
    const status = computeOilStatus(values.oil_temperature_celsius);
    if (status !== 'Normal' && !String(values.corrective_action || '').trim()) {
      errors.push('Corrective Action is required when oil temperature is outside 180°C to 190°C.');
    }
  }

  return errors;
}

export default function RecordForm({ module, initialRecord, onCancel, onSubmit, saving }) {
  const initialValues = useMemo(() => ({ ...emptyRecord(module), ...(initialRecord || {}) }), [module, initialRecord]);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState([]);
  const oilStatus = module.key === 'oil-temperature' ? computeOilStatus(values.oil_temperature_celsius) : '';

  const handleChange = (name, value) => setValues((prev) => ({ ...prev, [name]: value }));

  const submit = (event) => {
    event.preventDefault();
    const nextErrors = validate(module, values);
    setErrors(nextErrors);
    if (!nextErrors.length) onSubmit(values);
  };

  return (
    <form className="panel p-4 sm:p-5" onSubmit={submit}>
      <div className="mb-5">
        <h2 className="text-lg font-black text-ink">{initialRecord ? 'Edit Record' : 'Add New Record'}</h2>
        <p className="mt-1 text-sm text-muted">{module.title}</p>
      </div>

      {errors.length > 0 && (
        <div className="mb-4">
          <Alert type="error">
            <ul className="list-inside list-disc">
              {errors.map((error) => <li key={error}>{error}</li>)}
            </ul>
          </Alert>
        </div>
      )}

      {module.key === 'oil-temperature' && (
        <div className="mb-4">
          <Alert>Acceptable oil temperature range is 180°C to 190°C. Deviations require corrective action before saving.</Alert>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {module.fields.map((field) => (
          <label key={field.name} className={field.type === 'textarea' ? 'md:col-span-2 xl:col-span-3' : ''}>
            <span className="label">
              {field.label} {field.required && <span className="text-danger">*</span>}
            </span>
            {field.type === 'select' ? (
              <select className="field" value={values[field.name] || ''} onChange={(event) => handleChange(field.name, event.target.value)}>
                <option value="">Select...</option>
                {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            ) : field.type === 'textarea' ? (
              <textarea className="field min-h-28" value={values[field.name] || ''} onChange={(event) => handleChange(field.name, event.target.value)} />
            ) : (
              <input
                className="field"
                type={field.type}
                step={field.step}
                value={values[field.name] || ''}
                onChange={(event) => handleChange(field.name, event.target.value)}
              />
            )}
          </label>
        ))}

        {module.key === 'oil-temperature' && oilStatus && (
          <div>
            <span className="label">Computed Status</span>
            <div className="flex h-11 items-center rounded-lg border border-slate-200 bg-slate-50 px-3">
              <Badge value={oilStatus} />
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button className="btn btn-secondary" type="button" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Record'}</button>
      </div>
    </form>
  );
}

