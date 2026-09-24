import clsx from "clsx";
import { Check } from "lucide-react";

export interface WizardProgressProps {
  steps: string[];
  currentStep: number;
}

const classes = {
  container: "mx-auto flex max-w-3xl items-start",
  stepInner: "flex w-16 shrink-0 flex-col items-center gap-1.5 text-xs",
  labelActive: "font-semibold text-brand-600",
  labelUpcoming: "text-gray-500",
  circleBase:
    "flex size-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
  circleDone: "border-brand-500 bg-brand-500 text-white",
  circleCurrent: "border-brand-500 bg-white text-brand-600 shadow-[0_0_0_4px] shadow-brand-100",
  circleUpcoming: "border-gray-300 bg-white text-gray-400",
  checkIcon: "size-4",
  connectorBase: "mt-5 h-0.5 flex-1 rounded-full transition-colors",
  connectorDone: "bg-brand-500",
  connectorUpcoming: "bg-gray-200",
};

const WizardProgress = ({ steps, currentStep }: WizardProgressProps) => (
  <div className={classes.container}>
    {steps.map((step, idx) => (
      <div key={step} className="contents">
        <div
          className={clsx(
            classes.stepInner,
            idx <= currentStep ? classes.labelActive : classes.labelUpcoming,
          )}
        >
          <span
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
          </span>
          {step}
        </div>
        {idx < steps.length - 1 && (
          <span
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
