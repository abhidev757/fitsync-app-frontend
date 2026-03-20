import { useEffect, useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { loginAdmin } from "../../axios/adminApi"; 
import { AdminLoginData } from "../../types/admin.types";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
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
      navigate("/admin/adminDashboard");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Login failed");
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="p-6 md:p-8">
        <h1 className="text-xl font-bold flex items-center justify-center md:justify-start">
          <span className="text-white font-bold mr-1">FIT</span>
          <span className="text-gray-400">SYNC</span>
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm sm:max-w-md">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 tracking-tight uppercase">
            ADMIN LOGIN
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-500">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="admin@gmail.com"
                className="w-full p-4 rounded-xl bg-gray-900 border border-gray-800 focus:outline-none focus:border-gray-500 transition-all text-sm font-medium"
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-500">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full p-4 rounded-xl bg-gray-900 border border-gray-800 focus:outline-none focus:border-gray-500 transition-all text-sm font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-white text-black font-black py-4 px-4 rounded-xl uppercase text-xs tracking-[0.2em] hover:bg-gray-200 transition-all active:scale-[0.98] disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed mt-4"
              disabled={isLoading}
            >
              {isLoading ? "Validating..." : "Execute Login"}
            </button>

            <Link
              to="/adminRegister"
              className="block w-full text-center border border-gray-600 text-gray-300 font-medium py-3 px-4 rounded hover:border-gray-400 hover:text-white transition duration-200"
            >
              REGISTER
            </Link>
          </form>

          {/* Footer Decoration */}
          <p className="mt-12 text-center text-[8px] font-black text-gray-700 uppercase tracking-[0.4em]">
            Secure Admin Terminal // 2026
          </p>
        </div>
      </main>
    </div>
  );
}

export default Login;