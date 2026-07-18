import { Link } from "react-router-dom";
import { SearchX } from "lucide-react";
import Button from "../components/common/Button";
import { PATHS } from "../routes/paths";

const classes = {
  container:
    "flex min-h-[70vh] flex-col items-center justify-center gap-3 text-center",
  icon: "size-12 text-gray-400",
  title: "text-2xl font-bold",
  description: "text-sm text-gray-500",
  button: "mt-2",
};

const NotFound = () => (
  <div className={classes.container}>
    <SearchX className={classes.icon} />
    <h1 className={classes.title}>Page not found</h1>
    <p className={classes.description}>
      The page you're looking for doesn't exist or has been moved.
    </p>
    <Link to={PATHS.home}>
      <Button className={classes.button}>Go to homepage</Button>
    </Link>
  </div>
);

export default NotFound;
