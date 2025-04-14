import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../../axios/userApi';
import { toast } from 'react-toastify';

const ChangePassword: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    setError('');
    setSuccess(false);
  
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }
  
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
  
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('No token found. Please log in.');
      }
      const response = await changePassword(userId, { currentPassword, newPassword });
  
      if (response.success) {
        setSuccess(true);
        toast.success("Password changed successfully!");
        navigate("/user/userProfile");
      } else {
        setError(response.message || 'Failed to change password.');
      }
    } catch (err: unknown) {
      let errorMessage = 'An error occurred while changing the password.';
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };
  

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
      <div className="bg-[#1a1a1a] rounded-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-white text-center mb-4">
          Change Password
        </h1>

        <p className="text-center text-gray-400 text-sm mb-6">
          Forgot password?{' '}
          <a href="#" className="text-[#d9ff00] hover:underline">
            Click here!
          </a>
        </p>

        {success && (
          <div className="bg-green-500/20 border border-green-500 text-green-400 px-4 py-2 rounded-md mb-4">
            Password changed successfully!
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-2 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="current-password" className="block text-white mb-2">
              Current Password
            </label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-[#2a2a2a] border-none rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#d9ff00]"
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="new-password" className="block text-white mb-2">
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-[#2a2a2a] border-none rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#d9ff00]"
              disabled={loading}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="confirm-password" className="block text-white mb-2">
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-[#2a2a2a] border-none rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-[#d9ff00]"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#d9ff00] hover:bg-[#c8e600] text-black font-medium py-3 rounded-md transition-colors"
            disabled={loading}
          >
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
