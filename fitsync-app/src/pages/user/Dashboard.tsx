"use client";

import React, { useState, useEffect, ReactNode } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { ChevronRight, Flame, Footprints, Droplets, Moon, User, Calendar } from "lucide-react";
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
    <div className="relative h-full">
      <div className={active ? "filter blur-lg grayscale opacity-40 transition-all h-full" : "transition-all h-full"}>{children}</div>
      {active && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-2xl p-4 text-center z-10">
          <p className="text-[#CCFF00] font-black mb-3 text-[10px] uppercase tracking-[0.2em]">Google Fit Required</p>
          <Button
            onClick={connectGoogleFit}
            disabled={loadingFit}
            className="bg-[#CCFF00] text-black font-black text-xs py-5 px-6 rounded-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest shadow-[0_0_20px_rgba(204,255,0,0.2)]"
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
  const monthName = new Date(calYear, calMonth, 1).toLocaleString("default", { month: "short" });

  const prevMonth = () => calMonth === 0 ? (setCalYear(y => y - 1), setCalMonth(11)) : setCalMonth(m => m - 1);
  const nextMonth = () => calMonth === 11 ? (setCalYear(y => y + 1), setCalMonth(0)) : setCalMonth(m => m + 1);

  const fitness = dashInfo?.fitness;

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-10 bg-black min-h-screen text-white font-sans pb-24 md:pb-8">
      
      {/* Tactical Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-2">
        <div>
          <p className="text-[#CCFF00] font-black text-[10px] tracking-[0.4em] uppercase mb-1">Grid Dashboard</p>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">Command Center</h1>
        </div>
        <div className="text-gray-600 text-[10px] font-black tracking-widest uppercase italic border-l-2 border-[#CCFF00]/20 pl-3">
          {now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} // SYNC ACTIVE
        </div>
      </div>

      {/* Welcome Card - Adaptive Padding */}
      <Card className="bg-[#0B0B0B] border border-gray-900 overflow-hidden relative group rounded-[2rem]">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#CCFF00] opacity-5 blur-[100px] pointer-events-none"></div>
        <CardContent className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 md:p-10 gap-6">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-4xl font-black tracking-tighter uppercase italic">Welcome, {dashInfo?.user.name?.split(' ')[0] ?? "Operative"}</h2>
            <p className="text-gray-500 font-bold text-xs md:text-sm uppercase tracking-tight max-w-sm">Stay healthy by connecting your Google Fit account.</p>
          </div>
          <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-4">
             <span className="text-[10px] font-black text-gray-700 uppercase md:hidden tracking-widest">System Status</span>
             <div className="bg-[#CCFF00] p-4 rounded-2xl shadow-[0_0_20px_rgba(204,255,0,0.2)] hover:scale-110 transition-transform cursor-pointer">
               <ChevronRight className="h-5 w-5 text-black" />
             </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">

        {/* Left – Core Biometrics (8 Columns on Desktop) */}
        <div className="lg:col-span-8 space-y-6 md:space-y-10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <BlurSection active={!fitConnected}>
                <Card className="bg-[#0B0B0B] border border-gray-900 p-2 rounded-[2.5rem] hover:border-[#CCFF00]/30 transition-all h-full">
                  <CardContent className="flex flex-col items-center p-6">
                    <div className="flex items-center justify-between w-full mb-8">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Energy Expenditure</span>
                      <Flame className="text-[#CCFF00] h-4 w-4" />
                    </div>
                    <ProgressCircle percentage={((healthData?.caloriesBurned ?? 0) / 2000) * 100} size={160} strokeWidth={14} color={limeColor}>
                      <div className="text-center">
                        <p className="text-4xl font-black tracking-tighter italic">{Math.round(healthData?.caloriesBurned ?? 0)}</p>
                        <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Kcal Output</p>
                      </div>
                    </ProgressCircle>
                  </CardContent>
                </Card>
             </BlurSection>

             <BlurSection active={!fitConnected}>
                <Card className="bg-[#0B0B0B] border border-gray-900 p-2 rounded-[2.5rem] hover:border-[#CCFF00]/30 transition-all h-full">
                  <CardContent className="flex flex-col items-center p-6">
                    <div className="flex items-center justify-between w-full mb-8">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Locomotion Tracking</span>
                      <Footprints className="text-[#CCFF00] h-4 w-4" />
                    </div>
                    <ProgressCircle percentage={((healthData?.steps ?? 0) / 10000) * 100} size={160} strokeWidth={14} color={limeColor}>
                      <div className="text-center">
                        <p className="text-4xl font-black tracking-tighter italic">{healthData?.steps ?? 0}</p>
                        <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Step Registry</p>
                      </div>
                    </ProgressCircle>
                  </CardContent>
                </Card>
             </BlurSection>
          </div>

          {/* Secondary Stats - 1 Column on Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BlurSection active={!fitConnected}>
              <Card className="bg-[#0B0B0B] border border-gray-900 p-6 rounded-[2rem] h-full">
                <CardContent className="p-0 flex items-center justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center text-[#CCFF00] text-[10px] font-black uppercase tracking-widest">
                      <Moon className="mr-2 h-3.5 w-3.5" /> Recovery
                    </div>
                    <div>
                      <p className="text-4xl font-black tracking-tighter italic">{Math.round(healthData?.sleepHours ?? 0)} <span className="text-xs font-black text-gray-700 not-italic">HRS</span></p>
                      <p className="text-[10px] font-bold text-gray-600 uppercase">Target: 08.00</p>
                    </div>
                  </div>
                  <ProgressCircle percentage={((healthData?.sleepHours ?? 0) / 8) * 100} size={80} strokeWidth={8} color={limeColor} />
                </CardContent>
              </Card>
            </BlurSection>

            <Card className="bg-[#0B0B0B] border border-gray-900 p-6 rounded-[2rem] h-full">
              <CardContent className="p-0 flex items-center justify-between">
                <div className="space-y-4">
                  <div className="flex items-center text-[#CCFF00] text-[10px] font-black uppercase tracking-widest">
                    <Droplets className="mr-2 h-3.5 w-3.5" /> Hydration
                  </div>
                  <div>
                    <p className="text-4xl font-black tracking-tighter italic">{waterGlasses} <span className="text-xs font-black text-gray-700 not-italic">/ {totalGlasses}</span></p>
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => handleWaterChange(Math.max(0, waterGlasses - 1))}
                        className="w-10 h-10 bg-black border border-gray-800 rounded-xl hover:border-[#CCFF00] transition-colors flex items-center justify-center text-gray-400">−</button>
                      <button onClick={() => handleWaterChange(Math.min(totalGlasses, waterGlasses + 1))}
                        className="w-10 h-10 bg-[#CCFF00] rounded-xl flex items-center justify-center text-black font-black">+</button>
                    </div>
                  </div>
                </div>
                <ProgressCircle percentage={waterPct} size={80} strokeWidth={8} color={limeColor} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Sidebar – Dossier & Calendar (4 Columns on Desktop) */}
        <div className="lg:col-span-4 space-y-6 md:space-y-10">

          {/* Biometric Dossier */}
          <Card className="bg-[#0B0B0B] border border-gray-900 overflow-hidden rounded-[2.5rem]">
            <div className="h-1.5 bg-[#CCFF00]"></div>
            <CardContent className="p-8">
              <div className="flex items-center space-x-5 mb-8">
                <div className="h-20 w-20 rounded-3xl overflow-hidden bg-black border border-gray-800 flex items-center justify-center">
                  {dashInfo?.user.profileImageUrl
                    ? <img src={dashInfo.user.profileImageUrl} alt="Profile" className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all" />
                    : <User size={30} className="text-gray-800" />
                  }
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tighter uppercase italic">{dashInfo?.user.name ?? "—"}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-1.5 h-1.5 bg-[#CCFF00] rounded-full animate-pulse"></div>
                    <p className="text-[#CCFF00] text-[9px] font-black uppercase tracking-widest">Active Operative</p>
                  </div>
                </div>
              </div>

              {fitness && (
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { val: `${fitness.weight}`, label: "Weight", unit: "kg" },
                    { val: `${fitness.height}`, label: "Height", unit: "cm" },
                    { val: `${fitness.targetWeight}`, label: "Goal", unit: "kg", color: "text-[#CCFF00]" }
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-black/40 border border-gray-900 rounded-2xl p-4 text-center">
                      <p className={`${stat.color || 'text-white'} font-black text-sm italic`}>{stat.val}<span className="text-[8px] not-italic ml-0.5">{stat.unit}</span></p>
                      <p className="text-[8px] uppercase tracking-tighter text-gray-700 font-black mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Deployment Calendar */}
          <Card className="bg-[#0B0B0B] border border-gray-900 rounded-[2.5rem] overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 text-[#CCFF00]">
                  <Calendar size={14} />
                  <h4 className="font-black text-[10px] uppercase tracking-[0.3em] italic">{monthName} {calYear}</h4>
                </div>
                <div className="flex gap-2">
                  <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center bg-black border border-gray-800 rounded-xl text-gray-500 hover:text-[#CCFF00] transition-all">‹</button>
                  <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center bg-black border border-gray-800 rounded-xl text-gray-500 hover:text-[#CCFF00] transition-all">›</button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 md:gap-2 text-center text-[9px] font-black uppercase text-gray-700 mb-4">
                {DAYS.map((d) => <div key={d}>{d}</div>)}
              </div>

              <div className="grid grid-cols-7 gap-1 md:gap-2 text-center">
                {Array.from({ length: firstDow }).map((_, i) => <div key={`blank-${i}`} />)}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                  const isToday = d === todayDate && calMonth === todayMonth && calYear === todayYear;
                  const hasAppt = apptDays.has(d);

                  return (
                    <div key={d}
                      className={`h-9 md:h-10 flex items-center justify-center rounded-xl text-[10px] md:text-xs font-black transition-all cursor-default ${isToday
                          ? "bg-[#CCFF00] text-black shadow-[0_0_15px_rgba(204,255,0,0.4)] scale-110 z-10" 
                          : hasAppt
                            ? "border-2 border-[#CCFF00] text-[#CCFF00] bg-[#CCFF00]/5" 
                            : "text-gray-700 hover:bg-gray-900/50"
                        }`}
                    >
                      {d}
                    </div>
                  );
                })}
              </div>

              <div className="mt-10 pt-8 border-t border-gray-900 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#CCFF00] shadow-[0_0_8px_#CCFF00]"></div>
                  <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Current Window</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full border-2 border-[#CCFF00]"></div>
                  <span className="text-[9px] font-black text-[#CCFF00] uppercase tracking-widest">Active Deployment</span>
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
