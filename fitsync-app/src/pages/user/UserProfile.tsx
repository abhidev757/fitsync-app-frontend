import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/user/ui/button";
import { Card, CardContent } from "../../components/user/ui/card";
import { fetchUserProfile, uploadUserProfilePicture } from "../../axios/userApi";
import Cropper, { Area } from "react-easy-crop";

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

  if (!ctx) {
    return null;
  }

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

  // Crop modal related state
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>(""); // Data URL of uploaded image
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("userId");
        if (!token) {
          throw new Error("No token found. Please log in.");
        }

        const userData = await fetchUserProfile(token);
        localStorage.setItem("profilePic", userData.profileImageUrl);
        console.log("userData:", userData);

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
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setError("Failed to fetch user profile");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEditAvatar = () => {
    // Open crop modal and reset imageSrc so user can choose a new file
    setImageSrc("");
    setIsCropModalOpen(true);
  };

  // Trigger file input click
  const triggerFileSelectPopup = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // When a file is selected, read it as Data URL for cropping
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
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleUploadCroppedImage = async () => {
    if (!croppedAreaPixels || !imageSrc) return;
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedBlob) {
        throw new Error("Could not crop image");
      }
  
      // Convert Blob to File so that our API function accepts it
      const file = new File([croppedBlob], "profile.jpg", { type: croppedBlob.type });
  
      const userId = localStorage.getItem("userId");
      if (!userId) throw new Error("No token found. Please log in.");
  
      // Call the API helper function to upload the profile image
      const response = await uploadUserProfilePicture(file,userId);
  
      if (response.success) {
        // Update the state with new avatar URL or do other processing
        setUser((prev) => ({ ...prev, avatar: response.avatarUrl }));
      } else {
        throw new Error(response.message || "Failed to update avatar");
      }
    } catch (err: unknown ) {
      console.error("Error uploading cropped image:", err);
    } finally {
      setIsCropModalOpen(false);
    }
  };
  

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">User Details</h1>

      <Card className="bg-[#1a1a1a] border-none">
        <CardContent className="p-8">
          <div className="flex flex-col items-center mb-8 relative">
            <div className="h-32 w-32 rounded-full overflow-hidden mb-4 relative group">
              <img
                src={user.avatar}
                alt={user.fullName}
                className="h-full w-full object-cover"
              />
              <div
                className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={handleEditAvatar}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l3 3L21 7l-3-3-9 7z" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-[#d9ff00]">User Details</h2>
          </div>

          <div className="bg-[#222222] rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
              <div className="flex items-center">
                <span className="text-[#d9ff00] font-medium w-36">Full Name :</span>
                <span>{user.fullName}</span>
              </div>
              <div className="flex items-center">
                <span className="text-[#d9ff00] font-medium w-36">Age :</span>
                <span>{user.age}</span>
              </div>
              <div className="flex items-center">
                <span className="text-[#d9ff00] font-medium w-36">Email :</span>
                <span>{user.email}</span>
              </div>
              <div className="flex items-center">
                <span className="text-[#d9ff00] font-medium w-36">Height :</span>
                <span>{user.height}</span>
              </div>
              <div className="flex items-center">
                <span className="text-[#d9ff00] font-medium w-36">Phone Number :</span>
                <span>{user.phone}</span>
              </div>
              <div className="flex items-center">
                <span className="text-[#d9ff00] font-medium w-36">Sex :</span>
                <span>{user.sex}</span>
              </div>
              <div className="flex items-center">
                <span className="text-[#d9ff00] font-medium w-36">Activity level :</span>
                <span>{user.activityLevel}</span>
              </div>
              <div className="flex items-center">
                <span className="text-[#d9ff00] font-medium w-36">Current weight :</span>
                <span>{user.currentWeight}</span>
              </div>
              <div className="flex items-center">
                <span className="text-[#d9ff00] font-medium w-36">Target weight :</span>
                <span>{user.targetWeight}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button className="bg-[#d9ff00] text-black hover:bg-[#d9ff00]/90">
              <Link to="/user/userProfileEdit">Edit Details</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Crop Modal */}
      {isCropModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] p-4 rounded-lg max-w-lg w-full relative">
            <h2 className="text-xl font-bold text-white mb-4 text-center">
              Crop and Upload Image
            </h2>

            {/* File input for image upload */}
            {!imageSrc && (
              <div className="flex flex-col items-center mb-4">
                <Button
                  className="bg-[#d9ff00] text-black hover:bg-[#c8e600]"
                  onClick={triggerFileSelectPopup}
                >
                  Choose Image
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </div>
            )}

            {/* Display Cropper only when imageSrc is available */}
            {imageSrc && (
              <>
                <div className="relative w-full h-80 bg-gray-700">
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
                <div className="mt-4">
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </>
            )}

            <div className="flex justify-end mt-4 space-x-2">
              <Button
                className="bg-gray-500 text-white hover:bg-gray-600"
                onClick={() => setIsCropModalOpen(false)}
              >
                Cancel
              </Button>
              {imageSrc && (
                <Button
                  className="bg-[#d9ff00] text-black hover:bg-[#c8e600]"
                  onClick={handleUploadCroppedImage}
                >
                  Upload
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
