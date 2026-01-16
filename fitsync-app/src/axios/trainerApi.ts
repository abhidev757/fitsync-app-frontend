import axiosInstance from "./axiosInstance";
import {
  IforgotPasswordData,
  IGoogleLogin,
  ILoginData,
  IOtp,
  IResendOtpData,
  IresetPasswordData,
} from "../types/auth.types";
import {
  IRegisterData,
  IRegisterResponse,
  ITimeSlotData,
  ITrainerProfileEditData,
} from "../types/trainer.types";
import { connectTrainerSocket, disconnectTrainerSocket } from "../util/trainerSocket";

// Trainer Registration
export const registerTrainer = async (
  data: IRegisterData | IRegisterResponse
) => {
  const response = await axiosInstance.post("/trainer/trainerRegister", data);
  return response.data;
};

// Trainer Login
export const loginTrainer = async (data: ILoginData) => {
  const response = await axiosInstance.post("/trainer/trainerAuth", data);
  const trainerId = response.data?._id;
  console.log("userId when login", trainerId);
  if (trainerId) connectTrainerSocket(trainerId);
  return response.data;
};
//Google Login
export const trainerGoogleSignin = async (data: {
  credential: string;
}): Promise<IGoogleLogin> => {
  const response = await axiosInstance.post<IGoogleLogin>(
    "/trainer/auth/google",
    data
  );
  const trainerId = response.data?._id;
  console.log("userId when login", trainerId);
  if (trainerId) connectTrainerSocket(trainerId);
  return response.data;
};

// Logout
export const LogoutTrainer = async () => {
  await axiosInstance.post("/trainer/logoutTrainer");
  disconnectTrainerSocket();
};

// Verify OTP
export const verifyTrainerOtp = async (data: IOtp) => {
  await axiosInstance.post("/trainer/trainerOtpVerification", data);
};

// Resend OTP
export const resendTrainerOtp = async (data: IResendOtpData) => {
  await axiosInstance.post("/trainer/trainerResendOtp", data);
};

export const trainerForgotPasswordRequesting = async (
  data: IforgotPasswordData
): Promise<void> => {
  try {
    await axiosInstance.post("/trainer/trainerPassword-reset-request", data);
  } catch (error) {
    console.error("Forgot Password Request Error:", error);
    throw error;
  }
};

// Reset Password
export const resetTrainerPassword = async (
  data: IresetPasswordData,
  token: string
) => {
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
    const response = await axiosInstance.get(
      `/trainer/getTrainerDetails/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching Trainer profile:", error);
    throw error;
  }
};
// Trainer Profile Edit
export const updateTrainerProfile = async (
  userData: ITrainerProfileEditData,
  userId: string
) => {
  try {
    console.log("Axios Profile data:", userData);

    const response = await axiosInstance.put(
      `/trainer/trainerEditProfile/${userId}`,
      userData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};
export const uploadCertificate = async (certificate: File) => {
  const formData = new FormData();
  formData.append("certificate", certificate);

  const response = await axiosInstance.post(
    "/trainer/upload-certificate",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const uploadProfileImage = async (profileImage: File) => {
  const formData = new FormData();
  formData.append("profileImage", profileImage);

  const response = await axiosInstance.post(
    "/trainer/upload-profile",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

// Trainer Registration
export const addTimeSlot = async (data: ITimeSlotData) => {
  const userId = localStorage.getItem("trainerId");

  if (!userId) {
    throw new Error("Trainer ID not found. Please register first.");
  }

  const requestBody = { userId, ...data };
  const response = await axiosInstance.post(
    "/trainer/addTimeSlot",
    requestBody
  );
  return response.data;
};

export const getTimeSlots = async () => {
  const response = await axiosInstance.get("/trainer/getTimeSlots");
  return response;
};

export const deleteTimeSlot = async (date: string, time: string) => {
  const response = await axiosInstance.delete("/trainer/timeSlots", {
    data: { date, time },
  });
  return response.data;
};

export const getTrainerBookings = async (trainerId: string) => {
  const response = await axiosInstance.get(
    `/trainer/get-trainerBookings/${trainerId}`
  );
  return response.data;
};
export const getBookingsDetails = async (bookingId: string) => {
  const response = await axiosInstance.get(
    `/trainer/get-bookings-details/${bookingId}`
  );
  return response.data;
};

export const getWalletDetails = async (trainerId: string) => {
  const response = await axiosInstance.get(`/trainer/wallet/${trainerId}`);
  return response.data;
};

//Chat
export const getUsersToChat = async () => {
  const response = await axiosInstance.get(`/chat/fetchUsers`);
  return response.data;
};
export const getMessages = async (userId: string) => {
  const response = await axiosInstance.get(`/chat/getMessages/${userId}`);
  console.log("Messages from the backend:", response.data);
  return response.data;
};
export const sendMessages = async (userId: string, data: FormData) => {
  const response = await axiosInstance.post(
    `/chat/sendMessages/${userId}`,
    data,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return response.data;
};

export const cancelBooking = async (bookingId:string) => {
  const response = await axiosInstance.patch(`/trainer/cancel-booking/${bookingId}`);
  return response;
};

export const startVideoSession = async (sessionId: string) => {
  const response = await axiosInstance.post('/video/start', { sessionId });
  return response.data;
};