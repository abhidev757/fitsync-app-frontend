import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { refreshToken } from '../../axios/trainerApi';
import { setTrainerCredentials } from '../../slices/trainerAuthSlice';
import { ShieldAlert, Activity, Mail, LogOut } from 'lucide-react';

type VerificationStatus = 'pending' | 'rejected' | 'approved';

export default function VerificationStatus() {
  const [status, setStatus] = useState<VerificationStatus>('pending');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { trainerInfo } = useSelector((state: RootState) => state.trainerAuth);

  useEffect(() => {
    if (trainerInfo?.verificationStatus) {
      navigate('/trainer/trainerDashboard');
      return;
    }

    const checkStatus = async () => {
      try {
        if (status === 'pending' && loading) {
           setLoading(true);
        }

        const response = await refreshToken();
        if (response?.trainer) {
          if (response.trainer.verificationStatus) {
            dispatch(setTrainerCredentials(response.trainer));
            setStatus('approved');
            navigate('/trainer/trainerDashboard');
            return;
          }
        }
        setStatus('pending');
      } catch (error) {
        console.error('Error fetching verification status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
    const intervalId = setInterval(checkStatus, 10000);
    return () => clearInterval(intervalId);
  }, [navigate, dispatch, trainerInfo, status, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col font-sans">
        <div className="p-8 flex justify-between items-center bg-black/40 backdrop-blur-md border-b border-gray-900">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#CCFF00]">Identity Verification</span>
          <div className="flex items-center gap-2 text-gray-600 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:text-white transition-all">
            <LogOut size={14} /> <span>Abort Protocol</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center relative">
          <div className="absolute -inset-10 bg-[#CCFF00] opacity-5 blur-[120px] rounded-full"></div>
          <div className="mb-12 relative">
             <div className="absolute -inset-4 bg-[#CCFF00] rounded-full blur-xl opacity-20 animate-pulse"></div>
             <div className="relative text-center leading-none">
                <span className="block text-2xl font-black tracking-[0.3em] text-white">TS</span>
                <span className="block text-2xl font-black tracking-[0.3em] text-[#CCFF00]">OPS</span>
             </div>
          </div>
          
          <div className="w-16 h-16 border-t-2 border-b-2 border-[#CCFF00] rounded-full animate-spin shadow-[0_0_20px_rgba(204,255,0,0.2)] mb-8"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500 animate-pulse">Syncing Credential Registry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans overflow-hidden">
      {/* Tactical Navbar */}
      <div className="p-8 flex justify-between items-center bg-black/40 backdrop-blur-md border-b border-gray-900 z-10">
        <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${status === 'pending' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Security Clearance: {status}</span>
        </div>
        <a href="/trainer/trainerSignin" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 hover:text-[#CCFF00] transition-all">
            <LogOut size={14} /> Exit System
        </a>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative p-6">
        {/* Background Ambience */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[150px] opacity-10 ${status === 'pending' ? 'bg-yellow-500' : 'bg-red-600'}`}></div>

        <div className="mb-16">
            <div className="text-center leading-none opacity-50">
                <span className="block text-sm font-black tracking-[0.4em] text-white uppercase">Operational Gate</span>
                <span className="block text-sm font-black tracking-[0.4em] text-[#CCFF00] uppercase italic">Restricted Zone</span>
            </div>
        </div>
        
        {status === 'pending' && (
          <div className="bg-[#0B0B0B] border border-gray-900 rounded-[3rem] p-12 w-full max-w-xl text-center shadow-2xl relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-500 opacity-50"></div>
            <div className="bg-yellow-500/10 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-yellow-500/20 shadow-[0_0_30px_rgba(234,179,8,0.1)]">
              <Activity className="text-yellow-500" size={32} />
            </div>
            
            <p className="text-yellow-500 font-black text-[10px] tracking-[0.4em] uppercase mb-4 italic">Processing Identity</p>
            <h2 className="text-3xl font-black tracking-tighter uppercase italic text-white mb-6 leading-tight">
              Deployment Request Under Review
            </h2>
            <p className="text-gray-500 text-xs italic leading-relaxed max-w-sm mx-auto">
                System administrators are currently validating your credentials. 
                You will be automatically redirected to the <span className="text-white font-bold">Command Center</span> once clearance is granted.
            </p>
            
            {/* Tactical Loader Line */}
            <div className="mt-10 h-1 w-full bg-gray-900 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500 w-1/3 animate-[shimmer_2s_infinite] origin-left shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
            </div>
          </div>
        )}
        
        {status === 'rejected' && (
          <div className="bg-[#0B0B0B] border border-gray-900 rounded-[3rem] p-12 w-full max-w-xl text-center shadow-2xl relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-red-600 opacity-50"></div>
            <div className="bg-red-500/10 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
              <ShieldAlert className="text-red-500" size={32} />
            </div>

            <p className="text-red-500 font-black text-[10px] tracking-[0.4em] uppercase mb-4 italic">Clearance Denied</p>
            <h2 className="text-3xl font-black tracking-tighter uppercase italic text-white mb-6">
              Access Protocol Terminated
            </h2>
            <p className="text-gray-500 text-xs italic leading-relaxed max-w-sm mx-auto mb-10">
              Identity verification failed to meet FitSync OPS requirements. 
              The submitted dossier has been flagged. 
              Contact the central administration to appeal this decision.
            </p>
            
            <div className="flex flex-col gap-3">
                <button 
                  className="w-full py-5 bg-red-600 text-white font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl hover:bg-red-700 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] flex items-center justify-center gap-3"
                  onClick={() => window.location.href = '/contact-support'}
                >
                  <Mail size={16} /> Contact Admin Comms
                </button>
                <button 
                  className="w-full py-5 bg-transparent border border-gray-900 text-gray-600 font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl hover:text-white transition-all"
                  onClick={() => navigate('/trainer/trainerSignin')}
                >
                  Return to Terminal
                </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <footer className="p-10 text-center opacity-20">
            <span className="text-[9px] font-black uppercase tracking-[0.5em] text-gray-500">FitSync Registry // Restricted Data Hub</span>
      </footer>
    </div>
  );
}