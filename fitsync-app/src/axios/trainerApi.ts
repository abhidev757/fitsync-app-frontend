import axiosInstance from "./axiosInstance";
import { IforgotPasswordData, IGoogleLogin, ILoginData, IOtp, IResendOtpData, IresetPasswordData } from "../types/auth.types";
import { IRegisterData, IRegisterResponse, ITrainerProfileEditData } from "../types/trainer.types";

// Trainer Registration
export const registerTrainer = async (data: IRegisterData|IRegisterResponse) => {
  const response = await axiosInstance.post("/trainer/trainerRegister", data);
  return response.data;
};

// Trainer Login
export const loginTrainer = async (data: ILoginData) => {
  const response = await axiosInstance.post("/trainer/trainerAuth", data);
  console.log("Response Dataaaaa:",response.data);
  return response.data;
};
//Google Login
export const trainerGoogleSignin = async (data: { credential: string }): Promise<IGoogleLogin> => {
  const response = await axiosInstance.post<IGoogleLogin>("/trainer/auth/google", data);
  return response.data;
};

// Logout
export const LogoutTrainer = async () => {
  await axiosInstance.post("/trainer/logoutTrainer");
};

// Verify OTP
export const verifyTrainerOtp = async (data: IOtp) => {
  await axiosInstance.post("/trainer/trainerOtpVerification", data);
};

// Resend OTP
export const resendTrainerOtp = async (data: IResendOtpData) => {
  await axiosInstance.post("/trainer/trainerResendOtp", data);
};

export const trainerForgotPasswordRequesting = async (data: IforgotPasswordData): Promise<void> => {
  try {
    await axiosInstance.post("/trainer/trainerPassword-reset-request", data);
  } catch (error) {
    console.error("Forgot Password Request Error:", error);
    throw error;
  }
};

// Reset Password
export const resetTrainerPassword = async (data: IresetPasswordData, token: string) => {
  await axiosInstance.post(`/trainer/trainerReset-password/${token}`, data);
};

export const refreshToken = async () => {
  try {
    const response = await axiosInstance.post("/trainer/trainer-Refresh-token");
    return response.data;
  } catch (error) {
    console.error("Refresh Token Error:", error);
    throw error;
  }
};

//fetching trainer Info
export const fetchTrainerProfile = async (userId: string) => {
  try {
    const response = await axiosInstance.get(`/trainer/getTrainerDetails/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Trainer profile:", error);
    throw error;
  }
};
// Trainer Profile Edit
export const updateTrainerProfile = async (userData: ITrainerProfileEditData, userId: string) => {
  try {
    console.log("Axios Profile data:",userData);
    
    const response = await axiosInstance.put(`/trainer/trainerEditProfile/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }

};
export const uploadCertificate = async (certificate: File) => {
  const formData = new FormData();
  formData.append("certificate", certificate); // Append the file to FormData

  const response = await axiosInstance.post("/trainer/upload-certificate", formData, {
    headers: {
      "Content-Type": "multipart/form-data", // Set the content type for file upload
    },
  });

  return response.data; // Return the response data
};


