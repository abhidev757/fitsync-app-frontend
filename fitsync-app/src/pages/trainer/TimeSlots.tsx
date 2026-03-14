import { useEffect, useState, useMemo } from "react";
import { Plus, X, Calendar, Clock, Zap, Layers, Activity, Trash2, DollarSign, ChevronRight } from "lucide-react";
import { toast } from "react-toastify";
import { addTimeSlot, addBulkTimeSlots, deleteTimeSlot, getTimeSlots } from "../../axios/trainerApi";

// ── Types ─────────────────────────────────────────────────────────
interface Slot { time: string; type: string; id: string; price?: number; }
interface DaySchedule { date: string; slots: Slot[]; }

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const DURATIONS = [30, 45, 60, 90];
const BUFFER_OPTIONS = [0, 5, 10, 15, 30];
const LUNCH_OPTIONS = [
  { label: "NO BREAK", start: "", end: "" },
  { label: "12:00 – 13:00", start: "12:00", end: "13:00" },
  { label: "13:00 – 14:00", start: "13:00", end: "14:00" },
];

const fmt24to12 = (t: string): string => {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
};

const toMins = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };

function generatePreviewSlots(blockStart: string, blockEnd: string, durationMins: number, lunchStart: string, lunchEnd: string): string[] {
  if (!blockStart || !blockEnd || !durationMins) return [];
  const bStart = toMins(blockStart);
  const bEnd = toMins(blockEnd);
  const lStart = lunchStart ? toMins(lunchStart) : null;
  const lEnd = lunchEnd ? toMins(lunchEnd) : null;
  const slots: string[] = [];
  let cur = bStart;
  while (cur + durationMins <= bEnd) {
    const end = cur + durationMins;
    if (lStart !== null && lEnd !== null && cur < lEnd && end > lStart) {
      cur = lEnd;
      continue;
    }
    slots.push(`${fmt24to12(`${String(Math.floor(cur / 60)).padStart(2, "0")}:${String(cur % 60).padStart(2, "0")}`)} - ${fmt24to12(`${String(Math.floor(end / 60)).padStart(2, "0")}:${String(end % 60).padStart(2, "0")}`)}`);
    cur = end;
  }
  return slots;
}

