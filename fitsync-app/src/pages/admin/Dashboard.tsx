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
      pointRadius: 3, // Smaller points for mobile clarity
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
      pointRadius: 3,
    }],
  };

  const fmt = (n: number) =>
    n >= 1_000_000 ? `₹${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000 ? `₹${(n / 1_000).toFixed(1)}K`
    : `₹${n}`;

  return (
    <div className="p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Welcome to Dashboard
        </h1>
        <p className="text-gray-500 text-xs sm:text-sm mt-1 uppercase tracking-widest font-bold">
          System Overview // 2026
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <StatCard
          title="Total Clients"
          value={loading ? '—' : String(stats?.totalUsers ?? 0)}
          icon={<Users className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />}
          bgColor="bg-green-100"
        />
        <StatCard
          title="Total Trainers"
          value={loading ? '—' : String(stats?.totalTrainers ?? 0)}
          icon={<UserCog className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
          bgColor="bg-blue-100"
        />
        {/* Full width on sm:grid but back to 1/3 on lg:grid */}
        <div className="sm:col-span-2 lg:col-span-1">
          <StatCard
            title="Total Revenue"
            value={loading ? '—' : fmt(stats?.totalRevenue ?? 0)}
            icon={<DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />}
            bgColor="bg-red-100"
          />
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Wrapping charts in a container to ensure they handle overflow/aspect ratio on tiny screens */}
        <div className="bg-gray-900/40 p-1 rounded-2xl border border-gray-800">
          <LineChart title="User Growth" data={userGrowthData} />
        </div>
        <div className="bg-gray-900/40 p-1 rounded-2xl border border-gray-800">
          <LineChart title="Revenue Growth" data={revenueGrowthData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;