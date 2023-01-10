import "./App.css";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

/**Pages Import */
import Home from "./pages/Home/Home";
import RootLayout from "./layouts/RootLayout";
import Authenticate from "./pages/Authenticate/Authenticate";
import Activate from "./pages/Activate/Activate";
import Rooms from "./pages/Rooms/Rooms";

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
    </Route>
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
