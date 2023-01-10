import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const GuestRoute = ({ Comp }) => {
  const { user, isAuth } = useSelector((state) => state.auth);
  if (isAuth) {
    return <Navigate to="/rooms" />;
  }
  return <Comp />;
};

export default GuestRoute;
