import axiosInstance from "./axiosInstance";
import { IGoogleLogin, ILoginData, IOtp, IResendOtpData, IresetPasswordData,IforgotPasswordData } from "../types/auth.types";
import { BookingRequest, IProfileEditData, IRegisterData,IRegisterResponse, IUserFitnessData, passReq, PaymentIntentRequest } from "../types/user.types";

// User Registration
export const registerUser = async (data: IRegisterData|IRegisterResponse) => {
  const response = await axiosInstance.post("/user/register", data);
  return response.data;
};
//Google Login
export const googleSignin = async (data: { credential: string }): Promise<IGoogleLogin> => {
  const response = await axiosInstance.post<IGoogleLogin>("/user/auth/google", data);
  return response.data;
};
// User Login
export const loginUser = async (data: ILoginData) => {
  const response = await axiosInstance.post("/user/auth", data);
  return response.data;
};

// Logout
export const logoutUser = async () => {
  await axiosInstance.post("/user/logout");
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
export const forgotPasswordRequesting = async (data: IforgotPasswordData): Promise<void> => {
  try {
    await axiosInstance.post("/user/password-reset-request", data);
  } catch (error) {
    console.error("Forgot Password Request Error:", error);
    throw error;
  }
};
// Reset Password
export const resetUserPassword = async (data: IresetPasswordData, token: string) => {
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

    const response = await axiosInstance.post("/user/saveFitnessData", requestBody);
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
    const response = await axiosInstance.put(`/user/userEditProfile/${userId}`, data);
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
    console.log("Response Data",response.data);
    
    return response.data;
  } catch (error) {
    console.error("Error fetching Traines:", error);
    throw error;
  }
};

//fetching trainer Info
export const fetchTrainer = async (userId: string) => {
  try {
    const response = await axiosInstance.get(`/user/getTrainerDetails/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Trainer profile:", error);
    throw error;
  }
};


  export const createPaymentIntent = async (data: PaymentIntentRequest) => {
    console.log('Create payment data:',data);
    
    const response = await axiosInstance.post('/user/create-payment-intent', data);
    return response.data;
  }
  
  export const createBooking = async (data: BookingRequest) => {
    const response = await axiosInstance.post('/user/create-bookings', data);
    return response.data;
  }
  export const getBookings = async (userId:string) => {
    const response = await axiosInstance.get(`/user/get-bookings/${userId}`);
    return response.data;
  }
  export const getPayment = async (userId:string) => {
    const response = await axiosInstance.get(`/user/get-bookings/${userId}`);
    return response.data;
  }

  //Fetch Specializations
export const fetchSpecialization = async () => {
  try {
    const response = await axiosInstance.get(`/user/fetchSpecializations`);
    console.log("Specialization Data",response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching Traines:", error);
    throw error;
  }
};
export const changePassword = async (userId:string,data: passReq) => {
  const response = await axiosInstance.post(`/user/changePassword/${userId}`, data);
  return response.data;
}

export const uploadUserProfilePicture = async (profileImage: File,userId:string) => {
  const formData = new FormData();
  formData.append("profileImage", profileImage);

  const response = await axiosInstance.post(`/user/upload-profile/${userId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};