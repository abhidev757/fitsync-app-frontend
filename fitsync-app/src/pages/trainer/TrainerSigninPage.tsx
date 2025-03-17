import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { toast } from "react-toastify";
import { FiEye, FiEyeOff } from "react-icons/fi";
import {loginTrainer, trainerGoogleSignin} from '../../axios/trainerApi'
import { setTrainerCredentials } from "../../slices/trainerAuthSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { IApiError } from "../../types/error.types";

function SigninPage() {
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const {trainerInfo} = useSelector((state: RootState) => state.trainerAuth);


  useEffect(() => {
    if (trainerInfo && !trainerInfo.isGoogleLogin) {
      navigate("/trainer/trainerDashboard");
    }
  }, [navigate, trainerInfo]);
  // Handle Normal Login

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const data = await loginTrainer({ email, password });
      console.log("Trainer Information:",data)
      dispatch(setTrainerCredentials(data));
      localStorage.setItem("trainerId", data._id);
      toast.success("Successfully logged in!");
      navigate("/trainer/trainerDashboard");
    } catch (err: unknown) {
      const error = err as IApiError;
      console.error("Login Error:", error);
      toast.error(error?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
  if (!credentialResponse.credential) {
    toast.error("Google authentication failed. No credentials received.");
    return;
  }

  setIsLoading(true);
  try {
    const data = await trainerGoogleSignin({
      credential: credentialResponse.credential,
    });

    localStorage.setItem("trainerId", data._id);
    toast.success("Google Sign In successful!");
    navigate(data.isGoogleLogin ? "/trainer/trainerDashboard" : "/");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Google Login Error:", error);
      toast.error(error.response?.data?.message || "Google Sign In failed.");
    } else {
      console.error("Unexpected Error:", error);
      toast.error("An unexpected error occurred.");
    }
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="p-4">
        <span className="text-gray-400">Login</span>
      </div>

      <div className="flex-1 flex">
        <div className="w-full lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center">
          <div className="mb-10">
            <h1 className="text-xl font-bold flex items-center">
              <span className="text-white font-bold mr-1">FIT</span>
              <span className="text-gray-400">SYNC</span>
            </h1>
          </div>

          <div className="mb-10">
            <h2 className="text-4xl font-bold mb-2">Welcome Back!</h2>
            <p className="text-gray-400">
              We can assign tasks, set deadlines, and track progress effortlessly.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full p-3 rounded bg-gray-800 border border-gray-700"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="w-full p-3 rounded bg-gray-800 border border-gray-700"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <Link to="/trainerForgotPassword" className="text-sm text-gray-400 hover:text-white">
                Forgot password?
              </Link>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-black font-medium py-3 px-4 rounded transition duration-200"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>

              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error("Google Sign In was unsuccessful")}
              />
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400">
              Don't have an account?
              <Link to="/trainerSignup" className="ml-1 text-white hover:underline">
                Create account
              </Link>
            </p>
          </div>
        </div>

        <div className="hidden lg:block lg:w-1/2">
          <div className="h-full relative">
            <img
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1170&q=80"
              alt="Fitness trainer with client"
              className="h-full w-full object-cover rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SigninPage;
