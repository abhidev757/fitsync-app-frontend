"use client"

import type React from "react"
import { useNavigate } from "react-router-dom"
import { CheckCircle } from "lucide-react"

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate()

  // Mock payment data
  const paymentData = {
    transactionId: "1234567890",
    amount: 150.0,
    date: "October 5, 2023",
    name: "John Doe",
    email: "john.doe@example.com",
    address: "123 Main Street, Anytown, USA",
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
      <div className="max-w-md w-full p-6">
        <div className="bg-[#1a1a1a] rounded-lg p-8 shadow-lg">
          {/* Success icon */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="bg-[#d9ff00] rounded-full p-2 mb-4">
              <CheckCircle size={40} className="text-black" />
            </div>
            <h1 className="text-2xl font-bold text-[#d9ff00] mb-2">Payment Successful</h1>
            <p className="text-center text-gray-300">
              Thank you for your payment. Your transaction has been completed successfully.
            </p>
          </div>

          {/* Transaction Details */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[#d9ff00] mb-2">Transaction Details</h2>
            <div className="bg-[#2a2a2a] rounded-lg p-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-400">Transaction ID:</span>
                <span>{paymentData.transactionId}</span>

                <span className="text-gray-400">Amount Paid:</span>
                <span>${paymentData.amount.toFixed(2)}</span>

                <span className="text-gray-400">Date:</span>
                <span>{paymentData.date}</span>
              </div>
            </div>
          </div>

          {/* Billing Information */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-[#d9ff00] mb-2">Billing Information</h2>
            <div className="bg-[#2a2a2a] rounded-lg p-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-400">Name:</span>
                <span>{paymentData.name}</span>

                <span className="text-gray-400">Email:</span>
                <span>{paymentData.email}</span>

                <span className="text-gray-400">Address:</span>
                <span>{paymentData.address}</span>
              </div>
            </div>
          </div>

          {/* Back to home button */}
          <button
            className="w-full bg-[#d9ff00] hover:bg-[#c8e600] text-black font-medium py-3 rounded-lg"
            onClick={() => navigate("/")}
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccess

