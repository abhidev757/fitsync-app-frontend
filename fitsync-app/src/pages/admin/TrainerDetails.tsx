import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTrainerById, getTrainerReviews } from "../../axios/adminApi";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { Star } from "lucide-react";

interface TrainerDetails {
  name: string;
  email: string;
  phone: string;
  specializations: string;
  yearsOfExperience: number;
  sex: string;
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
      <Star key={s} size={14} className={s <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"} />
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

  if (loading) return <p className="text-white text-center">Loading trainer details...</p>;
  if (!trainerData) return <p className="text-white text-center">Trainer not found</p>;

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, INITIAL_SHOW);

  return (
    <div className="p-6">
      <div className="bg-gray-800 rounded-lg p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="mb-6">
              <img
                src={trainerData.profileImageUrl || "/placeholder.svg"}
                alt={trainerData.name}
                className="w-48 h-48 rounded-lg object-cover"
              />
            </div>

            <div className="space-y-4">
              <InfoRow label="Full Name" value={trainerData.name} />
              <InfoRow label="Email" value={trainerData.email} />
              <InfoRow label="Phone Number" value={trainerData.phone} />
              <InfoRow label="Specialization" value={trainerData.specializations} />
              <InfoRow label="Years of Experience" value={`${trainerData.yearsOfExperience} years`} />
              <InfoRow label="Sex" value={trainerData.sex || "N/A"} />

              {/* Overall Rating */}
              {avgRating && (
                <div className="flex flex-col space-y-1">
                  <span className="text-gray-400 text-sm">Overall Rating :</span>
                  <div className="flex items-center gap-2">
                    <StarRating rating={Math.round(Number(avgRating))} />
                    <span className="text-white font-bold text-lg">{avgRating}</span>
                    <span className="text-gray-400 text-sm">({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Certificate */}
          <div>
            <h2 className="text-white text-xl font-semibold mb-4">Certificate</h2>
            <div className="bg-white rounded-lg p-4">
              <img
                src={trainerData.certificateUrl || "/placeholder.svg"}
                alt="Trainer Certificate"
                className="w-full rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-10">
          <h2 className="text-white text-xl font-semibold mb-4">
            User Reviews {reviews.length > 0 && <span className="text-gray-400 text-sm font-normal">({reviews.length})</span>}
          </h2>

          {reviews.length === 0 ? (
            <p className="text-gray-500">No reviews yet for this trainer.</p>
          ) : (
            <>
              <div className="space-y-4">
                {visibleReviews.map((review) => (
                  <div key={review._id} className="bg-gray-700 rounded-lg p-5">
                    <div className="flex items-start gap-4">
                      <img
                        src={
                          review.userId?.profileImageUrl ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(review.userId?.name || "U")}&background=d9ff00&color=000&bold=true`
                        }
                        alt={review.userId?.name}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="text-white font-medium">{review.userId?.name || "Anonymous"}</span>
                          <span className="text-gray-400 text-xs">
                            {new Date(review.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                          </span>
                        </div>
                        <StarRating rating={review.rating} />
                        <p className="mt-2 text-gray-300 text-sm leading-relaxed">{review.review}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {reviews.length > INITIAL_SHOW && (
                <button
                  onClick={() => setShowAllReviews((p) => !p)}
                  className="mt-4 px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  {showAllReviews ? "Show Less" : `Show More (${reviews.length - INITIAL_SHOW} more)`}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col space-y-1">
    <span className="text-gray-400 text-sm">{label} :</span>
    <span className="text-white">{value}</span>
  </div>
);

export default TrainerDetailsPage;