export default function TimeSlots() {
  const [timeSlots, setTimeSlots] = useState<DaySchedule[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"quick" | "bulk">("quick");
  const [isLoading, setIsLoading] = useState(false);

  const [qa, setQa] = useState({ date: "", startTime: "09:00", endTime: "10:00", bufferMinutes: 0, price: "" });
  const [ba, setBa] = useState({ days: [] as string[], blockStart: "09:00", blockEnd: "17:00", durationMins: 60, lunchIndex: 0, price: "" });

  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => { fetchSlots(); }, []);

  const fetchSlots = async () => {
    setIsLoadingSlots(true);
    try {
      const { data } = await getTimeSlots();
      setTimeSlots(data);
    } catch {
      toast.error("Failed to load time slots");
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const bulkLunch = LUNCH_OPTIONS[ba.lunchIndex];
  const previewSlots = useMemo(
    () => generatePreviewSlots(ba.blockStart, ba.blockEnd, ba.durationMins, bulkLunch.start, bulkLunch.end),
    [ba.blockStart, ba.blockEnd, ba.durationMins, ba.lunchIndex]
  );

  const toggleDay = (d: string) =>
    setBa((prev) => ({
      ...prev,
      days: prev.days.includes(d) ? prev.days.filter((x) => x !== d) : [...prev.days, d],
    }));

  const resetModal = () => {
    setQa({ date: "", startTime: "09:00", endTime: "10:00", bufferMinutes: 0, price: "" });
    setBa({ days: [], blockStart: "09:00", blockEnd: "17:00", durationMins: 60, lunchIndex: 0, price: "" });
    setActiveTab("quick");
    setShowModal(false);
  };

  const handleQuickSubmit = async () => {
    if (!qa.date || !qa.price) { toast.error("Criteria Missing: Date and Price required."); return; }
    const userId = localStorage.getItem("trainerId");
    setIsLoading(true);
    try {
      const timeLabel = `${fmt24to12(qa.startTime)} - ${fmt24to12(qa.endTime)}`;
      await addTimeSlot({ userId, sessionType: "Quick Add", startDate: qa.date, endDate: qa.date, time: timeLabel, bufferMinutes: qa.bufferMinutes, price: qa.price });
      toast.success("Deployment Slot Synchronized.");
      resetModal(); fetchSlots();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Link Failure.");
    } finally { setIsLoading(false); }
  };

  const handleBulkSubmit = async () => {
    if (ba.days.length === 0 || !ba.price) { toast.error("Protocol Error: Select days and set asset value."); return; }
    const userId = localStorage.getItem("trainerId");
    setIsLoading(true);
    try {
      const result = await addBulkTimeSlots({ userId, days: ba.days, blockStart: ba.blockStart, blockEnd: ba.blockEnd, durationMinutes: ba.durationMins, lunchStart: bulkLunch.start || undefined, lunchEnd: bulkLunch.end || undefined, price: ba.price });
      toast.success(`${result.count || "Registry"} slots established successfully.`);
      resetModal(); fetchSlots();
    } catch (err: any) {
      toast.error("Bulk creation protocol failed.");
    } finally { setIsLoading(false); }
  };

  const handleDeleteSlot = async (slotId: string) => {
    try {
      await deleteTimeSlot(slotId);
      setTimeSlots((prev) => prev.map((d) => ({ ...d, slots: d.slots.filter((s) => s.id !== slotId) })).filter((d) => d.slots.length > 0));
      toast.success("Slot Severed.");
    } catch { toast.error("Termination failed."); }
  };

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500 pb-24 md:pb-20 p-4 md:p-0">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-[#CCFF00] font-black text-[10px] md:text-xs tracking-[0.4em] uppercase mb-1 md:mb-2">Schedule Logistics</p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic text-white leading-none">Deployment Grid</h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto group bg-[#CCFF00] text-black px-6 md:px-8 py-4 rounded-2xl flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-[0.3em] hover:shadow-[0_0_30px_rgba(204,255,0,0.3)] transition-all active:scale-95"
        >
          <Plus size={18} /> Establish Slot
        </button>
      </header>

      {/* Grid Display */}
      {isLoadingSlots ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-gray-700">
          <Activity className="animate-pulse mb-4 text-[#CCFF00]" size={32} />
          <p className="text-[10px] font-black uppercase tracking-[0.4em]">Syncing Calendar Data...</p>
        </div>
      ) : timeSlots.length === 0 ? (
        <div className="bg-[#0B0B0B] border border-dashed border-gray-900 rounded-[2rem] md:rounded-[3rem] py-20 md:py-32 text-center px-6">
          <Calendar className="mx-auto text-gray-800 mb-6" size={40} />
          <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.3em] mb-8">Registry Empty // No Slots established</p>
          <button onClick={() => setShowModal(true)} className="text-[#CCFF00] border-b border-[#CCFF00] font-black uppercase text-[10px] tracking-widest pb-1 hover:text-white hover:border-white transition-all">Initialize First Deployment</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {timeSlots.map((day) => (
            <div key={day.date} className="bg-[#0B0B0B] border border-gray-900 rounded-[2rem] overflow-hidden shadow-2xl transition-all hover:border-gray-800 flex flex-col">
              <div className="bg-black/40 backdrop-blur-md p-5 md:p-6 border-b border-gray-900 flex justify-between items-center shrink-0">
                <h3 className="text-white font-black italic uppercase tracking-tighter text-base md:text-lg">{day.date}</h3>
                <span className="text-[8px] font-black text-[#CCFF00] uppercase tracking-widest bg-[#CCFF00]/10 px-2.5 py-1 rounded-lg">Operational</span>
              </div>
              <div className="p-4 md:p-6 space-y-3 flex-1 overflow-y-auto">
                {day.slots.map((slot) => {
                  const now = new Date();
                  const slotDate = new Date(day.date);
                  const timeParts = slot.time.split('-').map(p => p.trim());
                  const endTimeStr = timeParts.length > 1 ? timeParts[1] : timeParts[0];

                  const match = endTimeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
                  if (match) {
                    let hours = parseInt(match[1], 10);
                    const minutes = parseInt(match[2], 10);
                    const period = match[3].toUpperCase();
                    if (period === 'PM' && hours < 12) hours += 12;
                    if (period === 'AM' && hours === 12) hours = 0;
                    slotDate.setHours(hours, minutes, 0, 0);
                  }

                  const isExpired = slotDate < now;

                  return (
                    <div key={slot.id} className={`group relative flex items-center justify-between p-4 bg-black border rounded-2xl transition-all active:scale-[0.98] ${isExpired ? "border-red-900/40 opacity-60" : "border-gray-900 hover:border-[#CCFF00]/30"}`}>
                      <div className="flex items-center gap-4 overflow-hidden">
                        <Clock size={16} className={`shrink-0 ${isExpired ? "text-red-900" : "text-gray-700 group-hover:text-[#CCFF00]"}`} />
                        <div className="min-w-0">
                          <p className={`text-[11px] md:text-xs font-black italic uppercase tracking-tight truncate ${isExpired ? "text-red-500/80" : "text-white"}`}>
                            {slot.time}
                          </p>
                          <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest truncate">{slot.type}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteSlot(slot.id)}
                        className={`p-2 rounded-lg shrink-0 transition-all ${isExpired ? "text-red-600 hover:bg-red-500/10" : "text-gray-800 hover:text-red-500 active:bg-red-500/10"}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
                <button onClick={() => setShowModal(true)} className="w-full py-4 border border-dashed border-gray-900 rounded-2xl text-[9px] font-black uppercase tracking-widest text-gray-700 hover:text-[#CCFF00] hover:border-[#CCFF00]/50 active:scale-95 transition-all flex items-center justify-center gap-2">
                  <Plus size={12} /> Sync Extra
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TACTICAL MODAL OVERRIDE - Responsive Fullscreen on small mobile */}
      {showModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4 animate-in fade-in duration-300">
          <div className="bg-[#0B0B0B] border-t sm:border border-gray-800 rounded-t-[2rem] sm:rounded-[2.5rem] w-full max-w-xl h-[92vh] sm:h-auto sm:max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#CCFF00] opacity-50"></div>

            <div className="flex justify-between items-center p-6 md:p-8 border-b border-gray-900 shrink-0">
              <div>
                <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-white">Establish Slot</h3>
                <p className="text-[8px] md:text-[9px] font-black text-gray-600 uppercase tracking-[0.3em]">Configure Deployment Logistics</p>
              </div>
              <button onClick={resetModal} className="p-3 bg-gray-900 rounded-xl text-gray-400 active:scale-90 active:bg-gray-800"><X size={20} /></button>
            </div>

            <div className="flex bg-black border-b border-gray-900 shrink-0">
              <button onClick={() => setActiveTab("quick")} className={`flex-1 py-4 md:py-5 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 md:gap-3 transition-all ${activeTab === "quick" ? "text-[#CCFF00] bg-[#CCFF00]/5 border-b-2 border-[#CCFF00]" : "text-gray-600"}`}>
                <Zap size={14} /> Quick Add
              </button>
              <button onClick={() => setActiveTab("bulk")} className={`flex-1 py-4 md:py-5 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 md:gap-3 transition-all ${activeTab === "bulk" ? "text-[#CCFF00] bg-[#CCFF00]/5 border-b-2 border-[#CCFF00]" : "text-gray-600"}`}>
                <Layers size={14} /> Bulk Registry
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 custom-scrollbar">
              {activeTab === "quick" ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#CCFF00] ml-1">Deployment Date</label>
                    <div className="relative flex items-center bg-black border border-gray-800 rounded-xl focus-within:border-[#CCFF00] transition-all overflow-hidden group">
                      <Calendar size={18} className="absolute left-4 text-gray-700 group-focus-within:text-[#CCFF00]" />
                      <input
                        type="date"
                        min={todayStr}
                        value={qa.date}
                        onChange={(e) => setQa({ ...qa, date: e.target.value })}
                        className="w-full bg-transparent text-white font-bold italic pl-12 pr-4 py-4 focus:outline-none [color-scheme:dark] text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-gray-600 ml-1">Inbound</label>
                      <input type="time" value={qa.startTime} onChange={(e) => setQa({ ...qa, startTime: e.target.value })} className="w-full bg-black border border-gray-900 text-white rounded-xl p-4 font-bold italic focus:border-[#CCFF00] focus:outline-none [color-scheme:dark] text-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-gray-600 ml-1">Outbound</label>
                      <input type="time" value={qa.endTime} onChange={(e) => setQa({ ...qa, endTime: e.target.value })} className="w-full bg-black border border-gray-900 text-white rounded-xl p-4 font-bold italic focus:border-[#CCFF00] focus:outline-none [color-scheme:dark] text-sm" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#CCFF00] ml-1">Buffer Protocol</label>
                    <div className="relative flex items-center bg-black border border-gray-900 rounded-xl overflow-hidden">
                       <select value={qa.bufferMinutes} onChange={(e) => setQa({ ...qa, bufferMinutes: Number(e.target.value) })} className="w-full bg-transparent text-white p-4 font-black uppercase text-[10px] tracking-widest focus:outline-none appearance-none">
                        {BUFFER_OPTIONS.map((b) => <option key={b} value={b} className="bg-[#0B0B0B]">{b === 0 ? "NO BREAK" : `${b} MIN COOL DOWN`}</option>)}
                      </select>
                      <ChevronRight size={14} className="absolute right-4 text-gray-600 rotate-90 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#CCFF00] ml-1">Asset Value (₹)</label>
                    <div className="flex items-center bg-black border border-gray-900 rounded-xl p-4 group focus-within:border-[#CCFF00]">
                      <DollarSign size={18} className="text-gray-700 group-focus-within:text-[#CCFF00]" />
                      <input type="number" placeholder="500" value={qa.price} onChange={(e) => setQa({ ...qa, price: e.target.value })} className="bg-transparent w-full text-white font-bold italic focus:outline-none ml-4 text-sm" />
                    </div>
                  </div>
                  <button onClick={handleQuickSubmit} disabled={isLoading} className="w-full py-5 bg-[#CCFF00] text-black font-black uppercase text-xs tracking-[0.3em] rounded-2xl hover:shadow-[0_0_30px_rgba(204,255,0,0.4)] active:scale-95 transition-all">
                    {isLoading ? "TRANSMITTING..." : "AUTHORIZE SLOT"}
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#CCFF00] ml-1">Sector (Days)</label>
                    <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                      {DAYS.map((d) => (
                        <button key={d} onClick={() => toggleDay(d)} className={`py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-90 ${ba.days.includes(d) ? "bg-[#CCFF00] text-black" : "bg-black border border-gray-900 text-gray-700"}`}>
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-gray-600 ml-1">Shift Start</label>
                      <input type="time" value={ba.blockStart} onChange={(e) => setBa({ ...ba, blockStart: e.target.value })} className="w-full bg-black border border-gray-900 text-white rounded-xl p-4 font-bold italic focus:outline-none text-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-gray-600 ml-1">Shift End</label>
                      <input type="time" value={ba.blockEnd} onChange={(e) => setBa({ ...ba, blockEnd: e.target.value })} className="w-full bg-black border border-gray-900 text-white rounded-xl p-4 font-bold italic focus:outline-none text-sm" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#CCFF00] ml-1">Duration</label>
                    <div className="flex gap-2">
                      {DURATIONS.map((d) => (
                        <button key={d} onClick={() => setBa({ ...ba, durationMins: d })} className={`flex-1 py-3 rounded-lg text-[9px] font-black uppercase active:scale-95 transition-all ${ba.durationMins === d ? "bg-white text-black" : "bg-black border border-gray-900 text-gray-700"}`}>
                          {d}M
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[#CCFF00] ml-1">Value (₹)</label>
                    <input type="number" placeholder="500" value={ba.price} onChange={(e) => setBa({ ...ba, price: e.target.value })} className="w-full bg-black border border-gray-900 text-white rounded-xl p-4 font-bold italic focus:border-[#CCFF00] text-sm" />
                  </div>

                  {previewSlots.length > 0 && (
                    <div className="bg-black border border-gray-900 rounded-2xl p-5">
                      <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-4 italic">Cycle Preview // {previewSlots.length} Slots</p>
                      <div className="flex flex-wrap gap-2">
                        {previewSlots.slice(0, 3).map((s, i) => (
                          <span key={i} className="bg-gray-950 border border-gray-900 text-gray-500 text-[8px] font-black px-2.5 py-1.5 rounded-lg uppercase">{s}</span>
                        ))}
                        {previewSlots.length > 3 && <span className="text-[8px] font-black text-[#CCFF00] uppercase pt-1.5">+ {previewSlots.length - 3} OTHERS</span>}
                      </div>
                    </div>
                  )}

                  <button onClick={handleBulkSubmit} disabled={isLoading || previewSlots.length === 0} className="w-full py-5 bg-[#CCFF00] text-black font-black uppercase text-[10px] md:text-xs tracking-[0.2em] rounded-2xl active:scale-95 transition-all">
                    {isLoading ? "SYNCING REGISTRY..." : `GENERATE ${ba.days.length * previewSlots.length || ""} SLOTS`}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}