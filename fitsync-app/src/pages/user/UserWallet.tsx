import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
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
      if (!userId) {
        console.error("User not authenticated");
        return;
      }
      try {
        const data = await getWalletDetails(userId);
        setBalance(data.balance);
        setTransactions(data.transactions);
      } catch (err) {
        console.error("Error fetching wallet data:", err);
      }
    };
    fetchWalletData();
  }, [loading]); // Reload data after payout request

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
      } catch (error: any) {
          console.error("Withdrawal error:", error);
          toast.error(error.response?.data?.message || "Failed to request payout");
      } finally {
          setLoading(false);
      }
  };

  // Pagination
  const idxLast = currentPage * transactionsPerPage;
  const idxFirst = idxLast - transactionsPerPage;
  const pageTransactions = transactions.slice(idxFirst, idxLast);

  const goPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="flex-1 p-6 space-y-6 text-white text-black">
      {/* Balance Card */}
      <div className="bg-gray-800 p-6 rounded-lg flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-white">
          Balance: <span className="text-[#d9ff00]">${balance.toFixed(2)}</span>
        </h2>
        <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#d9ff00] text-black px-6 py-2 rounded-lg hover:bg-[#c8e600] transition-colors font-bold"
        >
          Request Payout
        </button>
      </div>

     {/* Wallet History */}
      <div className="bg-gray-800 p-6 rounded-lg text-white">
        <h3 className="text-xl font-semibold mb-4">Wallet History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="text-left">
              <tr className="border-b border-gray-700">
                <th className="pb-3 px-4">AMOUNT</th>
                <th className="pb-3 px-4">REASON</th>
                <th className="pb-3 px-4">TYPE</th>
                <th className="pb-3 px-4">DATE</th>
              </tr>
            </thead>
            <tbody>
              {pageTransactions.map((tx, idx) => (
                <tr key={idx} className="border-b border-gray-700">
                  <td className="py-4 px-4">${tx.amount.toFixed(2)}</td>
                  <td className="py-4 px-4">{tx.reason}</td>
                  <td
                    className={`py-4 px-4 ${
                      tx.type === "credit" ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                  </td>
                  <td className="py-4 px-4">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-6">
          <button
            onClick={goPrev}
            disabled={currentPage === 1}
            className={`flex items-center gap-1 py-2 px-4 rounded-md ${
              currentPage === 1
                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-gray-700 text-white hover:bg-gray-600"
            }`}
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <span className="text-white">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={goNext}
            disabled={currentPage === totalPages}
            className={`flex items-center gap-1 py-2 px-4 rounded-md ${
              currentPage === totalPages
                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-[#d9ff00] text-black hover:bg-[#c8e600]"
            }`}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>

       {/* Withdrawal Modal */}
       <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-gray-800 rounded-xl p-6 w-full max-w-md text-white border border-gray-700 shadow-2xl relative"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                  <X size={24} />
              </button>

              <h2 className="text-2xl font-bold mb-6 text-[#d9ff00]">Request Payout</h2>
              
              <div className="space-y-4">
                  <div>
                      <label className="block text-gray-400 text-sm mb-1">Available Balance</label>
                      <div className="text-xl font-bold text-white">${balance.toFixed(2)}</div>
                  </div>

                  <div>
                      <label className="block text-gray-400 text-sm mb-1">Amount to Withdraw ($)</label>
                      <input 
                          type="number" 
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                          className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:border-[#d9ff00] transition-colors"
                          placeholder="0.00"
                          min="1"
                      />
                  </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWithdraw}
                  disabled={loading}
                  className="px-5 py-2.5 bg-[#d9ff00] hover:bg-[#c8e600] text-black rounded-lg text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? "Processing..." : "Confirm Request"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
