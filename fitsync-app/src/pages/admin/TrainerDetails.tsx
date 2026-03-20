import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTrainerById, getTrainerReviews } from "../../axios/adminApi";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { ChevronLeft, Award, Star as StarIcon } from "lucide-react";

interface TrainerDetails {
  name: string;
  email: string;
  phone: string;
  specializations: string;
  yearsOfExperience: number;
  sex: string;
  bio?: string;
  profileImage: string;
  certificateUrl: string;
  profileImageUrl: string;
}

interface Review {
  _id: string;
  rating: number;
  review: string;
  createdAt: string;
  userId: {
    _id: string;
    name: string;
    profileImageUrl?: string;
  };
}

const INITIAL_SHOW = 3;

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <StarIcon key={s} size={14} className={s <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"} />
    ))}
  </div>
);

const TrainerDetailsPage = () => {
  const navigate = useNavigate();
  const { adminInfo } = useSelector((state: RootState) => state.adminAuth);
  useEffect(() => { if (!adminInfo) navigate("/adminLogin"); }, [navigate, adminInfo]);

  const { id } = useParams<{ id: string }>() as { id: string };
  const [trainerData, setTrainerData] = useState<TrainerDetails | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [data, reviewData] = await Promise.all([
          getTrainerById(id),
          getTrainerReviews(id).catch(() => []),
        ]);
        setTrainerData(data);
        setReviews(Array.isArray(reviewData) ? reviewData : []);
      } catch (error) {
        toast.error("Failed to fetch trainer details");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white italic">Loading dossier...</div>;
  if (!trainerData) return <div className="min-h-screen flex items-center justify-center text-white italic">Trainer record not found.</div>;

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, INITIAL_SHOW);

  return (
    <div className="p-4 md:p-8">
      {/* Header / Back Navigation */}
      <button 
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-all text-xs font-bold uppercase tracking-widest"
      >
        <ChevronLeft size={16} /> Back to Registry
      </button>

      <div className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          
          {/* Left Side - Profile Information */}
          <div className="p-6 md:p-10 lg:border-r border-gray-700">
            <div className="flex flex-col items-center lg:items-start mb-8">
              <img
                src={trainerData.profileImageUrl || "/placeholder.svg"}
                alt={trainerData.name}
                className="w-40 h-40 md:w-56 md:h-56 rounded-2xl object-cover border-4 border-gray-700 shadow-xl mb-6"
              />
              <h1 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tighter leading-none mb-2">
                {trainerData.name}
              </h1>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                <Award size={12} /> Expert Professional
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
              <InfoRow label="Email Address" value={trainerData.email} />
              <InfoRow label="Phone Number" value={trainerData.phone} />
              <InfoRow label="Deployment" value={trainerData.specializations} />
              <InfoRow label="Experience" value={`${trainerData.yearsOfExperience} Years`} />
              <InfoRow label="Gender" value={trainerData.sex || "Not specified"} />
              <div className="sm:col-span-2 lg:col-span-1">
                <InfoRow label="Biography" value={trainerData.bio || "No biography provided."} />
              </div>

              {/* Overall Rating Block */}
              {avgRating && (
                <div className="sm:col-span-2 lg:col-span-1 pt-4 mt-4 border-t border-gray-700">
                  <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest block mb-2">Performance Rating</span>
                  <div className="flex items-center gap-3">
                    <StarRating rating={Math.round(Number(avgRating))} />
                    <span className="text-white font-black text-2xl tracking-tighter italic">{avgRating}</span>
                    <span className="text-gray-600 text-[10px] font-bold uppercase">({reviews.length} Feedbacks)</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Documentation & Reviews */}
          <div className="p-6 md:p-10 flex flex-col bg-gray-900/20">
            <div className="mb-10">
              <h2 className="text-white text-lg font-black italic uppercase tracking-widest mb-4 flex items-center gap-2">
                Credentials Documentation
              </h2>
              <div className="bg-black/40 border border-gray-700 rounded-xl p-4 flex flex-col items-center">
                {trainerData.certificateUrl ? (
                  <div className="w-full flex flex-col items-center gap-4">
                    {/\.(jpg|jpeg|png|webp)$/i.test(trainerData.certificateUrl) ? (
                      <img
                        src={trainerData.certificateUrl}
                        alt="Trainer Certificate"
                        className="w-full rounded-lg object-contain max-h-80 md:max-h-96"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-3 py-8">
                        <div className="p-5 bg-red-500/10 rounded-2xl">
                          <FileText size={48} className="text-red-500" />
                        </div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Encoded PDF Document</p>
                      </div>
                    )}
                    <a
                      href={trainerData.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto text-center px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all text-[10px] font-black uppercase tracking-widest"
                    >
                      Open Document Source
                    </a>
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm italic py-10">No documentation on file.</p>
                )}
              </div>
            </div>

            {/* User Feedback Section */}
            <div>
              <h2 className="text-white text-lg font-black italic uppercase tracking-widest mb-6">
                Personnel Feedback {reviews.length > 0 && <span className="text-gray-600 font-normal">[{reviews.length}]</span>}
              </h2>

              {reviews.length === 0 ? (
                <p className="text-gray-600 text-xs font-medium uppercase tracking-widest italic">No operational data available.</p>
              ) : (
                <div className="space-y-4">
                  {visibleReviews.map((review) => (
                    <div key={review._id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 transition-hover hover:border-blue-500/50">
                      <div className="flex items-start gap-4">
                        <img
                          src={
                            review.userId?.profileImageUrl ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(review.userId?.name || "U")}&background=blue&color=fff&bold=true`
                          }
                          alt={review.userId?.name}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-gray-600"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                            <span className="text-white text-xs font-black uppercase tracking-tight truncate">{review.userId?.name || "Unknown User"}</span>
                            <span className="text-gray-600 text-[10px] font-bold">
                              {new Date(review.createdAt).toLocaleDateString("en-GB")}
                            </span>
                          </div>
                          <StarRating rating={review.rating} />
                          <p className="mt-3 text-gray-400 text-xs leading-relaxed italic">{review.review}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {reviews.length > INITIAL_SHOW && (
                    <button
                      onClick={() => setShowAllReviews((p) => !p)}
                      className="w-full py-4 text-gray-500 hover:text-blue-400 text-[10px] font-black uppercase tracking-widest transition-all border-t border-gray-700 mt-2"
                    >
                      {showAllReviews ? "Collapse Logs" : `Access more files (${reviews.length - INITIAL_SHOW})`}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col space-y-1">
    <span className="text-gray-500 text-[9px] font-black uppercase tracking-widest">{label}</span>
    <span className="text-white text-sm md:text-base font-medium break-all">{value}</span>
  </div>
);

// Internal helper icon since FileText was used
const FileText = ({ size, className }: { size: number, className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

export default TrainerDetailsPage;