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
import { Save, User, Target } from "lucide-react";

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
      if (!userId) return;
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

  if (!userId) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userData = { name: formData.fullName, phone: formData.phone };
      const fitnessData = {
        sex: formData.sex as "Male" | "Female" | null,
        age: parseInt(formData.age, 10),
        height: parseFloat(formData.height),
        weight: parseFloat(formData.currentWeight),
        targetWeight: parseFloat(formData.targetWeight),
        activity: formData.activityLevel as "Little or No Activity" | "Lightly Active" | "Moderately Active" | "Very Active",
      };
      await profileEdit({ userData, fitnessData }, userId);
      navigate("/user/userProfile");
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 font-sans text-white">
      <div className="mb-10">
        <p className="text-[#CCFF00] font-black text-xs tracking-widest uppercase mb-1">Account Configuration</p>
        <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">Modify Profile</h1>
      </div>

      <Card className="bg-[#0B0B0B] border border-gray-900 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#CCFF00] opacity-5 blur-[100px] pointer-events-none"></div>

        <CardContent className="p-10">
          <form onSubmit={handleSubmit} className="space-y-12">

            {/* Identity Group */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4 border-b border-gray-900 pb-2">
                <User size={16} className="text-[#CCFF00]" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Identity Logs</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label htmlFor="fullName" className="block text-[10px] font-black uppercase tracking-widest text-[#CCFF00] ml-1">Full Name</label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="bg-black border border-gray-800 rounded-xl p-6 text-white focus:border-[#CCFF00] transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-widest text-gray-600 ml-1 italic">Email (Locked)</label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    readOnly
                    className="bg-black border border-gray-900 rounded-xl p-6 text-gray-600 opacity-50 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-[10px] font-black uppercase tracking-widest text-[#CCFF00] ml-1">Secure Line (Phone)</label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="bg-black border border-gray-800 rounded-xl p-6 text-white focus:border-[#CCFF00] transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="age" className="block text-[10px] font-black uppercase tracking-widest text-[#CCFF00] ml-1">Age Cycle</label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleChange}
                    className="bg-black border border-gray-800 rounded-xl p-6 text-white focus:border-[#CCFF00] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Bio-Metrics Group */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4 border-b border-gray-900 pb-2">
                <Target size={16} className="text-[#CCFF00]" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Bio-Metric Calibration</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label htmlFor="sex" className="block text-[10px] font-black uppercase tracking-widest text-[#CCFF00] ml-1">Genetic Sex</label>
                  <Select
                    value={formData.sex}
                    onValueChange={(value) => handleSelectChange("sex", value)}
                  >
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="activityLevel" className="block text-[10px] font-black uppercase tracking-widest text-[#CCFF00] ml-1">Activity Gradient</label>
                  <Select
                    value={formData.activityLevel}
                    onValueChange={(value) => handleSelectChange("activityLevel", value)}
                  >
                    <SelectItem value="Little or No Activity">Little or No Activity</SelectItem>
                    <SelectItem value="Lightly Active">Lightly Active</SelectItem>
                    <SelectItem value="Moderately Active">Moderately Active</SelectItem>
                    <SelectItem value="Very Active">Very Active</SelectItem>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="height" className="block text-[10px] font-black uppercase tracking-widest text-[#CCFF00] ml-1">Height (cm)</label>
                    <Input
                      id="height"
                      name="height"
                      type="number"
                      value={formData.height}
                      onChange={handleChange}
                      className="bg-black border border-gray-800 rounded-xl p-6 text-white focus:border-[#CCFF00] transition-all italic"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="currentWeight" className="block text-[10px] font-black uppercase tracking-widest text-[#CCFF00] ml-1">Mass (kg)</label>
                    <Input
                      id="currentWeight"
                      name="currentWeight"
                      value={formData.currentWeight}
                      onChange={handleChange}
                      className="bg-black border border-gray-800 rounded-xl p-6 text-white focus:border-[#CCFF00] transition-all italic"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="targetWeight" className="block text-[10px] font-black uppercase tracking-widest text-[#CCFF00] ml-1">Objective Mass (Target kg)</label>
                  <Input
                    id="targetWeight"
                    name="targetWeight"
                    value={formData.targetWeight}
                    onChange={handleChange}
                    className="bg-black border border-[#CCFF00]/40 rounded-xl p-6 text-[#CCFF00] focus:border-[#CCFF00] transition-all font-black italic shadow-[0_0_15px_rgba(204,255,0,0.05)]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-8 border-t border-gray-900">
              <Button
                type="submit"
                className="bg-[#CCFF00] text-black font-black uppercase text-xs tracking-[0.3em] px-16 py-8 rounded-2xl hover:shadow-[0_0_30px_rgba(204,255,0,0.4)] transition-all flex items-center gap-3 active:scale-95"
              >
                Commit Changes <Save size={18} />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProfile;