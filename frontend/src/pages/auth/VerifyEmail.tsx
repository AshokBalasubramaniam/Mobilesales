import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import api from "../../api/api";
import Spinner from "../../components/common/Spinner";
import { PATHS } from "../../routes/paths";

type VerifyStatus = "loading" | "success" | "error";

const classes = {
  container: "text-center",
  successIcon: "mx-auto mb-3 size-12 text-green-500",
  errorIcon: "mx-auto mb-3 size-12 text-red-500",
  title: "text-xl font-bold",
  description: "mt-1 text-sm text-gray-500",
  homeLink:
    "mt-6 inline-block text-sm font-medium text-brand-600 hover:underline",
};

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<VerifyStatus>("loading");

  useEffect(() => {
    if (!token) return setStatus("error");
    api
      .post("/auth/verify-email", { token })
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token]);

  if (status === "loading") return <Spinner full />;

  return (
    <div className={classes.container}>
      {status === "success" ? (
        <>
          <CheckCircle2 className={classes.successIcon} />
          <h1 className={classes.title}>Email verified!</h1>
          <p className={classes.description}>
            Your email has been verified successfully.
          </p>
        </>
      ) : (
        <>
          <XCircle className={classes.errorIcon} />
          <h1 className={classes.title}>Verification failed</h1>
          <p className={classes.description}>
            This link is invalid or has expired.
          </p>
        </>
      )}
      <Link to={PATHS.home} className={classes.homeLink}>
        Go to homepage
      </Link>
    </div>
  );
};

export default VerifyEmail;
