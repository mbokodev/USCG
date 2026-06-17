"use client";

import { useEffect, useState } from "react";
import { XCircle, Edit3 } from "lucide-react";
import { Button } from "../button";

export interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReject: (reason: string) => void;
  title?: string;
  itemName?: string;
  label?: string;
  placeholder?: string;
  submitLabel?: string;
  variant?: "reject" | "modify";
  isLoading?: boolean;
}

export function RejectModal({
  isOpen,
  onClose,
  onReject,
  title = "Refuser",
  itemName,
  label,
  placeholder,
  submitLabel,
  variant = "reject",
  isLoading = false,
}: RejectModalProps) {
  const [reason, setReason] = useState("");

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setReason("");
    }
  }, [isOpen]);

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

  const handleSubmit = () => {
    if (reason.trim()) {
      onReject(reason);
    }
  };

  const isModify = variant === "modify";
  const iconBgClass = isModify ? "bg-blue-100" : "bg-red-100";
  const iconClass = isModify ? "text-blue-600" : "text-red-600";
  const focusClass = isModify
    ? "focus:border-blue-500 focus:ring-blue-500/20"
    : "focus:border-red-500 focus:ring-red-500/20";
  const Icon = isModify ? Edit3 : XCircle;

  const defaultLabel = isModify ? "Modifications demandees" : "Raison du refus";
  const defaultPlaceholder = isModify
    ? "Decrivez les modifications demandees..."
    : "Expliquez pourquoi cette annonce est refusee...";
  const defaultSubmitLabel = isModify ? "Envoyer" : "Refuser";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={isLoading ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md transform rounded-2xl bg-white p-6 shadow-xl transition-all">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 ${iconBgClass} rounded-lg`}>
            <Icon className={`w-5 h-5 ${iconClass}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
            {itemName && (
              <p className="text-sm text-neutral-500">{itemName}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              {label || defaultLabel} <span className="text-red-500">*</span>
            </label>
            <textarea
              className={`w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm ${focusClass} focus:outline-none resize-none`}
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={placeholder || defaultPlaceholder}
              autoFocus
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              variant={isModify ? "default" : "destructive"}
              className="flex-1"
              onClick={handleSubmit}
              isLoading={isLoading}
              disabled={!reason.trim()}
            >
              <Icon className="w-4 h-4 mr-2" />
              {submitLabel || defaultSubmitLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
