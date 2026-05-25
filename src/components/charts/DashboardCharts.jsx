import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  ArcElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Bar, Doughnut, Line, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend);

const colors = ['#2563EB', '#38BDF8', '#14B8A6', '#F59E0B', '#EF4444', '#22C55E'];

const axisOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { labels: { color: '#64748B', boxWidth: 12 } } },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#64748B' } },
    y: { grid: { color: '#E2E8F0' }, ticks: { color: '#64748B', precision: 0 } },
  },
};

const radialOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom', labels: { color: '#64748B', boxWidth: 12 } } },
};

function ChartPanel({ title, children, className = '' }) {
  return (
    <section className={`panel p-4 sm:p-5 ${className}`}>
      <h2 className="mb-4 text-base font-black text-ink">{title}</h2>
      <div className="h-72 sm:h-80">{children}</div>
    </section>
  );
}

export default function DashboardCharts({ data }) {
  return (
    <div className="grid gap-4 xl:grid-cols-12">
      <ChartPanel title="Monthly Records Encoded" className="xl:col-span-8">
        <Line
          options={axisOptions}
          data={{
            labels: data.monthly.labels,
            datasets: [{
              label: 'Records',
              data: data.monthly.values,
              borderColor: '#2563EB',
              backgroundColor: 'rgba(37, 99, 235, 0.12)',
              fill: true,
              tension: 0.35,
            }],
          }}
        />
      </ChartPanel>

      <ChartPanel title="Oil Temperature Status" className="xl:col-span-4">
        <Doughnut
          options={radialOptions}
          data={{
            labels: data.oil.labels,
            datasets: [{ data: data.oil.values, backgroundColor: ['#22C55E', '#F59E0B', '#EF4444'] }],
          }}
        />
      </ChartPanel>

      <ChartPanel title="Corrective Actions by Module" className="xl:col-span-6">
        <Bar
          options={axisOptions}
          data={{
            labels: data.corrective.labels,
            datasets: [{ label: 'Corrective Actions', data: data.corrective.values, backgroundColor: colors }],
          }}
        />
      </ChartPanel>

      <ChartPanel title="Yes/No Compliance Summary" className="xl:col-span-3">
        <Doughnut
          options={radialOptions}
          data={{
            labels: data.compliance.labels,
            datasets: [{ data: data.compliance.values, backgroundColor: ['#22C55E', '#EF4444'] }],
          }}
        />
      </ChartPanel>

      <ChartPanel title="Pest Activity Summary" className="xl:col-span-3">
        <Pie
          options={radialOptions}
          data={{
            labels: data.pest.labels,
            datasets: [{ data: data.pest.values, backgroundColor: ['#22C55E', '#EF4444'] }],
          }}
        />
      </ChartPanel>
    </div>
  );
}

