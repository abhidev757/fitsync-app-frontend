import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Star, MessageSquare, Activity, User, ChevronLeft, ChevronRight } from 'lucide-react';
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
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        size={14}
        className={star <= rating ? 'text-[#CCFF00] fill-[#CCFF00]' : 'text-gray-800'}
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
        toast.error('Protocol Error: Failed to sync feedback grid.');
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

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0';

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
        <Activity className="animate-pulse mb-4 text-[#CCFF00]" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em]">Syncing Feedback Grid...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      {/* Header Protocol */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <p className="text-[#CCFF00] font-black text-xs tracking-[0.3em] uppercase mb-1">Performance Analytics</p>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white leading-none">Feedback Dossier</h1>
        </div>

        {/* Tactical Summary Card */}
        <div className="bg-[#0B0B0B] border border-gray-900 rounded-[2rem] p-6 flex items-center gap-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#CCFF00] opacity-5 blur-3xl"></div>
            <div className="text-center border-r border-gray-800 pr-8">
                <p className="text-5xl font-black italic tracking-tighter text-white">{avgRating}</p>
                <div className="mt-1 flex justify-center"><StarRating rating={Math.round(Number(avgRating))} /></div>
            </div>
            <div className="text-left">
                <p className="text-xl font-black italic text-[#CCFF00] tracking-tight">{reviews.length}</p>
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none">Total Logs</p>
            </div>
        </div>
      </header>

      {reviews.length === 0 ? (
        <div className="bg-[#0B0B0B] border border-dashed border-gray-900 rounded-[3rem] py-32 text-center">
          <MessageSquare className="mx-auto mb-6 text-gray-800" size={48} />
          <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.5em]">No Personnel Feedback Established in Grid</p>
        </div>
      ) : (
        <div className="max-w-5xl">
          <div className="space-y-6">
            {paginatedReviews.map((review) => (
              <div
                key={review._id}
                className="bg-[#0B0B0B] border border-gray-900 rounded-[2.5rem] p-8 hover:border-[#CCFF00]/40 transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#CCFF00] opacity-0 group-hover:opacity-5 blur-3xl transition-opacity"></div>
                
                <div className="flex flex-col sm:flex-row items-start gap-6 relative z-10">
                  {/* Subject Identification */}
                  <div className="shrink-0">
                    <div className="relative">
                        <div className="absolute -inset-1 bg-[#CCFF00] rounded-2xl blur opacity-0 group-hover:opacity-10 transition-opacity"></div>
                        {review.userId?.profileImageUrl ? (
                             <img
                             src={review.userId.profileImageUrl}
                             alt=""
                             className="w-16 h-16 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all border border-gray-800"
                           />
                        ) : (
                            <div className="w-16 h-16 rounded-2xl bg-black border border-gray-800 flex items-center justify-center">
                                <User size={24} className="text-gray-700" />
                            </div>
                        )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-black italic uppercase tracking-tight text-white">{review.userId?.name || 'Anonymous Agent'}</h3>
                        <div className="mt-1"><StarRating rating={review.rating} /></div>
                      </div>
                      <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest bg-black border border-gray-900 px-3 py-1 rounded-lg">
                        {new Date(review.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="mt-6 bg-black/50 border-l-2 border-gray-800 group-hover:border-[#CCFF00] transition-colors p-4 rounded-r-2xl">
                        <p className="text-sm text-gray-400 italic font-medium leading-relaxed uppercase tracking-tight">
                            "{review.review}"
                        </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tactical Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-16">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-4 bg-[#0B0B0B] border border-gray-900 rounded-2xl text-gray-700 hover:text-[#CCFF00] disabled:opacity-10 transition-all"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="flex gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-[10px] font-black transition-all ${
                      currentPage === i + 1
                        ? 'bg-[#CCFF00] text-black shadow-[0_0_15px_rgba(204,255,0,0.3)]'
                        : 'bg-[#0B0B0B] border border-gray-900 text-gray-700 hover:border-gray-500'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-4 bg-[#0B0B0B] border border-gray-900 rounded-2xl text-gray-700 hover:text-[#CCFF00] disabled:opacity-10 transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}