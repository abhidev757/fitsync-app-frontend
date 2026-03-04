import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getBookings, submitReview, getReview } from "../../axios/userApi";
import { toast } from "react-toastify";
import { Star } from "lucide-react";

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
  // Track which bookings already have a review  
  const [reviewedBookings, setReviewedBookings] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const currentUserId = localStorage.getItem("userId");
        if (!currentUserId) throw new Error("User not authenticated");
        const data = await getBookings(currentUserId);
        setBookings(data);

        // Check which completed bookings already have reviews
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

  const sessions = bookings.map((booking) => ({
    id: booking._id,
    meetingId: booking.meetingId,
    meetingStatus: booking.meetingStatus,
    trainerName: booking.trainerId?.name,
    trainerId: booking.trainerId?._id,
    trainerImage: booking.trainerId.profileImageUrl || "https://via.placeholder.com/80",
    sessionType: "Training Session",
    date: new Date(booking.startDate).toLocaleDateString(),
    time: booking.sessionTime,
    status:
      booking.status === "confirmed"
        ? "upcoming"
        : booking.status === "completed"
        ? "completed"
        : "cancelled",
  }));

  const upcomingSessions = bookings
    .filter((booking) => booking.status === "confirmed")
    .map((booking) => ({
      id: booking._id,
      trainer: booking.trainerId.name,
      type: "Training Session",
      time: booking.sessionTime,
    }))
    .slice(0, 4);

  const recentActivities = bookings
    .map((booking) => ({
      id: booking._id,
      description: `Session with ${booking.trainerId.name}`,
      date: new Date(booking.startDate).toLocaleDateString(),
      type:
        booking.status === "confirmed"
          ? "upcoming"
          : booking.status === "completed"
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
  const hasSessions = sessions.length > 0;
  const handleChat = (trainerId: string) => navigate(`/user/chat/${trainerId}`);

  // ── Review Modal ──────────────────────────────────────────────
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

  if (loading) return <div className="p-6 text-[#d9ff00]">Loading sessions...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      {/* My Sessions Section */}
      <div className="bg-[#1a1a1a] rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-[#d9ff00] mb-6">My Sessions</h2>

        {hasSessions ? (
          <div className="space-y-4">
            {currentSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => navigate(`/user/bookingDetails/${session.id}`)}
                className="bg-[#222222] rounded-lg p-4 flex items-center justify-between transform transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={session.trainerImage}
                    alt={session.trainerName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-[#d9ff00] font-medium">
                      {session.sessionType} with {session.trainerName}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Date: {session.date}, Time: {session.time}
                    </p>
                    {session.status === "completed" && (
                      <span className="inline-block mt-1 text-xs text-green-400 font-semibold">
                        ✓ Completed
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap justify-end">
                  {session.status === "cancelled" ? (
                    <span className="text-red-500 font-semibold px-4 py-1 rounded-full text-sm border border-red-500">
                      Cancelled
                    </span>
                  ) : session.status === "completed" ? (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleChat(session.trainerId); }}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded-full text-sm"
                      >
                        Chat
                      </button>
                      {reviewedBookings.has(session.id) ? (
                        <span className="px-4 py-1 rounded-full text-sm border border-[#d9ff00] text-[#d9ff00]">
                          ★ Reviewed
                        </span>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); openReviewModal(session.id, session.trainerId); }}
                          className="bg-[#d9ff00] hover:bg-[#c8e600] text-black px-4 py-1 rounded-full text-sm font-semibold"
                        >
                          Add Review
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleChat(session.trainerId); }}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded-full text-sm"
                      >
                        Chat
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
                              toast.info("Waiting for trainer to start the session...");
                            }
                          }}
                          className={`${
                            session.meetingStatus === "live" ? "bg-blue-500" : "bg-gray-500 cursor-not-allowed"
                          } text-white px-4 py-1 rounded-full text-sm`}
                        >
                          {session.meetingStatus === "live" ? "Join now" : "Waiting..."}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}

            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-6">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-[#222222] text-[#d9ff00] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#333333] transition-colors"
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handlePageChange(index + 1)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                      currentPage === index + 1
                        ? "bg-[#d9ff00] text-black font-bold"
                        : "bg-[#222222] text-white hover:bg-[#333333]"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-[#222222] text-[#d9ff00] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#333333] transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[#222222] rounded-lg p-16 flex flex-col items-center justify-center">
            <p className="text-gray-400 mb-8">No Sessions Attended</p>
            <Link to="/trainers">
              <button className="bg-[#d9ff00] hover:bg-[#c8e600] text-black px-6 py-2 rounded-full font-medium">
                Book now
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Upcoming Sessions and Recent Activity Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1a1a1a] rounded-lg p-6">
          <h2 className="text-xl font-bold text-[#d9ff00] mb-6">Upcoming Sessions</h2>
          <div className="bg-[#222222] rounded-lg p-6">
            {upcomingSessions.length > 0 ? (
              upcomingSessions.map((session) => (
                <div key={session.id} className="mb-2 last:mb-0">
                  <p className="text-[#d9ff00]">
                    {session.type} with {session.trainer} - {session.time}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No upcoming sessions</p>
            )}
          </div>
        </div>

        <div className="bg-[#1a1a1a] rounded-lg p-6 flex flex-col">
          <h2 className="text-xl font-bold text-[#d9ff00] mb-6">Recent Activity</h2>
          <div className="bg-[#222222] rounded-lg p-6 flex-1">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="mb-2 last:mb-0">
                  <p className="text-[#d9ff00]">{activity.description}</p>
                  <p className="text-sm text-gray-400">Date: {activity.date}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No recent activity</p>
            )}
          </div>
          <div className="mt-4 flex justify-end">
            <Link to="/trainers">
              <button className="bg-[#d9ff00] hover:bg-[#c8e600] text-black px-6 py-2 rounded-full font-medium">
                View Trainers
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Review Modal ─────────────────────────────────── */}
      {reviewModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-gray-700 rounded-2xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-[#d9ff00] mb-2 text-center">Rate Your Session</h2>
            <p className="text-gray-400 text-center mb-6 text-sm">
              Share your experience to help others
            </p>

            {/* Star Rating */}
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={36}
                    className={`transition-colors ${
                      star <= (hoveredStar || rating)
                        ? "text-[#d9ff00] fill-[#d9ff00]"
                        : "text-gray-600"
                    }`}
                  />
                </button>
              ))}
            </div>

            {rating > 0 && (
              <p className="text-center text-sm text-gray-400 mb-4">
                {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
              </p>
            )}

            {/* Review Text */}
            <textarea
              rows={4}
              placeholder="Write your review here..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full bg-[#222222] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#d9ff00] resize-none mb-6"
            />

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                onClick={closeReviewModal}
                className="flex-1 px-6 py-3 rounded-full font-bold bg-gray-700 hover:bg-gray-600 text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={submitting}
                className="flex-1 px-6 py-3 rounded-full font-bold bg-[#d9ff00] hover:bg-[#c8e600] text-black transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySessions;
