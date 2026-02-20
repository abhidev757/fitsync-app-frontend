import { useEffect, useState, FormEvent } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { trainerForgotPasswordRequesting } from "../../axios/trainerApi";
import axios from "axios";

export default function ForgotPassword() {
  const location = useLocation();
  const [email, setEmail] = useState<string>("");
  const [isChangePassword, setIsChangePassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (location.state) {
      const { email, isChangePassword } = location.state as {
        email: string;
        isChangePassword: boolean;
      };
      setEmail(email || "");
      setIsChangePassword(isChangePassword || false);
    }
  }, [location.state]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    try {
      await trainerForgotPasswordRequesting({ email });

      toast.success("Password reset link sent to your email");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        
        toast.error(error.response?.data?.message || "An unexpected error occurred");
      } else if (error instanceof Error) {
       
        toast.error(error.message);
      } else {
       
        toast.error("An unexpected error occurred");
      }
    }
     finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="p-6">
        <span className="text-gray-400">Forgot Password</span>
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
            <h2 className="text-3xl font-bold mb-2">Forgot Password</h2>
            <p className="text-gray-400">
              Enter your email to receive a password reset link.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded bg-gray-800/50 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gray-400 text-black font-medium py-3 px-4 rounded hover:bg-gray-300 transition duration-200"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send E-mail"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
