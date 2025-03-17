"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { profileEdit, fetchUserProfile } from "../../axios/userApi"; 
import { Button } from "../../components/user/ui/button";
import { Card, CardContent } from "../../components/user/ui/card";
import { Input } from "../../components/user/ui/input";
import { Select, SelectItem } from "../../components/user/ui/select";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

const EditProfile = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state: RootState) => state.auth);
  const userId = userInfo?._id;

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    age: "",
    sex: "",
    activityLevel: "",
    currentWeight: "",
    targetWeight: "",
    height: "",
  });

  
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!userId) {
        console.error("User ID is not available. Please log in.");
        return;
      }

      try {
        const profile = await fetchUserProfile(userId);
        if (profile) {
          setFormData({
            fullName: profile.name || "",
            email: profile.email || "",
            phone: profile.phone || "",
            age: profile.age?.toString() || "",
            sex: profile.sex || "",
            activityLevel: profile.activity || "",
            currentWeight: profile.weight?.toString() || "",
            targetWeight: profile.targetWeight?.toString() || "",
            height: profile.height?.toString() || "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };

    fetchProfileData();
  }, [userId]);

  if (!userId) {
    console.error("User ID is not available. Please log in.");
    return null; 
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      
      const userData = {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
      };

      const fitnessData = {
        sex: formData.sex as "Male" | "Female" | null, 
        age: parseInt(formData.age, 10), 
        height: parseFloat(formData.height),
        weight: parseFloat(formData.currentWeight), 
        targetWeight: parseFloat(formData.targetWeight), 
        activity: formData.activityLevel as
          | "Little or No Activity"
          | "Lightly Active"
          | "Moderately Active"
          | "Very Active", 
      };
      
      const response = await profileEdit({ userData, fitnessData }, userId);
      
      console.log("Profile updated successfully:", response);
      
      navigate("/user/userProfile");
    } catch (error) {
     
      console.error("Failed to update profile:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Update User Details</h1>

      <Card className="bg-[#1a1a1a] border-none">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Full Name */}
              <div className="space-y-2">
                <label
                  htmlFor="fullName"
                  className="block text-[#d9ff00] font-medium"
                >
                  Full Name
                </label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="bg-[#2a2a2a] border-none"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-[#d9ff00] font-medium"
                >
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-[#2a2a2a] border-none"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label
                  htmlFor="phone"
                  className="block text-[#d9ff00] font-medium"
                >
                  Phone Number
                </label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="bg-[#2a2a2a] border-none"
                />
              </div>

              {/* Activity Level */}
              <div className="space-y-2">
                <label
                  htmlFor="activityLevel"
                  className="block text-[#d9ff00] font-medium"
                >
                  Activity Level
                </label>
                <Select
                  value={formData.activityLevel}
                  onValueChange={(value) =>
                    handleSelectChange("activityLevel", value)
                  }
                  placeholder="Select activity level"
                >
                  <SelectItem value="Little or No Activity">
                    Little or No Activity
                  </SelectItem>
                  <SelectItem value="Light Activity">Light Activity</SelectItem>
                  <SelectItem value="Moderate Activity">
                    Moderate Activity
                  </SelectItem>
                  <SelectItem value="High Activity">High Activity</SelectItem>
                  <SelectItem value="Very High Activity">
                    Very High Activity
                  </SelectItem>
                </Select>
              </div>

              {/* Age */}
              <div className="space-y-2">
                <label
                  htmlFor="age"
                  className="block text-[#d9ff00] font-medium"
                >
                  Age
                </label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                  className="bg-[#2a2a2a] border-none"
                />
              </div>

              {/* Sex */}
              <div className="space-y-2">
                <label
                  htmlFor="sex"
                  className="block text-[#d9ff00] font-medium"
                >
                  Sex
                </label>
                <Select
                  value={formData.sex}
                  onValueChange={(value) => handleSelectChange("sex", value)}
                  placeholder="Select sex"
                >
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </Select>
              </div>

              {/* Current Weight */}
              <div className="space-y-2">
                <label
                  htmlFor="currentWeight"
                  className="block text-[#d9ff00] font-medium"
                >
                  Current Weight
                </label>
                <Input
                  id="currentWeight"
                  name="currentWeight"
                  value={formData.currentWeight}
                  onChange={handleChange}
                  className="bg-[#2a2a2a] border-none"
                />
              </div>

              {/* Target Weight */}
              <div className="space-y-2">
                <label
                  htmlFor="targetWeight"
                  className="block text-[#d9ff00] font-medium"
                >
                  Target Weight
                </label>
                <Input
                  id="targetWeight"
                  name="targetWeight"
                  value={formData.targetWeight}
                  onChange={handleChange}
                  className="bg-[#2a2a2a] border-none"
                />
              </div>

              {/* Height */}
              <div className="space-y-2">
                <label
                  htmlFor="height"
                  className="block text-[#d9ff00] font-medium"
                >
                  Height (cm)
                </label>
                <Input
                  id="height"
                  name="height"
                  type="number"
                  value={formData.height}
                  onChange={handleChange}
                  className="bg-[#2a2a2a] border-none"
                />
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                type="submit"
                className="bg-[#d9ff00] text-black hover:bg-[#d9ff00]/90 px-8"
              >
                Update Details
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProfile;
