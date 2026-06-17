import { icons } from "lucide-react";
import type { LucideIcon as LucideIconType, LucideProps } from "lucide-react";

// Get icon component by name
function getIconByName(name: string): LucideIconType | null {
  const icon = icons[name as keyof typeof icons];
  if (icon) {
    return icon as LucideIconType;
  }
  return null;
}

interface LucideIconProps extends Omit<LucideProps, "ref"> {
  name: string;
  fallback?: React.ReactNode;
}

export default function LucideIcon({
  name,
  fallback = null,
  size = 24,
  ...props
}: LucideIconProps) {
  const IconComponent = getIconByName(name);

  if (!IconComponent) {
    return <>{fallback}</>;
  }

  return <IconComponent size={size} {...props} />;
}
