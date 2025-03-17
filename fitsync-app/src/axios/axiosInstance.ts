import axios from "axios";

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: "http://localhost:3001/api", 
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

      const token =
        userInfo ? JSON.parse(userInfo).token :
        trainerInfo ? JSON.parse(trainerInfo).token :
        null;

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

export default axiosInstance;
