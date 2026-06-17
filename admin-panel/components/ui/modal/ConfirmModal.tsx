"use client";

import { useEffect } from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "../button";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "success" | "warning" | "danger";
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmer",
  message,
  itemName,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  variant = "success",
  isLoading = false,
}: ConfirmModalProps) {
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

  const iconConfig = {
    success: {
      bg: "bg-green-100",
      icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
      buttonVariant: "success" as const,
    },
    warning: {
      bg: "bg-amber-100",
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
      buttonVariant: "default" as const,
    },
    danger: {
      bg: "bg-red-100",
      icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
      buttonVariant: "destructive" as const,
    },
  };

  const config = iconConfig[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={isLoading ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-sm transform rounded-2xl bg-white p-6 shadow-xl transition-all">
        <div className="flex flex-col items-center text-center">
          <div className={`p-3 ${config.bg} rounded-full mb-4`}>
            {config.icon}
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-1">
            {title}
          </h3>
          {itemName && (
            <p className="text-sm font-medium text-neutral-700 mb-2">
              {itemName}
            </p>
          )}
          {message && (
            <p className="text-sm text-neutral-500 mb-6">{message}</p>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={config.buttonVariant}
            className="flex-1"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
