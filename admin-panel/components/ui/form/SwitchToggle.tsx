"use client";

import * as Switch from "@radix-ui/react-switch";
import { cn } from "@/shared/utils";

export interface SwitchToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function SwitchToggle({
  checked,
  onCheckedChange,
  label,
  disabled = false,
  className,
}: SwitchToggleProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Switch.Root
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          checked ? "bg-primary" : "bg-neutral-300"
        )}
      >
        <Switch.Thumb
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-6" : "translate-x-1"
          )}
        />
      </Switch.Root>
      {label && (
        <span className="text-sm text-neutral-700">{label}</span>
      )}
    </div>
  );
}
