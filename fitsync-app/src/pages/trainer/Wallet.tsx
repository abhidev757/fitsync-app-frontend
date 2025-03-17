import { useState } from 'react';

interface Transaction {
  amount: string;
  clientName: string;
  type: string;
}

export default function WalletPage() {
  const [transactions] = useState<Transaction[]>([
    { amount: '500$', clientName: 'John Doe', type: 'Credited' },
    { amount: '250$', clientName: 'Jane Smith', type: 'Credited' },
    { amount: '700$', clientName: 'Emily Johnson', type: 'Credited' },
  ]);

  return (
    <div className="flex-1 p-6 space-y-6 text-white"> {/* Added text-white here */}
      <div className="bg-gray-800 p-6 rounded-lg flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Balance : 5,600$</h2>
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
                <th className="pb-3 px-4">CLIENT NAME</th>
                <th className="pb-3 px-4">TYPE</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <tr key={index} className="border-b border-gray-700">
                  <td className="py-4 px-4">{transaction.amount}</td>
                  <td className="py-4 px-4">{transaction.clientName}</td>
                  <td className="py-4 px-4 text-green-500">{transaction.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <button className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
            Previous
          </button>
          <span className="text-gray-400">Page 1 of 3</span>
          <button className="px-4 py-2 bg-black rounded-lg hover:bg-gray-900 transition-colors">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}