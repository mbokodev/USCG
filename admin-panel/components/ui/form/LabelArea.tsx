import { cn } from "@/shared/utils";

export interface LabelAreaProps {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
  error?: string;
  className?: string;
}

export function LabelArea({
  label,
  required = false,
  hint,
  children,
  error,
  className,
}: LabelAreaProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-sm font-medium text-neutral-700">
          {label}
          {required && <span className="text-error ml-0.5">*</span>}
        </label>
        {hint && <span className="text-xs text-neutral-400">{hint}</span>}
      </div>
      {children}
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  );
}
