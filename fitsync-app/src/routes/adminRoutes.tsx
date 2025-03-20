import { Route } from "react-router-dom";
import App from "../App";
import Layout from "../components/admin/Layout";

// Public pages
import Homepage from "../pages/user/Homepage";
import AdminLogin from '../pages/admin/Login'
import AdminLDashboard from '../pages/admin/Dashboard'
import AdminUserManagement from '../pages/admin/UserManagement'
import AdminTrainerManagement from '../pages/admin/TrainerManagement'
import TrainerDetails from '../pages/admin/TrainerDetails'
import UserDetails from '../pages/admin/UserDetails'
import TrainerVerification from "../pages/admin/TrainerVerification"
import TrainerVerificationDetails from "../pages/admin/TrainerVerificationDetails"
import Specialization from "../pages/admin/Specilization";

const adminRoutes = (
  <Route path="/" element={<App />}>
    <Route index element={<Homepage />} /> 

    {/* Public Routes */}
    <Route path="adminLogin" element={<AdminLogin />} />

    <Route path="admin" element={<Layout/>}>
    <Route path="adminDashboard" element={<AdminLDashboard />} />
    <Route path="userManagement" element={<AdminUserManagement />} />
    <Route path="trainerManagement" element={<AdminTrainerManagement />} />
    <Route path="trainerDetails" element={<TrainerDetails />} />
    <Route path="userDetails/:id" element={<UserDetails />} />
    <Route path="trainerDetails/:id" element={<TrainerDetails />} />
    <Route path="trainerVerification" element={<TrainerVerification />} />
    <Route path="trainerVerificationDetails/:id" element={<TrainerVerificationDetails />} />
    <Route path="specialization" element={<Specialization />} />
    </Route>
    
  </Route>
);

export default adminRoutes;
