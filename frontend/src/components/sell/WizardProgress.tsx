import clsx from "clsx";
import { Check } from "lucide-react";

export interface WizardProgressProps {
  steps: string[];
  currentStep: number;
}

const classes = {
  container: "mb-8 flex items-center",
  step: "flex flex-1 items-center last:flex-none",
  stepInner: "flex flex-col items-center gap-1",
  circleBase:
    "flex size-8 items-center justify-center rounded-full text-xs font-semibold",
  circleDone: "bg-brand-600 text-white",
  circleCurrent: "border-2 border-brand-600 text-brand-600",
  circleUpcoming: "border-2 border-gray-200 text-gray-400 dark:border-gray-700",
  checkIcon: "size-4",
  label: "hidden text-[11px] text-gray-500 sm:block",
  connectorBase: "mx-1 h-0.5 flex-1",
  connectorDone: "bg-brand-600",
  connectorUpcoming: "bg-gray-200 dark:bg-gray-700",
};

const WizardProgress = ({ steps, currentStep }: WizardProgressProps) => (
  <div className={classes.container}>
    {steps.map((step, idx) => (
      <div key={step} className={classes.step}>
        <div className={classes.stepInner}>
          <div
            className={clsx(
              classes.circleBase,
              idx < currentStep
                ? classes.circleDone
                : idx === currentStep
                  ? classes.circleCurrent
                  : classes.circleUpcoming,
            )}
          >
            {idx < currentStep ? (
              <Check className={classes.checkIcon} />
            ) : (
              idx + 1
            )}
          </div>
          <span className={classes.label}>{step}</span>
        </div>
        {idx < steps.length - 1 && (
          <div
            className={clsx(
              classes.connectorBase,
              idx < currentStep
                ? classes.connectorDone
                : classes.connectorUpcoming,
            )}
          />
        )}
      </div>
    ))}
  </div>
);

export default WizardProgress;
