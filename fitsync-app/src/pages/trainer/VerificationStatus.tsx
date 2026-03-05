import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { refreshToken } from '../../axios/trainerApi';
import { setTrainerCredentials } from '../../slices/trainerAuthSlice';

type VerificationStatus = 'pending' | 'rejected' | 'approved';

export default function VerificationStatus() {
  const [status, setStatus] = useState<VerificationStatus>('pending');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { trainerInfo } = useSelector((state: RootState) => state.trainerAuth);

  useEffect(() => {
    // If they are already verified in Redux, just go to dashboard
    if (trainerInfo?.verificationStatus) {
      navigate('/trainer/trainerDashboard');
      return;
    }

    const checkStatus = async () => {
      try {
        // Only show loading on initial check so it doesn't blink every 10 seconds
        if (status === 'pending' && loading) {
           setLoading(true);
        }

        const response = await refreshToken();
        if (response?.trainer) {
          if (response.trainer.verificationStatus) {
            // Only update Redux when we have a new confirmed approval to break the infinite loop
            dispatch(setTrainerCredentials(response.trainer));
            setStatus('approved');
            navigate('/trainer/trainerDashboard');
            return;
          }
        }
        setStatus('pending');
      } catch (error) {
        console.error('Error fetching verification status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
    // Poll every 10 seconds while on this screen
    const intervalId = setInterval(checkStatus, 10000);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, dispatch]);

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