import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/user/ui/button";
import { Card, CardContent } from "../../components/user/ui/card";
import { fetchUserProfile } from "../../axios/userApi"; 

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("userId"); 
        if (!token) {
          throw new Error("No token found. Please log in.");
        }

        const userData = await fetchUserProfile(token); 
        console.log("userData:",userData);
        

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
          avatar: userData.avatar || "https://via.placeholder.com/150",
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
          <div className="flex flex-col items-center mb-8">
            <div className="h-32 w-32 rounded-full overflow-hidden mb-4">
              <img
                src={user.avatar}
                alt={user.fullName}
                className="h-full w-full object-cover"
              />
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
    </div>
  );
};

export default Profile;