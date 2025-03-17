import { createRoutesFromElements } from 'react-router-dom';
import userRoutes from './userRoutes';
import trainerRoutes from './trainerRoutes';
import adminRoutes from './adminRoutes'

const appRoutes = createRoutesFromElements(
  <>
    {userRoutes}
    {trainerRoutes}
    {adminRoutes}
  </>
);

export default appRoutes;
