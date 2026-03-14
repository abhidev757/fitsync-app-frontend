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

  // Review modal state
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
    if (hours === 12) {
      hours = 0;
    }
    if (modifier && modifier.toUpperCase() === 'PM') {
      hours += 12;
    }
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
      trainerImage: booking.trainerId.profileImageUrl || "https://via.placeholder.com/80",
      sessionType: "Training Session",
      date: new Date(booking.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      time: booking.sessionTime,
      status: statusStr,
    };
  });

  const upcomingSessions = sessions
    .filter((session) => session.status === "upcoming")
    .map((session) => ({
      id: session.id,
      trainer: session.trainerName,
      type: session.sessionType,
      time: session.time,
    }))
    .slice(0, 4);

  const recentActivities = sessions
    .map((session) => ({
      id: session.id,
      description: `Session with ${session.trainerName}`,
      date: session.date,
      type:
        session.status === "upcoming"
          ? "upcoming"
          : session.status === "completed"
          ? "completion"
          : "payment",
    }))
    .slice(0, 4);

  const sessionsPerPage = 5;
  const indexOfLastSession = currentPage * sessionsPerPage;
  const indexOfFirstSession = indexOfLastSession - sessionsPerPage;
  const currentSessions = sessions.slice(indexOfFirstSession, indexOfLastSession);
  const totalPages = Math.ceil(sessions.length / sessionsPerPage);

  const handlePageChange = (pageNumber: number) => setCurrentPage(pageNumber);
  const handleChat = (trainerId: string) => navigate(`/user/chat/${trainerId}`);

  const openReviewModal = async (bookingId: string, trainerId: string) => {
    const alreadyReviewed = reviewedBookings.has(bookingId);
    setReviewModal({ open: true, bookingId, trainerId, alreadyReviewed });
    setRating(0);
    setReviewText("");
    setHoveredStar(0);
  };

  const closeReviewModal = () => {
    setReviewModal({ open: false, bookingId: "", trainerId: "", alreadyReviewed: false });
  };

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
      const msg = err?.response?.data?.message || "Failed to submit review.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-[#CCFF00] font-black uppercase tracking-widest animate-pulse">Synchronizing Sessions...</div>;
  if (error) return <div className="p-8 text-red-500 font-bold italic underline">{error}</div>;

  return (
    <div className="p-8 space-y-8 bg-black min-h-screen text-white">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[#CCFF00] font-black text-xs tracking-widest uppercase mb-1">Performance History</p>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">My Sessions</h1>
        </div>
      </div>

      {/* Main Sessions List */}
      <div className="bg-[#0B0B0B] border border-gray-900 rounded-3xl p-8 shadow-2xl">
        {sessions.length > 0 ? (
          <div className="space-y-6">
            {currentSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => navigate(`/user/bookingDetails/${session.id}`)}
                className="bg-black border border-gray-900 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between transition-all hover:border-[#CCFF00]/40 group cursor-pointer"
              >
                <div className="flex items-center gap-6 w-full md:w-auto">
                  <div className="relative">
                    <img
                      src={session.trainerImage}
                      alt={session.trainerName}
                      className="w-20 h-20 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all"
                    />
                    {session.status === "upcoming" && (
                      <div className="absolute -top-2 -right-2 bg-[#CCFF00] p-1 rounded-md">
                        <Clock size={12} className="text-black" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-white text-xl font-black tracking-tight group-hover:text-[#CCFF00] transition-colors">
                      {session.trainerName}
                    </h3>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">
                      {session.date} • {session.time}
                    </p>
                    {session.status === "completed" && (
                      <div className="flex items-center mt-2 text-[#CCFF00] text-[10px] font-black uppercase tracking-widest">
                        <CheckCircle size={14} className="mr-1" /> Session Verified
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 mt-6 md:mt-0 w-full md:w-auto justify-end">
                  {session.status === "cancelled" ? (
                    <div className="flex items-center px-4 py-2 border border-red-900 text-red-500 rounded-xl text-xs font-black uppercase tracking-widest">
                      <XCircle size={14} className="mr-2" /> Cancelled
                    </div>
                  ) : session.status === "completed" ? (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleChat(session.trainerId); }}
                        className="p-3 bg-gray-900 text-white rounded-xl hover:text-[#CCFF00] transition-colors"
                        title="Chat with Trainer"
                      >
                        <MessageSquare size={20} />
                      </button>
                      {reviewedBookings.has(session.id) ? (
                        <div className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest border border-[#CCFF00] text-[#CCFF00]">
                          ★ Evaluated
                        </div>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); openReviewModal(session.id, session.trainerId); }}
                          className="px-6 py-3 bg-[#CCFF00] text-black rounded-xl text-xs font-black uppercase tracking-widest hover:shadow-[0_0_15px_rgba(204,255,0,0.3)] transition-all"
                        >
                          Leave Review
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleChat(session.trainerId); }}
                        className="p-3 bg-gray-900 text-white rounded-xl hover:text-[#CCFF00] transition-colors"
                      >
                        <MessageSquare size={20} />
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
                              toast.info("Waiting for trainer to start...");
                            }
                          }}
                          className={`flex items-center px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                            session.meetingStatus === "live" 
                            ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] animate-pulse" 
                            : "bg-gray-800 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          <Video size={16} className="mr-2" />
                          {session.meetingStatus === "live" ? "Join Now" : "Waiting"}
                        </button>
                      )}
                      {session.status === "passed" && (
                        <div className="flex items-center px-4 py-3 bg-gray-800 text-gray-400 rounded-xl text-xs font-black uppercase tracking-widest cursor-not-allowed">
                          <Clock size={14} className="mr-2" /> Passed
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-3 pt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-3 bg-[#0B0B0B] border border-gray-900 rounded-xl text-[#CCFF00] disabled:opacity-30 transition-all hover:border-[#CCFF00]"
                >
                  Prev
                </button>
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handlePageChange(index + 1)}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-black transition-all ${
                      currentPage === index + 1
                        ? "bg-[#CCFF00] text-black"
                        : "bg-[#0B0B0B] border border-gray-900 text-gray-500 hover:text-white hover:border-white"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-3 bg-[#0B0B0B] border border-gray-900 rounded-xl text-[#CCFF00] disabled:opacity-30 transition-all hover:border-[#CCFF00]"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-900 rounded-3xl">
            <p className="text-gray-600 font-bold uppercase tracking-widest mb-8 italic">No Session Data Found</p>
            <Link to="/trainers">
              <button className="bg-[#CCFF00] text-black px-10 py-4 rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-transform">
                Initialize First Session
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Side-by-Side Context Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#0B0B0B] border border-gray-900 rounded-3xl p-8">
          <h2 className="text-xl font-black text-[#CCFF00] uppercase italic tracking-tighter mb-8">Planned Evolution</h2>
          <div className="space-y-4">
            {upcomingSessions.length > 0 ? (
              upcomingSessions.map((session) => (
                <div key={session.id} className="p-4 bg-black border-l-4 border-[#CCFF00] rounded-r-xl">
                  <p className="font-black text-sm uppercase tracking-tight">{session.type} with {session.trainer}</p>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">{session.time}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-600 font-bold text-xs uppercase tracking-widest">No scheduled training detected</p>
            )}
          </div>
        </div>

        <div className="bg-[#0B0B0B] border border-gray-900 rounded-3xl p-8 flex flex-col">
          <h2 className="text-xl font-black text-[#CCFF00] uppercase italic tracking-tighter mb-8 text-left">Activity Feed</h2>
          <div className="flex-1 space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex justify-between items-center border-b border-gray-900 pb-4 last:border-0">
                  <div>
                    <p className="text-sm font-black uppercase tracking-tight">{activity.description}</p>
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{activity.date}</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-gray-800"></div>
                </div>
              ))
            ) : (
              <p className="text-gray-600 font-bold text-xs uppercase tracking-widest">Awaiting activity logs...</p>
            )}
          </div>
          <Link to="/trainers" className="mt-8">
            <button className="w-full border-2 border-[#CCFF00] text-[#CCFF00] py-4 rounded-xl font-black uppercase tracking-widest hover:bg-[#CCFF00] hover:text-black transition-all">
              View All Trainers
            </button>
          </Link>
        </div>
      </div>

      {/* Review Modal */}
      {reviewModal.open && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-6">
          <div className="bg-[#0B0B0B] border border-gray-800 rounded-3xl p-10 w-full max-w-lg shadow-[0_0_50px_rgba(204,255,0,0.1)]">
            <h2 className="text-3xl font-black text-[#CCFF00] italic uppercase tracking-tighter mb-2 text-center">Session Feedback</h2>
            <p className="text-gray-500 text-center mb-10 text-xs font-bold uppercase tracking-widest">Evaluate your coach's performance</p>

            <div className="flex justify-center gap-4 mb-10">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform active:scale-90"
                >
                  <Star
                    size={42}
                    className={`transition-all ${
                      star <= (hoveredStar || rating)
                        ? "text-[#CCFF00] fill-[#CCFF00] drop-shadow-[0_0_8px_rgba(204,255,0,0.5)]"
                        : "text-gray-800"
                    }`}
                  />
                </button>
              ))}
            </div>

            <textarea
              rows={5}
              placeholder="Detailed performance analysis..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full bg-black border border-gray-900 rounded-2xl px-6 py-4 text-white placeholder-gray-700 focus:outline-none focus:border-[#CCFF00] transition-all mb-10 text-sm"
            />

            <div className="flex gap-4">
              <button
                onClick={closeReviewModal}
                className="flex-1 px-8 py-4 rounded-2xl font-black uppercase tracking-widest bg-gray-900 hover:bg-gray-800 text-white transition-all text-xs"
              >
                Discard
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={submitting}
                className="flex-1 px-8 py-4 rounded-2xl font-black uppercase tracking-widest bg-[#CCFF00] text-black hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all disabled:opacity-50 text-xs"
              >
                {submitting ? "Processing..." : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySessions;