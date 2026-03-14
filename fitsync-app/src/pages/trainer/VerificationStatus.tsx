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
  }, [navigate, dispatch, trainerInfo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col font-sans">
        <div className="p-6 md:p-8 flex justify-between items-center bg-black/40 backdrop-blur-md border-b border-gray-900">
          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-[#CCFF00]">Identity Verification</span>
          <div onClick={() => navigate('/trainer/trainerSignin')} className="flex items-center gap-2 text-gray-600 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:text-white transition-all">
            <LogOut size={14} /> <span className="hidden xs:inline">Abort Protocol</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center relative px-4">
          <div className="absolute -inset-10 bg-[#CCFF00] opacity-5 blur-[80px] md:blur-[120px] rounded-full"></div>
          <div className="mb-8 md:mb-12 relative">
             <div className="absolute -inset-4 bg-[#CCFF00] rounded-full blur-xl opacity-20 animate-pulse"></div>
             <div className="relative text-center leading-none">
                <span className="block text-xl md:text-2xl font-black tracking-[0.3em] text-white">TS</span>
                <span className="block text-xl md:text-2xl font-black tracking-[0.3em] text-[#CCFF00]">OPS</span>
             </div>
          </div>
          
          <div className="w-12 h-12 md:w-16 md:h-16 border-t-2 border-b-2 border-[#CCFF00] rounded-full animate-spin shadow-[0_0_20px_rgba(204,255,0,0.2)] mb-8"></div>
          <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-gray-500 animate-pulse text-center">Syncing Credential Registry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans overflow-x-hidden">
      {/* Tactical Navbar */}
      <div className="p-6 md:p-8 flex justify-between items-center bg-black/40 backdrop-blur-md border-b border-gray-900 z-10">
        <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${status === 'pending' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-gray-400">
                Clearance: <span className="text-white">{status}</span>
            </span>
        </div>
        <a href="/trainer/trainerSignin" className="flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-gray-600 hover:text-[#CCFF00] transition-all">
            <LogOut size={14} /> <span className="hidden xs:inline">Exit System</span>
        </a>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative p-4 md:p-6">
        {/* Background Ambience - Responsive size */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full blur-[100px] md:blur-[150px] opacity-10 ${status === 'pending' ? 'bg-yellow-500' : 'bg-red-600'}`}></div>

        <div className="mb-8 md:mb-16">
            <div className="text-center leading-none opacity-50">
                <span className="block text-[10px] md:text-sm font-black tracking-[0.4em] text-white uppercase">Operational Gate</span>
                <span className="block text-[10px] md:text-sm font-black tracking-[0.4em] text-[#CCFF00] uppercase italic">Restricted Zone</span>
            </div>
        </div>
        
        <div className="w-full max-w-xl">
            {status === 'pending' && (
            <div className="bg-[#0B0B0B] border border-gray-900 rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 text-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-500 opacity-50"></div>
                <div className="bg-yellow-500/10 w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] flex items-center justify-center mx-auto mb-6 md:mb-8 border border-yellow-500/20 shadow-[0_0_30px_rgba(234,179,8,0.1)]">
                <Activity className="text-yellow-500" size={28} />
                </div>
                
                <p className="text-yellow-500 font-black text-[9px] md:text-[10px] tracking-[0.4em] uppercase mb-4 italic">Processing Identity</p>
                <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic text-white mb-6 leading-tight">
                Deployment Request Under Review
                </h2>
                <p className="text-gray-500 text-[11px] md:text-xs italic leading-relaxed max-w-sm mx-auto">
                    System administrators are currently validating your credentials. 
                    You will be automatically redirected once clearance is granted.
                </p>
                
                <div className="mt-8 md:mt-10 h-1 w-full bg-gray-900 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 w-1/3 animate-[shimmer_2s_infinite] origin-left shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
                </div>
            </div>
            )}
            
            {status === 'rejected' && (
            <div className="bg-[#0B0B0B] border border-gray-900 rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 text-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-red-600 opacity-50"></div>
                <div className="bg-red-500/10 w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] flex items-center justify-center mx-auto mb-6 md:mb-8 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                <ShieldAlert className="text-red-500" size={28} />
                </div>

                <p className="text-red-500 font-black text-[9px] md:text-[10px] tracking-[0.4em] uppercase mb-4 italic">Clearance Denied</p>
                <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic text-white mb-6">
                Access Protocol Terminated
                </h2>
                <p className="text-gray-500 text-[11px] md:text-xs italic leading-relaxed max-w-sm mx-auto mb-8 md:mb-10">
                Identity verification failed. The submitted dossier has been flagged. 
                Contact administration to appeal.
                </p>
                
                <div className="flex flex-col gap-3">
                    <button 
                    className="w-full py-4 md:py-5 bg-red-600 text-white font-black uppercase text-[9px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em] rounded-xl md:rounded-2xl hover:bg-red-700 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] flex items-center justify-center gap-3"
                    onClick={() => window.location.href = '/contact-support'}
                    >
                    <Mail size={16} /> Contact Admin
                    </button>
                    <button 
                    className="w-full py-4 md:py-5 bg-transparent border border-gray-900 text-gray-600 font-black uppercase text-[9px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em] rounded-xl md:rounded-2xl hover:text-white transition-all"
                    onClick={() => navigate('/trainer/trainerSignin')}
                    >
                    Return to Terminal
                    </button>
                </div>
            </div>
            )}
        </div>
      </div>

      {/* Footer Branding */}
      <footer className="p-6 md:p-10 text-center opacity-20">
            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-gray-500">FitSync Registry // Restricted Data Hub</span>
      </footer>
    </div>
  );
}