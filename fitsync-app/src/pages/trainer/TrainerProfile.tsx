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
import { useEffect, useState } from "react";
import { fetchTrainerProfile, updateTrainerProfile } from "../../axios/trainerApi"; // Adjust the path to your axiosInstance file
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

const TrainerProfile = () => {
  const { trainerInfo } = useSelector((state: RootState) => state.trainerAuth);
  console.log("trainer Info:",trainerInfo);
  
  const trainerId = trainerInfo?._id;

  const [formData, setFormData] = useState({
    name: "",
    yearsOfExperience: 0, // Change to number
    sex: null as "Male" | "Female" | null | undefined,
    specialization: "",
    email: "",
    phone: "",
  });

  // Fetch trainer profile data on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!trainerId) {
        console.error("Trainer ID is not available. Please log in.");
        return;
      }

      try {
        const profile = await fetchTrainerProfile(trainerId);
        console.log("Trainer Profile:", profile);
        
        if (profile) {
          setFormData({
            name: profile.name || "",
            yearsOfExperience: profile.yearsOfExperience || 0, // Ensure it's a number
            sex: profile.sex || null,
            specialization: profile.specialization || "",
            email: profile.email || "",
            phone: profile.phone || "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch trainer profile:", error);
      }
    };

    fetchProfileData();
  }, [trainerId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Handle the "yearsOfExperience" field separately to convert it to a number
    if (name === "yearsOfExperience") {
      setFormData((prev) => ({
        ...prev,
        [name]: Number(value), // Convert to number
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Guard clause: Ensure trainerId is defined
    if (!trainerId) {
      console.error("Trainer ID is not available. Please log in.");
      return;
    }

    try {
      // Prepare the data for the API call
      const userData = {
        name: formData.name,
        yearsOfExperience: formData.yearsOfExperience, // Already a number
        sex: formData.sex,
        specialization: formData.specialization,
        email: formData.email,
        phone: formData.phone,
      };
      console.log("Data to be sent:",userData);
      

      // Make the API call to update the trainer profile
      const response = await updateTrainerProfile({userData}, trainerId);

      // Handle the response (e.g., show a success message)
      console.log("Profile updated successfully:", response);

      // Optionally, navigate to another page or show a success notification
    } catch (error) {
      // Handle errors (e.g., show an error message)
      console.error("Failed to update profile:", error);
    }
  };

  const performanceData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [
      {
        label: "Performance",
        data: [3, 2.8, 3.2, 2.7, 3.1],
        borderColor: "rgb(255, 255, 255)",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.5)",
          display: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.5)",
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Account</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile and Performance */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <div className="relative inline-block">
              <img
                src="/placeholder.svg?height=120&width=120"
                alt="Trainer Profile"
                className="w-24 h-24 rounded-full mx-auto mb-4"
              />
              <button className="absolute bottom-0 right-0 bg-blue-500 p-1.5 rounded-full">
                <Camera className="h-3.5 w-3.5 text-white" />
              </button>
            </div>
            <h2 className="text-xl font-semibold text-white">{formData.name}</h2>
            <p className="text-gray-400 text-sm">{formData.email}</p>
          </div>

          {/* Performance Chart */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">2024 Performance</h3>
            <div className="h-48">
              <Line data={performanceData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Account Settings Form */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Account Settings</h2>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Full Name */}
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
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Sex and Specialization */}
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
                    <option value="Fitness trainer">Fitness trainer</option>
                    <option value="Yoga instructor">Yoga instructor</option>
                    <option value="Nutrition coach">Nutrition coach</option>
                  </select>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
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

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  Save Changes
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