import { useState } from 'react';
import { Calendar, Clock, X } from 'lucide-react';

interface TimeSlot {
  time: string;
  type: 'Single Session' | 'Package';
}

interface DaySchedule {
  date: string;
  slots: TimeSlot[];
}

interface Testimonial {
  id: number;
  name: string;
  image: string;
  rating: number;
  comment: string;
}

export default function TimeSlots() {
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('16/07/2024');
  const [formData, setFormData] = useState({
    sessionType: 'Single Session',
    startDate: '16/07/2024',
    endDate: '16/07/2024',
    timeSlot: '9:00 AM to 10:00 AM',
    price: '',
    numberOfSessions: '' // Add this new field
  });
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);

  // ... rest of your existing code ...

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSessionTypeChange = (type: string) => {
    setFormData({
      ...formData,
      sessionType: type,
      // Reset number of sessions when switching between types
      numberOfSessions: type === 'Package' ? formData.numberOfSessions : ''
    });
  };

  // ... rest of your existing code ...

  return (
    <div className="flex min-h-screen bg-gray">
      {/* Main Content - same as before ... */}

      {/* Add New Time Slot Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Add New Time Slot</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Session Type */}
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="sessionType"
                    checked={formData.sessionType === 'Single Session'}
                    onChange={() => handleSessionTypeChange('Single Session')}
                    className="mr-2"
                  />
                  <span className="text-white">Single Session</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="sessionType"
                    checked={formData.sessionType === 'Package'}
                    onChange={() => handleSessionTypeChange('Package')}
                    className="mr-2"
                  />
                  <span className="text-white">Package</span>
                </label>
              </div>

              {/* Number of Sessions (only shown for Package) */}
              {formData.sessionType === 'Package' && (
                <div className="flex items-center justify-between">
                  <label className="text-white">No. of Sessions</label>
                  <input
                    type="number"
                    name="numberOfSessions"
                    value={formData.numberOfSessions}
                    onChange={handleInputChange}
                    className="bg-gray-700 text-white p-2 rounded-md w-40"
                    min="1"
                  />
                </div>
              )}

              {/* Start Date */}
              <div className="flex items-center justify-between">
                <label className="text-white">Start Date :</label>
                <div className="relative">
                  <input
                    type="text"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="bg-gray-700 text-white p-2 rounded-md w-40"
                  />
                  <Calendar size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* End Date */}
              <div className="flex items-center justify-between">
                <label className="text-white">End Date :</label>
                <div className="relative">
                  <input
                    type="text"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="bg-gray-700 text-white p-2 rounded-md w-40"
                  />
                  <Calendar size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Available Time Slots */}
              <div className="flex items-center justify-between">
                <label className="text-white">Available Time Slots</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                    className="bg-gray-700 text-white p-2 rounded-md w-40 text-left"
                  >
                    {formData.timeSlot}
                  </button>
                  {showTimeDropdown && (
                    <div className="absolute right-0 mt-1 w-48 bg-gray-700 rounded-md shadow-lg z-10">
                      {timeOptions.map((time, index) => (
                        <div
                          key={index}
                          className={`px-4 py-2 text-white hover:bg-gray-600 cursor-pointer ${
                            time === formData.timeSlot ? 'bg-red-500' : ''
                          }`}
                          onClick={() => handleTimeSlotSelect(time)}
                        >
                          {time}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between">
                <label className="text-white">Price</label>
                <input
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="bg-gray-700 text-white p-2 rounded-md w-40"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-center space-x-4 mt-6">
                <button
                  onClick={handleSubmit}
                  className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Submit
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}