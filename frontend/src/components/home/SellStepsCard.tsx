import { useNavigate } from "react-router-dom";
import Button from "../common/Button";
import { PATHS } from "../../routes/paths";

const STEPS = [
  {
    n: 1,
    title: "Get Instant Quote",
    description: "Enter device details & get the best price",
  },
  {
    n: 2,
    title: "Schedule Pickup",
    description: "We'll pick up your device",
  },
  {
    n: 3,
    title: "Get Paid Instantly",
    description: "Receive payment securely",
  },
];

const classes = {
  card: "rounded-xl border border-gray-100 bg-white p-4 shadow-sm",
  header:
    "mb-3 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between",
  title: "font-display text-sm font-bold text-gray-900",
  list: "flex flex-col gap-3",
  step: "flex items-start gap-3",
  stepBadge:
    "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white",
  stepTitle: "text-xs font-semibold text-brand-600",
  stepDescription: "text-xs text-gray-500",
};

const SellStepsCard = () => {
  const navigate = useNavigate();

  return (
    <div className={classes.card}>
      <div className={classes.header}>
        <h3 className={classes.title}>Sell Your Device in 3 Easy Steps</h3>
        <Button size="sm" onClick={() => navigate(PATHS.sell)}>
          Start Selling
        </Button>
      </div>
      <div className={classes.list}>
        {STEPS.map((step) => (
          <div key={step.n} className={classes.step}>
            <span className={classes.stepBadge}>{step.n}</span>
            <div>
              <p className={classes.stepTitle}>
                {step.n}. {step.title}
              </p>
              <p className={classes.stepDescription}>{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SellStepsCard;
