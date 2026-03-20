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
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500 p-4 md:p-0 pb-24 md:pb-8">
      <header className="space-y-1">
        <p className="text-[#CCFF00] font-black text-[10px] md:text-xs tracking-[0.3em] uppercase">Finance Operations</p>
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic text-white leading-none">Asset Management</h1>
      </header>

      {/* Main Asset Card */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#CCFF00]/20 to-transparent rounded-[2rem] md:rounded-[2.5rem] blur-xl opacity-50"></div>
        <div className="relative bg-[#0B0B0B] border border-gray-900 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-center md:text-left">
                <div className="p-5 md:p-6 bg-black border border-gray-800 rounded-3xl text-[#CCFF00] shadow-[inset_0_0_20px_rgba(204,255,0,0.05)] shrink-0">
                    <TrendingUp size={32} className="md:w-10 md:h-10" />
                </div>
                <div>
                    <p className="text-[9px] md:text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] mb-1">Available Yield</p>
                    <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter text-white">
                        <span className="text-[#CCFF00] mr-2">₹</span>{balance.toLocaleString()}
                    </h2>
                </div>
            </div>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full md:w-auto bg-[#CCFF00] text-black font-black px-10 py-5 rounded-2xl uppercase text-[10px] md:text-xs tracking-[0.3em] hover:shadow-[0_0_30px_rgba(204,255,0,0.4)] transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <ArrowUpRight size={18} /> Initialize Payout
            </button>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="bg-[#0B0B0B] border border-gray-900 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between mb-8 border-b border-gray-900 pb-6">
            <div className="flex items-center gap-3">
                <History className="text-[#CCFF00]" size={18} />
                <h3 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] text-gray-500 italic">Transaction Registry</h3>
            </div>
            <span className="text-[8px] font-black text-gray-700 uppercase tracking-widest hidden sm:block">Sector 7-G Synchronized</span>
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em] text-left border-b border-gray-900/50">
                <th className="pb-5 px-4">Asset Value</th>
                <th className="pb-5 px-4">Protocol Reason</th>
                <th className="pb-5 px-4 text-center">Transfer Type</th>
                <th className="pb-5 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-900/30">
              {currentTransactions.length > 0 ? (
                currentTransactions.map((tx, index) => (
                  <tr key={index} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="py-6 px-4">
                        <span className="text-white font-black italic tracking-tight text-xl">₹{tx.amount}</span>
                    </td>
                    <td className="py-6 px-4">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-tight italic">{tx.reason}</p>
                    </td>
                    <td className="py-6 px-4 text-center">
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

        {/* Mobile View: Card List */}
        <div className="md:hidden space-y-4">
            {currentTransactions.length > 0 ? (
                currentTransactions.map((tx, index) => (
                    <div key={index} className="bg-black border border-gray-900 rounded-2xl p-5 space-y-4">
                        <div className="flex justify-between items-start">
                            <span className="text-white font-black italic tracking-tight text-2xl leading-none">₹{tx.amount}</span>
                            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded border text-[8px] font-black uppercase tracking-widest ${
                                tx.type === 'credit' ? 'bg-[#CCFF00]/5 border-[#CCFF00]/20 text-[#CCFF00]' : 'bg-red-500/5 border-red-500/20 text-red-500'
                            }`}>
                                {tx.type === 'credit' ? <ArrowDownLeft size={8} /> : <ArrowUpRight size={8} />}
                                {tx.type}
                            </div>
                        </div>
                        <div className="flex justify-between items-end">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight italic max-w-[60%]">{tx.reason}</p>
                            <span className="text-[8px] font-black text-gray-700 uppercase">{new Date(tx.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                        </div>
                    </div>
                ))
            ) : (
                <div className="py-12 text-center border border-dashed border-gray-900 rounded-2xl">
                    <p className="text-gray-700 text-[9px] font-black uppercase tracking-widest italic">Registry Empty</p>
                </div>
            )}
        </div>

        {/* Pagination Protocol */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-10 pt-8 border-t border-gray-900/50">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-3 bg-black border border-gray-800 rounded-xl text-gray-500 hover:text-[#CCFF00] disabled:opacity-20 active:scale-90 transition-all shrink-0"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex gap-2 overflow-x-auto px-4 scrollbar-hide">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`min-w-[40px] h-10 rounded-xl flex items-center justify-center text-[10px] font-black transition-all ${
                    currentPage === index + 1
                      ? "bg-[#CCFF00] text-black shadow-[0_0_15px_#CCFF00]/40"
                      : "bg-black border border-gray-800 text-gray-700"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-3 bg-black border border-gray-800 rounded-xl text-gray-500 hover:text-[#CCFF00] disabled:opacity-20 active:scale-90 transition-all shrink-0"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Payout Protocol Modal - Mobile Optimized */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-end md:items-center justify-center p-4 md:p-6 z-[100]">
            <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className="bg-[#0B0B0B] border border-gray-800 rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-12 w-full max-w-lg shadow-2xl relative overflow-hidden mb-4 md:mb-0 animate-in slide-in-from-bottom duration-500"
            >
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#CCFF00] opacity-50"></div>
                <div className="flex justify-between items-center mb-10">
                    <div className="space-y-1">
                        <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white leading-none">Initiate Payout</h2>
                        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-600">Confidential Extraction Protocol</p>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-900 rounded-full text-gray-600 hover:text-white transition-colors active:scale-90"><X size={20} /></button>
                </div>

                <div className="space-y-8">
                    <div className="p-6 md:p-8 bg-black border border-gray-900 rounded-[1.5rem] text-center md:text-left">
                        <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest mb-1 italic">Current Yield Pool</p>
                        <p className="text-3xl md:text-4xl font-black italic text-[#CCFF00] tracking-tighter leading-none">₹{balance.toLocaleString()}</p>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-600 ml-2">Extraction Amount (₹)</label>
                        <div className="relative flex items-center bg-black border border-gray-800 rounded-[1.5rem] p-5 focus-within:border-[#CCFF00]/50 transition-all group">
                            <DollarSign size={20} className="text-gray-700 group-focus-within:text-[#CCFF00] mr-4" />
                            <input 
                                type="number" 
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value === '' ? '' : Number(e.target.value))}
                                className="bg-transparent w-full text-white font-black italic text-xl focus:outline-none placeholder-gray-900"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-6">
                        <button
                            onClick={handleWithdraw}
                            disabled={loading}
                            className="w-full py-5 bg-[#CCFF00] text-black font-black uppercase text-[11px] tracking-[0.3em] rounded-2xl hover:shadow-[0_0_40px_rgba(204,255,0,0.5)] transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center gap-3 shadow-lg"
                        >
                            {loading ? <Activity className="animate-spin" size={18} /> : "Authorize Payout"}
                        </button>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="w-full py-4 text-gray-600 font-black uppercase text-[9px] tracking-widest hover:text-white transition-colors active:scale-95"
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