import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

const classes = {
  container: "flex min-h-screen flex-col",
  main: "flex-1",
};

const MainLayout = () => (
  <div className={classes.container}>
    <Navbar />
    <main className={classes.main}>
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default MainLayout;
