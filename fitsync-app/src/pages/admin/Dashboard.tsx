import { Users, UserCog, DollarSign } from 'lucide-react';
import StatCard from '../../components/admin/StatCard';
import LineChart from '../../components/admin/LineChart';
import { ChartData } from 'chart.js';
import { RootState } from '../../store';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminDashboardStats } from '../../axios/adminApi';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface DashboardStats {
  totalUsers: number;
  totalTrainers: number;
  totalRevenue: number;
  userGrowth: number[];
  revenueGrowth: number[];
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { adminInfo } = useSelector((state: RootState) => state.adminAuth);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adminInfo) { navigate('/adminLogin'); return; }
    getAdminDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [adminInfo, navigate]);

  const userGrowthData: ChartData<'line'> = {
    labels: MONTHS,
    datasets: [{
      label: 'New Users',
      data: stats?.userGrowth ?? Array(12).fill(0),
      borderColor: 'rgb(99, 102, 241)',
      backgroundColor: 'rgba(99, 102, 241, 0.15)',
      tension: 0.4,
      fill: true,
    }],
  };

  const revenueGrowthData: ChartData<'line'> = {
    labels: MONTHS,
    datasets: [{
      label: 'Revenue (₹)',
      data: stats?.revenueGrowth ?? Array(12).fill(0),
      borderColor: 'rgb(217, 255, 0)',
      backgroundColor: 'rgba(217, 255, 0, 0.1)',
      tension: 0.4,
      fill: true,
    }],
  };

  const fmt = (n: number) =>
    n >= 1_000_000 ? `₹${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000 ? `₹${(n / 1_000).toFixed(1)}K`
    : `₹${n}`;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Welcome to Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Clients"
          value={loading ? '—' : String(stats?.totalUsers ?? 0)}
          icon={<Users className="h-6 w-6 text-green-600" />}
          bgColor="bg-green-100"
        />
        <StatCard
          title="Total Trainers"
          value={loading ? '—' : String(stats?.totalTrainers ?? 0)}
          icon={<UserCog className="h-6 w-6 text-blue-600" />}
          bgColor="bg-blue-100"
        />
        <StatCard
          title="Total Revenue"
          value={loading ? '—' : fmt(stats?.totalRevenue ?? 0)}
          icon={<DollarSign className="h-6 w-6 text-red-600" />}
          bgColor="bg-red-100"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LineChart title="User Growth (This Year)" data={userGrowthData} />
        <LineChart title="Revenue Growth (This Year)" data={revenueGrowthData} />
      </div>
    </div>
  );
};

export default Dashboard;