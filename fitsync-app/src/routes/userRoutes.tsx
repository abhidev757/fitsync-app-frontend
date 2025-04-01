import { Route } from "react-router-dom";
import App from "../App";

// Public pages
import Homepage from "../pages/user/Homepage";
import Aboutpage from "../pages/user/Aboutpage";
import ContactPage from "../pages/user/Contactpage";
import SigninPage from "../pages/user/SigninPage";
import SignupPage from "../pages/user/SignupPage";
import UserOTPVerificationPage from "../pages/user/OTPVerificationPage";
import ForgotPasswordPage from "../pages/user/ForgotPasswordPage";
import ResetPasswordPage from "../pages/user/resetPassword";
import UserInfoPage from "../pages/user/UserInfoPage";
import Dashboard from "../pages/user/Dashboard";
import UserProfile from "../pages/user/UserProfile"
import UserProfileEdit from "../pages/user/UserProfileEdit"
import Layout from "../components/user/Layout";
import PrivateRoute from "../pages/user/PrivateRoute";
import TrainersList from "../pages/user/TrainerList";
import TrainerDetails from "../pages/user/TrainerDetailsPage";
import BookingCheckout from "../pages/user/TrainerBookingCheckout";
import PaymentSuccess from "../pages/user/BookingSuccess";
import MySessions from "../pages/user/MySessions";

const userRoutes = (
  <Route path="/" element={<App />}>
    <Route index element={<Homepage />} /> 

    {/* Public Routes */}
    <Route path="home" element={<Homepage />} />
    <Route path="about" element={<Aboutpage />} />
    <Route path="contact" element={<ContactPage />} />
    <Route path="signin" element={<SigninPage />} />
    <Route path="signup" element={<SignupPage />} />
    <Route path="forgotPassword" element={<ForgotPasswordPage />} />
    <Route path="reset-password/:token" element={<ResetPasswordPage />} />
    <Route path="OtpVerification" element={<UserOTPVerificationPage />} />
    <Route path="userInfo" element={<UserInfoPage />} />
    
    {/*Private Routes*/}
    <Route element={<PrivateRoute/>} >
    {/*pages under Layout */}
    <Route path="user" element={<Layout/>} >
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="userProfile" element={<UserProfile />} />
    <Route path="userProfileEdit" element={<UserProfileEdit />} />
    <Route path="trainersList" element={<TrainersList />} />
    <Route path="trainerDetails/:id" element={<TrainerDetails />} />
    <Route path="bookingCheckout/:id" element={<BookingCheckout />} />
    <Route path="paymentSuccess" element={<PaymentSuccess />} />
    <Route path="mySessions" element={<MySessions />} />
    </Route>
    </Route>
  </Route>
);

export default userRoutes;
