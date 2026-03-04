import React, { useEffect, useState } from 'react';
import { Users, Calendar, Clock, DollarSign } from 'lucide-react';
import { getTrainerDashboardStats } from '../../axios/trainerApi';

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface UpcomingSession {
  clientName: string;
  clientAvatar: string | null;
  date: string;
  time: string;
  status: string;
}

interface TrainerStats {
  totalClients: number;
  upcomingCount: number;
  totalSessions: number;
  walletBalance: number;
  upcomingList: UpcomingSession[];
  monthlyEarnings: number[];
  monthLabels: string[];
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  bgColor: string;
}

const StatCard = ({ icon, title, value, bgColor }: StatCardProps) => (
  <div className={`rounded-lg p-6 ${bgColor}`}>
    <div className="flex items-center gap-3 mb-2">
      {icon}
      <span className="text-gray-400 text-sm">{title}</span>
    </div>
    <div className="text-2xl font-semibold text-white">{value}</div>
  </div>
);

const STATUS_COLORS: Record<string, string> = {
  confirmed: 'text-green-500',
  pending: 'text-yellow-500',
  cancelled: 'text-red-500',
  completed: 'text-blue-400',
};

const TrainerDashboard = () => {
  const [stats, setStats] = useState<TrainerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTrainerDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const earningsChartData = {
    labels: stats?.monthLabels ?? [],
    datasets: [{
      label: 'Earnings (₹)',
      data: stats?.monthlyEarnings ?? [],
      backgroundColor: 'rgba(217, 255, 0, 0.7)',
      borderColor: 'rgb(217, 255, 0)',
      borderWidth: 1,
      borderRadius: 4,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Monthly Earnings (Last 6 Months)',
        color: '#fff',
        font: { size: 14, weight: 'bold' as const },
      },
    },
    scales: {
      x: { ticks: { color: '#9ca3af' }, grid: { display: false } },
      y: { ticks: { color: '#9ca3af' }, beginAtZero: true },
    },
  };

  const fmt = (n: number) =>
    n >= 1_000_000 ? `₹${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000 ? `₹${(n / 1_000).toFixed(1)}K`
    : `₹${n}`;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">My Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<Users className="h-6 w-6 text-green-500" />}
          title="Total Clients"
          value={loading ? '—' : String(stats?.totalClients ?? 0)}
          bgColor="bg-green-500/10"
        />
        <StatCard
          icon={<Calendar className="h-6 w-6 text-blue-500" />}
          title="Upcoming Sessions"
          value={loading ? '—' : String(stats?.upcomingCount ?? 0)}
          bgColor="bg-blue-500/10"
        />
        <StatCard
          icon={<Clock className="h-6 w-6 text-purple-500" />}
          title="Total Sessions"
          value={loading ? '—' : String(stats?.totalSessions ?? 0)}
          bgColor="bg-purple-500/10"
        />
        <StatCard
          icon={<DollarSign className="h-6 w-6 text-yellow-400" />}
          title="Wallet Balance"
          value={loading ? '—' : fmt(stats?.walletBalance ?? 0)}
          bgColor="bg-yellow-400/10"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Upcoming Sessions Table */}
        <div className="lg:col-span-3">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Upcoming Sessions</h2>
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <p className="text-gray-400 text-sm text-center py-6">Loading…</p>
              ) : !stats?.upcomingList?.length ? (
                <p className="text-gray-500 text-sm text-center py-6">No upcoming sessions.</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="text-gray-400 text-sm uppercase">
                      <th className="text-left py-3 px-4">Client</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Time</th>
                      <th className="text-left py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.upcomingList.map((s, i) => (
                      <tr key={i} className="border-t border-gray-700">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            {s.clientAvatar
                              ? <img src={s.clientAvatar} alt={s.clientName} className="w-7 h-7 rounded-full object-cover" />
                              : <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center text-xs text-white">{s.clientName[0]}</div>
                            }
                            <span className="text-white text-sm">{s.clientName}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-white text-sm">{s.date}</td>
                        <td className="py-4 px-4 text-white text-sm">{s.time}</td>
                        <td className="py-4 px-4">
                          <span className={`text-sm capitalize font-medium ${STATUS_COLORS[s.status] ?? 'text-gray-400'}`}>
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Earnings Chart */}
        <div className="bg-gray-800 rounded-lg p-6 flex flex-col">
          <div className="flex-1 min-h-[220px]">
            <Bar data={earningsChartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerDashboard;