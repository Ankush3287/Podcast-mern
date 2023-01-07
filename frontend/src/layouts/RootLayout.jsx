import Navigation from "../components/shared/Navigation/Navigation";
import { Outlet } from "react-router-dom";

const RootLayout = () => {
  return (
    <>
      <header>
        <Navigation />
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
};

export default RootLayout;
