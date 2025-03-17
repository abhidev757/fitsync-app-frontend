export default function BookingDetailsPage() {
    const bookingDetails = {
      clientName: 'John Doe',
      service: 'Yoga',
      date: 'Jan 12, 2024',
      time: '10:00 to 10:30',
      plan: 'Single Session',
    };
  
    return (
      <div className="flex-1 p-6">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl text-white font-semibold mb-6">Booking Details</h2>
          
          <div className="bg-gray p-6 rounded-lg space-y-4">
            {Object.entries(bookingDetails).map(([key, value]) => (
              <div key={key} className="flex">
                <span className="text-gray-400 w-32 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()} :
                </span>
                <span className="text-white">{value}</span>
              </div>
            ))}
            
            <div className="flex justify-end mt-6">
              <button className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }