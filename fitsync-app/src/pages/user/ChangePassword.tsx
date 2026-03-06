import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../../axios/userApi';
import { toast } from 'react-toastify';
import { Lock, ShieldCheck, AlertCircle } from 'lucide-react';

const ChangePassword: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
  
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Protocol error: All fields required');
      return;
    }
  
    if (newPassword !== confirmPassword) {
      setError('Mismatch: New credentials do not align');
      return;
    }
  
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      if (!userId) throw new Error('Auth Error: Session expired');
      
      const response = await changePassword(userId, { currentPassword, newPassword });
  
      if (response.success) {
        setSuccess(true);
        toast.success("Security Updated: Credentials synced");
        setTimeout(() => navigate("/user/userProfile"), 1500);
      } else {
        setError(response.message || 'Verification failed');
      }
    } catch (err: unknown) {
      let errorMessage = 'System Error: Unexpected disruption';
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
      if (!success) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-6 font-sans">
      <div className="bg-[#0B0B0B] border border-gray-900 rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#CCFF00] opacity-5 blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col items-center mb-8">
            <div className="bg-[#CCFF00]/10 p-4 rounded-2xl border border-[#CCFF00]/20 mb-4">
                <Lock className="text-[#CCFF00]" size={28} />
            </div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white text-center">
              Change Credentials
            </h1>
            <p className="text-center text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
              Update Security Protocol
            </p>
        </div>

        {success && (
          <div className="bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] px-4 py-3 rounded-xl mb-6 flex items-center gap-3 animate-in fade-in zoom-in-95">
            <ShieldCheck size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">Protocol Updated Successfully</span>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-3 rounded-xl mb-6 flex items-center gap-3 animate-in shake duration-300">
            <AlertCircle size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-2">Current Key</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-black border border-gray-800 rounded-xl p-4 text-white focus:outline-none focus:border-[#CCFF00] transition-all placeholder-gray-800 italic"
              disabled={loading}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#CCFF00] ml-2">New Key</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-black border border-gray-800 rounded-xl p-4 text-white focus:outline-none focus:border-[#CCFF00] transition-all placeholder-gray-800 italic"
              disabled={loading}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#CCFF00] ml-2">Verify New Key</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-black border border-gray-800 rounded-xl p-4 text-white focus:outline-none focus:border-[#CCFF00] transition-all placeholder-gray-800 italic"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#CCFF00] text-black font-black py-5 rounded-2xl uppercase text-xs tracking-[0.2em] hover:shadow-[0_0_30px_rgba(204,255,0,0.4)] transition-all active:scale-[0.98] disabled:opacity-50 mt-4"
            disabled={loading}
          >
            {loading ? 'Re-calibrating...' : 'Commit Update'}
          </button>
        </form>

        <div className="mt-8 text-center">
            <p className="text-gray-600 text-[9px] font-black uppercase tracking-[0.4em]">
                Secure Encryption Active // v2.0
            </p>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;