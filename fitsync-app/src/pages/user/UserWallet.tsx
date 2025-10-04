import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getWalletDetails } from "../../axios/userApi";

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
  }, []);

  // Pagination
  const idxLast = currentPage * transactionsPerPage;
  const idxFirst = idxLast - transactionsPerPage;
  const pageTransactions = transactions.slice(idxFirst, idxLast);

  const goPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="flex-1 p-6 space-y-6 text-white">
      {/* Balance Card */}
      <div className="bg-gray-800 p-6 rounded-lg flex justify-between items-center">
        <h2 className="text-2xl font-semibold">
          Balance: <span className="text-[#d9ff00]">${balance.toFixed(2)}</span>
        </h2>
        <button className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-900 transition-colors">
          Withdraw
        </button>
      </div>

      {/* Wallet History */}
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

        {/* Pagination Controls */}
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
    </div>
  );
}
