import { useEffect, useState } from 'react';
import { getWalletDetails } from '../../axios/trainerApi';

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

  useEffect(() => {
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
 
    fetchWalletData();
  }, []); 

  return (
    <div className="flex-1 p-6 space-y-6 text-white">
      <div className="bg-gray-800 p-6 rounded-lg flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Balance: ${balance}</h2>
        <button className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-900 transition-colors">
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
              {transactions.map((tx, index) => (
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
