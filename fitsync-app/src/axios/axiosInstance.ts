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
