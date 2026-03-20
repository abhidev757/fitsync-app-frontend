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
  <div className="bg-[#0B0B0B] border border-gray-900 rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 group hover:border-[#CCFF00]/40 transition-all duration-300 relative overflow-hidden">
    <div className="absolute top-0 right-0 w-24 h-24 bg-[#CCFF00] opacity-0 group-hover:opacity-5 blur-3xl transition-opacity"></div>
    <div className="flex justify-between items-start mb-4 md:mb-6">
      <div className="p-3 md:p-4 bg-black border border-gray-800 rounded-xl md:rounded-2xl text-[#CCFF00] shrink-0">
        {React.cloneElement(icon as React.ReactElement)}
      </div>
      <div className="flex items-center gap-1 text-[#CCFF00] text-[8px] md:text-[10px] font-black uppercase tracking-widest">
        <TrendingUp size={10} /> {trend}
      </div>
    </div>
    <p className="text-gray-500 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-1">{title}</p>
    <div className="text-2xl md:text-3xl font-black italic tracking-tighter text-white uppercase">{value}</div>
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
      borderRadius: 4,
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
        titleFont: { size: 10, weight: 'bold' as const },
        bodyFont: { size: 12 },
        borderColor: '#1f2937',
        borderWidth: 1,
        displayColors: false,
      }
    },
    scales: {
      x: { 
        ticks: { color: '#4b5563', font: { size: 9, weight: 'bold' as const } }, 
        grid: { display: false } 
      },
      y: { 
        ticks: { color: '#4b5563', font: { size: 9 } }, 
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
        <p className="text-[10px] font-black uppercase tracking-[0.4em]">Calibrating Command Center...</p>
    </div>
  );

  return (
    <div className="space-y-6 md:space-y-10 p-4 md:p-0 pb-24 md:pb-8">
      <header className="space-y-1">
        <p className="text-[#CCFF00] font-black text-[10px] md:text-xs tracking-[0.3em] uppercase">Operational Overview</p>
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic text-white leading-none">Command Center</h1>
      </header>

      {/* Stats Cards - 2 Columns on Mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <StatCard icon={<Users size={20}/>} title="Personnel" value={String(stats?.totalClients ?? 0)} trend="+12%" />
        <StatCard icon={<Calendar />} title="Deployments" value={String(stats?.upcomingCount ?? 0)} trend="Steady" />
        <StatCard icon={<Activity />} title="Load" value={String(stats?.totalSessions ?? 0)} trend="+5%" />
        <StatCard icon={<DollarSign />} title="Assets" value={fmt(stats?.walletBalance ?? 0)} trend="Growth" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8">
        
        {/* Upcoming Roster */}
        <div className="xl:col-span-8 bg-[#0B0B0B] border border-gray-900 rounded-[2rem] p-6 md:p-8 shadow-2xl overflow-hidden">
          <div className="flex justify-between items-center mb-8 md:mb-10">
            <h2 className="text-lg md:text-xl font-black italic uppercase tracking-tighter text-white">Deployment Roster</h2>
            <button className="text-[9px] md:text-[10px] font-black text-[#CCFF00] uppercase tracking-widest border-b border-[#CCFF00] pb-1 active:text-white transition-all">View Grid</button>
          </div>
          
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            {!stats?.upcomingList?.length ? (
              <p className="text-gray-700 text-[10px] font-black uppercase tracking-[0.3em] text-center py-12">No deployments active.</p>
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
                    <RosterRow key={i} s={s} />
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Mobile List (Replaces Table) */}
          <div className="md:hidden space-y-4">
            {!stats?.upcomingList?.length ? (
               <p className="text-gray-700 text-[10px] font-black uppercase text-center py-8 italic">No active data.</p>
            ) : (
              stats.upcomingList.map((s, i) => (
                <div key={i} className="bg-black border border-gray-900 rounded-2xl p-4 flex items-center justify-between group active:border-[#CCFF00]/40 transition-all">
                  <div className="flex items-center gap-4">
                    <img 
                      src={s.clientAvatar || `https://ui-avatars.com/api/?name=${s.clientName}&background=0D1117&color=4b5563`} 
                      className="w-10 h-10 rounded-xl object-cover grayscale group-active:grayscale-0" 
                      alt="" 
                    />
                    <div>
                      <p className="text-xs font-black uppercase italic text-white leading-tight">{s.clientName}</p>
                      <p className="text-[9px] font-bold text-gray-500 mt-1 uppercase tracking-tight">{s.date} // {s.time}</p>
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${STATUS_INDICATORS[s.status]} shadow-[0_0_8px_currentColor]`}></div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Revenue Analytics */}
        <div className="xl:col-span-4 bg-[#0B0B0B] border border-gray-900 rounded-[2rem] p-6 md:p-8 flex flex-col shadow-2xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#CCFF00] opacity-5 blur-[80px]"></div>
          <h2 className="text-lg md:text-xl font-black italic uppercase tracking-tighter text-white mb-1">Yield Analysis</h2>
          <p className="text-[8px] md:text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] mb-8">Asset Growth Flow</p>
          
          <div className="h-[200px] md:h-[250px] lg:flex-1">
            <Bar data={earningsChartData} options={chartOptions} />
          </div>

          <div className="mt-8 pt-6 border-t border-gray-900 flex justify-between items-center">
             <div>
                <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Total Yield</p>
                <p className="text-xl md:text-2xl font-black italic text-[#CCFF00] tracking-tighter leading-none">{fmt(stats?.monthlyEarnings.reduce((a, b) => a + b, 0) ?? 0)}</p>
             </div>
             <div className="text-right">
                <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Efficiency</p>
                <p className="text-xl md:text-2xl font-black italic text-white tracking-tighter leading-none">98.4%</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RosterRow = ({ s }: { s: UpcomingSession }) => (
  <tr className="group hover:bg-white/[0.02] transition-colors">
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
      <button className="p-3 bg-black border border-gray-900 rounded-xl text-gray-700 hover:text-[#CCFF00] hover:border-[#CCFF00] transition-all active:scale-90">
          <ChevronRight size={16} />
      </button>
    </td>
  </tr>
);

export default TrainerDashboard;