import { createRoutesFromElements, Route } from 'react-router-dom';
import userRoutes from './userRoutes';
import trainerRoutes from './trainerRoutes';
import adminRoutes from './adminRoutes'
import VideoCall from '../pages/VideoCall';

const appRoutes = createRoutesFromElements(
  <>

    {/* Common/Shared Routes */}
    <Route path="/video-call/:sessionId" element={<VideoCall />} />

    {userRoutes}
    {trainerRoutes}
    {adminRoutes}
  </>
);

export default appRoutes;
