import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react';
import { addSpecialization, getAllSpecializations, toggleSpecializationStatus } from "../../axios/adminApi";

interface Specialization {
    _id: string;
    name: string;
    description: string;
    isBlock: boolean;
}

const Specialization = () => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [specializations, setSpecializations] = useState<Specialization[]>([]);
    const [specializationName, setSpecializationName] = useState('');
    const [specializationDescription, setSpecializationDescription] = useState('');

    
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
      try {
          const response = await addSpecialization({
              name: specializationName,
              description: specializationDescription,
          });
  
          console.log('Specialization added:', response);
  
          setSpecializations((prev) => [...prev, response.specialization]);
  
          setSpecializationName('');
          setSpecializationDescription('');
  
          // Close the modal
          setShowAddModal(false);
      } catch (error) {
          console.error('Failed to add specialization:', error);
      }
  };

    const handleToggleStatus = async (name: string, isBlock: boolean) => {
      try {
  
          const updatedSpecialization = await toggleSpecializationStatus(name, !isBlock);
  
          setSpecializations((prev) =>
              prev.map((spec) =>
                  spec.name === name ? { ...spec, isBlock: updatedSpecialization.specialization.isBlock } : spec
              )
          );
      } catch (error) {
          console.error('Failed to toggle status:', error);
      }
  };

    return (
        <div className="p-6">
            {/* Header with Search and Add Button */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex-1 max-w-2xl relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Search by Specialization"
                        className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 ml-4"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Specialization
                </button>
            </div>

            {/* Specializations Table */}
            <div className="bg-gray-800 rounded-lg overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Specialization
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {specializations.map((spec) => (
                            <tr key={spec._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                    {spec.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`text-sm ${
                                        !spec.isBlock ? 'text-green-500' : 'text-red-500'
                                    }`}>
                                        {!spec.isBlock ? 'Listed' : 'Unlisted'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button
                                        onClick={() => handleToggleStatus(spec.name, spec.isBlock)}
                                        className={`px-4 py-1 rounded text-white text-sm ${
                                            !spec.isBlock 
                                                ? 'bg-red-500 hover:bg-red-600' 
                                                : 'bg-green-500 hover:bg-green-600'
                                        }`}
                                    >
                                        {!spec.isBlock ? 'Unlist' : 'List'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6">
                <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                </button>
                <span className="text-white">
                    Page {currentPage} of 3
                </span>
                <button
                    onClick={() => setCurrentPage(p => Math.min(3, p + 1))}
                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                </button>
            </div>

             {/* Add Specialization Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-white mb-6">
              Add Specialization
            </h2>
            
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Specialization Name"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  value={specializationName}
                  onChange={(e) => setSpecializationName(e.target.value)}
                />
              </div>
              
              <div>
                <textarea
                  placeholder="Write Description"
                  rows={6}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
                  value={specializationDescription}
                  onChange={(e) => setSpecializationDescription(e.target.value)}
                />
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleAddSpecialization}
                  className="px-8 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
    );
};

export default Specialization;