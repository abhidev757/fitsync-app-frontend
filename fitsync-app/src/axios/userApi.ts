import axiosInstance from "./axiosInstance";
import {
  IGoogleLogin,
  ILoginData,
  IOtp,
  IResendOtpData,
  IresetPasswordData,
  IforgotPasswordData,
} from "../types/auth.types";
import {
  BookingRequest,
  IProfileEditData,
  IRegisterData,
  IRegisterResponse,
  IUserFitnessData,
  passReq,
  PaymentIntentRequest,
} from "../types/user.types";
import { connectUserSocket, disconnectUserSocket } from "../util/userSocket";

// User Registration
export const registerUser = async (data: IRegisterData | IRegisterResponse) => {
  const response = await axiosInstance.post("/user/register", data);
  return response.data;
};
//Google Login
export const googleSignin = async (data: {
  credential: string;
}): Promise<IGoogleLogin> => {
  const response = await axiosInstance.post<IGoogleLogin>(
    "/user/auth/google",
    data
  );
  const userId = response.data?._id;
  if (userId) connectUserSocket(userId);
  return response.data;
};
// User Login
export const loginUser = async (data: ILoginData) => {
  console.log("Login data:",data);
  
  const response = await axiosInstance.post("/user/auth", data);
  const userId = response.data?._id;
  console.log("userId when login", userId);
  
  if (userId) connectUserSocket(userId);
  return response.data;
};

// Logout
export const logoutUser = async () => {
  await axiosInstance.post("/user/logout");
  disconnectUserSocket();
};

// Verify OTP
export const verifyUserOtp = async (data: IOtp) => {
  await axiosInstance.post("/user/otpVerification", data);
};

// Resend OTP
export const resendUserOtp = async (data: IResendOtpData) => {
  await axiosInstance.post("/user/resendOtp", data);
};
// Forgot Password
export const forgotPasswordRequesting = async (
  data: IforgotPasswordData
): Promise<void> => {
  try {
    await axiosInstance.post("/user/password-reset-request", data);
  } catch (error) {
    console.error("Forgot Password Request Error:", error);
    throw error;
  }
};
// Reset Password
export const resetUserPassword = async (
  data: IresetPasswordData,
  token: string
) => {
  await axiosInstance.post(`/user/reset-password/${token}`, data);
};

//Submitting user info
export const submitUserFitnessData = async (data: IUserFitnessData) => {
  try {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      throw new Error("User ID not found. Please register first.");
    }

    const requestBody = { userId, ...data };

    const response = await axiosInstance.post(
      "/user/saveFitnessData",
      requestBody
    );
    return response.data;
  } catch (error) {
    console.error("Error submitting fitness data:", error);
    throw error;
  }
};
//fetching userInfo
export const fetchUserProfile = async (userId: string) => {
  try {
    const response = await axiosInstance.get(`/user/getUserDetails/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};
// Refresh Token
export const refreshToken = async () => {
  try {
    const response = await axiosInstance.post("/user/refresh-token");
    return response.data;
  } catch (error) {
    console.error("Refresh Token Error:", error);
    throw error;
  }
};
// Profile Edit
export const profileEdit = async (data: IProfileEditData, userId: string) => {
  try {
    const response = await axiosInstance.put(
      `/user/userEditProfile/${userId}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};
//Fetch Trainers
export const fetchTrainers = async () => {
  try {
    const response = await axiosInstance.get(`/user/fetchTrainers`);
    console.log("Response Data", response.data);

    return response.data;
  } catch (error) {
    console.error("Error fetching Traines:", error);
    throw error;
  }
};

//fetching trainer Info
export const fetchTrainer = async (userId: string) => {
  try {
    const response = await axiosInstance.get(
      `/user/getTrainerDetails/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching Trainer profile:", error);
    throw error;
  }
};

export const createPaymentIntent = async (data: PaymentIntentRequest) => {
  console.log("Create payment data:", data);

  const response = await axiosInstance.post(
    "/user/create-payment-intent",
    data
  );
  return response.data;
};

export const createBooking = async (data: BookingRequest) => {
  const response = await axiosInstance.post("/user/create-bookings", data);
  return response.data;
};
export const getBookings = async (userId: string) => {
  const response = await axiosInstance.get(`/user/get-bookings/${userId}`);
  console.log("bookings data:", response.data);

  return response.data;
};
export const getPayment = async (userId: string) => {
  const response = await axiosInstance.get(`/user/get-bookings/${userId}`);
  return response.data;
};

//Fetch Specializations
export const fetchSpecialization = async () => {
  try {
    const response = await axiosInstance.get(`/user/fetchSpecializations`);
    console.log("Specialization Data", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching Traines:", error);
    throw error;
  }
};
export const changePassword = async (userId: string, data: passReq) => {
  const response = await axiosInstance.post(
    `/user/changePassword/${userId}`,
    data
  );
  return response.data;
};

export const uploadUserProfilePicture = async (
  profileImage: File,
  userId: string
) => {
  const formData = new FormData();
  formData.append("profileImage", profileImage);

  const response = await axiosInstance.post(
    `/user/upload-profile/${userId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const getMessages = async (trainerId: string) => {
  const { data } = await axiosInstance.get(`/chat/getMessages/${trainerId}`);
  console.log("Chat history:", data);

  return data;
};


export const sendMessages = async (trainerId: string, data: FormData) => {
  const response = await axiosInstance.post(
    `/chat/sendMessages/${trainerId}`,
    data,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
};

export const getWalletDetails = async (userId: string) => {
  const response = await axiosInstance.get(`/user/wallet/${userId}`);
  return response.data;
};

export const requestPayout = async (userId: string, amount: number) => {
  const response = await axiosInstance.post(`/user/request-payout`, { userId, amount });
  return response.data;
};

export const getBookingsDetails = async (bookingId: string) => {
  const response = await axiosInstance.get(
    `/user/get-bookings-details/${bookingId}`
  );
  return response.data;
};

export const cancelBooking = async (bookingId:string) => {
  const response = await axiosInstance.patch(`/user/cancel-booking/${bookingId}`);
  return response;
};

const today = new Date().toISOString().split("T")[0]

export const fetchTodayWater = async (userId: string) => {
  const response = await axiosInstance.get(`/user/water?userId=${userId}&date=${today}`)
  return response.data // { waterGlasses: number }
}

export const updateTodayWater = async (userId: string, waterGlasses: number) => {
  const response = await axiosInstance.post(`/user/water`, {
    userId,
    date: today,
    waterGlasses,
  })
  return response.data
}

export const getTodayHealthData = async (userId: string) => {
  const { data } = await axiosInstance.get<{
    steps: number
    caloriesBurned: number
    sleepHours: number
  }>(`/user/auth/google-fit/health-today`, {
    params: { userId },
  })
  console.log("fitnessDataaaaa: ", data);
  
  return data
}

export const syncGoogleFitData = async () => {
  const { data } = await axiosInstance.post(
    `/user/auth/google-fit/sync-fit`
  )
  return data
}

export const exchangeGoogleFitCode = async (code: string,redirectUri: string,userId:string) => {
  const { data } = await axiosInstance.post(`/user/auth/google-fit/code`,{ code, redirectUri,userId })
  return data
}


































