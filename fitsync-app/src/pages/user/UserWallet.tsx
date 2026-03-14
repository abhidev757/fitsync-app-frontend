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

  // Withdrawal State
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
      toast.error("Please enter a valid amount");
      return;
    }

    if (Number(withdrawAmount) > balance) {
      toast.error("Insufficient balance");
      return;
    }

    setLoading(true);
    try {
      await requestPayout(userId, Number(withdrawAmount));
      toast.success("Payout request submitted successfully!");
      setIsModalOpen(false);
      setWithdrawAmount('');
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      toast.error(error.response?.data?.message || "Failed to request payout");
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
    <div className="p-8 space-y-8 bg-black min-h-screen text-white font-sans">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[#CCFF00] font-black text-xs tracking-widest uppercase mb-1">Financial Portal</p>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">Wallet Assets</h1>
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-[#0B0B0B] border border-gray-900 p-8 rounded-[2rem] flex flex-col md:flex-row justify-between items-center relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-32 h-32 bg-[#CCFF00] opacity-5 blur-3xl"></div>
        <div className="flex items-center gap-6 mb-6 md:mb-0 relative z-10">
          <div className="p-4 bg-gray-900 rounded-2xl border border-gray-800">
            <Wallet className="text-[#CCFF00]" size={32} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Available Liquidity</p>
            <h2 className="text-5xl font-black text-white italic tracking-tighter">
              ₹{balance.toFixed(2)}
            </h2>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-auto bg-[#CCFF00] text-black px-10 py-4 rounded-xl hover:shadow-[0_0_20px_rgba(204,255,0,0.3)] transition-all font-black uppercase text-xs tracking-widest active:scale-95"
        >
          Request Payout
        </button>
      </div>

      {/* Wallet History Table */}
      <div className="bg-[#0B0B0B] border border-gray-900 rounded-[2rem] p-8 shadow-2xl">
        <div className="flex items-center gap-2 mb-8">
          <History size={18} className="text-[#CCFF00]" />
          <h3 className="text-xl font-black italic uppercase tracking-tighter">Transaction Ledger</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] border-b border-gray-900">
                <th className="pb-4 px-4 text-left font-black">Details</th>
                <th className="pb-4 px-4 text-left font-black">Log Type</th>
                <th className="pb-4 px-4 text-left font-black">Date</th>
                <th className="pb-4 px-4 text-right font-black">Net Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-900/50">
              {pageTransactions.map((tx, idx) => (
                <tr key={idx} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="py-5 px-4">
                    <p className="text-sm font-black uppercase tracking-tight text-white group-hover:text-[#CCFF00] transition-colors">{tx.reason}</p>
                    <p className="text-[9px] text-gray-600 font-bold uppercase mt-1">ID: {tx.sessionId?.slice(-8) || 'SYSTEM_GEN'}</p>
                  </td>
                  <td className="py-5 px-4">
                    <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${tx.type === "credit" ? "text-green-500" : "text-red-500"
                      }`}>
                      {tx.type === "credit" ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                      {tx.type}
                    </div>
                  </td>
                  <td className="py-5 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                    {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className={`py-5 px-4 text-right font-black italic text-lg tracking-tighter ${tx.type === "credit" ? "text-white" : "text-gray-500"
                    }`}>
                    {tx.type === "credit" ? "+" : "-"}₹{tx.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-900">
          <button
            onClick={goPrev}
            disabled={currentPage === 1}
            className="flex items-center gap-2 py-3 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest bg-gray-900 text-white disabled:opacity-20 hover:bg-gray-800 transition-all"
          >
            <ChevronLeft size={16} /> Prev
          </button>
          <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">
            Protocol {currentPage} / {totalPages}
          </span>
          <button
            onClick={goNext}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 py-3 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest bg-[#CCFF00] text-black disabled:opacity-20 hover:shadow-[0_0_15px_rgba(204,255,0,0.2)] transition-all"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Withdrawal Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-6 z-[100] backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-[#0B0B0B] border border-gray-800 rounded-[2.5rem] p-10 w-full max-w-lg shadow-[0_0_50px_rgba(204,255,0,0.1)] relative"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-8 right-8 text-gray-600 hover:text-[#CCFF00] transition-colors"
              >
                <X size={24} />
              </button>

              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-[#CCFF00] mb-2 text-center">Request Payout</h2>
              <p className="text-gray-500 text-center mb-10 text-[10px] font-black uppercase tracking-widest">Liquidate earned assets</p>

              <div className="space-y-8">
                <div className="bg-black border border-gray-900 rounded-2xl p-6">
                  <label className="block text-gray-600 text-[9px] font-black uppercase tracking-widest mb-2">Maximum Allocation</label>
                  <div className="text-3xl font-black text-white italic tracking-tighter">₹{balance.toFixed(2)}</div>
                </div>

                <div>
                  <label className="block text-gray-600 text-[9px] font-black uppercase tracking-widest mb-3 ml-2">Withdrawal amount (₹)</label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                    className="w-full bg-black text-white text-xl font-black p-5 rounded-2xl border border-gray-900 focus:outline-none focus:border-[#CCFF00] transition-all placeholder-gray-800 italic tracking-tighter"
                    placeholder="00.00"
                    min="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-12">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="py-5 bg-gray-900 hover:bg-gray-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWithdraw}
                  disabled={loading}
                  className="py-5 bg-[#CCFF00] hover:shadow-[0_0_20px_rgba(204,255,0,0.3)] text-black rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  {loading ? "AUTHORIZING..." : "CONFIRM ASSET DEBIT"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}