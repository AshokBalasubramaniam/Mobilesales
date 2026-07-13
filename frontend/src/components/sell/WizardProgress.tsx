import clsx from 'clsx';
import { Check } from 'lucide-react';

export interface WizardProgressProps {
  steps: string[];
  currentStep: number;
}

const WizardProgress = ({ steps, currentStep }: WizardProgressProps) => (
  <div className="mb-8 flex items-center">
    {steps.map((step, idx) => (
      <div key={step} className="flex flex-1 items-center last:flex-none">
        <div className="flex flex-col items-center gap-1">
          <div
            className={clsx(
              'flex size-8 items-center justify-center rounded-full text-xs font-semibold',
              idx < currentStep
                ? 'bg-brand-600 text-white'
                : idx === currentStep
                  ? 'border-2 border-brand-600 text-brand-600'
                  : 'border-2 border-gray-200 text-gray-400 dark:border-gray-700'
            )}
          >
            {idx < currentStep ? <Check className="size-4" /> : idx + 1}
          </div>
          <span className="hidden text-[11px] text-gray-500 sm:block">{step}</span>
        </div>
        {idx < steps.length - 1 && (
          <div className={clsx('mx-1 h-0.5 flex-1', idx < currentStep ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-700')} />
        )}
      </div>
    ))}
  </div>
);

export default WizardProgress;
