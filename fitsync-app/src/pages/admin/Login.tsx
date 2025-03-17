import { useEffect, useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { loginAdmin } from "../../axios/adminApi"; 
import { AdminLoginData } from "../../types/admin.types";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../../store";
import { useDispatch, useSelector } from "react-redux";
import { setAdminCredentials } from "../../slices/adminAuthSlice";

function Login() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { adminInfo } = useSelector((state: RootState) => state.adminAuth);

  useEffect(() => {
    if (adminInfo) {
      navigate('/admin/adminDashboard');
    }
  }, [navigate, adminInfo]);


  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<AdminLoginData>({
    email: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await loginAdmin(formData);
      dispatch(setAdminCredentials({ ...response }));
      toast.success("Login successful!");
      console.log("Login success:", response);
      navigate("/admin/adminDashboard");
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Login failed:", error.message);
        toast.error(error.message || "Login failed");
      } else {
        console.error("Unexpected error:", error);
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="p-6">
        <h1 className="text-xl font-bold flex items-center">
          <span className="text-white font-bold mr-1">FIT</span>
          <span className="text-gray-400">SYNC</span>
        </h1>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="w-full max-w-md px-6">
          <h2 className="text-2xl font-semibold text-center mb-8">LOGIN</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="w-full p-3 rounded bg-gray-800/50 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="w-full p-3 rounded bg-gray-800/50 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gray-200 text-black font-medium py-3 px-4 rounded hover:bg-gray-300 transition duration-200 disabled:bg-gray-500"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "LOGIN"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
