import { useEffect, useState, useMemo } from "react";
import { Plus, X, Calendar, Clock, Zap, Layers } from "lucide-react";
import { toast } from "react-toastify";
import { addTimeSlot, addBulkTimeSlots, deleteTimeSlot, getTimeSlots } from "../../axios/trainerApi";

// ── Types ─────────────────────────────────────────────────────────
interface Slot { time: string; type: string; id: string; }
interface DaySchedule { date: string; slots: Slot[]; }

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const DURATIONS = [30, 45, 60, 90];
const BUFFER_OPTIONS = [0, 5, 10, 15, 30];
const LUNCH_OPTIONS = [
  { label: "None", start: "", end: "" },
  { label: "12:00 – 13:00", start: "12:00", end: "13:00" },
  { label: "13:00 – 14:00", start: "13:00", end: "14:00" },
];

// Convert 24h "HH:MM" to "H:MM AM/PM"
const fmt24to12 = (t: string): string => {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
};

const toMins = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };

// Generate preview of slots for Bulk Add
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
    slots.push(`${fmt24to12(`${String(Math.floor(cur/60)).padStart(2,"0")}:${String(cur%60).padStart(2,"0")}`)} - ${fmt24to12(`${String(Math.floor(end/60)).padStart(2,"0")}:${String(end%60).padStart(2,"0")}`)}`);
    cur = end;
  }
  return slots;
}

