import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { PATHS } from "../routes/paths";

const classes = {
  container: "flex min-h-screen flex-col",
  main: "flex-1",
};

const MainLayout = () => {
  const { pathname } = useLocation();
  // My Account pages are app-style (sidebar + content) — no marketing footer.
  const hideFooter =
    pathname === PATHS.buyer.root ||
    pathname.startsWith(`${PATHS.buyer.root}/`);

  // Pages fade in on navigation. Sections with their own nested layout
  // (My Account, chat) are keyed by section only, so moving inside them
  // doesn't remount the sidebar / conversation list.
  const section = pathname.split("/")[1];
  const transitionKey = ["account", "chat"].includes(section)
    ? section
    : pathname;

  return (
    <div className={classes.container}>
      <Navbar />
      <main className={classes.main}>
        <div key={transitionKey} className="animate-fade-in">
          <Outlet />
        </div>
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
