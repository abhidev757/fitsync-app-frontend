// src/components/trainer/TrainerLayout.tsx
import { Outlet } from 'react-router-dom';
import TrainerSidebar from './TrainerSidebar';
import TrainerHeader from './TrainerHeader';

const TrainerLayout = () => {
  return (
    /* FIX: Changed h-screen to min-h-screen and removed overflow-hidden 
       on the outer wrapper to ensure the Obsidian background (#0B0B0B) 
       covers the entire page even if content grows.
    */
    <div className="flex min-h-screen bg-black">
      <TrainerSidebar />
      
      <div className="flex-1 flex flex-col">
        <TrainerHeader />
        
        {/* Main Content Area: 
           Using bg-[#0B0B0B] to ensure consistency with your high-end theme.
        */}
        <main className="flex-1 p-8 lg:p-12">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Tactical Footer / Status Bar (Optional) */}
        <footer className="p-6 border-t border-gray-900 bg-black/40 text-center">
             <p className="text-gray-800 text-[9px] font-black uppercase tracking-[0.4em]">
                FitSync Operational Grid // System Active
             </p>
        </footer>
      </div>
    </div>
  );
};

export default TrainerLayout;