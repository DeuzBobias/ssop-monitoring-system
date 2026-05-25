import { useEffect, useMemo, useState } from 'react';
import DashboardCharts from '../../components/charts/DashboardCharts';
import Loading from '../../components/ui/Loading';
import StatCard from '../../components/ui/StatCard';
import { supabase } from '../../services/supabaseClient';
import { modules } from '../../utils/modules';
import { hasCorrectiveAction } from '../../utils/formatters';

function monthKey(date) {
  return new Date(date).toLocaleDateString('en-PH', { month: 'short', year: 'numeric' });
}

export default function DashboardPage() {
  const [recordsByModule, setRecordsByModule] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      const entries = await Promise.all(modules.map(async (module) => {
        const { data, error } = await supabase.from(module.table).select('*');
        if (error) throw error;
        return [module.key, data || []];
      }));
      if (active) {
        setRecordsByModule(Object.fromEntries(entries));
        setLoading(false);
      }
    }
    load().catch((error) => {
      console.error(error);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const summary = useMemo(() => {
    const all = modules.flatMap((module) => (recordsByModule[module.key] || []).map((record) => ({ module, record })));
    const totals = Object.fromEntries(modules.map((module) => [module.key, recordsByModule[module.key]?.length || 0]));
    const corrective = all.filter(({ module, record }) => hasCorrectiveAction(record, module)).length;
    const oil = recordsByModule['oil-temperature'] || [];
    const pest = recordsByModule['pest-control'] || [];
    const raw = recordsByModule['raw-materials'] || [];
    const trucks = recordsByModule['delivery-truck'] || [];
    const pending = all.filter(({ module, record }) => module.qaField && !record[module.qaField]).length;

    const monthlyMap = new Map();
    all.forEach(({ module, record }) => {
      const key = monthKey(record[module.dateField] || record.created_at);
      monthlyMap.set(key, (monthlyMap.get(key) || 0) + 1);
    });

    return {
      totals,
      corrective,
      oilDeviations: oil.filter((record) => record.status !== 'Normal').length,
      pestObserved: pest.filter((record) => record.pest_activity_observed === 'Yes').length,
      damagedPackaging: raw.filter((record) => record.packaging_condition === 'Damaged').length,
      truckIssues: trucks.filter((record) => record.maintenance_issues === 'Yes').length,
      pending,
      charts: {
        monthly: { labels: [...monthlyMap.keys()], values: [...monthlyMap.values()] },
        corrective: {
          labels: modules.map((module) => module.shortTitle),
          values: modules.map((module) => (recordsByModule[module.key] || []).filter((record) => hasCorrectiveAction(record, module)).length),
        },
        oil: {
          labels: ['Normal', 'Below Range', 'Above Range'],
          values: ['Normal', 'Below Range', 'Above Range'].map((status) => oil.filter((record) => record.status === status).length),
        },
        compliance: {
          labels: ['Compliant / Yes', 'Non-compliant / No'],
          values: [
            (recordsByModule['stock-management'] || []).filter((r) => r.fifo_fefo_followed === 'Yes').length
              + (recordsByModule['raw-materials'] || []).filter((r) => r.within_specs === 'Yes').length
              + (recordsByModule['cleaning-sanitation'] || []).filter((r) => r.standard === 'Yes').length,
            (recordsByModule['stock-management'] || []).filter((r) => r.fifo_fefo_followed === 'No').length
              + (recordsByModule['raw-materials'] || []).filter((r) => r.within_specs === 'No').length
              + (recordsByModule['cleaning-sanitation'] || []).filter((r) => r.standard === 'No').length,
          ],
        },
        pest: {
          labels: ['No', 'Yes'],
          values: ['No', 'Yes'].map((value) => pest.filter((record) => record.pest_activity_observed === value).length),
        },
      },
    };
  }, [recordsByModule]);

  if (loading) return <Loading label="Loading dashboard..." />;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => (
          <StatCard key={module.key} label={module.shortTitle} value={summary.totals[module.key]} hint="Total encoded records" />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Records Needing Corrective Action" value={summary.corrective} tone="text-warning" />
        <StatCard label="Oil Temperature Deviations" value={summary.oilDeviations} tone="text-danger" />
        <StatCard label="Pest Activity Observations" value={summary.pestObserved} tone="text-danger" />
        <StatCard label="Damaged Packaging Records" value={summary.damagedPackaging} tone="text-warning" />
        <StatCard label="Pending QA Verifications" value={summary.pending} tone="text-primary" />
      </div>

      <DashboardCharts data={summary.charts} />
    </div>
  );
}

