import { useEffect, useState, type FormEvent } from "react";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import api from "../../api/api";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";
import type { ApiResponse } from "../../types/api";

interface SettingsData {
  emailFrom: string;
}

const classes = {
  title: "mb-4 text-lg font-semibold",
  card: "max-w-lg rounded-xl border border-gray-200 bg-white p-5",
  description: "mb-4 text-sm text-gray-500",
  form: "space-y-4",
  submitButton: "mt-2",
};

const Settings = () => {
  const [emailFrom, setEmailFrom] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get<ApiResponse<SettingsData>>("/admin/settings")
      .then(({ data }) => setEmailFrom(data.data.emailFrom))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch("/admin/settings", { emailFrom });
      toast.success("Settings updated");
    } catch (err) {
      toast.error(
        (isAxiosError<{ message?: string }>(err) &&
          err.response?.data?.message) ||
          "Could not update settings",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner full />;

  return (
    <div>
      <h2 className={classes.title}>Settings</h2>
      <div className={classes.card}>
        <p className={classes.description}>
          The email address that outgoing emails — verification, password
          reset, notifications — are sent from.
        </p>
        <form onSubmit={handleSubmit} className={classes.form}>
          <Input
            label="Email From"
            type="email"
            placeholder="no-reply@mobilesales.local"
            value={emailFrom}
            onChange={(e) => setEmailFrom(e.target.value)}
            required
          />
          <Button
            type="submit"
            loading={saving}
            className={classes.submitButton}
          >
            Save
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
