import React from "react";
import {ShieldAlert } from "lucide-react";

interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isOpen: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  message,
  onConfirm,
  onCancel,
  isOpen,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-red-600 opacity-5 blur-[100px] pointer-events-none"></div>

      <div className="bg-[#0B0B0B] border border-gray-900 rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Decorative Top Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-50"></div>

        {/* Header Icon */}
        <div className="flex justify-center mb-6">
            <div className="bg-red-500/10 p-4 rounded-2xl border border-red-500/20">
                <ShieldAlert className="text-red-500" size={28} />
            </div>
        </div>

        {/* Content */}
        <div className="text-center mb-8">
            <p className="text-red-500 font-black text-[10px] tracking-[0.4em] uppercase mb-2 italic">Priority Override</p>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-3">
                {title}
            </h2>
            <p className="text-gray-500 text-sm font-medium italic leading-relaxed px-2">
                {message}
            </p>
        </div>

        {/* Tactical Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            className="w-full bg-red-600 text-white font-black py-4 rounded-xl uppercase text-xs tracking-[0.2em] hover:bg-red-700 hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all active:scale-[0.98]"
          >
            Authorize Termination
          </button>
          
          <button
            onClick={onCancel}
            className="w-full bg-transparent border border-gray-800 text-gray-500 font-black py-4 rounded-xl uppercase text-xs tracking-[0.2em] hover:text-white hover:border-gray-600 transition-all active:scale-[0.98]"
          >
            Abort Protocol
          </button>
        </div>

        {/* Footer Details */}
        <div className="mt-8 flex items-center justify-center gap-2 opacity-20">
            <div className="h-[1px] w-8 bg-gray-500"></div>
            <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">FitSync Ops Lock</span>
            <div className="h-[1px] w-8 bg-gray-500"></div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;