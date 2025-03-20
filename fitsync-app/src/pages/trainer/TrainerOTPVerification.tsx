import React, { useEffect, useState, useCallback } from "react";
import {AxiosError} from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { resendTrainerOtp, verifyTrainerOtp } from "../../axios/trainerApi";

export default function OTPVerification() {
  const [otp, setOtp] = useState<string[]>(Array(4).fill(""));
  const [emailId, setEmailId] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isOtpExpired, setIsOtpExpired] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedEmailId = localStorage.getItem("trainerEmailId");
    if (storedEmailId) {
      setEmailId(storedEmailId);
    } else {
      navigate("/trainerSignup");
    }
  }, [navigate]);

  const startTimer = useCallback(() => {
    setIsOtpExpired(false);
    setTimeLeft(60);
    const timerInterval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime > 0) {
          return prevTime - 1;
        } else {
          clearInterval(timerInterval);
          setIsOtpExpired(true);
          return 0;
        }
      });
    }, 1000);
  }, []);

  useEffect(() => {
    startTimer();
  }, [startTimer]);

  const handleInputChange = (index: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      document.getElementById(`otp-input-${index + 1}`)?.focus();
    }
    if (!value && index > 0) {
      document.getElementById(`otp-input-${index - 1}`)?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await verifyTrainerOtp({ otp: otp.join(""), emailId });

      toast.success("Email verified successfully!");
      navigate("/trainerSignin");
    }  catch (error) {
      if (error instanceof AxiosError) {
        console.error("OTP Verification Error:", error);
        toast.error(error.response?.data?.message || "OTP verification failed");
      } else {
        console.error("Unexpected Error:", error);
        toast.error("An unexpected error occurred.");
      }
    }
    
  };

  const handleResendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await resendTrainerOtp({ emailId });
      setOtp(Array(4).fill(""));
      startTimer();
      toast.success("A new OTP has been sent to your email!");
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Resend OTP Error:", error);
        toast.error(error.response?.data?.message || "Failed to resend OTP");
      } else {
        console.error("Unexpected Error:", error);
        toast.error("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="p-6 flex justify-between items-center">
        <span className="text-gray-400">OTP Verification</span>
        <Link to="/trainerSignin" className="text-sm text-gray-400 hover:text-white">
          Already a member? <span className="text-white">Sign in</span>
        </Link>
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
            <h2 className="text-3xl font-bold mb-2">Sign in</h2>
            <p className="text-gray-400">
              We just sent you a verification code. Check<br />
              your inbox to get it.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center gap-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onFocus={(e) => e.target.select()}
                  className="w-14 h-14 text-center text-2xl font-bold rounded bg-gray-800/50 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
                />
              ))}
            </div>

            <div className="text-center mt-4">
              {timeLeft > 0 ? (
                <p className="text-sm text-gray-400">Resend OTP in {timeLeft}s</p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-sm text-yellow-400 hover:underline"
                >
                  Resend OTP
                </button>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white font-medium py-3 px-4 rounded hover:bg-blue-600 transition duration-200"
            >
              Continue
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            This site is protected by reCAPTCHA<br />
            and the Google Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
