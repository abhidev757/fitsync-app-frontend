import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : "http://localhost:4000/api";

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: BASE_URL, 
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, 
});


axiosInstance.interceptors.request.use(
  (config) => {
    try {
      const userInfo = localStorage.getItem("userInfo");
      const trainerInfo = localStorage.getItem("trainerInfo");

      const isTrainerRoute = config.url?.startsWith('/trainer') || config.url?.startsWith('/chat');
      
      let token = null;
      if (isTrainerRoute && trainerInfo) {
        token = JSON.parse(trainerInfo).token;
      } else if (!isTrainerRoute && userInfo) {
        token = JSON.parse(userInfo).token;
      } else if (trainerInfo) {
         token = JSON.parse(trainerInfo).token;
      } else if (userInfo) {
         token = JSON.parse(userInfo).token;
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error retrieving token:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403) {
      const message = error.response.data.message;
      console.log("403 error message from backend:", message);
      if (message === "You have been blocked by the admin.") {
        localStorage.removeItem("userInfo");
        localStorage.removeItem("trainerInfo");
        window.location.href = "/blocked";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
