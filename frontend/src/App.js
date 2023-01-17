import "./App.css";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { useLoadingWithRefresh } from "./hooks/useLoadingWithRefresh";
import Loader from "./components/shared/Loader/Loader";

/**Pages Import */
import Home from "./pages/Home/Home";
import RootLayout from "./layouts/RootLayout";
import Authenticate from "./pages/Authenticate/Authenticate";
import Activate from "./pages/Activate/Activate";
import Rooms from "./pages/Rooms/Rooms";
import Room from "./pages/Room/Room";

/**Protected Routes */
import GuestRoute from "./ProtectedRoutes/GuestRoute";
import SemiProtected from "./ProtectedRoutes/SemiProtected";
import Protected from "./ProtectedRoutes/Protected";

/**Root Routes */
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route index element={<GuestRoute Comp={Home} />} />
      <Route path="authenticate" element={<GuestRoute Comp={Authenticate} />} />
      <Route path="activate" element={<SemiProtected Comp={Activate} />} />
      <Route path="rooms" element={<Protected Comp={Rooms} />} />
      <Route path="room/:id" element={<Protected Comp={Room} />} />
    </Route>
  )
);

function App() {
  const { loading } = useLoadingWithRefresh();
  return loading ? (
    <Loader message="Loading, Please wait!" />
  ) : (
    <RouterProvider router={router} />
  );
}

export default App;
