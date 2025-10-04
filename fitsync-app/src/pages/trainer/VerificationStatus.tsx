import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type VerificationStatus = 'pending' | 'rejected' | 'approved';

export default function VerificationStatus() {
  const [status, setStatus] = useState<VerificationStatus>('pending');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        setLoading(true);
        setTimeout(() => {
          setStatus('pending');
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching verification status:', error);
        setLoading(false);
      }
    };

    checkStatus();
  }, []);

  useEffect(() => {
    if (status === 'approved' && !loading) {
      navigate('/trainer-dashboard');
    }
  }, [status, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        <div className="p-6 flex justify-between items-center">
          <span className="text-gray-400">Verification status</span>
          <a href="/login" className="text-sm text-gray-400 hover:text-white">
            Already a member? <span className="text-white">Sign in</span>
          </a>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="mb-6">
            <h1 className="text-xl font-bold flex items-center">
              <span className="text-white font-bold mr-1">FIT</span>
              <span className="text-gray-400">SYNC</span>
            </h1>
          </div>
          
          <div className="w-12 h-12 border-t-2 border-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-400">Loading verification status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="p-6 flex justify-between items-center">
        <span className="text-gray-400">Verification {status}</span>
        <a href="/login" className="text-sm text-gray-400 hover:text-white">
          Already a member? <span className="text-white">Sign in</span>
        </a>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="mb-10">
          <h1 className="text-xl font-bold flex items-center">
            <span className="text-white font-bold mr-1">FIT</span>
            <span className="text-gray-400">SYNC</span>
          </h1>
        </div>
        
        {status === 'pending' && (
          <>
            <div className="bg-yellow-400 text-black font-semibold px-10 py-3 rounded-full mb-8">
              Pending
            </div>
            <h2 className="text-2xl font-semibold text-center px-4">
              We'll notify you once the admin has reviewed your request
            </h2>
          </>
        )}
        
        {status === 'rejected' && (
          <>
            <div className="bg-red-500 text-white font-semibold px-10 py-3 rounded-full mb-8">
              Rejected
            </div>
            <h2 className="text-2xl font-semibold text-center px-4">
              Your verification request has been rejected
            </h2>
            <p className="mt-4 text-gray-400 text-center max-w-md">
              We're sorry, but your application didn't meet our requirements. 
              Please contact support for more information.
            </p>
            <button 
              className="mt-8 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
              onClick={() => window.location.href = '/contact-support'}
            >
              Contact Support
            </button>
          </>
        )}
      </div>
    </div>
  );
}