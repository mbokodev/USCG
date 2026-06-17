"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "../button";
import { useTranslations } from "next-intl";

export interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
  isLoading?: boolean;
}

export function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  isLoading = false,
}: DeleteModalProps) {
  const t = useTranslations("common");

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose, isLoading]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={isLoading ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md transform rounded-xl bg-white p-6 shadow-xl transition-all">
        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
            <AlertTriangle className="h-6 w-6 text-error" />
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            {title || t("deleteConfirm.title")}
          </h3>

          {/* Message */}
          <p className="text-sm text-neutral-500 mb-6">
            {message || t("deleteConfirm.message")}
            {itemName && (
              <span className="font-medium text-neutral-700">
                {" "}
                &quot;{itemName}&quot;
              </span>
            )}
          </p>

          {/* Actions */}
          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isLoading}
            >
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={onConfirm}
              isLoading={isLoading}
            >
              {t("delete")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
