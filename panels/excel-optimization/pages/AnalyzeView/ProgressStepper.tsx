import {
  Check,
  Loader2,
  File,
  ListChecks,
  Settings,
  Table,
} from "lucide-react";

const icons: Record<string, React.ComponentType<any>> = {
  "Fájl betöltése…": File,
  "Sheet kiválasztása…": ListChecks,
  "Adatok normalizálása…": Settings,
  "Fejlécek detektálása…": Table,
  "Sorok feldolgozása…": Settings,
  "Előkészítés befejezve…": Check,
};

type ProgressStepperProps = { steps: string[]; currentIndex: number };

export default function ProgressStepper({
  steps,
  currentIndex,
}: ProgressStepperProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 py-10">
      {steps.map((step, i) => {
        const Icon = icons[step] ?? Loader2;
        const isActive = i === currentIndex;
        const isDone = i < currentIndex;

        return (
          <div key={i} className="flex flex-col items-center relative">
            {/* Ikon */}
            <div className="relative flex items-center justify-center">
              <Icon
                className={`
                  w-6 h-6
                  transition-all
                  ${
                    isDone
                      ? "text-gray-700"
                      : isActive
                      ? "text-gray-800 animate-pulse opacity-10"
                      : "text-gray-400"
                  }
                `}
              />

              {/* Zöld pipa overlay, ha kész */}
              {isDone && (
                <Check className="w-4 h-4 text-green-500 absolute -right-3 -bottom-2" />
              )}
            </div>

            {/* Szöveg */}
            <div
              className={`
                mt-1 text-sm text-center max-w-[200px]
                ${
                  isDone
                    ? "text-gray-700"
                    : isActive
                    ? "text-gray-800 font-medium"
                    : "text-gray-400"
                }
              `}
            >
              {step}
            </div>

            {/* Függőleges vonal */}
            {i < steps.length - 1 && (
              <div className="h-5 border-l border-gray-300 my-1" />
            )}
          </div>
        );
      })}
    </div>
  );
}
