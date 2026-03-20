import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Search, X } from 'lucide-react';
import { addSpecialization, getAllSpecializations, toggleSpecializationStatus } from "../../axios/adminApi";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from 'framer-motion';

interface Specialization {
  _id: string;
  name: string;
  description: string;
  isBlock: boolean;
}

const Specialization = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedSpecialization, setSelectedSpecialization] = useState<Specialization | null>(null);
  const [pendingAction, setPendingAction] = useState<"list" | "unlist" | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [specializationName, setSpecializationName] = useState('');
  const [specializationDescription, setSpecializationDescription] = useState('');

  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        const data = await getAllSpecializations();
        setSpecializations(data);
      } catch (error) {
        console.error('Failed to fetch specializations:', error);
      }
    };
    fetchSpecializations();
  }, []);

  const handleAddSpecialization = async () => {
    const trimmedName = specializationName.trim().toLowerCase();
    const exists = specializations.some((spec) => spec.name.trim().toLowerCase() === trimmedName);

    if (exists) {
      toast.warning("This specialization already exists.");
      return;
    }

    try {
      const response = await addSpecialization({
        name: specializationName,
        description: specializationDescription,
      });

      toast.success("Specialization added successfully");
      setSpecializations((prev) => [...prev, response.specialization]);
      setSpecializationName('');
      setSpecializationDescription('');
      setShowAddModal(false);
    } catch (error) {
      toast.error("Failed to add specialization");
    }
  };

  const confirmToggle = async () => {
    if (!selectedSpecialization) return;
    try {
      const updated = await toggleSpecializationStatus(selectedSpecialization.name, !selectedSpecialization.isBlock);
      setSpecializations((prev) =>
        prev.map((spec) =>
          spec.name === selectedSpecialization.name
            ? { ...spec, isBlock: updated.specialization.isBlock }
            : spec
        )
      );
      toast.success(`Specialization ${pendingAction === 'list' ? 'listed' : 'unlisted'} successfully`);
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setShowConfirmModal(false);
      setSelectedSpecialization(null);
      setPendingAction(null);
    }
  };

  const filteredSpecializations = specializations.filter((spec) =>
    spec.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filteredSpecializations.length / ITEMS_PER_PAGE));
  const currentSpecializations = filteredSpecializations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header / Search & Add */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
        <div className="w-full md:flex-1 md:max-w-2xl relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search specializations..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full md:w-auto flex items-center justify-center px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-900/20"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Specialization
        </button>
      </div>

      {/* Specialization Content */}
      <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-xl border border-gray-700">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Specialization</th>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {currentSpecializations.map((spec) => (
                <tr key={spec._id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">{spec.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${!spec.isBlock ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {!spec.isBlock ? 'Listed' : 'Unlisted'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => { setSelectedSpecialization(spec); setPendingAction(spec.isBlock ? "list" : "unlist"); setShowConfirmModal(true); }}
                      className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${!spec.isBlock ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white'}`}
                    >
                      {!spec.isBlock ? 'Unlist' : 'List'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile List View (Cards) */}
        <div className="md:hidden divide-y divide-gray-700">
          {currentSpecializations.map((spec) => (
            <div key={spec._id} className="p-5 flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-white font-bold text-base">{spec.name}</p>
                <span className={`text-[10px] font-black uppercase tracking-widest ${!spec.isBlock ? 'text-green-500' : 'text-red-500'}`}>
                  {!spec.isBlock ? 'Currently Listed' : 'Currently Unlisted'}
                </span>
              </div>
              <button
                onClick={() => { setSelectedSpecialization(spec); setPendingAction(spec.isBlock ? "list" : "unlist"); setShowConfirmModal(true); }}
                className={`p-2.5 rounded-xl font-black text-xs uppercase transition-all ${!spec.isBlock ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}
              >
                {!spec.isBlock ? 'Unlist' : 'List'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-gray-800 text-white rounded-xl hover:bg-gray-700 disabled:opacity-30 transition-all font-bold text-sm"
          >
            <ChevronLeft className="h-4 w-4 mr-2" /> Previous
          </button>
          
          <div className="flex space-x-2 overflow-x-auto pb-2 sm:pb-0">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${currentPage === i + 1 ? 'bg-blue-600 text-white font-black' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-30 transition-all font-bold text-sm"
          >
            Next <ChevronRight className="h-4 w-4 ml-2" />
          </button>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20}/></button>
              <h2 className="text-xl font-black uppercase italic tracking-tighter text-white mb-6">Add Specialization</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Specialization Name"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  value={specializationName}
                  onChange={(e) => setSpecializationName(e.target.value)}
                />
                <textarea
                  placeholder="Service Description"
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500 resize-none"
                  value={specializationDescription}
                  onChange={(e) => setSpecializationDescription(e.target.value)}
                />
                <button
                  onClick={handleAddSpecialization}
                  className="w-full py-4 bg-blue-600 text-white font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-900/40 transition-all active:scale-95"
                >
                  Confirm Entry
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showConfirmModal && selectedSpecialization && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="bg-gray-800 border border-gray-700 rounded-2xl p-8 w-full max-w-sm text-center shadow-2xl"
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${pendingAction === 'list' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                 <Plus size={32} className={pendingAction === 'list' ? '' : 'rotate-45'} />
              </div>
              <h2 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">Confirm {pendingAction}</h2>
              <p className="text-gray-400 text-sm mb-8 leading-relaxed">Adjust status for "<span className="text-white font-bold">{selectedSpecialization.name}</span>"?</p>
              <div className="flex gap-3">
                <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-3 bg-gray-700 text-white rounded-xl font-bold hover:bg-gray-600 transition-all">Abort</button>
                <button
                  onClick={confirmToggle}
                  className={`flex-1 py-3 rounded-xl font-black uppercase tracking-widest transition-all ${pendingAction === "list" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
                >
                  Execute
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Specialization;