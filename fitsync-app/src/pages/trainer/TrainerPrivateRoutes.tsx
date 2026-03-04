import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import { refreshToken } from "../../axios/trainerApi";
import { logoutTrainer, setTrainerCredentials } from "../../slices/trainerAuthSlice";

const PrivateRoute: React.FC = () => {
  const { trainerInfo } = useSelector((state: RootState) => state.trainerAuth);
  const dispatch = useDispatch();
  const [isTokenValid, setIsTokenValid] = useState<boolean>(!!trainerInfo);

  useEffect(() => {
    const verifyToken = async () => {
      if (trainerInfo) {
        console.log("Private route checking the refresh token...");
        try {
          const response = await refreshToken();
          // The backend now sends the fresh trainer object via response.trainer
          if (response?.trainer) {
            // Update Redux if the updated info differs (like verificationStatus)
            if (response.trainer.verificationStatus !== trainerInfo.verificationStatus) {
              dispatch(setTrainerCredentials(response.trainer));
            }
          }
          setIsTokenValid(true);
        } catch (error) {
          console.error("Token refresh failed:", error);
          setIsTokenValid(false);
          dispatch(logoutTrainer())
        }
      }
    };

    verifyToken();
    const intervalId = setInterval(verifyToken, 14 * 60 * 1000); // Refresh every 14 minutes

    return () => clearInterval(intervalId);
  }, [trainerInfo, dispatch]);

  if (!isTokenValid || !trainerInfo) {
    console.log('Token Validation:',isTokenValid);
    console.log('Trainer Info:',trainerInfo);
    
    return <Navigate to="/trainerSignin" replace />;
  }

  if (trainerInfo.verificationStatus === false) {
    return <Navigate to="/verificationStatus" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;