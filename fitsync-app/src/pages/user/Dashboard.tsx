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
  const limeColor = "#CCFF00";

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
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const todayDate = now.getDate();
  const todayMonth = now.getMonth();
  const todayYear = now.getFullYear();

  useEffect(() => {
    if (!userId) return;
    getDashboardData(calYear, calMonth + 1)
      .then((data: DashboardInfo) => setDashInfo(data))
      .catch(console.error);
  }, [userId, calYear, calMonth]);

  useEffect(() => {
    setFitConnected(localStorage.getItem("googleFitConnected") === "true");
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetchTodayWater(userId)
      .then((d) => setWaterGlasses(d.waterGlasses ?? 0))
      .catch(console.error);
  }, [userId]);

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
      <div className={active ? "filter blur-xl grayscale opacity-40 transition-all" : "transition-all"}>{children}</div>
      {active && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-2xl">
          <p className="text-white font-bold mb-4 text-xs uppercase tracking-widest">Connect Data Stream</p>
          <Button
            onClick={connectGoogleFit}
            disabled={loadingFit}
            className="bg-[#CCFF00] text-black font-black hover:scale-105 transition-transform"
          >
            {loadingFit ? "Syncing..." : "Sync Google Fit"}
          </Button>
        </div>
      )}
    </div>
  );

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDow = (new Date(calYear, calMonth, 1).getDay() + 6) % 7;
  const apptDays = new Set(dashInfo?.appointmentDays ?? []);
  const monthName = new Date(calYear, calMonth, 1).toLocaleString("default", { month: "long" });

  const prevMonth = () => calMonth === 0 ? (setCalYear(y => y - 1), setCalMonth(11)) : setCalMonth(m => m - 1);
  const nextMonth = () => calMonth === 11 ? (setCalYear(y => y + 1), setCalMonth(0)) : setCalMonth(m => m + 1);

  const fitness = dashInfo?.fitness;

  return (
    <div className="p-6 space-y-8 bg-black min-h-screen text-white font-sans">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[#CCFF00] font-black text-xs tracking-widest uppercase mb-1">Command Center</p>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">Dashboard Overview</h1>
        </div>
        <div className="text-right hidden md:block text-gray-600 text-xs font-bold tracking-widest uppercase">
          {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Welcome Card */}
      <Card className="bg-[#0B0B0B] border border-gray-900 overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#CCFF00] opacity-5 blur-3xl group-hover:opacity-10 transition-opacity"></div>
        <CardContent className="flex justify-between items-center p-8">
          <div>
            <h2 className="text-3xl font-black tracking-tight mb-2">Welcome back, {dashInfo?.user.name?.split(' ')[0] ?? "Elite"}!</h2>
            <p className="text-gray-500 font-medium max-w-md">Your bio-data is syncing. Continue your journey to peak performance.</p>
          </div>
          <div className="bg-[#CCFF00] p-3 rounded-full shadow-[0_0_20px_rgba(204,255,0,0.3)]">
            <ChevronRight className="h-6 w-6 text-black" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left – Metrics */}
        <div className="lg:col-span-2 space-y-8">
          <BlurSection active={!fitConnected}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-[#0B0B0B] border border-gray-900 p-2">
                <CardContent className="flex flex-col items-center">
                  <div className="flex items-center justify-between w-full mb-6">
                    <span className="text-xs font-black uppercase tracking-widest text-gray-500">Total Calories</span>
                    <Flame className="text-[#CCFF00] h-5 w-5" />
                  </div>
                  <ProgressCircle percentage={((healthData?.caloriesBurned ?? 0) / 2000) * 100} size={140} strokeWidth={12} color={limeColor}>
                    <div className="text-center">
                      <p className="text-4xl font-black tracking-tighter italic">{Math.round(healthData?.caloriesBurned ?? 0)}</p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">kcal / 2000</p>
                    </div>
                  </ProgressCircle>
                </CardContent>
              </Card>

              <Card className="bg-[#0B0B0B] border border-gray-900 p-2">
                <CardContent className="flex flex-col items-center">
                  <div className="flex items-center justify-between w-full mb-6">
                    <span className="text-xs font-black uppercase tracking-widest text-gray-500">Step Count</span>
                    <Footprints className="text-[#CCFF00] h-5 w-5" />
                  </div>
                  <ProgressCircle percentage={((healthData?.steps ?? 0) / 10000) * 100} size={140} strokeWidth={12} color={limeColor}>
                    <div className="text-center">
                      <p className="text-4xl font-black tracking-tighter italic">{healthData?.steps ?? 0}</p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Steps / 10k</p>
                    </div>
                  </ProgressCircle>
                </CardContent>
              </Card>
            </div>
          </BlurSection>

          {/* Sleep & Water Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BlurSection active={!fitConnected}>
              <Card className="bg-[#0B0B0B] border border-gray-900 p-4 h-full">
                <CardContent className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center text-[#CCFF00] text-xs font-black uppercase tracking-widest mb-4">
                      <Moon className="mr-2 h-4 w-4" /> Sleep Cycles
                    </div>
                    <p className="text-4xl font-black tracking-tighter italic">{Math.round(healthData?.sleepHours ?? 0)} <span className="text-xs font-bold text-gray-600 not-italic">HRS</span></p>
                    <p className="text-xs text-gray-500">8h Target</p>
                  </div>
                  <ProgressCircle percentage={((healthData?.sleepHours ?? 0) / 8) * 100} size={80} strokeWidth={8} color={limeColor} />
                </CardContent>
              </Card>
            </BlurSection>

            <Card className="bg-[#0B0B0B] border border-gray-900 p-4 h-full">
              <CardContent className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center text-[#CCFF00] text-xs font-black uppercase tracking-widest mb-4">
                    <Droplets className="mr-2 h-4 w-4" /> Hydration
                  </div>
                  <p className="text-4xl font-black tracking-tighter italic">{waterGlasses} <span className="text-xs font-bold text-gray-600 not-italic">/ {totalGlasses}</span></p>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => handleWaterChange(Math.max(0, waterGlasses - 1))}
                      className="w-8 h-8 bg-gray-900 border border-gray-800 rounded-lg hover:border-[#CCFF00] transition-colors flex items-center justify-center text-gray-400">−</button>
                    <button onClick={() => handleWaterChange(Math.min(totalGlasses, waterGlasses + 1))}
                      className="w-8 h-8 bg-[#CCFF00] rounded-lg flex items-center justify-center text-black font-black">+</button>
                  </div>
                </div>
                <ProgressCircle percentage={waterPct} size={80} strokeWidth={8} color={limeColor} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Sidebar – Profile & Calendar */}
        <div className="space-y-8">

          {/* Profile Card */}
          <Card className="bg-[#0B0B0B] border border-gray-900 overflow-hidden">
            <div className="h-1 bg-[#CCFF00]"></div>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="h-16 w-16 rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 flex items-center justify-center">
                  {dashInfo?.user.profileImageUrl
                    ? <img src={dashInfo.user.profileImageUrl} alt="Profile" className="object-cover w-full h-full" />
                    : <User size={24} className="text-gray-700" />
                  }
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight">{dashInfo?.user.name ?? "—"}</h3>
                  <p className="text-[#CCFF00] text-[10px] font-black uppercase tracking-widest">Pro Member</p>
                </div>
              </div>

              {fitness && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-black/50 border border-gray-900 rounded-xl p-3 text-center">
                    <p className="text-white font-black text-sm italic">{fitness.weight}kg</p>
                    <p className="text-[8px] uppercase tracking-tighter text-gray-600 font-bold">Current</p>
                  </div>
                  <div className="bg-black/50 border border-gray-900 rounded-xl p-3 text-center">
                    <p className="text-white font-black text-sm italic">{fitness.height}cm</p>
                    <p className="text-[8px] uppercase tracking-tighter text-gray-600 font-bold">Height</p>
                  </div>
                  <div className="bg-black/50 border border-gray-900 rounded-xl p-3 text-center">
                    <p className="text-[#CCFF00] font-black text-sm italic">{fitness.targetWeight}kg</p>
                    <p className="text-[8px] uppercase tracking-tighter text-gray-600 font-bold">Goal</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Appointment Calendar */}
          <Card className="bg-[#0B0B0B] border border-gray-900">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-black text-xs uppercase tracking-widest italic">{monthName} {calYear}</h4>
                <div className="flex space-x-1">
                  <button onClick={prevMonth} className="w-6 h-6 flex items-center justify-center bg-gray-900 rounded-md text-gray-400 hover:text-[#CCFF00]">‹</button>
                  <button onClick={nextMonth} className="w-6 h-6 flex items-center justify-center bg-gray-900 rounded-md text-gray-400 hover:text-[#CCFF00]">›</button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center text-[9px] font-black uppercase text-gray-600 mb-2">
                {DAYS.map((d) => <div key={d}>{d}</div>)}
              </div>

              <div className="grid grid-cols-7 gap-2 text-center">
                {Array.from({ length: firstDow }).map((_, i) => <div key={`blank-${i}`} />)}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                  const isToday = d === todayDate && calMonth === todayMonth && calYear === todayYear;
                  const hasAppt = apptDays.has(d);

                  return (
                    <div key={d}
                      className={`h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${isToday
                          ? "bg-[#CCFF00] text-black shadow-[0_0_15px_rgba(204,255,0,0.3)]" // Solid Lime for Today
                          : hasAppt
                            ? "border-2 border-[#CCFF00] text-[#CCFF00] bg-[#CCFF00]/5" // Lime Border for Scheduled
                            : "text-gray-500 hover:bg-gray-900"
                        }`}
                    >
                      {d}
                    </div>
                  );
                })}
              </div>

              {/* Updated Legend to match your request */}
              <div className="mt-6 pt-6 border-t border-gray-900 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-md bg-[#CCFF00]"></div>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Today</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-md border-2 border-[#CCFF00]"></div>
                  <span className="text-[9px] font-black text-[#CCFF00] uppercase tracking-widest">Scheduled Session</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;