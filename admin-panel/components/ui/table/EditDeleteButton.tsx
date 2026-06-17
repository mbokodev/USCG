"use client";

import { Edit2, Trash2, Eye } from "lucide-react";
import { cn } from "@/shared/utils";

export interface EditDeleteButtonProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function EditDeleteButton({
  onView,
  onEdit,
  onDelete,
  className,
}: EditDeleteButtonProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {onView && (
        <button
          onClick={onView}
          className="p-2 text-neutral-500 hover:text-primary hover:bg-neutral-100 rounded-lg transition-colors"
          aria-label="Voir"
        >
          <Eye className="w-4 h-4" />
        </button>
      )}
      {onEdit && (
        <button
          onClick={onEdit}
          className="p-2 text-neutral-500 hover:text-primary hover:bg-neutral-100 rounded-lg transition-colors"
          aria-label="Modifier"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      )}
      {onDelete && (
        <button
          onClick={onDelete}
          className="p-2 text-neutral-500 hover:text-error hover:bg-red-50 rounded-lg transition-colors"
          aria-label="Supprimer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
