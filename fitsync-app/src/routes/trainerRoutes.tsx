import { Route } from "react-router-dom";
import App from "../App";

// Public pages
import Homepage from "../pages/user/Homepage";
import SigninPage from "../pages/trainer/TrainerSigninPage";
import SignupPage from "../pages/trainer/TrainerSignupPage";
import TrainerDashboard from "../pages/trainer/TrainerDashboard";
import TrainerOTPVerificationPage from "../pages/trainer/TrainerOTPVerification";
import TrainerResetPassword from '../pages/trainer/TrainerResetPassword'
import TrainerForgotPassword from '../pages/trainer/TrainerForgotPassword'
import TrainerProfile from "../pages/trainer/TrainerProfile";
import TrainerLayout from "../components/trainer/TrainerLayout";
import TrainerPrivateRoute from "../pages/trainer/TrainerPrivateRoutes";
import BookingsPage from "../pages/trainer/Bookings";
import BookingDetailsPage from "../pages/trainer/BookingDetails";
import WalletPage from "../pages/trainer/Wallet";
import VerificationStatus from "../pages/trainer/VerificationStatus";
import TimeSlots from "../pages/trainer/TimeSlots";
import TrainerChat from "../pages/trainer/TrainerChat";
import TrainerLiveSessions from "../pages/trainer/TrainerLiveSessions";

const trainerRoutes = (
  <Route path="/" element={<App />}>
    <Route index element={<Homepage />} /> 

    {/* Public Routes */}
    <Route path="trainerSignin" element={<SigninPage />} />
    <Route path="trainerSignup" element={<SignupPage />} />
    <Route path="trainerReset-password/:token" element={<TrainerResetPassword />} />
    <Route path="trainerForgotPassword" element={<TrainerForgotPassword />} />
    <Route path="trainerotpVerification" element={<TrainerOTPVerificationPage />} />
    <Route path="verificationStatus" element={<VerificationStatus />} />
    <Route element={<TrainerPrivateRoute/>} >
    <Route path="trainer" element={<TrainerLayout/>}>
    <Route path="trainerDashboard" element={<TrainerDashboard />} />
    <Route path="trainerProfile" element={<TrainerProfile />} />
    <Route path="bookings" element={<BookingsPage />} />
    <Route path="bookingsDetails/:bookingId" element={<BookingDetailsPage />} />
    <Route path="wallet" element={<WalletPage />} />
    <Route path="timeSlots" element={<TimeSlots />} />
    <Route path="trainerChat" element={<TrainerChat />} />
    <Route path="trainerLiveSessions" element={<TrainerLiveSessions />} />
    </Route>
    </Route>
  </Route>
);

export default trainerRoutes;
