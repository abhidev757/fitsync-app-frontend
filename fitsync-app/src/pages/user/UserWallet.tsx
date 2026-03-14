"use client";

import { useState, useEffect } from "react";
import { AxiosError } from "axios";
import { ChevronLeft, ChevronRight, X, Wallet, ArrowUpRight, ArrowDownLeft, History } from "lucide-react";
import { getWalletDetails, requestPayout } from "../../axios/userApi";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

interface Transaction {
  amount: number;
  type: "credit" | "debit";
  reason: string;
  createdAt: string;
  sessionId?: string;
}

export default function UserWalletPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);

  const transactionsPerPage = 5;
  const totalPages = Math.ceil(transactions.length / transactionsPerPage);

  useEffect(() => {
    const fetchWalletData = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;
      try {
        const data = await getWalletDetails(userId);
        setBalance(data.balance);
        setTransactions(data.transactions);
      } catch (err) {
        console.error("Error fetching wallet data:", err);
      }
    };
    fetchWalletData();
  }, [loading]);

  const handleWithdraw = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    if (!withdrawAmount || Number(withdrawAmount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (Number(withdrawAmount) > balance) {
      toast.error("Insufficient balance");
      return;
    }

    setLoading(true);
    try {
      await requestPayout(userId, Number(withdrawAmount));
      toast.success("Payout request submitted!");
      setIsModalOpen(false);
      setWithdrawAmount('');
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      toast.error(error.response?.data?.message || "Payout failed");
    } finally {
      setLoading(false);
    }
  };

  const idxLast = currentPage * transactionsPerPage;
  const idxFirst = idxLast - transactionsPerPage;
  const pageTransactions = transactions.slice(idxFirst, idxLast);

  const goPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-10 bg-black min-h-screen text-white font-sans pb-24 md:pb-8">
      {/* Tactical Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-2">
        <div>
          <p className="text-[#CCFF00] font-black text-[10px] tracking-widest md:tracking-[0.4em] uppercase mb-1">Financial Portal</p>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">Wallet Assets</h1>
        </div>
      </div>

      {/* Balance Card - Refined for Mobile */}
      <div className="bg-[#0B0B0B] border border-gray-900 p-5 md:p-10 rounded-[2rem] md:rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-48 h-48 bg-[#CCFF00] opacity-5 blur-[80px] pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 mb-8 md:mb-0 relative z-10 text-center md:text-left">
          <div className="p-5 bg-gray-950 border border-gray-800 rounded-3xl shrink-0">
            <Wallet className="text-[#CCFF00] w-8 h-8 md:w-10 md:h-10" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest md:tracking-[0.3em] mb-1">Current Liquidity</p>
            <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter leading-none">
              ₹{balance.toFixed(2)}
            </h2>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-auto bg-[#CCFF00] text-black px-6 md:px-12 py-5 rounded-2xl hover:shadow-[0_0_30px_rgba(204,255,0,0.4)] transition-all font-black uppercase text-[11px] tracking-widest md:tracking-[0.2em] active:scale-95 z-10"
        >
          Request Payout
        </button>
      </div>

      {/* Ledger Section */}
      <div className="bg-[#0B0B0B] border border-gray-900 rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-10 shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 mb-10 border-b border-gray-900/50 pb-6">
          <History size={20} className="text-[#CCFF00]" />
          <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter">Transaction Ledger</h3>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] border-b border-gray-900/30">
                <th className="pb-5 px-4 text-left">Transmission Details</th>
                <th className="pb-5 px-4 text-left">Type</th>
                <th className="pb-5 px-4 text-left">Timestamp</th>
                <th className="pb-5 px-4 text-right">Net Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-900/50">
              {pageTransactions.map((tx, idx) => (
                <tr key={idx} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="py-6 px-4">
                    <p className="text-sm font-black uppercase tracking-tight text-white group-hover:text-[#CCFF00] transition-colors">{tx.reason}</p>
                    <p className="text-[9px] text-gray-700 font-black uppercase mt-1.5 italic">ID: {tx.sessionId?.slice(-12) || 'SYSTEM_OVERRIDE'}</p>
                  </td>
                  <td className="py-6 px-4">
                    <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${tx.type === "credit" ? "text-green-500" : "text-red-500"}`}>
                      {tx.type === "credit" ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                      {tx.type}
                    </div>
                  </td>
                  <td className="py-6 px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    {new Date(tx.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className={`py-6 px-4 text-right font-black italic text-xl tracking-tighter ${tx.type === "credit" ? "text-white" : "text-gray-500"}`}>
                    {tx.type === "credit" ? "+" : "-"}₹{tx.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile List View - Replaces Table */}
        <div className="md:hidden space-y-4">
          {pageTransactions.map((tx, idx) => (
            <div key={idx} className="bg-black border border-gray-900 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div className="overflow-hidden min-w-0 pr-2">
                  <p className="text-xs font-black uppercase tracking-tight text-[#CCFF00] truncate">{tx.reason}</p>
                  <p className="text-[9px] text-gray-700 font-bold mt-1 uppercase truncate">ID: {tx.sessionId?.slice(-8) || 'SYSTEM'}</p>
                </div>
                <p className={`text-lg font-black italic tracking-tighter shrink-0 truncate ${tx.type === "credit" ? "text-white" : "text-gray-600"}`}>
                  {tx.type === "credit" ? "+" : "-"}₹{tx.amount.toFixed(2)}
                </p>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-900">
                 <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest md:tracking-[0.2em] ${tx.type === "credit" ? "text-green-500" : "text-red-500"}`}>
                   {tx.type === "credit" ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                   {tx.type}
                 </div>
                 <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">
                   {new Date(tx.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                 </span>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination - Mobile Adaptive */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-10 gap-3 md:gap-6 pt-8 border-t border-gray-900 w-full">
            <button
              onClick={goPrev}
              disabled={currentPage === 1}
              className="w-full sm:w-auto flex items-center justify-center gap-3 py-4 px-4 md:px-8 rounded-xl text-[10px] font-black uppercase tracking-widest bg-gray-900 text-white disabled:opacity-20 active:scale-95 transition-all"
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <span className="text-[9px] md:text-[10px] font-black text-gray-700 uppercase tracking-widest md:tracking-[0.4em] order-first sm:order-none w-full sm:w-auto text-center mb-2 sm:mb-0">
              Dossier {currentPage} <span className="text-[#CCFF00]/40">//</span> {totalPages}
            </span>
            <button
              onClick={goNext}
              disabled={currentPage === totalPages}
              className="w-full sm:w-auto flex items-center justify-center gap-3 py-4 px-4 md:px-8 rounded-xl text-[10px] font-black uppercase tracking-widest bg-[#CCFF00] text-black disabled:opacity-20 active:scale-95 transition-all"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Withdrawal Modal - Optimized for Mobile Thumb Navigation */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/95 flex items-end md:items-center justify-center p-4 md:p-6 z-[100] backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-[#0B0B0B] border border-gray-800 rounded-[2.5rem] p-8 md:p-12 w-full max-w-lg shadow-2xl relative mb-4 md:mb-0"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 bg-gray-900 rounded-full text-gray-500 hover:text-[#CCFF00] transition-colors"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-10">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-[#CCFF00] leading-none mb-2">Request Payout</h2>
                <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest md:tracking-[0.3em] italic">Liquidate Operational Assets</p>
              </div>

              <div className="space-y-6">
                <div className="bg-black border border-gray-900 rounded-[2rem] p-6 text-center">
                  <label className="block text-gray-700 text-[9px] font-black uppercase tracking-widest mb-2">Max Available</label>
                  <div className="text-4xl font-black text-white italic tracking-tighter leading-none">₹{balance.toFixed(2)}</div>
                </div>

                <div className="relative group">
                  <label className="block text-gray-700 text-[9px] font-black uppercase tracking-widest mb-3 ml-4">Debit Amount (₹)</label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                    className="w-full bg-black text-white text-2xl font-black p-6 rounded-[2rem] border border-gray-900 focus:outline-none focus:border-[#CCFF00]/50 transition-all placeholder-gray-800 italic tracking-tighter text-center"
                    placeholder="00.00"
                    min="1"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-10">
                <button
                  onClick={handleWithdraw}
                  disabled={loading}
                  className="w-full py-5 bg-[#CCFF00] hover:shadow-[0_0_40px_rgba(204,255,0,0.5)] text-black rounded-2xl text-[11px] font-black uppercase tracking-widest md:tracking-[0.2em] transition-all disabled:opacity-50 active:scale-95"
                >
                  {loading ? "AUTHORIZING..." : "Confirm Asset Debit"}
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-white transition-colors"
                >
                  Cancel Transaction
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}