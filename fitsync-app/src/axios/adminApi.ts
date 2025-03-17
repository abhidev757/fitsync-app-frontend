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