// ── Component ─────────────────────────────────────────────────────
export default function TimeSlots() {
  const [timeSlots, setTimeSlots] = useState<DaySchedule[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"quick" | "bulk">("quick");
  const [isLoading, setIsLoading] = useState(false);

  // Quick Add state
  const [qa, setQa] = useState({
    date: "",
    startTime: "09:00",
    endTime: "10:00",
    bufferMinutes: 0,
    price: "",
  });

  // Bulk Add state
  const [ba, setBa] = useState({
    days: [] as string[],
    blockStart: "09:00",
    blockEnd: "17:00",
    durationMins: 60,
    lunchIndex: 0,
    price: "",
  });

  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchSlots();
  }, []);

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

  // Bulk Add preview
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

  // ── Quick Add submit ─────────────────────────────────────────────
  const handleQuickSubmit = async () => {
    if (!qa.date) { toast.error("Please select a date."); return; }
    if (!qa.startTime || !qa.endTime) { toast.error("Please set start and end times."); return; }
    if (qa.startTime >= qa.endTime) { toast.error("End time must be after start time."); return; }
    if (!qa.price || parseFloat(qa.price) <= 0) { toast.error("Please enter a valid price."); return; }

    const userId = localStorage.getItem("trainerId");
    setIsLoading(true);
    try {
      const timeLabel = `${fmt24to12(qa.startTime)} - ${fmt24to12(qa.endTime)}`;
      await addTimeSlot({
        userId,
        sessionType: "Quick Add",
        startDate: qa.date,
        endDate: qa.date,
        time: timeLabel,
        bufferMinutes: qa.bufferMinutes,
        price: qa.price,
      });
      toast.success("Time slot added!");
      resetModal();
      fetchSlots();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to add time slot.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Bulk Add submit ──────────────────────────────────────────────
  const handleBulkSubmit = async () => {
    if (ba.days.length === 0) { toast.error("Select at least one day."); return; }
    if (!ba.blockStart || !ba.blockEnd) { toast.error("Set a time block."); return; }
    if (ba.blockStart >= ba.blockEnd) { toast.error("Block end must be after block start."); return; }
    if (!ba.price || parseFloat(ba.price) <= 0) { toast.error("Please enter a valid price."); return; }
    if (previewSlots.length === 0) { toast.error("No slots generated – adjust your settings."); return; }

    const userId = localStorage.getItem("trainerId");
    setIsLoading(true);
    try {
      const result = await addBulkTimeSlots({
        userId,
        days: ba.days,
        blockStart: ba.blockStart,
        blockEnd: ba.blockEnd,
        durationMinutes: ba.durationMins,
        lunchStart: bulkLunch.start || undefined,
        lunchEnd: bulkLunch.end || undefined,
        price: ba.price,
      });
      toast.success(`${result.count || "All"} slots created successfully!`);
      resetModal();
      fetchSlots();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create bulk slots.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────
  const handleDeleteSlot = async (slotId: string) => {
    const id = toast.loading("Deleting...");
    try {
      await deleteTimeSlot(slotId);
      setTimeSlots((prev) =>
        prev.map((d) => ({ ...d, slots: d.slots.filter((s) => s.id !== slotId) })).filter((d) => d.slots.length > 0)
      );
      toast.update(id, { render: "Deleted!", type: "success", isLoading: false, autoClose: 2000 });
    } catch {
      toast.update(id, { render: "Failed to delete.", type: "error", isLoading: false, autoClose: 2000 });
    }
  };

  const confirmDelete = (slotId: string) => {
    const toastId = toast.info(
      <div>
        <p className="mb-2 font-semibold">Delete this time slot?</p>
        <div className="flex gap-2">
          <button onClick={() => { handleDeleteSlot(slotId); toast.dismiss(toastId); }} className="bg-red-600 text-white px-3 py-1 rounded text-xs">Confirm</button>
          <button onClick={() => toast.dismiss(toastId)} className="bg-gray-500 text-white px-3 py-1 rounded text-xs">Cancel</button>
        </div>
      </div>,
      { autoClose: false, closeOnClick: false, draggable: false }
    );
  };

  // ── Render slots ─────────────────────────────────────────────────
  const renderTimeSlots = () => {
    if (isLoadingSlots) return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500" />
      </div>
    );
    if (timeSlots.length === 0) return (
      <div className="text-center py-16">
        <Calendar className="mx-auto text-gray-600 mb-3" size={40} />
        <p className="text-gray-400 text-lg mb-4">No time slots yet</p>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors">Add First Slot</button>
      </div>
    );
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {timeSlots.map((day) => (
          <div key={day.date} className="bg-gray-900 p-4 rounded-xl border border-gray-700">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-white font-semibold">{day.date}</h3>
              <button onClick={() => setShowModal(true)} className="text-blue-400 hover:text-blue-300 text-xs">+ Add</button>
            </div>
            <div className="space-y-2">
              {day.slots.map((slot) => (
                <div key={slot.id} className="bg-blue-600/80 p-3 rounded-lg relative group">
                  <button onClick={() => confirmDelete(slot.id)} className="absolute top-2 right-2 text-white opacity-0 group-hover:opacity-100 transition-opacity"><X size={14} /></button>
                  <p className="text-white text-sm font-medium">{slot.time}</p>
                  <span className="text-blue-200 text-xs">{slot.type}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ── JSX ──────────────────────────────────────────────────────────
  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="bg-gray-800 p-6 rounded-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Current Schedules</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={18} /> Add New
          </button>
        </div>
        {renderTimeSlots()}
      </div>

      {/* ── Modal ─────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">Add Time Slot</h3>
              <button onClick={resetModal} className="text-gray-400 hover:text-white"><X size={22} /></button>
            </div>

            {/* Tab switcher */}
            <div className="flex border-b border-gray-700">
              <button
                onClick={() => setActiveTab("quick")}
                className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === "quick" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400 hover:text-white"}`}
              >
                <Zap size={16} /> Quick Add
              </button>
              <button
                onClick={() => setActiveTab("bulk")}
                className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === "bulk" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400 hover:text-white"}`}
              >
                <Layers size={16} /> Bulk Add
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* ──── QUICK ADD ──── */}
              {activeTab === "quick" && (
                <>
                  <p className="text-gray-400 text-sm">One-off session for a specific date and time.</p>

                  {/* Date */}
                  <div>
                    <label className="text-gray-300 text-sm block mb-1">Date</label>
                    <input
                      type="date"
                      min={todayStr}
                      value={qa.date}
                      onChange={(e) => setQa({ ...qa, date: e.target.value })}
                      className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Time Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-300 text-sm block mb-1"><Clock size={13} className="inline mr-1" />Start Time</label>
                      <input
                        type="time"
                        value={qa.startTime}
                        onChange={(e) => setQa({ ...qa, startTime: e.target.value })}
                        className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-gray-300 text-sm block mb-1"><Clock size={13} className="inline mr-1" />End Time</label>
                      <input
                        type="time"
                        value={qa.endTime}
                        onChange={(e) => setQa({ ...qa, endTime: e.target.value })}
                        className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Buffer */}
                  <div>
                    <label className="text-gray-300 text-sm block mb-1">Buffer After Session</label>
                    <select
                      value={qa.bufferMinutes}
                      onChange={(e) => setQa({ ...qa, bufferMinutes: Number(e.target.value) })}
                      className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {BUFFER_OPTIONS.map((b) => (
                        <option key={b} value={b}>{b === 0 ? "None" : `${b} minutes`}</option>
                      ))}
                    </select>
                    <p className="text-gray-500 text-xs mt-1">Adds a break after this session to prevent back-to-back bookings.</p>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="text-gray-300 text-sm block mb-1">Price (₹)</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 500"
                      value={qa.price}
                      onChange={(e) => setQa({ ...qa, price: e.target.value })}
                      className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Preview badge */}
                  {qa.date && qa.startTime && qa.endTime && qa.startTime < qa.endTime && (
                    <div className="bg-blue-900/40 border border-blue-700 rounded-lg p-3 text-sm text-blue-300">
                      📅 {new Date(qa.date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short", year: "numeric" })}
                      &nbsp;·&nbsp;{fmt24to12(qa.startTime)} – {fmt24to12(qa.endTime)}
                      {qa.bufferMinutes > 0 && ` + ${qa.bufferMinutes}m buffer`}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button onClick={resetModal} className="flex-1 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors">Cancel</button>
                    <button onClick={handleQuickSubmit} disabled={isLoading} className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-60 transition-colors">
                      {isLoading ? "Saving..." : "Save Slot"}
                    </button>
                  </div>
                </>
              )}

              {/* ──── BULK ADD ──── */}
              {activeTab === "bulk" && (
                <>
                  <p className="text-gray-400 text-sm">Generate recurring slots for your weekly routine.</p>

                  {/* Day selection */}
                  <div>
                    <label className="text-gray-300 text-sm block mb-2">Days of the Week</label>
                    <div className="flex gap-2 flex-wrap">
                      {DAYS.map((d) => (
                        <button
                          key={d}
                          onClick={() => toggleDay(d)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${ba.days.includes(d) ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time Block */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-300 text-sm block mb-1">Block Start</label>
                      <input type="time" value={ba.blockStart} onChange={(e) => setBa({ ...ba, blockStart: e.target.value })}
                        className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="text-gray-300 text-sm block mb-1">Block End</label>
                      <input type="time" value={ba.blockEnd} onChange={(e) => setBa({ ...ba, blockEnd: e.target.value })}
                        className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="text-gray-300 text-sm block mb-1">Session Duration</label>
                    <div className="flex gap-2">
                      {DURATIONS.map((d) => (
                        <button key={d} onClick={() => setBa({ ...ba, durationMins: d })}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${ba.durationMins === d ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}>
                          {d}m
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Lunch break */}
                  <div>
                    <label className="text-gray-300 text-sm block mb-1">Lunch Break (skip)</label>
                    <select
                      value={ba.lunchIndex}
                      onChange={(e) => setBa({ ...ba, lunchIndex: Number(e.target.value) })}
                      className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {LUNCH_OPTIONS.map((opt, i) => <option key={i} value={i}>{opt.label}</option>)}
                    </select>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="text-gray-300 text-sm block mb-1">Price per Session (₹)</label>
                    <input type="number" min="1" placeholder="e.g. 500" value={ba.price} onChange={(e) => setBa({ ...ba, price: e.target.value })}
                      className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>

                  {/* Live Preview */}
                  {previewSlots.length > 0 && (
                    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
                      <p className="text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wider">
                        Preview · {previewSlots.length} slot{previewSlots.length !== 1 ? "s" : ""} per selected day
                        {ba.days.length > 0 && ` · ${previewSlots.length * ba.days.length * 4} total`}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {previewSlots.map((s, i) => (
                          <span key={i} className="bg-blue-800 text-blue-200 text-xs px-2 py-1 rounded-md">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {previewSlots.length === 0 && ba.blockStart && ba.blockEnd && (
                    <p className="text-amber-400 text-sm">⚠️ No slots fit within the current settings.</p>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button onClick={resetModal} className="flex-1 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors">Cancel</button>
                    <button onClick={handleBulkSubmit} disabled={isLoading || previewSlots.length === 0}
                      className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-60 transition-colors">
                      {isLoading ? "Creating..." : `Create ${ba.days.length * previewSlots.length * 4 || ""} Slots`}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
