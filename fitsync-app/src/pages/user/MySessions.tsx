import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getBookings, submitReview, getReview } from "../../axios/userApi";
import { toast } from "react-toastify";
import { Star, MessageSquare, Video, CheckCircle, XCircle, Clock } from "lucide-react";

interface Booking {
  _id: string;
  meetingId: string;
  meetingStatus: string;
  trainerId: {
    _id: string;
    name: string;
    profileImageUrl: string;
  };
  sessionTime: string;
  startDate: string;
  status: "confirmed" | "completed" | "cancelled";
}

const MySessions: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const [reviewModal, setReviewModal] = useState<{
    open: boolean;
    bookingId: string;
    trainerId: string;
    alreadyReviewed: boolean;
  }>({ open: false, bookingId: "", trainerId: "", alreadyReviewed: false });
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewedBookings, setReviewedBookings] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const currentUserId = localStorage.getItem("userId");
        if (!currentUserId) throw new Error("User not authenticated");
        const data = await getBookings(currentUserId);
        setBookings(data);

        const completed = (data as Booking[]).filter((b) => b.status === "completed");
        const reviewChecks = await Promise.all(
          completed.map(async (b) => {
            try {
              const r = await getReview(b._id);
              return r ? b._id : null;
            } catch {
              return null;
            }
          })
        );
        setReviewedBookings(new Set(reviewChecks.filter(Boolean) as string[]));
      } catch (err) {
        setError("Failed to fetch bookings");
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const parse12HourTime = (timeStr: string): { hours: number, minutes: number } => {
    const [time, modifier] = timeStr.trim().split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (hours === 12) hours = 0;
    if (modifier && modifier.toUpperCase() === 'PM') hours += 12;
    return { hours, minutes };
  };

  const isSessionPassed = (startDateStr: string, sessionTimeStr: string): boolean => {
    try {
      if (!sessionTimeStr) return false;
      const parts = sessionTimeStr.split("-");
      if (parts.length < 2) return false;
      const endTimeStr = parts[1].trim();
      const { hours, minutes } = parse12HourTime(endTimeStr);
      const expirationDate = new Date(startDateStr);
      expirationDate.setHours(hours, minutes, 0, 0);
      return expirationDate < new Date();
    } catch {
      return false;
    }
  };

  const sessions = bookings.map((booking) => {
    const passed = booking.status === "confirmed" && isSessionPassed(booking.startDate, booking.sessionTime);
    let statusStr = "upcoming";
    if (booking.status === "completed") statusStr = "completed";
    else if (booking.status === "cancelled") statusStr = "cancelled";
    else if (passed) statusStr = "passed";

    return {
      id: booking._id,
      meetingId: booking.meetingId,
      meetingStatus: booking.meetingStatus,
      trainerName: booking.trainerId?.name,
      trainerId: booking.trainerId?._id,
      trainerImage: booking.trainerId?.profileImageUrl || "https://via.placeholder.com/80",
      sessionType: "Training Session",
      date: new Date(booking.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      time: booking.sessionTime,
      status: statusStr,
    };
  });

  const upcomingSessions = sessions.filter((s) => s.status === "upcoming").slice(0, 4);
  const recentActivities = sessions.slice(0, 4);

  const sessionsPerPage = 5;
  const indexOfLastSession = currentPage * sessionsPerPage;
  const indexOfFirstSession = indexOfLastSession - sessionsPerPage;
  const currentSessions = sessions.slice(indexOfFirstSession, indexOfLastSession);
  const totalPages = Math.ceil(sessions.length / sessionsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChat = (trainerId: string) => navigate(`/user/chat/${trainerId}`);

  const openReviewModal = async (bookingId: string, trainerId: string) => {
    const alreadyReviewed = reviewedBookings.has(bookingId);
    setReviewModal({ open: true, bookingId, trainerId, alreadyReviewed });
    setRating(0);
    setReviewText("");
    setHoveredStar(0);
  };

  const closeReviewModal = () => setReviewModal({ ...reviewModal, open: false });

  const handleSubmitReview = async () => {
    if (rating === 0) { toast.warning("Please select a star rating."); return; }
    if (!reviewText.trim()) { toast.warning("Please write a review."); return; }
    const userId = localStorage.getItem("userId");
    if (!userId) { toast.error("Not authenticated."); return; }

    setSubmitting(true);
    try {
      await submitReview({
        bookingId: reviewModal.bookingId,
        userId,
        trainerId: reviewModal.trainerId,
        rating,
        review: reviewText.trim(),
      });
      toast.success("Review submitted successfully!");
      setReviewedBookings((prev) => new Set([...prev, reviewModal.bookingId]));
      closeReviewModal();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-[#CCFF00] font-black uppercase tracking-widest animate-pulse h-screen flex items-center justify-center bg-black">Synchronizing Sessions...</div>;
  if (error) return <div className="p-8 text-red-500 font-bold italic h-screen flex items-center justify-center bg-black uppercase tracking-widest">{error}</div>;

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-10 bg-black min-h-screen text-white pb-24 md:pb-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-2">
        <div>
          <p className="text-[#CCFF00] font-black text-[10px] tracking-widest md:tracking-[0.4em] uppercase mb-1">Performance History</p>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">My Sessions</h1>
        </div>
      </div>

      {/* Main Sessions List */}
      <div className="bg-[#0B0B0B] border border-gray-900 rounded-[2rem] p-4 md:p-8 shadow-2xl">
        {sessions.length > 0 ? (
          <div className="space-y-4 md:space-y-6">
            {currentSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => navigate(`/user/bookingDetails/${session.id}`)}
                className="bg-black border border-gray-900 rounded-2xl p-4 md:p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between transition-all hover:border-[#CCFF00]/40 group cursor-pointer gap-6"
              >
                <div className="flex items-center gap-4 md:gap-6 w-full lg:w-auto">
                  <div className="relative shrink-0">
                    <img
                      src={session.trainerImage}
                      alt={session.trainerName}
                      className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all border border-gray-900"
                    />
                    {session.status === "upcoming" && (
                      <div className="absolute -top-2 -right-2 bg-[#CCFF00] p-1.5 rounded-lg shadow-lg">
                        <Clock size={12} className="text-black" />
                      </div>
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="text-white text-lg md:text-xl font-black tracking-tight group-hover:text-[#CCFF00] transition-colors truncate">
                      {session.trainerName}
                    </h3>
                    <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">
                      {session.date} <span className="text-[#CCFF00]/40 mx-1">|</span> {session.time}
                    </p>
                    {session.status === "completed" && (
                      <div className="flex items-center mt-2 text-[#CCFF00] text-[10px] font-black uppercase tracking-widest italic">
                        <CheckCircle size={12} className="mr-1.5" /> Session Verified
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile-Adaptive Actions */}
                <div className="flex flex-wrap md:flex-nowrap gap-3 w-full lg:w-auto md:justify-end border-t border-gray-900 pt-4 lg:border-0 lg:pt-0">
                  {session.status === "cancelled" ? (
                    <div className="flex items-center px-4 py-2 border border-red-900/50 bg-red-950/10 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest w-full justify-center">
                      <XCircle size={14} className="mr-2" /> Cancelled
                    </div>
                  ) : session.status === "completed" ? (
                    <div className="flex w-full gap-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleChat(session.trainerId); }}
                        className="p-3 bg-gray-900 text-white rounded-xl hover:text-[#CCFF00] transition-colors border border-gray-800"
                      >
                        <MessageSquare size={18} />
                      </button>
                      {reviewedBookings.has(session.id) ? (
                        <div className="flex-1 flex items-center justify-center px-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-[#CCFF00]/40 text-[#CCFF00]/60 italic">
                          ★ Evaluated
                        </div>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); openReviewModal(session.id, session.trainerId); }}
                          className="flex-1 px-4 md:px-6 py-3 bg-[#CCFF00] text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_15px_rgba(204,255,0,0.3)] transition-all"
                        >
                          Feedback
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex w-full gap-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleChat(session.trainerId); }}
                        className="p-3 bg-gray-900 text-white rounded-xl hover:text-[#CCFF00] transition-colors border border-gray-800"
                      >
                        <MessageSquare size={18} />
                      </button>
                      {session.status === "upcoming" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (session.meetingStatus === "live") {
                              const storedInfo = localStorage.getItem('userInfo');
                              const userInfo = storedInfo ? JSON.parse(storedInfo) : null;
                              navigate(`/video-call/${session.meetingId}`, { state: { role: 'user', name: userInfo?.name } });
                            } else {
                              toast.info("Awaiting trainer initialization...");
                            }
                          }}
                          className={`flex-1 flex items-center justify-center px-4 md:px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            session.meetingStatus === "live" 
                            ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] animate-pulse" 
                            : "bg-gray-900 text-gray-700 cursor-not-allowed border border-gray-800"
                          }`}
                        >
                          <Video size={16} className="mr-2" />
                          {session.meetingStatus === "live" ? "Join Now" : "Awaiting"}
                        </button>
                      )}
                      {session.status === "passed" && (
                        <div className="flex-1 flex items-center justify-center px-4 md:px-6 py-3 bg-gray-900/50 text-gray-700 rounded-xl text-[10px] font-black uppercase tracking-widest italic border border-gray-900">
                          <Clock size={14} className="mr-2" /> Expired
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-1 md:gap-2 pt-8 overflow-x-auto pb-2 overflow-y-hidden w-full max-w-full">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 md:px-4 py-2 bg-[#0B0B0B] border border-gray-800 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#CCFF00] disabled:opacity-20 transition-all active:scale-95 shrink-0"
                >
                  Prev
                </button>
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handlePageChange(index + 1)}
                    className={`min-w-[32px] md:min-w-[40px] h-8 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center text-[9px] md:text-[10px] font-black transition-all active:scale-90 shrink-0 ${
                      currentPage === index + 1
                        ? "bg-[#CCFF00] text-black shadow-[0_0_15px_rgba(204,255,0,0.3)]"
                        : "bg-black border border-gray-900 text-gray-600"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 md:px-4 py-2 bg-[#0B0B0B] border border-gray-800 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#CCFF00] disabled:opacity-20 transition-all active:scale-95 shrink-0"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4 border-2 border-dashed border-gray-900 rounded-[2rem] text-center">
            <p className="text-gray-700 font-black uppercase tracking-widest md:tracking-[0.3em] mb-8 italic text-sm">No Grid Sessions Detected</p>
            <Link to="/user/trainersList" className="w-full max-w-xs">
              <button className="w-full bg-[#CCFF00] text-black py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:shadow-[0_0_25px_rgba(204,255,0,0.3)] transition-all active:scale-95">
                Initiate Protocol
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Side Context Sections - Stacks on Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
        <div className="bg-[#0B0B0B] border border-gray-900 rounded-[2rem] p-6 md:p-8">
          <h2 className="text-lg md:text-xl font-black text-[#CCFF00] uppercase italic tracking-tighter mb-8 flex items-center gap-3">
            <div className="w-1.5 h-1.5 bg-[#CCFF00] rounded-full animate-pulse"></div>
            Planned Evolution
          </h2>
          <div className="space-y-4">
            {upcomingSessions.length > 0 ? (
              upcomingSessions.map((session) => (
                <div key={session.id} className="p-4 bg-black border-l-2 border-[#CCFF00] rounded-r-xl group hover:bg-white/[0.02] transition-colors">
                  <p className="font-black text-xs md:text-sm uppercase tracking-tight truncate">{session.sessionType} // {session.trainerName}</p>
                  <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest md:tracking-[0.2em] mt-2">{session.time}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-700 font-black text-[10px] uppercase tracking-widest italic">Grid schedule empty</p>
            )}
          </div>
        </div>

        <div className="bg-[#0B0B0B] border border-gray-900 rounded-[2rem] p-6 md:p-8 flex flex-col">
          <h2 className="text-lg md:text-xl font-black text-[#CCFF00] uppercase italic tracking-tighter mb-8">Activity Feed</h2>
          <div className="flex-1 space-y-5">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex justify-between items-center border-b border-gray-900/50 pb-4 last:border-0">
                  <div className="overflow-hidden">
                    <p className="text-[11px] font-black uppercase tracking-tight truncate pr-4">Session // {activity.trainerName}</p>
                    <p className="text-[9px] font-bold text-gray-700 uppercase tracking-widest mt-1.5">{activity.date}</p>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-800 shrink-0"></div>
                </div>
              ))
            ) : (
              <p className="text-gray-700 font-black text-[10px] uppercase tracking-widest italic">Awaiting telemetry logs...</p>
            )}
          </div>
          <Link to="/user/trainersList" className="mt-8">
            <button className="w-full border border-[#CCFF00] text-[#CCFF00] py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-[#CCFF00] hover:text-black transition-all active:scale-95">
              Access Full Roster
            </button>
          </Link>
        </div>
      </div>

      {/* Review Modal - Mobile Optimized */}
      {reviewModal.open && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-end md:items-center justify-center z-[100] p-4 md:p-6">
          <div className="bg-[#0B0B0B] border border-gray-800 rounded-[2.5rem] p-6 md:p-10 w-full max-w-lg shadow-2xl animate-in slide-in-from-bottom-10 duration-500">
            <h2 className="text-2xl md:text-3xl font-black text-[#CCFF00] italic uppercase tracking-tighter mb-2 text-center">Session Intel</h2>
            <p className="text-gray-600 text-center mb-10 text-[9px] md:text-[10px] font-black uppercase tracking-widest md:tracking-[0.2em] italic">Evaluate coach performance</p>

            <div className="flex justify-center gap-2 md:gap-4 mb-10 overflow-x-auto py-2 max-w-full">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform active:scale-75 shrink-0"
                >
                  <Star
                    size={window.innerWidth < 768 ? 32 : 42}
                    className={`transition-all ${
                      star <= (hoveredStar || rating)
                        ? "text-[#CCFF00] fill-[#CCFF00] drop-shadow-[0_0_10px_rgba(204,255,0,0.6)]"
                        : "text-gray-900"
                    }`}
                  />
                </button>
              ))}
            </div>

            <textarea
              rows={4}
              placeholder="Operational summary..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full bg-black border border-gray-900 rounded-2xl px-5 py-4 text-white placeholder-gray-800 focus:outline-none focus:border-[#CCFF00] transition-all mb-8 text-sm font-bold"
            />

            <div className="flex flex-col md:flex-row gap-4">
              <button
                onClick={closeReviewModal}
                className="flex-1 order-2 md:order-1 py-4 rounded-xl font-black uppercase tracking-widest bg-gray-900 text-white transition-all text-[10px] active:scale-95"
              >
                Abort
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={submitting}
                className="flex-1 order-1 md:order-2 py-4 rounded-xl font-black uppercase tracking-widest bg-[#CCFF00] text-black shadow-[0_0_20px_rgba(204,255,0,0.3)] transition-all disabled:opacity-50 text-[10px] active:scale-95"
              >
                {submitting ? "Transmitting..." : "Submit Feed"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySessions;