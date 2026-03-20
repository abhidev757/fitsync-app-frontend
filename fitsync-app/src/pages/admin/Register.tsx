import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { registerAdmin } from "../../axios/adminApi";
import { AdminLoginData } from "../../types/admin.types";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<AdminLoginData & { confirmPassword: string }>({
    email: "",
    password: "",
    confirmPassword: "",
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

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      await registerAdmin({ email: formData.email, password: formData.password });
      toast.success("Admin registered successfully!");
      navigate("/adminLogin");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Registration failed");
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
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 tracking-tight uppercase">
            ADMIN REGISTER
          </h2>
          <p className="text-center text-gray-600 text-xs uppercase tracking-widest mb-8">
            Create a new admin account
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-500"
              >
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
              <label
                htmlFor="password"
                className="block text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-500"
              >
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

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="block text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-500"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full p-4 rounded-xl bg-gray-900 border border-gray-800 focus:outline-none focus:border-gray-500 transition-all text-sm font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-white text-black font-black py-4 px-4 rounded-xl uppercase text-xs tracking-[0.2em] hover:bg-gray-200 transition-all active:scale-[0.98] disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed mt-4"
              disabled={isLoading}
            >
              {isLoading ? "Registering..." : "Create Admin"}
            </button>
          </form>

          {/* Back to Login */}
          <p className="mt-6 text-center text-xs text-gray-600">
            Already have an account?{" "}
            <Link
              to="/adminLogin"
              className="text-gray-300 font-bold hover:text-white transition-colors uppercase tracking-widest"
            >
              Login
            </Link>
          </p>

          {/* Footer Decoration */}
          <p className="mt-8 text-center text-[8px] font-black text-gray-700 uppercase tracking-[0.4em]">
            Secure Admin Terminal // 2026
          </p>
        </div>
      </main>
    </div>
  );
}

export default Register;
