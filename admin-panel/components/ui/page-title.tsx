import { cn } from "@/shared/utils";

export interface PageTitleProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageTitle({
  title,
  description,
  action,
  className,
}: PageTitleProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6",
        className
      )}
    >
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-neutral-500">{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
