"use client"

import type React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { CheckCircle, ArrowRight, ShieldCheck, Download } from "lucide-react"

interface BookingData {
  trainer: {
    name: string;
  };
  clientName: string;
  clientEmail: string;
  time: string;
  startDate: string;
  isPackage: boolean;
  total: number;
}

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  
  const bookingData = location.state?.booking as BookingData | undefined
  const userInfoString = localStorage.getItem('userInfo');
  const userInfo = userInfoString ? JSON.parse(userInfoString) : null;

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 md:p-6 font-sans overflow-x-hidden">
      <div className="max-w-xl w-full">
        {/* Elite Success Container */}
        <div className="bg-[#0B0B0B] border border-gray-900 rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-500">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#CCFF00] opacity-5 blur-[100px] pointer-events-none"></div>

          {/* Success Header */}
          <div className="flex flex-col items-center justify-center mb-8 md:mb-12">
            <div className="relative mb-6">
              <div className="absolute -inset-4 bg-[#CCFF00] rounded-full blur-2xl opacity-20 animate-pulse"></div>
              <div className="relative bg-[#CCFF00] rounded-full p-3 md:p-4 shadow-[0_0_30px_rgba(204,255,0,0.4)]">
                <CheckCircle size={40} className="text-black stroke-[3px] md:w-12 md:h-12" />
              </div>
            </div>
            <p className="text-[#CCFF00] font-black text-[10px] md:text-xs tracking-[0.3em] uppercase mb-2">Transaction Verified</p>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic text-center leading-none">Evolution Started</h1>
            <p className="text-center text-gray-600 mt-4 text-xs md:text-sm max-w-xs font-bold uppercase tracking-tight italic">
              Authorization successful. Prepare for deployment.
            </p>
          </div>

          <div className="space-y-6 md:space-y-8 mb-10">
            {/* Tactical Booking Receipt */}
            {bookingData && (
              <div className="animate-in slide-in-from-bottom-4 duration-700 delay-150">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h2 className="text-[9px] md:text-[10px] font-black text-gray-700 uppercase tracking-widest italic">Manifest Details</h2>
                  <span className="text-[9px] md:text-[10px] font-black text-[#CCFF00] uppercase tracking-widest underline decoration-dotted underline-offset-4">Registry Log</span>
                </div>
                <div className="bg-black border border-gray-900 rounded-2xl p-5 md:p-6 space-y-4">
                  <div className="flex justify-between items-center py-1 border-b border-gray-900/50 pb-3">
                    <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest">Lead Operative</span>
                    <span className="text-xs md:text-sm font-black uppercase italic text-[#CCFF00]">{bookingData.trainer.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-900/50 pb-3">
                    <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest">Window</span>
                    <span className="text-xs md:text-sm font-black uppercase italic text-gray-300">
                      {new Date(bookingData.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} // {bookingData.time}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest">Protocol</span>
                    <span className="text-xs md:text-sm font-black uppercase italic text-gray-300">
                      {bookingData.isPackage ? "10-Session Block" : "Single Session"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* User Identity Info */}
            <div className="animate-in slide-in-from-bottom-4 duration-700 delay-300">
              <h2 className="text-[9px] md:text-[10px] font-black text-gray-700 uppercase tracking-widest italic mb-3 px-1">Authorized Operative</h2>
              <div className="bg-black border border-gray-900 rounded-2xl p-5 md:p-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-950 flex items-center justify-center border border-gray-800 shrink-0">
                    <ShieldCheck className="text-[#CCFF00]/40" size={20} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[11px] md:text-xs font-black uppercase tracking-tight truncate">{userInfo?.name || "Operative"}</p>
                    <p className="text-[9px] md:text-[10px] font-bold text-gray-700 tracking-[0.2em] truncate uppercase italic">{userInfo?.email || "Signal Encrypted"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="space-y-4 pt-4 md:pt-6 border-t border-gray-900 animate-in slide-in-from-bottom-4 duration-700 delay-500">
            <button
              className="group w-full bg-[#CCFF00] text-black font-black py-5 rounded-2xl uppercase text-[10px] md:text-xs tracking-[0.2em] hover:shadow-[0_0_30px_rgba(204,255,0,0.4)] transition-all flex items-center justify-center gap-2 active:scale-95"
              onClick={() => navigate("/user/dashboard")}
            >
              Access Command Center <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button className="w-full flex items-center justify-center gap-2 text-gray-700 hover:text-white transition-colors py-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest">
              <Download size={14} className="text-[#CCFF00]/30" /> Transmit Receipt PDF
            </button>
          </div>
        </div>
        
        <p className="text-center mt-8 text-gray-800 text-[10px] font-black uppercase tracking-[0.5em] italic">
          Registry Update Complete // Disconnecting Signal...
        </p>
      </div>
    </div>
  )
}

export default PaymentSuccess