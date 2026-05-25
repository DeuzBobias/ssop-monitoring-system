import { Search } from 'lucide-react';
import { getStatusOptions } from '../../utils/modules';

export default function Filters({ module, filters, setFilters, onReset }) {
  const statusOptions = getStatusOptions(module);

  return (
    <div className="panel no-print p-4 sm:p-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-12">
        <label className="sm:col-span-2 lg:col-span-4">
          <span className="label">Search</span>
          <span className="relative block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              className="field pl-10"
              value={filters.search}
              onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
              placeholder="Search records..."
            />
          </span>
        </label>

        <label className="lg:col-span-2">
          <span className="label">Start Date</span>
          <input
            className="field"
            type="date"
            value={filters.startDate}
            onChange={(event) => setFilters((prev) => ({ ...prev, startDate: event.target.value }))}
          />
        </label>

        <label className="lg:col-span-2">
          <span className="label">End Date</span>
          <input
            className="field"
            type="date"
            value={filters.endDate}
            onChange={(event) => setFilters((prev) => ({ ...prev, endDate: event.target.value }))}
          />
        </label>

        <label className="lg:col-span-2">
          <span className="label">{module.statusLabel}</span>
          <select
            className="field"
            value={filters.status}
            onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
          >
            <option value="">All</option>
            {statusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>

        <div className="flex items-end lg:col-span-2">
          <button className="btn btn-secondary w-full" type="button" onClick={onReset}>Reset</button>
        </div>
      </div>
    </div>
  );
}

