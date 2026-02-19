import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-4">
      <motion.h1 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-[#d9ff00] text-9xl font-bold tracking-widest"
      >
        404
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-xl md:text-2xl font-semibold mt-4 text-gray-300"
      >
        Oops! Page Not Found
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-8"
      >
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 bg-[#d9ff00] text-black text-lg font-bold rounded-lg shadow-lg hover:bg-[#c8e600] transition-colors"
        >
          Go Back
        </button>
      </motion.div>
    </div>
  );
};

export default NotFound;
