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
import Register from "./pages/Register/Register";
import Login from "./pages/Login/Login";

/**Root Routes */
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route index element={<Home />} />
      <Route path="register" element={<Register />} />
      <Route path="login" element={<Login />} />
    </Route>
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
