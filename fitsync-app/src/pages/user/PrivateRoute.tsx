import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import { refreshToken } from "../../axios/userApi";
import { logout } from "../../slices/authSlice";

const PrivateRoute: React.FC = () => {
  const { userInfo } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [isTokenValid, setIsTokenValid] = useState<boolean>(!!userInfo);

  useEffect(() => {
    const verifyToken = async () => {
      if (userInfo) {
        console.log("Private route checking the refresh token...");
        try {
          await refreshToken();
          setIsTokenValid(true);
        } catch (error) {
          console.error("Token refresh failed:", error);
          setIsTokenValid(false);
          dispatch(logout())
        }
      }
    };

    verifyToken();
    const intervalId = setInterval(verifyToken, 14 * 60 * 1000); 

    return () => clearInterval(intervalId);
  }, [userInfo, dispatch]);

  if (!isTokenValid || !userInfo) {
    return <Navigate to="/signin" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;