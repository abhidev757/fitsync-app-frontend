import { useState, useEffect, FormEvent, useCallback } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import {
  registerTrainer,
  trainerGoogleSignin,
  uploadCertificate,
  uploadProfileImage,
  fetchTrainerSpecializations,
} from "../../axios/trainerApi";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { setTrainerCredentials } from "../../slices/trainerAuthSlice";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../../util/cropImage";
import { ShieldCheck, FileText, Camera, User, Mail, Lock, Activity, ChevronRight, X } from "lucide-react";

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
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [availableSpecializations, setAvailableSpecializations] = useState<string[]>([]);
  const [certificate, setCertificate] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string>("");
  const [croppedImage, setCroppedImage] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const loadSpecializations = async () => {
      try {
        const data = await fetchTrainerSpecializations();
        setAvailableSpecializations(data.map((s: { name?: string } | string) => typeof s === 'string' ? s : (s.name || '')));
      } catch (err) {
        console.error('Failed to fetch specializations:', err);
      }
    };
    loadSpecializations();
  }, []);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error("Security mismatch. No credentials received.");
      return;
    }
    if (!certificate) {
      toast.error("Protocol Error: Upload certification before Google verification.");
      return;
    }

    setIsLoading(true);
    try {
      const certificateResponse = await uploadCertificate(certificate);
      const data = await trainerGoogleSignin({
        credential: credentialResponse.credential,
        certificateUrl: certificateResponse.fileUrl,
      });

      dispatch(setTrainerCredentials(data));
      localStorage.setItem("trainerId", data._id);
      toast.success("Identity Verified: Google Access Granted");
      navigate(data.verificationStatus ? "/trainer/trainerDashboard" : "/verificationStatus");
    } catch {
      toast.error("Authentication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setProfileImageUrl(URL.createObjectURL(file));
      setCroppedImage(null); // Reset preview
    }
  };

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleCrop = async () => {
    if (!profileImageUrl || !croppedAreaPixels) return;
    try {
      const croppedImg = await getCroppedImg(profileImageUrl, croppedAreaPixels);
      setCroppedImage(croppedImg);
      toast.success("Image Calibrated");
    } catch {
      toast.error("Calibration error.");
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!certificate || !croppedImage) {
      toast.error("Required: Certification and Calibrated Profile Image.");
      return;
    }

    setIsLoading(true);

    try {
      const [certRes, profRes] = await Promise.all([
        uploadCertificate(certificate),
        uploadProfileImage(croppedImage)
      ]);

      const data = await registerTrainer({
        name,
        email,
        password,
        specializations,
        certificateUrl: certRes.fileUrl,
        profileImageUrl: profRes.fileUrl,
      });

      localStorage.setItem("trainerId", data._id);
      localStorage.setItem("trainerEmailId", data.email);
      toast.success("Dossier Created: Verify email to proceed.");
      navigate("/trainerOtpVerification");
    } catch {
      toast.error("System Error: Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans p-6 lg:p-12 overflow-x-hidden">
      <div className="max-w-6xl mx-auto">

        {/* Header Navigation */}
        <div className="flex justify-between items-center mb-16">
          <div className="flex flex-col">
            <span className="text-[#CCFF00] font-black text-[10px] tracking-[0.4em] uppercase mb-1">Personnel Integration</span>
            <h1 className="text-2xl font-black italic uppercase tracking-tighter">
              FIT<span className="text-[#CCFF00]">SYNC</span> FOR EXPERTS
            </h1>
          </div>
          <Link to="/trainerSignin" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-[#CCFF00] transition-colors border-b border-gray-900 pb-1">
            Already Registered? Login
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

          {/* Left Column: Context */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-[#0B0B0B] border border-gray-900 p-8 rounded-[2rem] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#CCFF00] opacity-5 blur-3xl"></div>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4 leading-none text-white">Join the Elite Roster.</h2>
              <p className="text-gray-500 text-sm leading-relaxed italic">
                "Deploy your expertise through our high-performance infrastructure. Track metrics, manage deployments, and scale your influence."
              </p>
            </div>

            <div className="space-y-4 px-4">
              {[
                { icon: <ShieldCheck size={16} />, text: "Credential Verification" },
                { icon: <Activity size={16} />, text: "Real-time Biometrics" },
                { icon: <FileText size={16} />, text: "Automated Billing" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-gray-700 font-bold uppercase text-[10px] tracking-widest">
                  <span className="text-[#CCFF00]">{item.icon}</span> {item.text}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="lg:col-span-8">
            <form onSubmit={handleSubmit} className="space-y-10 bg-[#0B0B0B] border border-gray-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative">

              {/* Profile Calibration Section */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-900 pb-4">
                  <Camera size={18} className="text-[#CCFF00]" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Visual Identification</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Profile Source</label>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="prof-input" />
                    <label htmlFor="prof-input" className="flex items-center justify-center gap-3 w-full py-4 bg-black border border-gray-800 rounded-xl cursor-pointer hover:border-[#CCFF00] transition-all group">
                      <Camera size={16} className="text-gray-600 group-hover:text-[#CCFF00]" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 group-hover:text-white">Upload Headshot</span>
                    </label>
                  </div>

                  {profileImageUrl && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                      <div className="relative h-64 w-full bg-black border border-gray-800 rounded-2xl overflow-hidden shadow-inner">
                        <Cropper image={profileImageUrl} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} />
                      </div>
                      <div className="flex items-center gap-4">
                        <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="flex-1 h-1 bg-gray-900 appearance-none accent-[#CCFF00] rounded-lg" />
                        <button type="button" onClick={handleCrop} className="px-6 py-2 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-lg hover:bg-[#CCFF00] transition-all">Calibrate</button>
                      </div>
                    </div>
                  )}

                  {croppedImage && (
                    <div className="md:col-span-2 bg-black border border-[#CCFF00]/20 p-4 rounded-2xl flex items-center gap-6 animate-in zoom-in-95">
                      <img src={URL.createObjectURL(croppedImage)} alt="Preview" className="w-20 h-20 rounded-xl object-cover grayscale border border-gray-800" />
                      <div>
                        <p className="text-[10px] font-black text-[#CCFF00] uppercase tracking-widest mb-1">Identity Locked</p>
                        <p className="text-xs text-gray-500 italic">Visual profile has been calibrated to system standards.</p>
                      </div>
                      <button type="button" onClick={() => setCroppedImage(null)} className="ml-auto p-2 text-gray-700 hover:text-red-500 transition-colors"><X size={16} /></button>
                    </div>
                  )}
                </div>
              </section>

              {/* Identity & Credentials */}
              <section className="space-y-8">
                <div className="flex items-center gap-3 border-b border-gray-900 pb-4">
                  <User size={18} className="text-[#CCFF00]" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Service Credentials</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#CCFF00] ml-1">Full Name</label>
                    <div className="flex items-center bg-black border border-gray-800 rounded-xl p-4 focus-within:border-[#CCFF00] transition-all">
                      <User size={16} className="text-gray-700 mr-3" />
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="bg-transparent w-full text-sm font-bold uppercase tracking-tight focus:outline-none placeholder-gray-800" placeholder="Agent Name" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#CCFF00] ml-1">Secure Email</label>
                    <div className="flex items-center bg-black border border-gray-800 rounded-xl p-4 focus-within:border-[#CCFF00] transition-all">
                      <Mail size={16} className="text-gray-700 mr-3" />
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-transparent w-full text-sm font-bold uppercase tracking-tight focus:outline-none placeholder-gray-800" placeholder="Contact Protocol" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#CCFF00] ml-1">Password</label>
                    <div className="flex items-center bg-black border border-gray-800 rounded-xl p-4 focus-within:border-[#CCFF00] transition-all relative">
                      <Lock size={16} className="text-gray-700 mr-3" />
                      <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-transparent w-full text-sm font-bold uppercase tracking-tight focus:outline-none placeholder-gray-800" placeholder="Secret Key" />
                      <button type="button" onClick={togglePasswordVisibility} className="text-gray-700 hover:text-white transition-colors">{showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}</button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#CCFF00] ml-1">Deployment Specialization</label>
                    <div className="flex items-center bg-black border border-gray-800 rounded-xl p-4 focus-within:border-[#CCFF00] transition-all">
                      <Activity size={16} className="text-gray-700 mr-3" />
                      <select onChange={(e) => { const v = e.target.value; if (v && !specializations.includes(v)) setSpecializations([...specializations, v]); }} className="bg-transparent w-full text-[10px] font-black uppercase tracking-widest focus:outline-none text-white">
                        <option value="">Select Domain</option>
                        {availableSpecializations.map((spec) => (
                          <option key={spec} value={spec} className="bg-black">{spec}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {specializations.map((spec) => (
                        <span key={spec} className="flex items-center gap-2 bg-[#CCFF00]/10 border border-[#CCFF00]/20 text-[#CCFF00] text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">
                          {spec} <button type="button" onClick={() => setSpecializations(specializations.filter((s) => s !== spec))}><X size={10} /></button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Certificate Section */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#CCFF00] ml-1">Expert Certification (PDF/DOC)</label>
                  <div className="bg-black border border-gray-800 rounded-xl p-6 flex flex-col items-center justify-center border-dashed group hover:border-[#CCFF00]/50 transition-all cursor-pointer relative">
                    <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => e.target.files && setCertificate(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <FileText size={24} className={`mb-3 ${certificate ? 'text-[#CCFF00]' : 'text-gray-700 group-hover:text-white'}`} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{certificate ? certificate.name : "Transmit Certification Files"}</p>
                  </div>
                </div>
              </section>

              {/* Action Footer */}
              <div className="pt-8 border-t border-gray-900">
                <div className="flex flex-col sm:flex-row gap-4">
                  <button type="submit" disabled={isLoading} className="flex-1 bg-[#CCFF00] text-black font-black uppercase text-xs tracking-[0.3em] py-5 rounded-2xl hover:shadow-[0_0_30px_rgba(204,255,0,0.4)] transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50">
                    {isLoading ? "Synchronizing Dossier..." : "Initialize Registry"} <ChevronRight size={18} />
                  </button>
                  <div className="flex-1">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      theme="filled_black"
                      shape="pill"
                      text="signup_with"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <p className="text-center mt-20 text-gray-800 text-[10px] font-black uppercase tracking-[0.5em]">
        End of Transmission // FITSYNC Registry 2026
      </p>
    </div>
  );
}

export default SignupPage;