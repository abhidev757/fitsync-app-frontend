import { useState, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { resetTrainerPassword } from "../../axios/trainerApi";
import axios from "axios";

export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
  
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
  
    const validatePassword = (password: string) => {
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
      return passwordRegex.test(password);
    };
  
    const handleSubmit = async (e: FormEvent) => {
      e.preventDefault();
  
      setPasswordError("");
      setConfirmPasswordError("");
  
      if (!password) {
        setPasswordError("Please enter your password.");
        return;
      }
      if (!validatePassword(password)) {
        setPasswordError(
          "Password must include at least 1 uppercase, 1 lowercase, 1 digit, 1 special character, and be at least 8 characters long."
        );
        return;
      }
      if (!confirmPassword) {
        setConfirmPasswordError("Please confirm your password.");
        return;
      }
      if (password !== confirmPassword) {
        setConfirmPasswordError("Passwords do not match.");
        return;
      }
      if (!token) {
        toast.error("Invalid or missing token.");
        return;
      }
  
      try {
        setIsLoading(true);
        await resetTrainerPassword({ password},token);
  
        toast.success("Password reset successfully! Redirecting to sign in...");
        setTimeout(() => navigate("/trainerSignin"), 3000);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setPasswordError(err.response?.data?.message || "Error resetting password.");
        } else {
          setPasswordError("An unexpected error occurred.");
        }
      } finally {
        setIsLoading(false);
      }
    };
  

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="p-6">
        <span className="text-gray-400">Reset Password</span>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="w-full max-w-md px-6">
          <div className="mb-6">
            <h1 className="text-xl font-bold flex items-center">
              <span className="text-white font-bold mr-1">FIT</span>
              <span className="text-gray-400">SYNC</span>
            </h1>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Reset Password</h2>
            <p className="text-gray-400">
              Enter your new password below to reset your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="newPassword" className="block text-sm font-medium">
                New Password
              </label>
              <div className="relative">
                <input
                  type= 'password'
                  id="newPassword"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 rounded bg-gray-800/50 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
                  required
                />
                <button
                  type="button"
                  
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400"
                >
                  { <FiEyeOff size={20} /> }
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 rounded bg-gray-800/50 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
                  required
                />
                <button
                  type="button"
                 
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400"
                >
                  {<FiEyeOff size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gray-400 text-black font-medium py-3 px-4 rounded hover:bg-gray-300 transition duration-200"
            >
              Reset Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
