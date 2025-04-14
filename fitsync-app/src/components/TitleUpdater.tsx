import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const TitleUpdater = () => {
  const location = useLocation();
  const path = location.pathname;

  useEffect(() => {
    // Static title mapping
    const titleMap: { [key: string]: string } = {
      '/': 'FitSync | Home',
      '/home': 'FitSync | Home',
      '/about': 'About Us | FitSync',
      '/contact': 'Contact | FitSync',
      '/signin': 'Sign In | FitSync',
      '/signup': 'Sign Up | FitSync',
      '/forgotPassword': 'Forgot Password | FitSync',
      '/OtpVerification': 'OTP Verification | FitSync',
      '/userInfo': 'Complete Your Info | FitSync',
      '/user/dashboard': 'Dashboard | FitSync',
      '/user/userProfile': 'Your Profile | FitSync',
      '/user/userProfileEdit': 'Edit Profile | FitSync',
      '/user/trainersList': 'Browse Trainers | FitSync',
      '/paymentSuccess': 'Payment Success | FitSync',
      '/mySessions': 'My Sessions | FitSync',
      '/admin/adminDashboard': 'Admin Dashboard | FitSync',
      '/admin/userManagement': 'User Management | FitSync',
      '/admin/trainerManagement': 'Trainer Management | FitSync',
      '/trainer/trainerDashboard': 'Trainer Dashboard | FitSync',
      '/trainer/wallet': 'Wallet | FitSync',
      '/trainer/bookings': 'My Bookings | FitSync',
      '/trainer/timeSlots': 'Manage Time Slots | FitSync',
    };

    // Dynamic route patterns (basic detection)
    const dynamicTitles: { pattern: RegExp; title: string }[] = [
      { pattern: /^\/reset-password\/.+$/, title: 'Reset Password | FitSync' },
      { pattern: /^\/trainerReset-password\/.+$/, title: 'Trainer Reset Password | FitSync' },
      { pattern: /^\/trainerDetails\/.+$/, title: 'Trainer Details | FitSync' },
      { pattern: /^\/bookingCheckout\/.+$/, title: 'Booking Checkout | FitSync' },
      { pattern: /^\/userDetails\/.+$/, title: 'User Details | FitSync' },
      { pattern: /^\/trainerVerificationDetails\/.+$/, title: 'Verification Details | FitSync' },
      { pattern: /^\/bookingsDetails\/.+$/, title: 'Booking Info | FitSync' },
    ];

    let title = titleMap[path];

    if (!title) {
      const match = dynamicTitles.find(({ pattern }) => pattern.test(path));
      title = match ? match.title : 'FitSync';
    }

    document.title = title;
  }, [path]);

  return null;
};

export default TitleUpdater;
