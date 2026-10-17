import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface AnalyticsData {
  totalTasks: number;
  completedTasks: number;
  activeTasks: number;
  unassignedTasks: number;
  tasksByStatus: Record<string, number>;
  completionRate: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658'];

export default function AnalyticsView() {
  const { data, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ['analytics'],
    queryFn: async () => {
      const res = await api.get('/tasks/analytics');
      return res.data;
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  if (isLoading) return <div style={{ padding: '32px' }}>Loading analytics...</div>;
  if (error || !data) return <div style={{ padding: '32px' }}>Failed to load analytics</div>;

  const pieData = Object.entries(data.tasksByStatus).map(([key, value]) => ({
    name: key,
    value: value
  }));

  return (
    <div className="analytics-view" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px', overflowY: 'auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
        <div className="stat-card" style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)' }}>Total Tasks</h3>
          <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)' }}>{data.totalTasks}</div>
        </div>
        <div className="stat-card" style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)' }}>Completed</h3>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#2ecc71' }}>{data.completedTasks}</div>
        </div>
        <div className="stat-card" style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)' }}>Active</h3>
          <div style={{ fontSize: '32px', fontWeight: '800', color: '#f39c12' }}>{data.activeTasks}</div>
        </div>
        <div className="stat-card" style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)' }}>Completion Rate</h3>
          <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--brand-orange)' }}>{data.completionRate.toFixed(1)}%</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        <div className="chart-card" style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', height: '400px' }}>
          <h3 style={{ margin: '0 0 24px 0' }}>Tasks Breakdown</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card" style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', height: '400px' }}>
          <h3 style={{ margin: '0 0 24px 0' }}>Status Distribution</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pieData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="var(--brand-orange)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
