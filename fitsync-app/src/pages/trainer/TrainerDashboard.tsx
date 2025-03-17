// src/pages/trainer/TrainerDashboard.tsx
import { Users, Calendar, Clock, DollarSign } from 'lucide-react';

interface ChatMessage {
  id: number;
  name: string;
  message: string;
  time: string;
  avatar: string;
}

interface Session {
  patientName: string;
  date: string;
  time: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
}

const TrainerDashboard = () => {
  const chatMessages: ChatMessage[] = [
    {
      id: 1,
      name: "Annette Black",
      message: "Hey, what diet should I follow?",
      time: "05:00 pm",
      avatar: "/placeholder.svg?height=40&width=40"
    },
    {
      id: 2,
      name: "Courtney Henry",
      message: "Hello",
      time: "09:00 pm",
      avatar: "/placeholder.svg?height=40&width=40"
    },
    {
      id: 3,
      name: "Robert Fox",
      message: "It was a good session.",
      time: "11:00 am",
      avatar: "/placeholder.svg?height=40&width=40"
    },
    {
      id: 4,
      name: "Devon Lane",
      message: "See you on the next Monday.",
      time: "13:00 pm",
      avatar: "/placeholder.svg?height=40&width=40"
    }
  ];

  const sessions: Session[] = [
    {
      patientName: "John Doe",
      date: "2023-10-10",
      time: "10:00 AM",
      status: "Pending"
    },
    {
      patientName: "Jane Smith",
      date: "2023-10-11",
      time: "11:00 AM",
      status: "Confirmed"
    },
    {
      patientName: "Emily Johnson",
      date: "2023-10-12",
      time: "12:00 PM",
      status: "Cancelled"
    }
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">My Task</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<Users className="h-6 w-6 text-green-500" />}
          title="Total clients"
          value="85"
          bgColor="bg-green-500/10"
        />
        <StatCard
          icon={<Calendar className="h-6 w-6 text-blue-500" />}
          title="Upcoming Sessions"
          value="15"
          bgColor="bg-blue-500/10"
        />
        <StatCard
          icon={<Clock className="h-6 w-6 text-purple-500" />}
          title="Total Sessions"
          value="120"
          bgColor="bg-purple-500/10"
        />
        <StatCard
          icon={<DollarSign className="h-6 w-6 text-red-500" />}
          title="Pending Due"
          value="$ 1500"
          bgColor="bg-red-500/10"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Content */}
        <div className="lg:col-span-3">
          {/* Upcoming Sessions */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Upcoming Sessions</h2>
              <button className="text-blue-500 hover:text-blue-400">
                See board
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-gray-400 text-sm uppercase">
                    <th className="text-left py-3 px-4">Patient Name</th>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Time</th>
                    <th className="text-left py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-black rounded-lg">
                  {sessions.map((session, index) => (
                    <tr key={index} className="border-t border-gray-800">
                      <td className="py-4 px-4 text-white">{session.patientName}</td>
                      <td className="py-4 px-4 text-white">{session.date}</td>
                      <td className="py-4 px-4 text-white">{session.time}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`${
                            session.status === 'Confirmed'
                              ? 'text-green-500'
                              : session.status === 'Pending'
                              ? 'text-yellow-500'
                              : 'text-red-500'
                          }`}
                        >
                          {session.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Chat */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">New Chat</h2>
          <div className="space-y-4">
            {chatMessages.map((message) => (
              <div key={message.id} className="flex items-start gap-3 pb-4 border-b border-gray-700">
                <img
                  src={message.avatar || "/placeholder.svg"}
                  alt={message.name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="text-white font-medium">{message.name}</h3>
                    <span className="text-gray-400 text-sm">{message.time}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{message.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

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

export default TrainerDashboard;