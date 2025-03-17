import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  bgColor: string;
}

const StatCard = ({ title, value, icon, bgColor }: StatCardProps) => {
  return (
    <div className={`rounded-lg p-6 ${bgColor}`}>
      <div className="flex flex-col">
        <div className="flex items-center mb-2">
          <div className="mr-2">
            {icon}
          </div>
          <h3 className="text-sm text-gray-600">{title}</h3>
        </div>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;