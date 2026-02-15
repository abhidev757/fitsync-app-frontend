import { useEffect, useState } from "react";
import { Calendar, Plus, X } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import { addTimeSlot, deleteTimeSlot, getTimeSlots } from "../../axios/trainerApi";


// interface TimeSlot {
//   time: string;
//   type: "Single Session" | "Package";
// }



interface Testimonial {
  id: number;
  name: string;
  image: string;
  rating: number;
  comment: string;
}

export default function TimeSlots() {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    sessionType: "Single Session",
    startDate: "16/07/2024",
    endDate: "16/07/2024",
    timeSlot: "9:00 AM to 10:00 AM",
    price: "",
    numberOfSessions: "",
  });
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);

  

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Vibin",
      image: "/placeholder.svg?height=80&width=80",
      rating: 5,
      comment:
        '"The custom workout and nutrition plans were exactly what I needed. I\'ve never felt healthier!"',
    },
    {
      id: 2,
      name: "Vibin",
      image: "/placeholder.svg?height=80&width=80",
      rating: 5,
      comment:
        '"The custom workout and nutrition plans were exactly what I needed. I\'ve never felt healthier!"',
    },
    {
      id: 3,
      name: "Sarah M",
      image: "/placeholder.svg?height=80&width=80",
      rating: 5,
      comment:
        '"The custom workout and nutrition plans were exactly what I needed. I\'ve never felt healthier!"',
    },
    {
      id: 4,
      name: "Tomas",
      image: "/placeholder.svg?height=80&width=80",
      rating: 5,
      comment:
        '"The custom workout and nutrition plans were exactly what I needed. I\'ve never felt healthier!"',
    },
  ];

  const timeOptions = [
    "9:00 AM to 10:00 AM",
    "10:00 AM to 11:00 AM",
    "11:00 AM to 12:00 PM",
    "1:00 PM to 2:00 PM",
    "2:00 PM to 3:00 PM",
    "3:00 PM to 4:00 PM",
  ];


  interface DaySchedule {
    date: string;       
    slots: {
      time: string;     
      type: string;
      id: string;     
    }[];
  }

  const [isLoading, setIsLoading] = useState(false);
  const [timeSlots, setTimeSlots] = useState<DaySchedule[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);


  useEffect(() => {
    const fetchTimeSlots = async () => {
      try {
        const { data } = await getTimeSlots();
        console.log('API Response:', data); 
        setTimeSlots(data); 
      } catch (error) {
        toast.error("Failed to load time slots");
        console.error(error);
      } finally {
        setIsLoadingSlots(false);
      }
    };
    fetchTimeSlots();
  }, []);

  

    // Handle slot deletion
  const handleDeleteSlot = async (slotId: string) => {
  // 1. Create a loading toast
  const id = toast.loading("Deleting time slot...");

  try {
    await deleteTimeSlot(slotId);

    // 2. Update state
    setTimeSlots(prev => prev.map(day => ({
      ...day,
      slots: day.slots.filter(s => s.id !== slotId)
    })).filter(day => day.slots.length > 0));

    // 3. Update the toast to Success
    toast.update(id, {
      render: "Time slot deleted successfully",
      type: "success",
      isLoading: false,
      autoClose: 3000,
    });
  } catch (error) {
    console.log(error)
    // 4. Update the toast to Error
    toast.update(id, {
      render: "Failed to delete slot",
      type: "error",
      isLoading: false,
      autoClose: 3000,
    });
  }
};

  
  const toInputFormat = (displayDate: string) => {
    const [day, month, year] = displayDate.split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  };

 
  const toDisplayFormat = (inputDate: string) => {
    const [year, month, day] = inputDate.split("-");
    return `${day}/${month}/${year}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSessionTypeChange = (type: string) => {
    setFormData({
      ...formData,
      sessionType: type,
    });
  };

  const handleTimeSlotSelect = (time: string) => {
    setFormData({
      ...formData,
      timeSlot: time,
    });
    setShowTimeDropdown(false);
  };

  const confirmDelete = (slotId: string) => {
  const toastId = toast.info(
    <div>
      <p className="mb-2 font-semibold">Delete this time slot?</p>
      <div className="flex gap-2">
        <button
          onClick={() => {
            handleDeleteSlot(slotId);
            toast.dismiss(toastId); // Close the confirmation toast
          }}
          className="bg-red-600 text-white px-3 py-1 rounded text-xs"
        >
          Confirm
        </button>
        <button
          onClick={() => toast.dismiss(toastId)}
          className="bg-gray-500 text-white px-3 py-1 rounded text-xs"
        >
          Cancel
        </button>
      </div>
    </div>,
    {
      autoClose: false, // Don't close until user interacts
      closeOnClick: false,
      draggable: false,
    }
  );
};

  const handleSubmit = async () => {
    // Validate form
    if (!formData.timeSlot) {
      toast.error("Please select a time slot");
      return;
    }

    if (!formData.price) {
      toast.error("Please enter a price");
      return;
    }

    if (formData.sessionType === "Package" && !formData.numberOfSessions) {
      toast.error("Please specify number of sessions for packages");
      return;
    }
    setIsLoading(true);

    try {
      const requestData = {
        sessionType: formData.sessionType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        time: formData.timeSlot,
        price: formData.price,
        numberOfSessions: formData.numberOfSessions || null,
      };
      

      // Show loading state
      await addTimeSlot(requestData);
      toast.success("Time slot added successfully!");

      const { data } = await getTimeSlots();
      setTimeSlots(data);

      setShowModal(false);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to add time slot");
    } finally {
      setIsLoading(false);
    }
  };


  // Render function
const renderTimeSlots = () => {
  if (isLoadingSlots) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (timeSlots.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-white text-lg">No time slots available</p>
        <button 
          onClick={() => setShowModal(true)}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Add First Time Slot
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {timeSlots.map((day) => (
        <div key={day.date} className="bg-gray-900 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-white">{day.date}</h3>
            <button 
              onClick={() => setShowModal(true)}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              + Add Slot
            </button>
          </div>
          
          <div className="space-y-3">
            {day.slots.map((slot) => (
              <div key={`${day.date}-${slot.time}`} className="bg-blue-500/90 p-3 rounded-lg relative group">
                <button 
                  onClick={() => confirmDelete(slot.id)}
                  className="absolute top-2 right-2 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete slot"
                >
                  <X size={16} />
                </button>
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">{slot.time}</span>
                  <span className="text-white/90 text-sm bg-blue-600 px-2 py-1 rounded">
                    {slot.type}
                  </span>
                </div>
                {/* Additional slot info can go here */}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

  return (
    <div className="flex min-h-screen bg-gray">
      {/* Main Content */}
      <div className="flex-1">
        {/* Time Slots Content */}
        <div className="p-6">
          <div className="bg-gray-800 p-6 rounded-lg">
          <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-white">Time Slots</h2>
          <div className="flex space-x-4">
            {/* Date picker remains the same */}
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
            >
              <Plus size={18} className="mr-1" />
              Add New
            </button>
          </div>
        </div>
            
            {renderTimeSlots()}
      
          </div>
          

          {/* Testimonials */}
          <div className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="bg-gray-800 p-4 rounded-lg"
                >
                  <div className="flex flex-col items-center">
                    <img
                      src={testimonial.image || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full mb-2"
                    />
                    <h4 className="text-white font-medium">
                      {testimonial.name}
                    </h4>
                    <div className="flex text-yellow-400 my-2">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                    <p className="text-gray-300 text-sm text-center">
                      {testimonial.comment}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-4">
              <button className="text-white hover:underline">see more</button>
            </div>
          </div>
        </div>
      </div>

      {/* Add New Time Slot Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">
                Add New Time Slot
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400"
              >
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
                    checked={formData.sessionType === "Single Session"}
                    onChange={() => handleSessionTypeChange("Single Session")}
                    className="mr-2"
                  />
                  <span className="text-white">Single Session</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="sessionType"
                    checked={formData.sessionType === "Package"}
                    onChange={() => handleSessionTypeChange("Package")}
                    className="mr-2"
                  />
                  <span className="text-white">Package</span>
                </label>
              </div>

              {/* Number of Sessions (only shown for Package) */}
              {formData.sessionType === "Package" && (
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
              <div className="flex items-center justify-between mb-4">
                <label className="text-white">Start Date:</label>
                <div className="relative">
                  {/* Visible display input (read-only) */}
                  <input
                    type="text"
                    value={formData.startDate}
                    readOnly
                    className="bg-gray-700 text-white p-2 rounded-md w-40"
                  />

                  {/* Hidden but clickable date input */}
                  <input
                    type="date"
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    value={toInputFormat(formData.startDate)}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        startDate: toDisplayFormat(e.target.value),
                        // Auto-update end date if it's before start date
                        endDate:
                          e.target.value > toInputFormat(formData.endDate)
                            ? formData.endDate
                            : toDisplayFormat(e.target.value),
                      });
                    }}
                  />

                  <Calendar
                    size={16}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>

              {/* End Date */}
              <div className="flex items-center justify-between mb-4">
                <label className="text-white">End Date:</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.endDate}
                    readOnly
                    className="bg-gray-700 text-white p-2 rounded-md w-40"
                  />
                  <input
                    type="date"
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    value={toInputFormat(formData.endDate)}
                    min={toInputFormat(formData.startDate)} // Can't be before start date
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        endDate: toDisplayFormat(e.target.value),
                      });
                    }}
                  />
                  <Calendar
                    size={16}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
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
                            time === formData.timeSlot ? "bg-red-500" : ""
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
                  disabled={isLoading}
                  className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors disabled:bg-blue-400"
                >
                  {isLoading ? "Submitting..." : "Submit"}
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
