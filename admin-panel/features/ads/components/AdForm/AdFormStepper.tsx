"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";

export interface Step {
  id: number;
  title: string;
  description: string;
}

interface AdFormStepperProps {
  steps: Step[];
  currentStep: number;
}

export function AdFormStepper({ steps, currentStep }: AdFormStepperProps) {
  const t = useTranslations("ads");

  return (
    <div className="mb-6">
      {/* Mobile stepper - current step only */}
      <div className="flex sm:hidden items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm">
          {currentStep}
        </div>
        <div>
          <p className="text-sm font-medium text-neutral-900">
            {steps[currentStep - 1].title}
          </p>
          <p className="text-xs text-neutral-500">
            {t("stepper.step", { current: currentStep, total: steps.length })}
          </p>
        </div>
      </div>

      {/* Desktop stepper */}
      <div className="hidden sm:flex items-center gap-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                  currentStep > step.id
                    ? "bg-green-500 text-white"
                    : currentStep === step.id
                    ? "bg-primary text-white"
                    : "bg-neutral-200 text-neutral-500"
                }`}
              >
                {currentStep > step.id ? (
                  <Check className="w-4 h-4" />
                ) : (
                  step.id
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-900">
                  {step.title}
                </p>
                <p className="text-xs text-neutral-500">{step.description}</p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-12 h-0.5 mx-4 rounded ${
                  currentStep > step.id ? "bg-green-500" : "bg-neutral-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
