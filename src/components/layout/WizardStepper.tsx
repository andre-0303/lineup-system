interface Step {
  label: string;
  number: number;
}

const STEPS: Step[] = [
  { number: 1, label: "Dados" },
  { number: 2, label: "Palcos" },
  { number: 3, label: "Palestrantes" },
  { number: 4, label: "Grade" },
  { number: 5, label: "Visual" },
  { number: 6, label: "Publicar" },
];

interface WizardStepperProps {
  currentStep: number;
}

export function WizardStepper({ currentStep }: WizardStepperProps) {
  return (
    <div
      className="flex items-center gap-0 overflow-x-auto pb-1"
      style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
    >
      {STEPS.map((step, idx) => {
        const done = step.number < currentStep;
        const active = step.number === currentStep;
        return (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center gap-1 min-w-[56px]">
              <div
                className="flex items-center justify-center w-7 h-7 text-xs font-bold transition-all"
                style={{
                  background: active ? "#00ff00" : done ? "rgba(0,255,0,0.15)" : "transparent",
                  color: active ? "#000" : done ? "#00ff00" : "rgba(255,255,255,0.2)",
                  border: done ? "1px solid rgba(0,255,0,0.3)" : active ? "none" : "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {done ? "✓" : step.number}
              </div>
              <span
                className="text-[10px] tracking-wide hidden sm:block"
                style={{
                  color: active ? "#00ff00" : done ? "rgba(0,255,0,0.4)" : "rgba(255,255,255,0.2)",
                }}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className="h-px w-6 mx-1 mb-4 sm:mb-0 shrink-0"
                style={{
                  background: step.number < currentStep
                    ? "rgba(0,255,0,0.3)"
                    : "rgba(255,255,255,0.06)",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
