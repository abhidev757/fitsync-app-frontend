import { createRoutesFromElements, Route } from 'react-router-dom';
import userRoutes from './userRoutes';
import trainerRoutes from './trainerRoutes';
import adminRoutes from './adminRoutes'
import VideoCall from '../pages/VideoCall';
import NotFound from '../pages/NotFound';

const appRoutes = createRoutesFromElements(
  <>

    {/* Common/Shared Routes */}
    <Route path="/video-call/:sessionId" element={<VideoCall />} />

    {userRoutes}
    {trainerRoutes}
    {adminRoutes}
    
    {/* 404 Route - Must be last */}
    <Route path="*" element={<NotFound />} />
  </>
);

export default appRoutes;
