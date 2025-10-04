import React, { useState, useEffect, ReactNode } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { ChevronRight, Flame, Footprints, Droplets } from "lucide-react";
import { Button } from "../../components/user/ui/button";
import { Card, CardContent } from "../../components/user/ui/card";
import ProgressCircle from "../../components/user/Progress-circle";
import {
  getTodayHealthData,
  syncGoogleFitData,
  exchangeGoogleFitCode,
} from "../../axios/userApi";
import { fetchTodayWater, updateTodayWater } from "../../axios/userApi";

interface HealthData {
  steps: number;
  caloriesBurned: number;
  sleepHours: number;
}
interface BlurSectionProps {
  active: boolean;
  children: ReactNode;
}

const Dashboard: React.FC = () => {
  const userId = localStorage.getItem("userId") || "";

  // Water state
  const [waterGlasses, setWaterGlasses] = useState(0);
  const totalGlasses = 9;
  const waterPct = (waterGlasses / totalGlasses) * 100;

  // Google Fit state
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [fitConnected, setFitConnected] = useState(false);
  const [loadingFit, setLoadingFit] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Set initial connection status from localStorage
  useEffect(() => {
    const isConnected = localStorage.getItem("googleFitConnected") === "true";
    setFitConnected(isConnected);
  }, []);

  // Fetch water on mount
  useEffect(() => {
    if (!userId) return;
    fetchTodayWater(userId)
      .then((d) => setWaterGlasses(d.waterGlasses ?? 0))
      .catch(console.error);
  }, [userId]);

  // Fetch today's health data with auto-sync for connected users
  useEffect(() => {
    if (!userId || !initialLoad) return;
    
    const fetchHealthData = async () => {
      const isConnected = localStorage.getItem("googleFitConnected") === "true";
      setLoadingFit(true);
      
      try {
        // Sync for connected users
        if (isConnected) {
          try {
            await syncGoogleFitData();
          } catch (syncError) {
            console.error("Sync failed", syncError);
            localStorage.removeItem("googleFitConnected");
            setFitConnected(false);
          }
        }
        
        // Fetch updated health data
        const data = await getTodayHealthData(userId);
        setHealthData(data);
      } catch (error) {
        console.error("Failed to get health data", error);
        setFitConnected(false);
      } finally {
        setLoadingFit(false);
        setInitialLoad(false);
      }
    };

    fetchHealthData();
  }, [userId, initialLoad]);

  // Google Fit connect & sync
  const connectGoogleFit = useGoogleLogin({
    flow: "auth-code",
    scope: [
      "openid",
      "profile",
      "email",
      "https://www.googleapis.com/auth/fitness.activity.read",
      "https://www.googleapis.com/auth/fitness.sleep.read",
      "https://www.googleapis.com/auth/fitness.body.read",
    ].join(" "),
    redirect_uri: window.location.origin,
    onSuccess: async ({ code }) => {
      setLoadingFit(true);
      try {
        // 1) Exchange code for tokens
        await exchangeGoogleFitCode(code, window.location.origin, userId);
        // 2) Sync Fit data
        await syncGoogleFitData();
        // 3) Store connection status
        localStorage.setItem("googleFitConnected", "true");
        // 4) Re-fetch today's health
        const fresh = await getTodayHealthData(userId);
        setHealthData(fresh);
        setFitConnected(true);
      } catch (err) {
        console.error("Fit sync failed", err);
      } finally {
        setLoadingFit(false);
      }
    },
    onError: () => alert("Google Fit authorization failed"),
  });

  // Water change handler
  const handleWaterChange = (newVal: number) => {
    setWaterGlasses(newVal);
    updateTodayWater(userId, newVal).catch(console.error);
  };

  // Blur wrapper
  const BlurSection = ({ active, children }: BlurSectionProps) => (
    <div className="relative">
      <div className={active ? "filter blur-md" : ""}>{children}</div>
      {active && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <Button onClick={connectGoogleFit} disabled={loadingFit}>
            {loadingFit ? "Syncing..." : "Sync Google Fit"}
          </Button>
        </div>
      )}
    </div>
  );

  // Calendar mock data
  const days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  const dates = Array.from({ length: 31 }, (_, i) => i + 1);
  const todayDate = new Date().getDate();

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>

      {/* Welcome Card */}
      <Card className="bg-[#1a1a1a] border-none">
        <CardContent className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Hello!</h2>
            <p className="text-gray-400">
              Stay healthy by connecting your Google Fit account.
            </p>
          </div>
          <ChevronRight className="h-8 w-8 text-[#d9ff00]" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Fit-powered */}
        <div className="md:col-span-2 space-y-6">
          <BlurSection active={!fitConnected}>
            <div className="grid grid-cols-2 gap-4">
              {/* Calories */}
              <Card className="bg-[#1a1a1a] border-none">
                <CardContent>
                  <div className="flex items-center mb-2">
                    <Flame className="text-[#d9ff00] mr-2" />
                    <span>Total Calories</span>
                  </div>
                  <ProgressCircle
                    percentage={((healthData?.caloriesBurned ?? 0) / 2000) * 100}
                    size={100}
                    strokeWidth={10}
                  >
                    <div className="text-center">
                      <p className="text-xl font-bold">
                        {Math.round(healthData?.caloriesBurned ?? 0)}
                      </p>
                      <p className="text-xs text-gray-400">kcal</p>
                    </div>
                  </ProgressCircle>
                </CardContent>
              </Card>

              {/* Steps */}
              <Card className="bg-[#1a1a1a] border-none">
                <CardContent>
                  <div className="flex items-center mb-2">
                    <Footprints className="text-[#d9ff00] mr-2" />
                    <span>Steps</span>
                  </div>
                  <ProgressCircle
                    percentage={((healthData?.steps ?? 0) / 5000) * 100}
                    size={100}
                    strokeWidth={10}
                  >
                    <div className="text-center">
                      <p className="text-xl font-bold">
                        {healthData?.steps ?? 0}
                      </p>
                      <p className="text-xs text-gray-400">steps</p>
                    </div>
                  </ProgressCircle>
                </CardContent>
              </Card>
            </div>
          </BlurSection>

          {/* Sleep & Water */}
          <div className="grid grid-cols-3 gap-4">
            {/* Sleep */}
            <BlurSection active={!fitConnected}>
              <Card className="bg-[#1a1a1a] border-none">
                <CardContent>
                  <div className="flex items-center mb-2">
                    <Droplets className="text-[#d9ff00] mr-2" />
                    <span>Sleep (hrs)</span>
                  </div>
                  <ProgressCircle
                    percentage={((healthData?.sleepHours ?? 0) / 8) * 100}
                    size={80}
                    strokeWidth={8}
                  >
                    <div className="text-center">
                      <p>{Math.round(healthData?.sleepHours ?? 0)}</p>
                    </div>
                  </ProgressCircle>
                </CardContent>
              </Card>
            </BlurSection>

            {/* Water */}
            <Card className="bg-[#1a1a1a] border-none">
              <CardContent>
                <div className="flex items-center mb-2">
                  <Droplets className="text-[#d9ff00] mr-2" />
                  <span>Water</span>
                </div>
                <ProgressCircle
                  percentage={waterPct}
                  size={80}
                  strokeWidth={8}
                >
                  <div className="text-center">
                    <p>
                      {waterGlasses}/{totalGlasses}
                    </p>
                    <p className="text-xs text-gray-400">glasses</p>
                  </div>
                </ProgressCircle>
                <div className="flex justify-center gap-2 mt-2">
                  <button
                    onClick={() =>
                      handleWaterChange(Math.max(0, waterGlasses - 1))
                    }
                    className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center"
                  >
                    −
                  </button>
                  <button
                    onClick={() =>
                      handleWaterChange(
                        Math.min(totalGlasses, waterGlasses + 1)
                      )
                    }
                    className="w-6 h-6 bg-[#d9ff00] rounded-full flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column - Profile & Calendar */}
        <div className="space-y-6">
          {/* Profile */}
          <Card className="bg-[#1a1a1a] border-none">
            <CardContent className="text-center">
              <div className="h-24 w-24 rounded-full overflow-hidden mx-auto mb-2">
                <img
                  src="https://via.placeholder.com/100"
                  alt="User"
                  className="object-cover w-full h-full"
                />
              </div>
              <h3 className="text-xl font-bold">Tassy Omah</h3>
              <p className="text-gray-400">
                25 • New York, USA
              </p>
            </CardContent>
          </Card>

          {/* Calendar */}
          <Card className="bg-[#1a1a1a] border-none">
            <CardContent>
              <h4 className="mb-2 font-medium">Trainer's Appointment</h4>
              <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
                {days.map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {dates.map((d) => (
                  <div
                    key={d}
                    className={`p-1 rounded-full ${
                      d === todayDate
                        ? "bg-[#d9ff00] text-black"
                        : "hover:bg-[#2a2a2a]"
                    }`}
                  >
                    {d}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;