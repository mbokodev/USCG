"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "../button";
import { useTranslations } from "next-intl";

export interface ValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: (reason: string) => void;
  title?: string;
  itemName?: string;
  isLoading?: boolean;
}

export function ValidationModal({
  isOpen,
  onClose,
  onApprove,
  onReject,
  title,
  itemName,
  isLoading = false,
}: ValidationModalProps) {
  const t = useTranslations("ads.validation");
  const tCommon = useTranslations("common");
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [reason, setReason] = useState("");

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setAction(null);
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

  const handleConfirm = () => {
    if (action === "approve") {
      onApprove();
    } else if (action === "reject" && reason.trim()) {
      onReject(reason);
    }
  };

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
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          {title || t("title")}
        </h3>
        {itemName && (
          <p className="text-sm text-neutral-500 mb-4">{itemName}</p>
        )}

        {/* Action selection */}
        {!action && (
          <div className="space-y-3">
            <button
              onClick={() => setAction("approve")}
              className="w-full flex items-center gap-3 p-4 rounded-lg border border-neutral-200 hover:border-success hover:bg-green-50 transition-colors"
            >
              <CheckCircle className="w-6 h-6 text-success" />
              <div className="text-left">
                <p className="font-medium text-neutral-900">{t("approve")}</p>
              </div>
            </button>
            <button
              onClick={() => setAction("reject")}
              className="w-full flex items-center gap-3 p-4 rounded-lg border border-neutral-200 hover:border-error hover:bg-red-50 transition-colors"
            >
              <XCircle className="w-6 h-6 text-error" />
              <div className="text-left">
                <p className="font-medium text-neutral-900">{t("reject")}</p>
              </div>
            </button>
          </div>
        )}

        {/* Confirm approve */}
        {action === "approve" && (
          <div className="space-y-4">
            <p className="text-sm text-neutral-600">
              Confirmez-vous l&apos;approbation ?
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setAction(null)}
                disabled={isLoading}
              >
                {tCommon("cancel")}
              </Button>
              <Button
                variant="success"
                className="flex-1"
                onClick={handleConfirm}
                isLoading={isLoading}
              >
                {t("approve")}
              </Button>
            </div>
          </div>
        )}

        {/* Reject with reason */}
        {action === "reject" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                {t("reason")}
              </label>
              <textarea
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none"
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t("reasonPlaceholder")}
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setAction(null)}
                disabled={isLoading}
              >
                {tCommon("cancel")}
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleConfirm}
                isLoading={isLoading}
                disabled={!reason.trim()}
              >
                {t("reject")}
              </Button>
            </div>
          </div>
        )}

        {/* Close button when no action selected */}
        {!action && (
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={onClose}
          >
            {tCommon("cancel")}
          </Button>
        )}
      </div>
    </div>
  );
}
