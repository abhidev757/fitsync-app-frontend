import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const TitleUpdater = () => {
  const location = useLocation();
  const path = location.pathname;

  useEffect(() => {
    // Stylized Elite Static title mapping
    const titleMap: { [key: string]: string } = {
      '/': 'FITSYNC | Elite Evolution',
      '/home': 'FITSYNC | Elite Evolution',
      '/about': 'FITSYNC | Our Protocol',
      '/contact': 'FITSYNC | Communications',
      '/signin': 'FITSYNC | Initialize Session',
      '/signup': 'FITSYNC | Create Identity',
      '/forgotPassword': 'FITSYNC | Recover Credentials',
      '/OtpVerification': 'FITSYNC | 2FA Gateway',
      '/userInfo': 'FITSYNC | Bio-Metric Config',
      '/user/dashboard': 'FITSYNC | Member Dashboard',
      '/user/userProfile': 'FITSYNC | Personal Dossier',
      '/user/userProfileEdit': 'FITSYNC | Update Identity Logs',
      '/user/trainersList': 'FITSYNC | Explore Elite Roster',
      '/user/userWallet': 'FITSYNC | Asset Hub',
      '/user/mySessions': 'FITSYNC | Performance History',
      '/paymentSuccess': 'FITSYNC | Transaction Verified',
      '/adminLogin': 'FITSYNC ADMIN | Security Gateway',
      '/admin/adminDashboard': 'FITSYNC ADMIN | System Overview',
      '/admin/userManagement': 'FITSYNC ADMIN | Member Database',
      '/admin/trainerManagement': 'FITSYNC ADMIN | Expert Roster',
      '/admin/specialization': 'FITSYNC ADMIN | Domain Protocol',
      '/admin/trainerVerification': 'FITSYNC ADMIN | Background Checks',
      '/admin/payments': 'FITSYNC ADMIN | Financial Logs',
      '/trainerSignin': 'FITSYNC OPS | Expert Portal',
      '/trainerSignup': 'FITSYNC OPS | Personnel Integration',
      '/trainer/trainerDashboard': 'FITSYNC OPS | Command Center',
      '/trainer/wallet': 'FITSYNC OPS | Asset Treasury',
      '/trainer/bookings': 'FITSYNC OPS | Deployment Logs',
      '/trainer/trainerLiveSessions': 'FITSYNC OPS | Active Deployments',
      '/trainer/timeSlots': 'FITSYNC OPS | Schedule Matrices',
      '/trainer/verificationStatus': 'FITSYNC OPS | Clearance Status',
      '/trainer/trainerProfile': 'FITSYNC OPS | Expert Identity',
      '/trainer/trainerChat': 'FITSYNC OPS | Secure Comms',
      '/trainer/trainerReviews': 'FITSYNC OPS | Evaluation Logs',
    };

    const dynamicTitles: { pattern: RegExp; title: string }[] = [
      { pattern: /^\/reset-password\/.+$/, title: 'FITSYNC | Reset Security Key' },
      { pattern: /^\/trainerReset-password\/.+$/, title: 'FITSYNC OPS | Reset Security Key' },
      { pattern: /^\/user\/trainerDetails\/.+$/, title: 'FITSYNC | Expert Profile' },
      { pattern: /^\/trainerDetails\/.+$/, title: 'FITSYNC | Expert Profile' },
      { pattern: /^\/bookingCheckout\/.+$/, title: 'FITSYNC | Authorize Deployment' },
      { pattern: /^\/admin\/userDetails\/.+$/, title: 'FITSYNC ADMIN | Member Profile' },
      { pattern: /^\/admin\/trainerVerificationDetails\/.+$/, title: 'FITSYNC ADMIN | Background Check' },
      { pattern: /^\/admin\/trainerDetails\/.+$/, title: 'FITSYNC ADMIN | Expert Profile' },
      { pattern: /^\/userDetails\/.+$/, title: 'FITSYNC ADMIN | Member Profile' },
      { pattern: /^\/trainerVerificationDetails\/.+$/, title: 'FITSYNC ADMIN | Background Check' },
      { pattern: /^\/bookingsDetails\/.+$/, title: 'FITSYNC | Mission Details' },
      { pattern: /^\/user\/bookingDetails\/.+$/, title: 'FITSYNC | Deployment Briefing' },
      { pattern: /^\/user\/chat\/.+$/, title: 'FITSYNC | Secure Comms' },
      { pattern: /^\/trainer\/chat\/.+$/, title: 'FITSYNC OPS | Secure Comms' },
      { pattern: /^\/video-call\/.+$/, title: 'FITSYNC | Live Uplink' },
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
