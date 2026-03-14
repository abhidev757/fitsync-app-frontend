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
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 font-sans">
      <div className="max-w-xl w-full">
        {/* Elite Success Container */}
        <div className="bg-[#0B0B0B] border border-gray-900 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#CCFF00] opacity-5 blur-[100px] pointer-events-none"></div>

          {/* Success Header */}
          <div className="flex flex-col items-center justify-center mb-10">
            <div className="relative mb-6">
              <div className="absolute -inset-4 bg-[#CCFF00] rounded-full blur-2xl opacity-20 animate-pulse"></div>
              <div className="relative bg-[#CCFF00] rounded-full p-4 shadow-[0_0_30px_rgba(204,255,0,0.4)]">
                <CheckCircle size={48} className="text-black stroke-[3px]" />
              </div>
            </div>
            <p className="text-[#CCFF00] font-black text-xs tracking-[0.3em] uppercase mb-2">Transaction Verified</p>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic text-center">Evolution Started</h1>
            <p className="text-center text-gray-500 mt-4 text-sm max-w-xs font-medium">
              Your session has been authorized. Prepare for peak performance.
            </p>
          </div>

          <div className="space-y-6 mb-10">
            {/* Tactical Booking Receipt */}
            {bookingData && (
              <div>
                <div className="flex items-center justify-between mb-3 px-1">
                  <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-widest italic">Deployment Details</h2>
                  <span className="text-[10px] font-black text-[#CCFF00] uppercase tracking-widest underline decoration-dotted underline-offset-4">Digital Invoice</span>
                </div>
                <div className="bg-black border border-gray-900 rounded-2xl p-6 space-y-4">
                  <div className="flex justify-between items-center py-1 border-b border-gray-900/50">
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Expert Coach</span>
                    <span className="text-sm font-black uppercase italic text-[#CCFF00]">{bookingData.trainer.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-900/50">
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Schedule</span>
                    <span className="text-sm font-black uppercase italic">{new Date(bookingData.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })} @ {bookingData.time}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Integration</span>
                    <span className="text-sm font-black uppercase italic">{bookingData.isPackage ? "10-Session Block" : "Single Session"}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Billing Summary */}
            <div>
              <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-widest italic mb-3 px-1">Authorized Member</h2>
              <div className="bg-black border border-gray-900 rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center border border-gray-800">
                    <ShieldCheck className="text-[#CCFF00]" size={20} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-black uppercase tracking-tight truncate">{userInfo?.name || "Member"}</p>
                    <p className="text-[10px] font-bold text-gray-600 tracking-widest truncate uppercase">{userInfo?.email || "ID Encrypted"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="space-y-4">
            <button
              className="group w-full bg-[#CCFF00] text-black font-black py-5 rounded-2xl uppercase text-xs tracking-widest hover:shadow-[0_0_30px_rgba(204,255,0,0.4)] transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              onClick={() => navigate("/user/dashboard")}
            >
              Enter Dashboard <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-white transition-colors py-2 text-[10px] font-black uppercase tracking-widest">
              <Download size={14} /> Download Receipt
            </button>
          </div>
        </div>
        
        <p className="text-center mt-8 text-gray-700 text-[10px] font-black uppercase tracking-[0.4em]">
          FitSync Protocol 2026 // End of Transmission
        </p>
      </div>
    </div>
  )
}

export default PaymentSuccess