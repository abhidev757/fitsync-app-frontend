import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/user/ui/button";
import { Card, CardContent } from "../../components/user/ui/card";
import { fetchUserProfile, uploadUserProfilePicture } from "../../axios/userApi";
import Cropper, { Area } from "react-easy-crop";
import { Mail, Phone, Calendar, Ruler, Activity, Target, Weight, Camera, Edit3, X } from "lucide-react";

const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: Area
): Promise<Blob | null> => {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => (image.onload = resolve));

  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d");

  if (!ctx) return null;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, "image/jpeg");
  });
};

const Profile = () => {
  const [user, setUser] = useState({
    fullName: "",
    email: "",
    phone: "",
    age: 0,
    height: "",
    sex: "",
    activityLevel: "",
    currentWeight: "",
    targetWeight: "",
    avatar: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("userId");
        if (!token) throw new Error("No token found. Please log in.");

        const userData = await fetchUserProfile(token);
        localStorage.setItem("profilePic", userData.profileImageUrl);

        setUser({
          fullName: userData.name || "N/A",
          email: userData.email || "N/A",
          phone: userData.phone || "N/A",
          age: userData.age || 0,
          height: userData.height || "N/A",
          sex: userData.sex || "N/A",
          activityLevel: userData.activity || "N/A",
          currentWeight: userData.weight || "N/A",
          targetWeight: userData.targetWeight || "N/A",
          avatar: userData.profileImageUrl || "/images/pro-pic.svg",
        });

        setLoading(false);
      } catch {
        setError("Failed to fetch user profile");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleEditAvatar = () => {
    setImageSrc("");
    setIsCropModalOpen(true);
  };

  const triggerFileSelectPopup = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result as string);
      });
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    }, []
  );

  const handleUploadCroppedImage = async () => {
    if (!croppedAreaPixels || !imageSrc) return;
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedBlob) throw new Error("Could not crop image");

      const file = new File([croppedBlob], "profile.jpg", { type: croppedBlob.type });
      const userId = localStorage.getItem("userId");
      if (!userId) throw new Error("No token found. Please log in.");

      const response = await uploadUserProfilePicture(file, userId);
      if (response.success) {
        setUser((prev) => ({ ...prev, avatar: response.avatarUrl }));
        localStorage.setItem("profilePic", response.avatarUrl);
      } else {
        throw new Error(response.message || "Failed to update avatar");
      }
    } catch (err: unknown) {
      console.error("Error uploading image:", err);
    } finally {
      setIsCropModalOpen(false);
    }
  };

  if (loading) return <div className="p-8 text-[#CCFF00] font-black uppercase tracking-widest animate-pulse text-center h-screen flex items-center justify-center bg-black">Synchronizing Dossier...</div>;
  if (error) return <div className="p-8 text-red-500 font-bold text-center h-screen flex items-center justify-center bg-black uppercase tracking-widest">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 font-sans text-white pb-24 md:pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 gap-2">
        <div>
          <p className="text-[#CCFF00] font-black text-[10px] tracking-[0.4em] uppercase mb-1">Personal Dossier</p>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">User Profile</h1>
        </div>
      </div>

      <Card className="bg-[#0B0B0B] border border-gray-900 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#CCFF00] opacity-5 blur-[100px] pointer-events-none"></div>

        <CardContent className="p-6 md:p-12">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-10 md:mb-16 relative">
            <div className="relative group">
              <div className="absolute -inset-1.5 bg-[#CCFF00] rounded-full blur opacity-10 group-hover:opacity-30 transition-opacity"></div>
              <div className="h-32 w-32 md:h-44 md:w-44 rounded-full overflow-hidden border-2 border-gray-800 relative cursor-pointer" onClick={handleEditAvatar}>
                <img src={user.avatar} alt={user.fullName} className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-[#CCFF00] mb-1" size={24} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Update</span>
                </div>
              </div>
            </div>
            <div className="mt-6 text-center">
              <h2 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter">{user.fullName}</h2>
              <div className="flex items-center justify-center gap-2 mt-1">
                <div className="w-1.5 h-1.5 bg-[#CCFF00] rounded-full animate-pulse"></div>
                <p className="text-[#CCFF00] text-[9px] font-black uppercase tracking-[0.3em]">Authorized Member</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-10">
            {/* Identity Info */}
            <div className="space-y-4 md:space-y-6">
              <h3 className="text-[10px] font-black uppercase text-gray-600 tracking-[0.4em] mb-2 ml-1">Identity Logs</h3>
              <div className="bg-black border border-gray-900 p-4 md:p-5 rounded-2xl flex items-center gap-4 group hover:border-[#CCFF00]/30 transition-all">
                <Mail className="text-gray-700 group-hover:text-[#CCFF00] shrink-0" size={18} />
                <div className="overflow-hidden">
                  <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Contact Signal</p>
                  <p className="text-sm font-black text-white uppercase truncate">{user.email}</p>
                </div>
              </div>
              <div className="bg-black border border-gray-900 p-4 md:p-5 rounded-2xl flex items-center gap-4 group hover:border-[#CCFF00]/30 transition-all">
                <Phone className="text-gray-700 group-hover:text-[#CCFF00] shrink-0" size={18} />
                <div className="overflow-hidden">
                  <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Secure Line</p>
                  <p className="text-sm font-black text-white uppercase">{user.phone}</p>
                </div>
              </div>
              <div className="bg-black border border-gray-900 p-4 md:p-5 rounded-2xl flex items-center gap-4 group hover:border-[#CCFF00]/30 transition-all">
                <Calendar className="text-gray-700 group-hover:text-[#CCFF00] shrink-0" size={18} />
                <div>
                  <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Age Cycle</p>
                  <p className="text-sm font-black text-white uppercase">{user.age} <span className="text-[10px] text-gray-600 italic">Years</span></p>
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="space-y-4 md:space-y-6">
              <h3 className="text-[10px] font-black uppercase text-gray-600 tracking-[0.4em] mb-2 ml-1">Bio-Metrics</h3>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="bg-black border border-gray-900 p-4 md:p-5 rounded-2xl group hover:border-[#CCFF00]/30 transition-all">
                  <Ruler className="text-gray-700 group-hover:text-[#CCFF00] mb-3" size={16} />
                  <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Height</p>
                  <p className="text-sm font-black italic uppercase text-white">{user.height} <span className="text-[9px] not-italic">CM</span></p>
                </div>
                <div className="bg-black border border-gray-900 p-4 md:p-5 rounded-2xl group hover:border-[#CCFF00]/30 transition-all">
                  <Activity className="text-gray-700 group-hover:text-[#CCFF00] mb-3" size={16} />
                  <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Sex</p>
                  <p className="text-sm font-black italic uppercase text-white">{user.sex}</p>
                </div>
                <div className="bg-black border border-gray-900 p-4 md:p-5 rounded-2xl group hover:border-[#CCFF00]/30 transition-all">
                  <Weight className="text-gray-700 group-hover:text-[#CCFF00] mb-3" size={16} />
                  <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Current</p>
                  <p className="text-sm font-black italic uppercase text-white">{user.currentWeight} <span className="text-[9px] not-italic">KG</span></p>
                </div>
                <div className="bg-black border border-gray-900 p-4 md:p-5 rounded-2xl group hover:border-[#CCFF00]/30 transition-all border-l-2 border-l-[#CCFF00]/20">
                  <Target className="text-[#CCFF00] mb-3" size={16} />
                  <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Target</p>
                  <p className="text-sm font-black italic uppercase text-[#CCFF00]">{user.targetWeight} <span className="text-[9px] not-italic text-gray-600">KG</span></p>
                </div>
              </div>
              <div className="bg-black border border-gray-900 p-4 md:p-5 rounded-2xl flex items-center justify-between group hover:border-[#CCFF00]/30 transition-all">
                <div className="flex items-center gap-3">
                  <Activity className="text-gray-700 group-hover:text-[#CCFF00]" size={18} />
                  <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Activity Gradient</span>
                </div>
                <span className="text-xs md:text-sm font-black italic uppercase text-white">{user.activityLevel}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center md:justify-end pt-8 border-t border-gray-900/50">
            <Link to="/user/userProfileEdit" className="w-full md:w-auto">
              <button className="w-full md:w-auto bg-[#CCFF00] text-black px-12 py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:shadow-[0_0_30px_rgba(204,255,0,0.4)] transition-all flex items-center justify-center gap-2 active:scale-95">
                Modify Data <Edit3 size={14} />
              </button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Crop Modal - Optimized for Mobile Viewports */}
      {isCropModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-end md:items-center justify-center z-[100] p-4 md:p-6">
          <div className="bg-[#0B0B0B] border border-gray-800 rounded-[2.5rem] p-6 md:p-10 w-full max-w-xl shadow-2xl relative mb-4 md:mb-0 animate-in slide-in-from-bottom-10 duration-500">
            <button 
              onClick={() => setIsCropModalOpen(false)} 
              className="absolute top-6 right-6 p-2 bg-gray-900 rounded-full text-gray-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-[#CCFF00] leading-none mb-2">Visual Alignment</h2>
              <p className="text-gray-600 text-[9px] font-black uppercase tracking-[0.3em] italic">Recalibrate Personnel Imagery</p>
            </div>

            {!imageSrc ? (
              <div className="flex flex-col items-center py-16 md:py-24 border-2 border-dashed border-gray-800 rounded-3xl mb-8 group hover:border-[#CCFF00]/40 transition-colors">
                <Button 
                  className="bg-[#CCFF00] text-black font-black uppercase text-[10px] tracking-widest px-10 py-6 rounded-xl hover:shadow-[0_0_20px_rgba(204,255,0,0.2)] transition-all" 
                  onClick={triggerFileSelectPopup}
                >
                  Access File System
                </Button>
                <p className="mt-4 text-gray-700 text-[9px] font-black uppercase tracking-widest italic">PNG // JPG // WEBP Supported</p>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              </div>
            ) : (
              <div className="space-y-8">
                <div className="relative w-full h-[300px] md:h-[380px] bg-black border border-gray-900 rounded-3xl overflow-hidden">
                  <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                  />
                </div>
                <div className="px-2">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest italic">Zoom Calibration</p>
                    <span className="text-[10px] font-black text-[#CCFF00] italic">{zoom.toFixed(1)}x</span>
                  </div>
                  <input 
                    type="range" 
                    min={1} 
                    max={3} 
                    step={0.1} 
                    value={zoom} 
                    onChange={(e) => setZoom(Number(e.target.value))} 
                    className="w-full h-1.5 bg-gray-900 rounded-lg appearance-none cursor-pointer accent-[#CCFF00]" 
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mt-10">
              <button 
                onClick={() => setIsCropModalOpen(false)} 
                className="w-full py-4 bg-gray-950 border border-gray-900 hover:border-red-500/50 hover:text-red-500 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 transition-all order-2 sm:order-1"
              >
                Abort Sync
              </button>
              {imageSrc && (
                <button 
                  onClick={handleUploadCroppedImage} 
                  className="w-full py-4 bg-[#CCFF00] text-black rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(204,255,0,0.3)] transition-all active:scale-95 order-1 sm:order-2"
                >
                  Commit Data
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;