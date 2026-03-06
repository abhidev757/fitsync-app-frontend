import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/user/ui/button";
import { Card, CardContent } from "../../components/user/ui/card";
import { fetchUserProfile, uploadUserProfilePicture } from "../../axios/userApi";
import Cropper, { Area } from "react-easy-crop";
import { User, Mail, Phone, Calendar, Ruler, Activity, Target, Weight, Camera, Edit3 } from "lucide-react";

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
          avatar: userData.profileImageUrl || "https://via.placeholder.com/150",
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
      } else {
        throw new Error(response.message || "Failed to update avatar");
      }
    } catch (err: unknown) {
      console.error("Error uploading image:", err);
    } finally {
      setIsCropModalOpen(false);
    }
  };

  if (loading) return <div className="p-8 text-[#CCFF00] font-black uppercase tracking-widest animate-pulse text-center mt-20">Synchronizing Profile...</div>;
  if (error) return <div className="p-8 text-red-500 font-bold text-center mt-20">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 font-sans text-white">
      <div className="flex justify-between items-end mb-10">
        <div>
          <p className="text-[#CCFF00] font-black text-xs tracking-widest uppercase mb-1">Personal Dossier</p>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">User Profile</h1>
        </div>
      </div>

      <Card className="bg-[#0B0B0B] border border-gray-900 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#CCFF00] opacity-5 blur-[100px] pointer-events-none"></div>

        <CardContent className="p-10">
          <div className="flex flex-col items-center mb-12 relative">
            <div className="relative group">
              <div className="absolute -inset-1 bg-[#CCFF00] rounded-full blur opacity-10 group-hover:opacity-30 transition-opacity"></div>
              <div className="h-40 w-40 rounded-full overflow-hidden border-2 border-gray-800 relative cursor-pointer" onClick={handleEditAvatar}>
                <img src={user.avatar} alt={user.fullName} className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-[#CCFF00] mb-1" size={24} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Update</span>
                </div>
              </div>
            </div>
            <div className="mt-6 text-center">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter">{user.fullName}</h2>
              <p className="text-[#CCFF00] text-[10px] font-black uppercase tracking-[0.3em] mt-1">Authorized Member</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Identity Info */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase text-gray-600 tracking-[0.4em] mb-4 ml-2">Identity Logs</h3>
              <div className="bg-black border border-gray-900 p-5 rounded-2xl flex items-center gap-4 group hover:border-[#CCFF00]/30 transition-all">
                <Mail className="text-gray-700 group-hover:text-[#CCFF00]" size={18} />
                <div>
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Contact Email</p>
                  <p className="text-sm font-bold text-white uppercase">{user.email}</p>
                </div>
              </div>
              <div className="bg-black border border-gray-900 p-5 rounded-2xl flex items-center gap-4 group hover:border-[#CCFF00]/30 transition-all">
                <Phone className="text-gray-700 group-hover:text-[#CCFF00]" size={18} />
                <div>
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Secure Line</p>
                  <p className="text-sm font-bold text-white uppercase">{user.phone}</p>
                </div>
              </div>
              <div className="bg-black border border-gray-900 p-5 rounded-2xl flex items-center gap-4 group hover:border-[#CCFF00]/30 transition-all">
                <Calendar className="text-gray-700 group-hover:text-[#CCFF00]" size={18} />
                <div>
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Age Cycle</p>
                  <p className="text-sm font-bold text-white uppercase">{user.age} Years</p>
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase text-gray-600 tracking-[0.4em] mb-4 ml-2">Bio-Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black border border-gray-900 p-5 rounded-2xl group hover:border-[#CCFF00]/30 transition-all">
                  <Ruler className="text-gray-700 group-hover:text-[#CCFF00] mb-2" size={18} />
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Height</p>
                  <p className="text-sm font-black italic uppercase text-white">{user.height} CM</p>
                </div>
                <div className="bg-black border border-gray-900 p-5 rounded-2xl group hover:border-[#CCFF00]/30 transition-all">
                  <Activity className="text-gray-700 group-hover:text-[#CCFF00] mb-2" size={18} />
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Sex</p>
                  <p className="text-sm font-black italic uppercase text-white">{user.sex}</p>
                </div>
                <div className="bg-black border border-gray-900 p-5 rounded-2xl group hover:border-[#CCFF00]/30 transition-all">
                  <Weight className="text-gray-700 group-hover:text-[#CCFF00] mb-2" size={18} />
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Current Mass</p>
                  <p className="text-sm font-black italic uppercase text-white">{user.currentWeight} KG</p>
                </div>
                <div className="bg-black border border-gray-900 p-5 rounded-2xl group hover:border-[#CCFF00]/30 transition-all">
                  <Target className="text-gray-700 group-hover:text-[#CCFF00] mb-2" size={18} />
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Target Mass</p>
                  <p className="text-sm font-black italic uppercase text-[#CCFF00]">{user.targetWeight} KG</p>
                </div>
              </div>
              <div className="bg-black border border-gray-900 p-5 rounded-2xl flex items-center justify-between group hover:border-[#CCFF00]/30 transition-all">
                <div className="flex items-center gap-4">
                  <Activity className="text-gray-700 group-hover:text-[#CCFF00]" size={18} />
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Activity Gradient</span>
                </div>
                <span className="text-sm font-black italic uppercase text-white">{user.activityLevel}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-gray-900">
            <Link to="/user/userProfileEdit">
              <button className="bg-[#CCFF00] text-black px-10 py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:shadow-[0_0_20px_rgba(204,255,0,0.3)] transition-all flex items-center gap-2 active:scale-95">
                Modify Data <Edit3 size={14} />
              </button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Crop Modal */}
      {isCropModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[100] p-6">
          <div className="bg-[#0B0B0B] border border-gray-800 rounded-[2.5rem] p-10 w-full max-w-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] relative">
            <button onClick={() => setIsCropModalOpen(false)} className="absolute top-8 right-8 text-gray-600 hover:text-white transition-colors">
              <User size={24} />
            </button>

            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-[#CCFF00] mb-2 text-center">Visual Alignment</h2>
            <p className="text-gray-500 text-center mb-10 text-[10px] font-black uppercase tracking-widest">Recalibrate profile imagery</p>

            {!imageSrc ? (
              <div className="flex flex-col items-center py-20 border-2 border-dashed border-gray-800 rounded-3xl mb-8">
                <Button className="bg-[#CCFF00] text-black font-black uppercase text-[10px] tracking-widest px-8 py-6 rounded-xl hover:bg-white transition-all" onClick={triggerFileSelectPopup}>
                  Select File
                </Button>
                <p className="mt-4 text-gray-700 text-[10px] font-bold uppercase">PNG, JPG, WEBP only</p>
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} style={{ display: "none" }} />
              </div>
            ) : (
              <div className="space-y-8">
                <div className="relative w-full h-[350px] bg-black border border-gray-900 rounded-3xl overflow-hidden shadow-inner">
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
                <div className="px-4">
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-3">Zoom Calibration</p>
                  <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full h-1 bg-gray-900 rounded-lg appearance-none cursor-pointer accent-[#CCFF00]" />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mt-10">
              <button onClick={() => setIsCropModalOpen(false)} className="py-5 bg-gray-900 hover:bg-gray-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-all">
                Cancel
              </button>
              {imageSrc && (
                <button onClick={handleUploadCroppedImage} className="py-5 bg-[#CCFF00] hover:shadow-[0_0_20px_rgba(204,255,0,0.3)] text-black rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                  Commit Sync
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