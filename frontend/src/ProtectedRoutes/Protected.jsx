import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Protected = ({ Comp }) => {
  const { user, isAuth } = useSelector((state) => state.auth);
  if (!isAuth) {
    return <Navigate to="/" />;
  } else if (isAuth && !user.activated) {
    return <Navigate to="/activate" />;
  }
  return <Comp />;
};

export default Protected;
