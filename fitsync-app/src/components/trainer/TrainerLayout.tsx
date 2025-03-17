// src/components/trainer/TrainerLayout.tsx
import { Outlet } from 'react-router-dom';
import TrainerSidebar from './TrainerSidebar';
import TrainerHeader from './TrainerHeader';

const TrainerLayout = () => {
  return (
    <div className="flex h-screen bg-gray-900">
      <TrainerSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TrainerHeader />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TrainerLayout;