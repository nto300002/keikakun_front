'use client';

import { CheckIcon } from '@heroicons/react/24/solid';
import React from 'react';

interface Step {
  id: string;
  title: string;
  status: 'completed' | 'current' | 'pending';
}

interface StepWizardProps {
  steps: Step[];
  className?: string;
}

export default function StepWizard({ steps, className = '' }: StepWizardProps) {
  return (
    <nav aria-label="Progress" className={`py-8 ${className}`}>
      <ol role="list" className="flex items-center justify-center">
        {steps.map((step, stepIdx) => (
          <React.Fragment key={step.id}>
            <li className="relative">
              {step.status === 'completed' ? (
                <>
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#10B981]">
                    <CheckIcon className="h-5 w-5 text-white" aria-hidden="true" />
                  </div>
                  <span className="absolute top-10 w-max -translate-x-1/2 text-sm text-gray-300">{step.title}</span>
                </>
              ) : step.status === 'current' ? (
                <>
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#10B981] bg-[#2A2A2A]" aria-current="step">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
                  </div>
                  <span className="absolute top-10 w-max -translate-x-1/2 text-sm font-semibold text-[#10B981]">{step.title}</span>
                </>
              ) : (
                <>
                  <div className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-600 bg-[#2A2A2A]">
                    <span className="h-2.5 w-2.5 rounded-full bg-transparent" />
                  </div>
                  <span className="absolute top-10 w-max -translate-x-1/2 text-sm text-gray-500">{step.title}</span>
                </>
              )}
            </li>
            {stepIdx < steps.length - 1 && (
              <li aria-hidden="true" className="px-4 text-gray-500 sm:px-8">
                &gt;
              </li>
            )}
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
}
