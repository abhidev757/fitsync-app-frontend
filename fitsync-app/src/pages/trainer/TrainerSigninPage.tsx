"use client";

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { toast } from "react-toastify";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { loginTrainer, trainerGoogleSignin } from '../../axios/trainerApi';
import { setTrainerCredentials } from "../../slices/trainerAuthSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { IApiError } from "../../types/error.types";
import { Lock, Mail, ChevronRight, ShieldCheck } from "lucide-react";

function SigninPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { trainerInfo } = useSelector((state: RootState) => state.trainerAuth);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    if (trainerInfo) {
      navigate(trainerInfo.verificationStatus ? "/trainer/trainerDashboard" : "/verificationStatus");
    }
  }, [navigate, trainerInfo]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const data = await loginTrainer({ email, password });
      dispatch(setTrainerCredentials(data));
      localStorage.setItem("trainerId", data._id);
      toast.success("Identity Verified: Welcome to Command Center");
      navigate(data.verificationStatus ? "/trainer/trainerDashboard" : "/verificationStatus");
    } catch (err: unknown) {
      const error = err as IApiError;
      toast.error(error?.data?.message || "Verification failed. Check credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error("Security mismatch. No credentials received.");
      return;
    }

    setIsLoading(true);
    try {
      const data = await trainerGoogleSignin({
        credential: credentialResponse.credential,
      });

      dispatch(setTrainerCredentials(data));
      localStorage.setItem("trainerId", data._id);
      toast.success("Google Authentication Successful");
      navigate(data.verificationStatus ? "/trainer/trainerDashboard" : "/verificationStatus");
    } catch (error) {
      toast.error("Protocol Error: Google Sign In failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col overflow-hidden">
      {/* Top Protocol Bar */}
      <div className="p-6 border-b border-gray-900 bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex flex-col">
                <span className="text-[#CCFF00] font-black text-[10px] tracking-[0.4em] uppercase mb-0.5">Expert Portal</span>
                <Link to="/">
                  <h1 className="text-xl font-black italic uppercase tracking-tighter hover:drop-shadow-[0_0_15px_rgba(204,255,0,0.5)] transition-all cursor-pointer">
                  FIT<span className="text-[#CCFF00]">SYNC</span> OPS
                  </h1>
                </Link>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 italic">Auth_Session_v2.0</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 relative">
        {/* Background Ambient Glow */}
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#CCFF00] opacity-5 blur-[120px] pointer-events-none"></div>

        <div className="w-full max-w-5xl flex flex-col lg:flex-row bg-[#0B0B0B] border border-gray-900 rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10">
          
          {/* Left: Branding & Context */}
          <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden group">
            <img
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1170&q=80"
              alt="Elite Training"
              className="h-full w-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-75 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-12 flex flex-col justify-end">
                <div className="bg-[#CCFF00] w-12 h-1 h-1 rounded-full mb-6"></div>
                <h2 className="text-5xl font-black tracking-tighter uppercase italic mb-4 leading-none">
                    Command <br /> Your Roster.
                </h2>
                <p className="text-gray-400 text-sm italic font-medium leading-relaxed max-w-xs">
                    Access high-fidelity biometric data, manage deployments, and scale your influence within the FitSync grid.
                </p>
            </div>
          </div>

          {/* Right: Authentication Form */}
          <div className="w-full lg:w-1/2 p-10 md:p-16 flex flex-col justify-center bg-[#0B0B0B]">
            <div className="mb-10">
              <h2 className="text-4xl font-black tracking-tighter uppercase italic mb-2">Initialize Session</h2>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Provide expert credentials to proceed.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Identity Container */}
              <div className="rounded-2xl overflow-hidden border border-gray-800 bg-black transition-all focus-within:border-[#CCFF00]/50">
                <div className="relative flex items-center border-b border-gray-900">
                  <div className="pl-4 text-gray-700">
                    <Mail size={18} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    className="appearance-none relative block w-full px-4 py-5 bg-transparent placeholder-gray-800 text-white focus:outline-none sm:text-sm italic font-medium"
                    placeholder="Expert Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="relative flex items-center">
                  <div className="pl-4 text-gray-700">
                    <Lock size={18} />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="appearance-none relative block w-full px-4 py-5 bg-transparent placeholder-gray-800 text-white focus:outline-none sm:text-sm italic font-medium"
                    placeholder="Secret Key"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="pr-4 text-gray-700 hover:text-white transition-colors"
                  >
                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <Link to="/trainerForgotPassword" className="text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-[#CCFF00] transition-colors italic">
                  Lost Credentials?
                </Link>
              </div>

              <div className="space-y-4 pt-2">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-3 bg-[#CCFF00] text-black font-black py-5 px-4 rounded-2xl uppercase text-xs tracking-[0.3em] hover:shadow-[0_0_30px_rgba(204,255,0,0.4)] transition-all active:scale-[0.98] disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                        <ShieldCheck size={18} className="animate-pulse" /> Verifying...
                    </span>
                  ) : (
                    <>Establish Link <ChevronRight size={18} /></>
                  )}
                </button>

                <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-900"></div></div>
                    <div className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.5em] text-gray-700"><span className="bg-[#0B0B0B] px-4 italic">OR SECURE SYNC</span></div>
                </div>

                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    theme="filled_black"
                    shape="pill"
                    text="signin_with"
                  />
                </div>
              </div>
            </form>

            <div className="mt-12 text-center">
              <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">
                New Personnel? 
                <Link to="/trainerSignup" className="ml-2 text-white hover:text-[#CCFF00] underline decoration-[#CCFF00] underline-offset-8 transition-colors">
                  Initialize Registry
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <p className="text-center py-8 text-gray-800 text-[10px] font-black uppercase tracking-[0.5em]">
        FitSync Security Protocol // End Transmission
      </p>
    </div>
  );
}

export default SigninPage;