import { Users, UserCog, DollarSign } from 'lucide-react';
import StatCard from '../../components/admin/StatCard';
import LineChart from '../../components/admin/LineChart';
import { ChartData } from 'chart.js';
import { RootState } from '../../store';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const { adminInfo } = useSelector((state: RootState) => state.adminAuth);

  useEffect(() => {
    if (!adminInfo) {
      navigate('/adminLogin');
    }
  }, [navigate, adminInfo]);
 
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const userGrowthData: ChartData<'line'> = {
    labels: months,
    datasets: [
      {
        label: 'Users',
        data: [650, 680, 690, 720, 740, 760, 780, 800, 820, 830, 840, 854],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const revenueGrowthData: ChartData<'line'> = {
    labels: months,
    datasets: [
      {
        label: 'Revenue',
        data: [45000, 48000, 52000, 55000, 58000, 62000, 65000, 68000, 72000, 74000, 76000, 78865],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        tension: 0.4,
      },
    ],
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Welcome to Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Total Clients" 
          value="854" 
          icon={<Users className="h-6 w-6 text-green-600" />} 
          bgColor="bg-green-100" 
        />
        <StatCard 
          title="Total Trainers" 
          value="266" 
          icon={<UserCog className="h-6 w-6 text-blue-600" />} 
          bgColor="bg-blue-100" 
        />
        <StatCard 
          title="Revenue" 
          value="$78,865" 
          icon={<DollarSign className="h-6 w-6 text-red-600" />} 
          bgColor="bg-red-100" 
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LineChart title="User Growth" data={userGrowthData} />
        <LineChart title="Revenue Growth" data={revenueGrowthData} />
      </div>
    </div>
  );
};

export default Dashboard;