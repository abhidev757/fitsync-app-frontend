import axiosInstance from "./axiosInstance";
import { AdminLoginData } from "../types/admin.types";


// Admin Login
export const loginAdmin = async (data: AdminLoginData) => {
  const response = await axiosInstance.post("/admin/login", data);
  return response.data;
};
// Admin Logout
export const LogoutAdmin = async () => {
   await axiosInstance.post("/admin/logout");
};

// Get All Users
export const getAllUsers = async () => {
  const response = await axiosInstance.get("/admin/getAllUsers");
  return response.data;
};

// Update User Status
export const updateUserStatus = async (userId: string, newStatus: boolean) => {
  const response = await axiosInstance.put(`/admin/updateUserStatus/${userId}`, { newStatus });
  return response.data;
};
// Get All trainers
export const getAllTrainer = async () => {
  const response = await axiosInstance.get("/admin/getAllTrainers");
  return response.data;
};

// Update trainer Status
export const updateTrainerStatus = async (trainerId: string, newStatus: boolean) => {
  const response = await axiosInstance.put(`/admin/updateTrainerStatus/${trainerId}`, { newStatus });
  return response.data;
};
//Get user ID
export const getUserById = async (id: string) => {
  const response = await axiosInstance.get(`/admin/getUser/${id}`);
  return response.data;
};
//Get trainer ID
export const getTrainerById = async (id: string) => {
  const response = await axiosInstance.get(`/admin/getTrainer/${id}`);
  return response.data;
};
// Add Specialization
export const addSpecialization = async (specializationData: { name: string; description: string }) => {
  const response = await axiosInstance.post("/admin/addSpecialization", specializationData);
  return response.data;
};
// Fetch All Specializations
export const getAllSpecializations = async () => {
  const response = await axiosInstance.get('/admin/getAllSpecializations');
  return response.data;
};

// Toggle Specialization Status
export const toggleSpecializationStatus = async (name: string, isBlock: boolean) => {
  const response = await axiosInstance.put(`/admin/toggleSpecializationStatus`, { name,isBlock });
  return response.data;
};
//Fetch applicants
export const fetchApplicants = async () => {
  try {
    const response = await axiosInstance.get(`/admin/fetchApplicants`);
    console.log("Response Data",response.data);
    
    return response.data;
  } catch (error) {
    console.error("Error fetching Trainer Applicants:", error);
    throw error;
  }
};
//Approve Trainer
export const approveTrainer = async (id: string) => {
  try {
      const response = await axiosInstance.put(`/admin/approveTrainer/${id}`);
      return response;
  } catch (error) {
      console.error("Error in approveTrainer API call:", error);
      throw error; 
  }
};
export const rejectTrainer = async (id: string,data:{reason:string}) => {
  try {
      const response = await axiosInstance.put(`/admin/rejectTrainer/${id}`,data);
      return response;
  } catch (error) {
      console.error("Error in rejectTrainer API call:", error);
      throw error; 
  }
};
