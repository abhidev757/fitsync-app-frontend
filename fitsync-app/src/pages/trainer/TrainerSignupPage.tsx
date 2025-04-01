import { useState, useEffect, FormEvent, useCallback } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import {
  registerTrainer,
  trainerGoogleSignin,
  uploadCertificate,
  uploadProfileImage,
} from "../../axios/trainerApi";
import { toast } from "react-toastify";
import axios from "axios";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../../util/cropImage"; // Utility function to crop the image
interface Area {
  width: number;
  height: number;
  x: number;
  y: number;
}

function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [specializations, setSpecializations] = useState("");
  const [certificate, setCertificate] = useState<File | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string>("");
  const [croppedImage, setCroppedImage] = useState<File | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
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

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse
  ) => {
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setProfileImage(file);
      setProfileImageUrl(URL.createObjectURL(file));
    }
  };

  const onCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleCrop = async () => {
    if (!profileImageUrl || !croppedAreaPixels) return;

    try {
      const croppedImg = await getCroppedImg(
        profileImageUrl,
        croppedAreaPixels
      );
      setCroppedImage(croppedImg);
    } catch (error) {
      console.error("Failed to crop the image:", error);
      toast.error("Error cropping the image.");
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors([]);

    if (!certificate || !croppedImage) {
      toast.error("Please upload all required files.");
      return;
    }

    if (isUploading) return;
    setIsUploading(true);

    try {
      const certificateResponse = await uploadCertificate(certificate);
      const certificateUrl = certificateResponse.fileUrl;

      const profileResponse = await uploadProfileImage(croppedImage);
      const profileUrl = profileResponse.fileUrl;

      const data = await registerTrainer({
        name,
        email,
        password,
        specializations,
        certificateUrl,
        profileImageUrl: profileUrl,
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

        <form
          onSubmit={handleSubmit}
          className="space-y-6 max-w-4xl mx-auto w-full"
        >
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
              <label
                htmlFor="specialization"
                className="block text-sm font-medium"
              >
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

            <div className="space-y-2">
              <label
                htmlFor="certificate"
                className="block text-sm font-medium"
              >
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label
                htmlFor="profileImage"
                className="block text-sm font-medium"
              >
                Profile Picture
              </label>
              <input
                id="profileImage"
                type="file"
                accept="image/*"
                className="w-full p-3 rounded bg-gray-800 border border-gray-700"
                onChange={handleImageChange}
              />
              {profileImageUrl && (
  <div className="mt-4">
    {/* Flex container for side-by-side layout */}
    <div className="flex flex-row gap-4">
      {/* Cropping Container */}
      <div
        className="crop-container"
        style={{
          width: "300px",
          height: "300px",
          position: "relative",
        }}
      >
        <Cropper
          image={profileImageUrl}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </div>

      {/* Cropped Preview (smaller and aside the original image) */}
      {croppedImage && (
        <div className="flex flex-col items-center">
          <h3 className="text-sm font-medium mb-2">Cropped Preview:</h3>
          <img
            src={URL.createObjectURL(croppedImage)}
            alt="Cropped"
            className="border border-gray-500 rounded-md"
            style={{ width: "150px", height: "150px" }} // Adjust size here
          />
        </div>
      )}
    </div>

    {/* Crop Button (placed below the side-by-side layout) */}
    <button
      type="button"
      onClick={handleCrop}
      className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
    >
      Crop Image
    </button>
  </div>
)}
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
              <Link
                to="/trainerSignin"
                className="ml-1 text-white hover:underline"
              >
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
