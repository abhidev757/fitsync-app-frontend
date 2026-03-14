"use client";

import { Camera, User, Mail, Phone, Award, Activity, Save, ShieldCheck } from "lucide-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useEffect, useRef, useState } from "react";
import {
  fetchTrainerProfile,
  updateTrainerProfile,
  uploadAndSaveProfileImage,
  fetchTrainerSpecializations,
  getTrainerPerformanceStats,
} from "../../axios/trainerApi";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Specialization {
  _id: string;
  name: string;
}

const TrainerProfile = () => {
  const { trainerInfo } = useSelector((state: RootState) => state.trainerAuth);
  const trainerId = trainerInfo?._id;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    yearsOfExperience: 0,
    sex: null as "Male" | "Female" | null | undefined,
    specialization: "",
    phone: "",
    email: "",
    bio: "",
  });

  const [avatarUrl, setAvatarUrl] = useState("");
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [perfLabels, setPerfLabels] = useState<string[]>([]);
  const [perfData, setPerfData] = useState<number[]>([]);

  useEffect(() => {
    if (!trainerId) return;

    const load = async () => {
      try {
        const [profile, specs, perf] = await Promise.all([
          fetchTrainerProfile(trainerId),
          fetchTrainerSpecializations(),
          getTrainerPerformanceStats(),
        ]);

        if (profile) {
          setFormData({
            name: profile.name || "",
            yearsOfExperience: profile.yearsOfExperience || 0,
            sex: profile.sex || null,
            specialization: profile.specializations?.[0] || profile.specialization || "",
            phone: profile.phone || "",
            email: profile.email || "",
            bio: profile.bio || "",
          });
          setAvatarUrl(profile.profileImageUrl || "");
        }

        if (Array.isArray(specs)) setSpecializations(specs);
        if (perf) {
          setPerfLabels(perf.labels);
          setPerfData(perf.data);
        }
      } catch (err) {
        console.error("Protocol Error: Profile sync failed.", err);
      }
    };

    load();
  }, [trainerId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "yearsOfExperience" ? Number(value) : value,
    }));
  };

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingImageFile(file);
    setAvatarUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainerId) return;
    setSaving(true);
    setSaveMsg("");

    try {
      if (pendingImageFile) {
        const { fileUrl } = await uploadAndSaveProfileImage(pendingImageFile);
        setAvatarUrl(fileUrl);
        setPendingImageFile(null);
      }

      await updateTrainerProfile(
        {
          userData: {
            name: formData.name,
            yearsOfExperience: formData.yearsOfExperience,
            sex: formData.sex,
            specialization: formData.specialization,
            specializations: formData.specialization ? [formData.specialization] : [],
            phone: formData.phone,
            bio: formData.bio,
          },
        },
        trainerId
      );

      setSaveMsg("Identity Synchronized Successfully.");
    } catch (err) {
      setSaveMsg("Link Failure: Retry authorization.");
    } finally {
      setSaving(false);
    }
  };

  const performanceData = {
    labels: perfLabels.length ? perfLabels : ["—"],
    datasets: [
      {
        label: "Sessions",
        data: perfData.length ? perfData : [0],
        borderColor: "#CCFF00",
        backgroundColor: "rgba(204, 255, 0, 0.05)",
        tension: 0.5,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: "#CCFF00",
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: "#4b5563", font: { size: 10, weight: 'bold' as const } },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
      x: {
        ticks: { color: "#4b5563", font: { size: 10, weight: 'bold' as const } },
        grid: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0B0B0B',
        borderColor: '#1f2937',
        borderWidth: 1,
        titleFont: { size: 10, family: 'Inter' },
        bodyFont: { size: 12, family: 'Inter', weight: 'bold' as const },
        displayColors: false,
      },
    },
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <header>
        <p className="text-[#CCFF00] font-black text-xs tracking-[0.4em] uppercase mb-1">Personnel Record</p>
        <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white leading-none">Identity Manager</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: Biometric ID & Performance */}
        <div className="lg:col-span-4 space-y-8">
          {/* Biometric identity Card */}
          <div className="bg-[#0B0B0B] border border-gray-900 rounded-[2.5rem] p-10 text-center relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#CCFF00] opacity-20"></div>
            <div className="relative inline-block mb-8">
              <div className="absolute -inset-4 bg-[#CCFF00] rounded-full blur-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-700"></div>
              <div className="relative">
                <img
                  src={avatarUrl || "/images/pro-pic.svg"}
                  alt="Identity"
                  className="w-32 h-32 rounded-[2rem] mx-auto object-cover grayscale group-hover:grayscale-0 transition-all duration-500 border-2 border-gray-800 group-hover:border-[#CCFF00]"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 bg-[#CCFF00] text-black p-3 rounded-2xl hover:scale-110 transition-all shadow-xl"
                >
                  <Camera size={18} />
                </button>
              </div>
            </div>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white leading-none mb-2">{formData.name || "Subject Alpha"}</h2>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">{formData.email}</p>

            {pendingImageFile && (
              <div className="mt-6 inline-flex items-center gap-2 bg-[#CCFF00]/10 border border-[#CCFF00]/20 px-4 py-2 rounded-xl">
                <Activity size={12} className="text-[#CCFF00] animate-pulse" />
                <span className="text-[9px] font-black text-[#CCFF00] uppercase tracking-widest">Image Calibration Pending</span>
              </div>
            )}

            <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImagePick} />
          </div>

          {/* Performance Telemetry */}
          <div className="bg-[#0B0B0B] border border-gray-900 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-black italic uppercase tracking-tighter text-white">Performance</h3>
                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Efficiency Telemetry</p>
              </div>
              <Activity className="text-[#CCFF00]/20" size={24} />
            </div>
            <div className="h-56 relative z-10">
              <Line data={performanceData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Right Column: Tactical Settings */}
        <div className="lg:col-span-8">
          <div className="bg-[#0B0B0B] border border-gray-900 rounded-[2.5rem] p-10 shadow-2xl relative">
            <div className="flex items-center gap-3 mb-10 border-b border-gray-900 pb-6">
              <ShieldCheck className="text-[#CCFF00]" size={20} />
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-500">Service Configuration</h3>
            </div>

            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-1">Personnel Full Name</label>
                  <div className="flex items-center bg-black border border-gray-800 rounded-2xl p-4 focus-within:border-[#CCFF00] transition-all">
                    <User size={18} className="text-gray-700 mr-4" />
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="bg-transparent w-full text-white font-bold italic focus:outline-none uppercase tracking-tight" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-1">Registry Email (Locked)</label>
                  <div className="flex items-center bg-black border border-gray-800 rounded-2xl p-4 opacity-50 cursor-not-allowed">
                    <Mail size={18} className="text-gray-700 mr-4" />
                    <input type="email" value={formData.email} readOnly className="bg-transparent w-full text-gray-600 font-bold italic focus:outline-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-1">Experience Calibration (Years)</label>
                  <div className="flex items-center bg-black border border-gray-800 rounded-2xl p-4 focus-within:border-[#CCFF00] transition-all">
                    <Award size={18} className="text-gray-700 mr-4" />
                    <input type="number" name="yearsOfExperience" value={formData.yearsOfExperience} onChange={handleChange} min={0} className="bg-transparent w-full text-white font-bold italic focus:outline-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-1">Deployment Specialization</label>
                  <div className="flex items-center bg-black border border-gray-800 rounded-2xl p-4 focus-within:border-[#CCFF00] transition-all">
                    <Activity size={18} className="text-gray-700 mr-4" />
                    <select name="specialization" value={formData.specialization} onChange={handleChange} className="bg-transparent w-full text-white font-black uppercase text-[10px] tracking-widest focus:outline-none">
                      <option value="" className="bg-[#0B0B0B]">Unassigned</option>
                      {specializations.map((s) => (
                        <option key={s._id} value={s.name} className="bg-[#0B0B0B]">{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-1">Secure Signal (Phone)</label>
                  <div className="flex items-center bg-black border border-gray-800 rounded-2xl p-4 focus-within:border-[#CCFF00] transition-all">
                    <Phone size={18} className="text-gray-700 mr-4" />
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="bg-transparent w-full text-white font-bold italic focus:outline-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-1">Biological Marker (Sex)</label>
                  <div className="flex bg-black border border-gray-800 rounded-2xl p-1">
                    {["Male", "Female"].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, sex: s as any }))}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.sex === s ? "bg-[#CCFF00] text-black" : "text-gray-700 hover:text-white"}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-1">Professional Biography</label>
                  <div className="flex bg-black border border-gray-800 rounded-2xl p-4 focus-within:border-[#CCFF00] transition-all">
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange as any}
                      placeholder="Share your experience, training philosophy, and achievements..."
                      rows={4}
                      className="bg-transparent w-full text-white font-bold italic focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-10 border-t border-gray-900 flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-3">
                  {saveMsg && (
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${saveMsg.includes("Success") ? "bg-[#CCFF00]/10 border border-[#CCFF00]/20 text-[#CCFF00]" : "bg-red-500/10 border border-red-500/20 text-red-500"}`}>
                      <ShieldCheck size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest italic">{saveMsg}</span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto px-10 py-5 bg-[#CCFF00] text-black font-black uppercase text-xs tracking-[0.3em] rounded-2xl hover:shadow-[0_0_30px_rgba(204,255,0,0.4)] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {saving ? <Activity className="animate-spin" size={18} /> : <Save size={18} />}
                  Synchronize Identity
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerProfile;