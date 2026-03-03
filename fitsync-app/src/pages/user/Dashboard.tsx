import React, { useState, useEffect, ReactNode } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { ChevronRight, Flame, Footprints, Droplets, Moon, User } from "lucide-react";
import { Button } from "../../components/user/ui/button";
import { Card, CardContent } from "../../components/user/ui/card";
import ProgressCircle from "../../components/user/Progress-circle";
import {
  getTodayHealthData,
  syncGoogleFitData,
  exchangeGoogleFitCode,
  getDashboardData,
  fetchTodayWater,
  updateTodayWater,
} from "../../axios/userApi";

interface HealthData {
  steps: number;
  caloriesBurned: number;
  sleepHours: number;
}

interface FitnessInfo {
  age: number;
  sex: string;
  weight: number;
  height: number;
  targetWeight: number;
  activity: string;
}

interface DashboardInfo {
  user: { name: string; profileImageUrl: string | null };
  fitness: FitnessInfo | null;
  appointmentDays: number[];
}

interface BlurSectionProps {
  active: boolean;
  children: ReactNode;
}

const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const Dashboard: React.FC = () => {
  const userId = localStorage.getItem("userId") || "";

  // ── Water
  const [waterGlasses, setWaterGlasses] = useState(0);
  const totalGlasses = 9;
  const waterPct = (waterGlasses / totalGlasses) * 100;

  // ── Google Fit
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [fitConnected, setFitConnected] = useState(false);
  const [loadingFit, setLoadingFit] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // ── Real dashboard data
  const [dashInfo, setDashInfo] = useState<DashboardInfo | null>(null);

  // ── Calendar navigation
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth()); // 0-indexed
  const todayDate = now.getDate();
  const todayMonth = now.getMonth();
  const todayYear = now.getFullYear();

  // Fetch dashboard data whenever month changes
  useEffect(() => {
    if (!userId) return;
    getDashboardData(calYear, calMonth + 1)
      .then((data: DashboardInfo) => setDashInfo(data))
      .catch(console.error);
  }, [userId, calYear, calMonth]);

  // Google Fit connection status
  useEffect(() => {
    setFitConnected(localStorage.getItem("googleFitConnected") === "true");
  }, []);

  // Water log
  useEffect(() => {
    if (!userId) return;
    fetchTodayWater(userId)
      .then((d) => setWaterGlasses(d.waterGlasses ?? 0))
      .catch(console.error);
  }, [userId]);

  // Health data auto-sync
  useEffect(() => {
    if (!userId || !initialLoad) return;
    const run = async () => {
      const isConnected = localStorage.getItem("googleFitConnected") === "true";
      setLoadingFit(true);
      try {
        if (isConnected) {
          try { await syncGoogleFitData(); }
          catch { localStorage.removeItem("googleFitConnected"); setFitConnected(false); }
        }
        setHealthData(await getTodayHealthData(userId));
      } catch { setFitConnected(false); }
      finally { setLoadingFit(false); setInitialLoad(false); }
    };
    run();
  }, [userId, initialLoad]);

  const connectGoogleFit = useGoogleLogin({
    flow: "auth-code",
    scope: [
      "openid", "profile", "email",
      "https://www.googleapis.com/auth/fitness.activity.read",
      "https://www.googleapis.com/auth/fitness.sleep.read",
      "https://www.googleapis.com/auth/fitness.body.read",
    ].join(" "),
    redirect_uri: window.location.origin,
    onSuccess: async ({ code }) => {
      setLoadingFit(true);
      try {
        await exchangeGoogleFitCode(code, window.location.origin, userId);
        await syncGoogleFitData();
        localStorage.setItem("googleFitConnected", "true");
        setHealthData(await getTodayHealthData(userId));
        setFitConnected(true);
      } catch (err) { console.error("Fit sync failed", err); }
      finally { setLoadingFit(false); }
    },
    onError: () => alert("Google Fit authorization failed"),
  });

  const handleWaterChange = (v: number) => {
    setWaterGlasses(v);
    updateTodayWater(userId, v).catch(console.error);
  };

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

  // ── Calendar
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDow = (new Date(calYear, calMonth, 1).getDay() + 6) % 7; // Mon=0
  const apptDays = new Set(dashInfo?.appointmentDays ?? []);
  const monthName = new Date(calYear, calMonth, 1).toLocaleString("default", { month: "long" });

  const prevMonth = () => calMonth === 0 ? (setCalYear(y => y - 1), setCalMonth(11)) : setCalMonth(m => m - 1);
  const nextMonth = () => calMonth === 11 ? (setCalYear(y => y + 1), setCalMonth(0)) : setCalMonth(m => m + 1);

  const fitness = dashInfo?.fitness;

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>

      {/* Welcome */}
      <Card className="bg-[#1a1a1a] border-none">
        <CardContent className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Hello, {dashInfo?.user.name ?? "there"}!</h2>
            <p className="text-gray-400">Stay healthy by connecting your Google Fit account.</p>
          </div>
          <ChevronRight className="h-8 w-8 text-[#d9ff00]" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Left – Google Fit metrics */}
        <div className="md:col-span-2 space-y-6">
          <BlurSection active={!fitConnected}>
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-[#1a1a1a] border-none">
                <CardContent>
                  <div className="flex items-center mb-2"><Flame className="text-[#d9ff00] mr-2" /><span>Total Calories</span></div>
                  <ProgressCircle percentage={((healthData?.caloriesBurned ?? 0) / 2000) * 100} size={100} strokeWidth={10}>
                    <div className="text-center">
                      <p className="text-xl font-bold">{Math.round(healthData?.caloriesBurned ?? 0)}</p>
                      <p className="text-xs text-gray-400">kcal</p>
                    </div>
                  </ProgressCircle>
                </CardContent>
              </Card>

              <Card className="bg-[#1a1a1a] border-none">
                <CardContent>
                  <div className="flex items-center mb-2"><Footprints className="text-[#d9ff00] mr-2" /><span>Steps</span></div>
                  <ProgressCircle percentage={((healthData?.steps ?? 0) / 5000) * 100} size={100} strokeWidth={10}>
                    <div className="text-center">
                      <p className="text-xl font-bold">{healthData?.steps ?? 0}</p>
                      <p className="text-xs text-gray-400">steps</p>
                    </div>
                  </ProgressCircle>
                </CardContent>
              </Card>
            </div>
          </BlurSection>

          {/* Sleep & Water */}
          <div className="grid grid-cols-3 gap-4">
            <BlurSection active={!fitConnected}>
              <Card className="bg-[#1a1a1a] border-none">
                <CardContent>
                  <div className="flex items-center mb-2"><Moon className="text-[#d9ff00] mr-2" /><span>Sleep (hrs)</span></div>
                  <ProgressCircle percentage={((healthData?.sleepHours ?? 0) / 8) * 100} size={80} strokeWidth={8}>
                    <div className="text-center"><p>{Math.round(healthData?.sleepHours ?? 0)}</p></div>
                  </ProgressCircle>
                </CardContent>
              </Card>
            </BlurSection>

            <Card className="bg-[#1a1a1a] border-none">
              <CardContent>
                <div className="flex items-center mb-2"><Droplets className="text-[#d9ff00] mr-2" /><span>Water</span></div>
                <ProgressCircle percentage={waterPct} size={80} strokeWidth={8}>
                  <div className="text-center">
                    <p>{waterGlasses}/{totalGlasses}</p>
                    <p className="text-xs text-gray-400">glasses</p>
                  </div>
                </ProgressCircle>
                <div className="flex justify-center gap-2 mt-2">
                  <button onClick={() => handleWaterChange(Math.max(0, waterGlasses - 1))}
                    className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center">−</button>
                  <button onClick={() => handleWaterChange(Math.min(totalGlasses, waterGlasses + 1))}
                    className="w-6 h-6 bg-[#d9ff00] rounded-full flex items-center justify-center text-black font-bold">+</button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right – Profile & Calendar */}
        <div className="space-y-6">

          {/* Profile Card */}
          <Card className="bg-[#1a1a1a] border-none">
            <CardContent className="text-center">
              <div className="h-24 w-24 rounded-full overflow-hidden mx-auto mb-3 bg-gray-700 flex items-center justify-center">
                {dashInfo?.user.profileImageUrl
                  ? <img src={dashInfo.user.profileImageUrl} alt="Profile" className="object-cover w-full h-full" />
                  : <User size={40} className="text-gray-400" />
                }
              </div>
              <h3 className="text-xl font-bold">{dashInfo?.user.name ?? "—"}</h3>

              {fitness && (
                <p className="text-gray-400 text-sm mt-1">
                  {fitness.age} yrs · {fitness.sex} · {fitness.activity}
                </p>
              )}

              {fitness && (
                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                  <div className="bg-gray-800 rounded-lg p-2">
                    <p className="text-[#d9ff00] font-bold text-sm">{fitness.weight}<span className="text-xs text-gray-400"> kg</span></p>
                    <p className="text-xs text-gray-500">Weight</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-2">
                    <p className="text-[#d9ff00] font-bold text-sm">{fitness.height}<span className="text-xs text-gray-400"> cm</span></p>
                    <p className="text-xs text-gray-500">Height</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-2">
                    <p className="text-[#d9ff00] font-bold text-sm">{fitness.targetWeight}<span className="text-xs text-gray-400"> kg</span></p>
                    <p className="text-xs text-gray-500">Goal</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Appointment Calendar */}
          <Card className="bg-[#1a1a1a] border-none">
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <button onClick={prevMonth} className="text-gray-400 hover:text-white px-1 text-lg">‹</button>
                <h4 className="font-medium text-sm">{monthName} {calYear}</h4>
                <button onClick={nextMonth} className="text-gray-400 hover:text-white px-1 text-lg">›</button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-1">
                {DAYS.map((d) => <div key={d}>{d}</div>)}
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {Array.from({ length: firstDow }).map((_, i) => <div key={`blank-${i}`} />)}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                  const isToday = d === todayDate && calMonth === todayMonth && calYear === todayYear;
                  const hasAppt = apptDays.has(d);
                  return (
                    <div key={d}
                      title={hasAppt ? "Session booked" : undefined}
                      className={`p-1 rounded-full text-xs transition-colors ${
                        isToday
                          ? "bg-[#d9ff00] text-black font-bold"
                          : hasAppt
                          ? "bg-blue-600 text-white font-medium"
                          : "hover:bg-[#2a2a2a] text-gray-300"
                      }`}
                    >
                      {d}
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-4 mt-3 text-xs text-gray-500 justify-center">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#d9ff00] inline-block" />Today
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />Session
                </span>
              </div>

              <p className="text-center text-xs text-gray-600 mt-2">Trainer's Appointment</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;