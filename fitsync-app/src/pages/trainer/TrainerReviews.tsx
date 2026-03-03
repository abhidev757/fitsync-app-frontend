import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Star, MessageSquare } from 'lucide-react';
import axiosInstance from '../../axios/axiosInstance';

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

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        size={16}
        className={star <= rating ? 'text-[#d9ff00] fill-[#d9ff00]' : 'text-gray-600'}
      />
    ))}
  </div>
);

export default function TrainerReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    const fetchReviews = async () => {
      const trainerId = localStorage.getItem('trainerId');
      if (!trainerId) return;
      try {
        const { data } = await axiosInstance.get(`/trainer/reviews/${trainerId}`);
        setReviews(data || []);
      } catch (err) {
        toast.error('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const totalPages = Math.max(1, Math.ceil(reviews.length / ITEMS_PER_PAGE));
  const paginatedReviews = reviews.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Average rating
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '—';

  if (loading) return <div className="p-6 text-[#d9ff00]">Loading reviews...</div>;

  return (
    <div className="p-6 min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#d9ff00]">My Reviews</h1>
            <p className="text-gray-400 mt-1">What your clients say about you</p>
          </div>

          {/* Summary Card */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl px-6 py-4 text-center">
            <p className="text-4xl font-bold text-[#d9ff00]">{avgRating}</p>
            <StarRating rating={Math.round(Number(avgRating))} />
            <p className="text-gray-400 text-sm mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="bg-gray-900 border border-dashed border-gray-700 rounded-xl p-20 text-center">
            <MessageSquare className="mx-auto mb-4 text-gray-600" size={48} />
            <p className="text-gray-500 text-lg">No reviews yet.</p>
            <p className="text-gray-600 text-sm mt-2">Complete sessions with clients to receive reviews.</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {paginatedReviews.map((review) => (
                <div
                  key={review._id}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-[#d9ff00] transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <img
                      src={
                        review.userId?.profileImageUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(review.userId?.name || 'U')}&background=d9ff00&color=000&bold=true`
                      }
                      alt={review.userId?.name}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <p className="font-semibold text-white">{review.userId?.name || 'Anonymous'}</p>
                        <span className="text-gray-500 text-xs">
                          {new Date(review.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </span>
                      </div>

                      <StarRating rating={review.rating} />

                      <p className="mt-3 text-gray-300 leading-relaxed">{review.review}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-8">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                <div className="flex space-x-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                        currentPage === i + 1
                          ? 'bg-[#d9ff00] text-black font-bold'
                          : 'bg-gray-900 border border-gray-800 text-white hover:bg-gray-800'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
