import React, { useEffect, useState } from 'react';
import { Users, Calendar, DollarSign, Activity, TrendingUp, ChevronRight } from 'lucide-react';
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
  trend: string;
}

const StatCard = ({ icon, title, value, trend }: StatCardProps) => (
  <div className="bg-[#0B0B0B] border border-gray-900 rounded-[2rem] p-8 group hover:border-[#CCFF00]/40 transition-all duration-300 relative overflow-hidden">
    <div className="absolute top-0 right-0 w-24 h-24 bg-[#CCFF00] opacity-0 group-hover:opacity-5 blur-3xl transition-opacity"></div>
    <div className="flex justify-between items-start mb-6">
      <div className="p-4 bg-black border border-gray-800 rounded-2xl text-[#CCFF00]">
        {icon}
      </div>
      <div className="flex items-center gap-1 text-[#CCFF00] text-[10px] font-black uppercase tracking-widest">
        <TrendingUp size={12} /> {trend}
      </div>
    </div>
    <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{title}</p>
    <div className="text-3xl font-black italic tracking-tighter text-white uppercase">{value}</div>
  </div>
);

const STATUS_INDICATORS: Record<string, string> = {
  confirmed: 'bg-yellow-500',
  pending: 'bg-orange-500',
  cancelled: 'bg-red-600',
  completed: 'bg-[#CCFF00]',
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
      label: 'Revenue',
      data: stats?.monthlyEarnings ?? [],
      backgroundColor: '#CCFF00',
      borderRadius: 8,
      hoverBackgroundColor: '#e6ff80',
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0B0B0B',
        titleFont: { size: 10, weight: 'bold' as const, family: 'Inter' },
        bodyFont: { size: 12, family: 'Inter' },
        borderColor: '#1f2937',
        borderWidth: 1,
        displayColors: false,
      }
    },
    scales: {
      x: { 
        ticks: { color: '#4b5563', font: { size: 10, weight: 'bold' as const } }, 
        grid: { display: false } 
      },
      y: { 
        ticks: { color: '#4b5563', font: { size: 10 } }, 
        grid: { color: '#111827' } 
      },
    },
  };

  const fmt = (n: number) =>
    n >= 1_000_000 ? `₹${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000 ? `₹${(n / 1_000).toFixed(1)}K`
    : `₹${n}`;

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
        <Activity className="animate-pulse mb-4 text-[#CCFF00]" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em]">Booting Command Center...</p>
    </div>
  );

  return (
    <div className="space-y-10">
      <header>
        <p className="text-[#CCFF00] font-black text-xs tracking-[0.3em] uppercase mb-2">Operational Overview</p>
        <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">Trainer Command Center</h1>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          icon={<Users size={24} />}
          title="Active Personnel"
          value={String(stats?.totalClients ?? 0)}
          trend="+12%"
        />
        <StatCard
          icon={<Calendar size={24} />}
          title="Upcoming Deployments"
          value={String(stats?.upcomingCount ?? 0)}
          trend="Steady"
        />
        <StatCard
          icon={<Activity size={24} />}
          title="Session Load"
          value={String(stats?.totalSessions ?? 0)}
          trend="+5%"
        />
        <StatCard
          icon={<DollarSign size={24} />}
          title="System Assets"
          value={fmt(stats?.walletBalance ?? 0)}
          trend="Growth"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Upcoming Roster */}
        <div className="xl:col-span-8 bg-[#0B0B0B] border border-gray-900 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Daily Deployment Roster</h2>
            <button className="text-[10px] font-black text-[#CCFF00] uppercase tracking-widest border-b border-[#CCFF00] pb-1 hover:text-white hover:border-white transition-all">View Full Grid</button>
          </div>
          
          <div className="overflow-x-auto">
            {!stats?.upcomingList?.length ? (
              <p className="text-gray-700 text-[10px] font-black uppercase tracking-[0.3em] text-center py-12">No deployments active in current sector.</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em] border-b border-gray-900">
                    <th className="text-left pb-4 px-2">Personnel</th>
                    <th className="text-left pb-4 px-2">Timestamp</th>
                    <th className="text-left pb-4 px-2">Status</th>
                    <th className="text-right pb-4 px-2">Protocol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-900">
                  {stats.upcomingList.map((s, i) => (
                    <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="py-6 px-2">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className={`absolute -inset-1 rounded-full blur-sm opacity-20 ${STATUS_INDICATORS[s.status]}`}></div>
                            {s.clientAvatar
                              ? <img src={s.clientAvatar} alt="" className="w-10 h-10 rounded-xl object-cover border border-gray-800 grayscale group-hover:grayscale-0 transition-all" />
                              : <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-xs font-black border border-gray-800 text-gray-500">{s.clientName[0]}</div>
                            }
                          </div>
                          <span className="text-white font-black italic uppercase tracking-tight text-sm">{s.clientName}</span>
                        </div>
                      </td>
                      <td className="py-6 px-2">
                        <p className="text-xs font-bold text-white italic">{s.date}</p>
                        <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{s.time}</p>
                      </td>
                      <td className="py-6 px-2">
                        <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${STATUS_INDICATORS[s.status]}`}></div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white italic">{s.status}</span>
                        </div>
                      </td>
                      <td className="py-6 px-2 text-right">
                        <button className="p-3 bg-black border border-gray-800 rounded-xl text-gray-700 hover:text-[#CCFF00] hover:border-[#CCFF00] transition-all">
                            <ChevronRight size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Revenue Analytics */}
        <div className="xl:col-span-4 bg-[#0B0B0B] border border-gray-900 rounded-[2.5rem] p-8 flex flex-col shadow-2xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#CCFF00] opacity-5 blur-[80px]"></div>
          <h2 className="text-xl font-black italic uppercase tracking-tighter text-white mb-2 text-center lg:text-left">Revenue Stream</h2>
          <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] mb-10 text-center lg:text-left">Quarterly Asset Growth</p>
          
          <div className="flex-1 min-h-[300px]">
            <Bar data={earningsChartData} options={chartOptions} />
          </div>

          <div className="mt-8 pt-8 border-t border-gray-900 flex justify-between items-center">
             <div>
                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Total Yield</p>
                <p className="text-2xl font-black italic text-[#CCFF00] tracking-tighter">{fmt(stats?.monthlyEarnings.reduce((a, b) => a + b, 0) ?? 0)}</p>
             </div>
             <div className="text-right">
                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Efficiency</p>
                <p className="text-2xl font-black italic text-white tracking-tighter">98.4%</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerDashboard;