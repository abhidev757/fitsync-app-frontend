"use client";

import type React from "react";
import { useEffect, useState, useCallback } from "react";
import {AxiosError} from "axios";
import AuthLayout from "./AuthLayout";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { resendUserOtp, verifyUserOtp } from "../../axios/userApi";

const OTPVerificationPage: React.FC = () => {
  const [otp, setOtp] = useState<string[]>(Array(4).fill(""));
  const [emailId, setEmailId] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isOtpExpired, setIsOtpExpired] = useState<boolean>(false);
  const navigate = useNavigate();
  console.log(isOtpExpired);

  useEffect(() => {
    const storedEmailId = localStorage.getItem("emailId")
    console.log("Email retrieved from localStorage:", storedEmailId);;
    if (storedEmailId) {
      setEmailId(storedEmailId);
    } else {
      navigate("/signup");
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
      await verifyUserOtp({
        otp: otp.join(""),
        emailId,
      });
  
      toast.success("Email verified successfully!");
      navigate("/userInfo");
    } catch (err) {
      console.log(err);
      // const error = err as AxiosError<{ message: string }>;
      toast.error("OTP verification failed.");
    }
  };
  
  const handleResendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await resendUserOtp({ emailId});
      setOtp(Array(4).fill(""));
      startTimer();
      toast.success("A new OTP has been sent to your email!");
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      toast.error(error.response?.data?.message || "Failed to resend OTP.");
    }
  };

  return (
    <AuthLayout title="Sign in">
      <p className="mt-2 text-center text-sm text-gray-300">
        We just sent you a verification code. Check your inbox.
      </p>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="flex justify-center space-x-2">
          {otp.map((data, index) => (
            <input
              key={index}
              type="text"
              name="otp"
              id={`otp-input-${index}`}
              maxLength={1}
              value={data}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onFocus={(e) => e.target.select()}
              className="w-12 h-12 text-center text-2xl rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
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
        <div>
          <button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            Continue
          </button>
        </div>
      </form>
      <p className="mt-6 text-center text-xs text-gray-400">
        This site is protected by reCAPTCHA and the Google Privacy Policy.
      </p>
    </AuthLayout>
  );
};

export default OTPVerificationPage;
