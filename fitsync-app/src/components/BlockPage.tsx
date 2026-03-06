import { ShieldAlert, Mail, Lock, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const BlockedPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-6 font-sans overflow-hidden relative">
      {/* Background glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600 opacity-5 blur-[120px] pointer-events-none"></div>

      <div className="max-w-xl w-full bg-[#0B0B0B] border border-gray-900 rounded-[2.5rem] p-10 md:p-16 shadow-2xl relative z-10 text-center">
        
        {/* Warning Icon Cluster */}
        <div className="flex justify-center mb-8">
            <div className="relative">
                <div className="absolute -inset-4 bg-red-600 rounded-full blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-black border border-red-900/50 p-6 rounded-3xl shadow-xl">
                    <ShieldAlert size={48} className="text-red-500 stroke-[1.5px]" />
                </div>
            </div>
        </div>

        <div className="space-y-4 mb-10">
            <p className="text-red-500 font-black text-xs tracking-[0.4em] uppercase italic">Security Protocol Active</p>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">Access Terminated</h1>
            <div className="w-16 h-1 bg-red-600 mx-auto rounded-full"></div>
        </div>

        <p className="text-gray-500 font-medium leading-relaxed mb-10 italic">
          System logs indicate your credentials have been restricted by the central administrator. 
          Your current session has been suspended until further verification.
        </p>

        <div className="grid grid-cols-1 gap-4 mb-10">
            <div className="flex items-center gap-4 bg-black border border-gray-900 p-4 rounded-2xl group transition-all hover:border-red-900/40">
                <div className="p-3 bg-gray-900 rounded-xl text-red-500">
                    <Lock size={18} />
                </div>
                <div className="text-left">
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Reason</p>
                    <p className="text-sm font-bold text-white uppercase italic">Account Suspension</p>
                </div>
            </div>
            
            <Link 
                to="/contact" 
                className="flex items-center gap-4 bg-black border border-gray-900 p-4 rounded-2xl group transition-all hover:border-[#CCFF00]/40"
            >
                <div className="p-3 bg-gray-900 rounded-xl text-[#CCFF00]">
                    <Mail size={18} />
                </div>
                <div className="text-left">
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Appeal Channel</p>
                    <p className="text-sm font-bold text-white uppercase italic group-hover:text-[#CCFF00] transition-colors">Contact Support Team</p>
                </div>
            </Link>
        </div>

        <button 
            onClick={() => window.location.href = '/'}
            className="w-full py-5 bg-gray-900 hover:bg-white hover:text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-white transition-all active:scale-95"
        >
          Return to Entry Point
        </button>

      </div>

      <div className="mt-12 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-gray-800 text-[10px] font-black uppercase tracking-[0.5em]">
              <AlertTriangle size={12} /> SYSTEM_LOCK_ID_772
          </div>
          <p className="text-gray-800 text-[9px] font-black uppercase tracking-[0.4em]">
            FITSYNC CENTRAL COMMAND // 2026
          </p>
      </div>
    </div>
  );
};

export default BlockedPage;