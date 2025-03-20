import { useState, useEffect, FormEvent } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { registerTrainer, trainerGoogleSignin, uploadCertificate } from "../../axios/trainerApi";
import { toast } from "react-toastify";
import axios from "axios";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";

function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [specializations, setSpecializations] = useState("");
  const [certificate, setCertificate] = useState<File | null>(null); // State for certificate file
  const [errors, setErrors] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (errors.length > 0) {
      const timer = setTimeout(() => setErrors([]), 4000);
      return () => clearTimeout(timer);
    }
  }, [errors]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error("Google authentication failed. No credentials received.");
      return;
    }

    setIsLoading(true);
    try {
      const data = await trainerGoogleSignin({
        credential: credentialResponse.credential,
      });

      localStorage.setItem("userId", data._id);
      toast.success("Google Sign In successful!");
      navigate(data.isGoogleLogin ? "/trainer/TrainerDashboard" : "/");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Google Login Error:", error);
        toast.error(error.response?.data?.message || "Google Sign In failed.");
      } else {
        console.error("Unexpected Error:", error);
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const [isUploading, setIsUploading] = useState(false);

const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setErrors([]);
  
  if (!certificate) {
    toast.error("Please upload a certificate.");
    return;
  }

  if (isUploading) return;
  setIsUploading(true);

  try {
    const response = await uploadCertificate(certificate);
    console.log("Upload response:", response);
    const certificateUrl = response.fileUrl;

    const data = await registerTrainer({
      name,
      email,
      password,
      specializations,
      certificateUrl,
    });

    localStorage.setItem("trainerId", data._id);
    localStorage.setItem("trainerEmailId", data.email);

    toast.success("Registration successful! Please verify your email.");
    navigate("/trainerOtpVerification");
  } catch (err) {
    console.error("Registration Error:", err);
    toast.error("An error occurred.");
  } finally {
    setIsUploading(false);
  }
};


  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="p-4">
        <span className="text-gray-400">Register</span>
      </div>

      <div className="flex-1 p-8 lg:p-16 flex flex-col">
        <div className="mb-6">
          <h1 className="text-xl font-bold flex items-center">
            <span className="text-white font-bold mr-1">FIT</span>
            <span className="text-gray-400">SYNC</span>
          </h1>
        </div>

        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-2">Register Here</h2>
          <p className="text-gray-400">
            We can assign tasks, set deadlines, and track progress effortlessly.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium">
                Name
              </label>
              <input
                id="name"
                type="text"
                required
                className="w-full p-3 rounded bg-gray-800 border border-gray-700"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value.trim())}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="specialization" className="block text-sm font-medium">
                Specialization
              </label>
              <input
                type="text"
                id="specialization"
                placeholder="Input your specialization here"
                value={specializations}
                onChange={(e) => setSpecializations(e.target.value.trim())}
                className="w-full p-3 rounded bg-gray-800 border border-gray-700"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                className="w-full p-3 rounded bg-gray-800 border border-gray-700"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full p-3 rounded bg-gray-800 border border-gray-700"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            {/* Certificate Upload Field */}
            <div className="space-y-2">
              <label htmlFor="certificate" className="block text-sm font-medium">
                Certificate
              </label>
              <input
                id="certificate"
                type="file"
                required
                accept=".pdf,.doc,.docx"
                className="w-full p-3 rounded bg-gray-800 border border-gray-700"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setCertificate(e.target.files[0]);
                  }
                }}
              />
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-black font-medium py-3 px-4 rounded transition duration-200"
              disabled={isLoading}
            >
              {isLoading ? "Signing up..." : "Sign up"}
            </button>

            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google Sign In was unsuccessful")}
            />
          </div>

          <div className="text-center pt-4">
            <p className="text-gray-400">
              Have an account?
              <Link to="/trainerSignin" className="ml-1 text-white hover:underline">
                Login Now
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignupPage;