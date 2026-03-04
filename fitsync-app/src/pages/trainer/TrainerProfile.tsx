"use client";

import { Camera } from "lucide-react";
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
  uploadProfileImage,
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

  // Form state — only committed when Save is clicked
  const [formData, setFormData] = useState({
    name: "",
    yearsOfExperience: 0,
    sex: null as "Male" | "Female" | null | undefined,
    specialization: "",
    phone: "",
    email: "",
  });

  // Displayed avatar URL (shows local preview while pending)
  const [avatarUrl, setAvatarUrl] = useState("");
  // Pending file to upload on Save
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);

  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Performance chart data
  const [perfLabels, setPerfLabels] = useState<string[]>([]);
  const [perfData, setPerfData] = useState<number[]>([]);

  // ── Fetch profile on mount ─────────────────────────────────────────────────
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
          });
          setAvatarUrl(profile.profileImageUrl || "");
        }

        if (Array.isArray(specs)) setSpecializations(specs);
        if (perf) {
          setPerfLabels(perf.labels);
          setPerfData(perf.data);
        }
      } catch (err) {
        console.error("Failed to load profile data:", err);
      }
    };

    load();
  }, [trainerId]);

  // ── Field change handler (text/select fields only) ─────────────────────────
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "yearsOfExperience" ? Number(value) : value,
    }));
  };

  // ── Image pick — local preview only, no upload yet ────────────────────────
  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingImageFile(file);
    setAvatarUrl(URL.createObjectURL(file)); // instant local preview
  };

  // ── Save Changes — upload image + persist form data ────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainerId) return;
    setSaving(true);
    setSaveMsg("");

    try {
      // 1. Upload image if a new one was picked
      if (pendingImageFile) {
        const { fileUrl } = await uploadProfileImage(pendingImageFile);
        setAvatarUrl(fileUrl);
        setPendingImageFile(null);
      }

      // 2. Save text/select fields (exclude email — not editable)
      await updateTrainerProfile(
        {
          userData: {
            name: formData.name,
            yearsOfExperience: formData.yearsOfExperience,
            sex: formData.sex,
            specialization: formData.specialization,
            specializations: formData.specialization ? [formData.specialization] : [],
            phone: formData.phone,
          },
        },
        trainerId
      );

      setSaveMsg("Profile saved successfully!");
    } catch (err) {
      console.error("Failed to save profile:", err);
      setSaveMsg("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Performance chart config ───────────────────────────────────────────────
  const performanceData = {
    labels: perfLabels.length ? perfLabels : ["—"],
    datasets: [
      {
        label: "Completed Sessions",
        data: perfData.length ? perfData : [0],
        borderColor: "rgb(217, 255, 0)",
        backgroundColor: "rgba(217, 255, 0, 0.1)",
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: "rgb(217, 255, 0)",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: "rgba(255,255,255,0.5)", stepSize: 1 },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
      x: {
        ticks: { color: "rgba(255,255,255,0.5)" },
        grid: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => ` ${ctx.parsed.y} session${ctx.parsed.y !== 1 ? "s" : ""}`,
        },
      },
    },
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Account</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Profile Card + Performance Chart */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <div className="relative inline-block">
              <img
                src={avatarUrl || "https://via.placeholder.com/96"}
                alt="Trainer Profile"
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
              />
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleImagePick}
              />
              {/* Camera button triggers file picker */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-3 right-0 bg-blue-500 hover:bg-blue-600 p-1.5 rounded-full transition-colors"
                title="Change profile photo"
              >
                <Camera className="h-3.5 w-3.5 text-white" />
              </button>
            </div>
            <h2 className="text-xl font-semibold text-white">{formData.name || "Trainer"}</h2>
            <p className="text-gray-400 text-sm">{formData.email}</p>
            {pendingImageFile && (
              <p className="text-xs text-yellow-400 mt-1">New photo selected — click Save Changes to apply</p>
            )}
          </div>

          {/* Performance Chart */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-1">Performance</h3>
            <p className="text-xs text-gray-400 mb-4">Completed sessions · last 6 months</p>
            <div className="h-48">
              <Line data={performanceData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Right column: Account Settings Form */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Account Settings</h2>
            <form className="space-y-6" onSubmit={handleSubmit}>

              {/* Full Name + Years of Experience */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    name="yearsOfExperience"
                    value={formData.yearsOfExperience}
                    onChange={handleChange}
                    min={0}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Sex + Specialization */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Sex
                  </label>
                  <select
                    name="sex"
                    value={formData.sex || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select Sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Specialization
                  </label>
                  <select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select Specialization</option>
                    {specializations.map((s) => (
                      <option key={s._id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Email (read-only) + Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    E-mail <span className="text-xs text-gray-500">(not editable)</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    readOnly
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-500 cursor-not-allowed opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Save feedback */}
              {saveMsg && (
                <p className={`text-sm ${saveMsg.includes("success") ? "text-green-400" : "text-red-400"}`}>
                  {saveMsg}
                </p>
              )}

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? "Saving…" : "Save Changes"}
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