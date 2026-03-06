import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertTriangle, ChevronLeft } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-4 font-sans overflow-hidden relative">
      {/* Tactical background detail */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#CCFF00] opacity-5 blur-[120px] pointer-events-none"></div>
      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center z-10"
      >
        <div className="bg-[#CCFF00]/10 p-4 rounded-2xl border border-[#CCFF00]/20 mb-8">
            <AlertTriangle className="text-[#CCFF00]" size={32} />
        </div>

        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-[#CCFF00] text-[12rem] md:text-[15rem] font-black tracking-tighter leading-none italic select-none drop-shadow-[0_0_30px_rgba(204,255,0,0.2)]"
        >
          404
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center"
        >
          <p className="text-[#CCFF00] font-black text-xs tracking-[0.4em] uppercase mb-4">Signal Lost / Path Interrupted</p>
          <h2 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-white">
            Objective Not Found
          </h2>
          <p className="max-w-xs mx-auto text-gray-500 font-medium mt-4 text-sm leading-relaxed">
            The protocol you are attempting to access has been moved or purged from the main cluster.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-12"
        >
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-3 px-10 py-4 bg-[#CCFF00] text-black text-xs font-black uppercase tracking-[0.2em] rounded-xl shadow-[0_0_20px_rgba(204,255,0,0.3)] hover:scale-105 transition-all active:scale-95"
          >
            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Abort & Revert
          </button>
        </motion.div>
      </motion.div>

      {/* Decorative side text */}
      <div className="absolute bottom-10 left-10 hidden lg:block">
          <p className="text-[10px] font-black text-gray-800 uppercase tracking-[0.5em] vertical-text transform -rotate-180" style={{ writingMode: 'vertical-rl' }}>
              ERR_CODE_SIGNAL_FAIL_CLUSTER_09
          </p>
      </div>
    </div>
  );
};

export default NotFound;