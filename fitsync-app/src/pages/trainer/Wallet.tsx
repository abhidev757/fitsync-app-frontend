import { useEffect, useState } from 'react';
import { getWalletDetails, requestPayout } from '../../axios/trainerApi';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  TrendingUp, 
  DollarSign, 
  ChevronLeft, 
  ChevronRight,
  Activity,
  X
} from 'lucide-react';

interface Transaction {
  amount: number;
  type: 'credit' | 'debit';
  reason: string;
  createdAt: string;
  sessionId?: string;
}

export default function WalletPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchWalletData = async () => {
    const trainerId = localStorage.getItem('trainerId');
    if (!trainerId) return;

    try {
      const data = await getWalletDetails(trainerId);
      setBalance(data.balance);
      setTransactions(data.transactions);
    } catch (err) {
      toast.error("System Error: Asset data synchronization failed.");
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []); 

  const handleWithdraw = async () => {
    const trainerId = localStorage.getItem('trainerId');
    if (!trainerId) return;

    if (!withdrawAmount || Number(withdrawAmount) <= 0) {
      toast.error("Invalid Amount: Specify a valid asset value.");
      return;
    }

    if (Number(withdrawAmount) > balance) {
      toast.error("Protocol Error: Insufficient asset balance.");
      return;
    }

    setLoading(true);
    try {
      await requestPayout(trainerId, Number(withdrawAmount));
      toast.success("Transmission Complete: Payout request logged.");
      setIsModalOpen(false);
      setWithdrawAmount('');
      fetchWalletData(); 
    } catch (error: any) {
      toast.error("Network Failure: Payout request denied.");
    } finally {
      setLoading(false);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(transactions.length / itemsPerPage);

  if (isDataLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
        <Activity className="animate-pulse mb-4 text-[#CCFF00]" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em]">Syncing Asset Grid...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header>
        <p className="text-[#CCFF00] font-black text-xs tracking-[0.3em] uppercase mb-2">Finance Operations</p>
        <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white leading-none">Asset Management</h1>
      </header>

      {/* Main Asset Card */}
      <div className="relative group overflow-hidden">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#CCFF00]/20 to-transparent rounded-[2.5rem] blur-xl opacity-50"></div>
        <div className="relative bg-[#0B0B0B] border border-gray-900 rounded-[2.5rem] p-10 flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl">
            <div className="flex items-center gap-8">
                <div className="p-6 bg-black border border-gray-800 rounded-3xl text-[#CCFF00] shadow-[inset_0_0_20px_rgba(204,255,0,0.05)]">
                    <TrendingUp size={40} />
                </div>
                <div>
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] mb-1">Total Available Yield</p>
                    <h2 className="text-5xl font-black italic tracking-tighter text-white">
                        <span className="text-[#CCFF00] mr-2">₹</span>{balance.toLocaleString()}
                    </h2>
                </div>
            </div>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full md:w-auto bg-[#CCFF00] text-black font-black px-12 py-5 rounded-2xl uppercase text-xs tracking-[0.3em] hover:shadow-[0_0_30px_rgba(204,255,0,0.4)] transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <ArrowUpRight size={18} /> Initialize Payout
            </button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-[#0B0B0B] border border-gray-900 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 mb-10 border-b border-gray-900 pb-6">
            <History className="text-[#CCFF00]" size={20} />
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-500">Transaction Registry</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em] text-left border-b border-gray-900">
                <th className="pb-4 px-4">Asset Value</th>
                <th className="pb-4 px-4">Protocol Reason</th>
                <th className="pb-4 px-4">Transfer Type</th>
                <th className="pb-4 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-900">
              {currentTransactions.length > 0 ? (
                currentTransactions.map((tx, index) => (
                  <tr key={index} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="py-6 px-4">
                        <span className="text-white font-black italic tracking-tight text-lg">₹{tx.amount}</span>
                    </td>
                    <td className="py-6 px-4">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-tight italic">{tx.reason}</p>
                    </td>
                    <td className="py-6 px-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${
                            tx.type === 'credit' ? 'bg-[#CCFF00]/5 border-[#CCFF00]/20 text-[#CCFF00]' : 'bg-red-500/5 border-red-500/20 text-red-500'
                        }`}>
                            {tx.type === 'credit' ? <ArrowDownLeft size={10} /> : <ArrowUpRight size={10} />}
                            {tx.type}
                        </div>
                    </td>
                    <td className="py-6 px-4 text-right">
                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                            {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <p className="text-gray-700 text-[10px] font-black uppercase tracking-[0.4em]">No transaction logs found in grid.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Protocol */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-12 pt-8 border-t border-gray-900">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-3 bg-black border border-gray-800 rounded-xl text-gray-500 hover:text-[#CCFF00] disabled:opacity-20 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex gap-2">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black transition-all ${
                    currentPage === index + 1
                      ? "bg-[#CCFF00] text-black shadow-[0_0_15px_rgba(204,255,0,0.3)]"
                      : "bg-black border border-gray-800 text-gray-500 hover:border-gray-600"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-3 bg-black border border-gray-800 rounded-xl text-gray-500 hover:text-[#CCFF00] disabled:opacity-20 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Payout Protocol Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 z-[100]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-[#0B0B0B] border border-gray-900 rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#CCFF00] opacity-50"></div>
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white leading-none">Initiate Payout</h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-600 hover:text-white transition-colors"><X size={24} /></button>
                </div>

                <div className="space-y-6">
                    <div className="p-6 bg-black border border-gray-800 rounded-2xl">
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Current Yield Pool</p>
                        <p className="text-2xl font-black italic text-white">₹{balance.toLocaleString()}</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#CCFF00] ml-1">Extraction Amount (₹)</label>
                        <div className="relative flex items-center bg-black border border-gray-800 rounded-2xl p-4 focus-within:border-[#CCFF00] transition-all">
                            <DollarSign size={18} className="text-gray-700 mr-3" />
                            <input 
                                type="number" 
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value === '' ? '' : Number(e.target.value))}
                                className="bg-transparent w-full text-white font-black italic text-lg focus:outline-none placeholder-gray-800"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-4">
                        <button
                            onClick={handleWithdraw}
                            disabled={loading}
                            className="w-full py-5 bg-[#CCFF00] text-black font-black uppercase text-xs tracking-[0.3em] rounded-2xl hover:shadow-[0_0_30px_rgba(204,255,0,0.3)] transition-all active:scale-[0.98] disabled:opacity-20 flex items-center justify-center gap-2"
                        >
                            {loading ? <Activity className="animate-spin" size={18} /> : "Authorize Payout"}
                        </button>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="w-full py-4 bg-transparent text-gray-500 font-bold uppercase text-[10px] tracking-widest hover:text-white transition-colors"
                        >
                            Abort Protocol
                        </button>
                    </div>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}