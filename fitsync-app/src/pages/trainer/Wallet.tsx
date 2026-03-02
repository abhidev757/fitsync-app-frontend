import { useEffect, useState } from 'react';
import { getWalletDetails, requestPayout } from '../../axios/trainerApi';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchWalletData = async () => {
      const trainerId = localStorage.getItem('trainerId');
      if (!trainerId) {
        console.error('Trainer not authenticated');
        return;
      }

      try {
        const data = await getWalletDetails(trainerId);
        setBalance(data.balance);
        setTransactions(data.transactions);
      } catch (err) {
        console.error('Error fetching wallet data:', err);
      }
    };

  useEffect(() => {
    fetchWalletData();
  }, []); 

  const handleWithdraw = async () => {
      const trainerId = localStorage.getItem('trainerId');
      if (!trainerId) return;

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
          await requestPayout(trainerId, Number(withdrawAmount));
          toast.success("Payout requested successfully");
          setIsModalOpen(false);
          setWithdrawAmount('');
          // Optionally refresh balance, though it won't change until approved usually, 
          // or maybe we should deduct it immediately from "available" balance?
          // For now, let's just refresh to be safe.
          fetchWalletData(); 
      } catch (error: any) {
          toast.error(error.response?.data?.message || "Failed to request payout");
      } finally {
          setLoading(false);
      }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(transactions.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex-1 p-6 space-y-6 text-white">
      <div className="bg-gray-800 p-6 rounded-lg flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Balance: ${balance}</h2>
        <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-900 transition-colors"
        >
          Withdraw
        </button>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg">
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
              {currentTransactions.length > 0 ? (
                currentTransactions.map((tx, index) => (
                  <tr key={index} className="border-b border-gray-700">
                  <td className="py-4 px-4">${tx.amount}</td>
                  <td className="py-4 px-4">{tx.reason}</td>
                  <td
                    className={`py-4 px-4 ${
                      tx.type === 'credit' ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {tx.type}
                  </td>
                  <td className="py-4 px-4">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-400">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex space-x-2">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index + 1)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    currentPage === index + 1
                      ? "bg-[#d9ff00] text-black font-bold"
                      : "bg-gray-700 text-white hover:bg-gray-600"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-black rounded-lg hover:bg-gray-900 transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="bg-gray-800 rounded-lg p-6 w-full max-w-md text-white border border-gray-700 shadow-xl"
            >
                <h2 className="text-xl font-bold mb-4">Request Payout</h2>
                <div className="mb-4">
                    <p className="text-gray-400 text-sm mb-2">Available Balance: <span className="text-white font-bold">${balance}</span></p>
                    <input 
                        type="number" 
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                        className="w-full bg-gray-700 text-white p-3 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                        placeholder="Enter amount to withdraw"
                    />
                </div>
                <div className="flex justify-end space-x-3">
                <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded text-sm transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleWithdraw}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-bold transition-colors disabled:opacity-50"
                >
                    {loading ? "Processing..." : "Confirm"}
                </button>
                </div>
            </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
}
