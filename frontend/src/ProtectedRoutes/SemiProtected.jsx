import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const SemiProtected = ({ Comp }) => {
  const { user, isAuth } = useSelector((state) => state.auth);
  if (!isAuth) {
    return <Navigate to="/" />;
  } else if (isAuth && !user.activated) {
    return <Comp />;
  }
  return <Navigate to="/rooms" />;
};

export default SemiProtected;
