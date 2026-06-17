import { cn } from "@/shared/utils";

export interface BadgeProps {
  variant?: "default" | "success" | "warning" | "error" | "info";
  children: React.ReactNode;
  className?: string;
}

const variants = {
  default: "bg-neutral-100 text-neutral-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-700",
  error: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700",
};

export function Badge({
  variant = "default",
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

// Status-specific badges
export function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<
    string,
    { variant: BadgeProps["variant"]; label: string }
  > = {
    PENDING: { variant: "warning", label: "En attente" },
    APPROVED: { variant: "success", label: "Approuvee" },
    REJECTED: { variant: "error", label: "Refusee" },
    MODIFICATION_REQUESTED: { variant: "info", label: "Modifications" },
  };

  const config = statusConfig[status] || { variant: "default", label: status };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
