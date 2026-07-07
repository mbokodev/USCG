"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Phone, MessageSquare, AlertTriangle, Check, Loader2, CheckCircle } from "lucide-react";
import sellerRequestsService from "@/features/seller-requests/services/seller-requests.service";
import { ContactMethod } from "@/features/seller-requests/types/seller-requests.types";

// WhatsApp icon component
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

interface ContactPreferencesProps {
  businessPhone: string;
  enabledContactMethods: ContactMethod[];
}

const CONTACT_METHODS = [
  { id: ContactMethod.PHONE, labelKey: "phone", icon: Phone, color: "#4CAF50" },
  { id: ContactMethod.SMS, labelKey: "sms", icon: MessageSquare, color: "#2196F3" },
  { id: ContactMethod.WHATSAPP, labelKey: "whatsapp", icon: WhatsAppIcon, color: "#25D366" },
];

export function ContactPreferences({
  businessPhone,
  enabledContactMethods,
}: ContactPreferencesProps) {
  const t = useTranslations("profile.contact");
  const queryClient = useQueryClient();
  const [methods, setMethods] = useState<ContactMethod[]>(enabledContactMethods || []);

  // Sync with prop changes
  useEffect(() => {
    setMethods(enabledContactMethods || []);
  }, [enabledContactMethods]);

  const [showSuccess, setShowSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: (newMethods: ContactMethod[]) =>
      sellerRequestsService.updateContactPreferences({ enabledContactMethods: newMethods }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-seller-request"] });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    },
    onError: () => {
      // Revert on error
      setMethods(enabledContactMethods || []);
    },
  });

  const toggleMethod = (method: ContactMethod) => {
    const newMethods = methods.includes(method)
      ? methods.filter((m) => m !== method)
      : [...methods, method];
    setMethods(newMethods);
    mutation.mutate(newMethods);
  };

  const hasNoMethods = methods.length === 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
          <Phone className="w-5 h-5 text-primary" />
          {t("title")}
        </h3>
        {showSuccess && (
          <span className="flex items-center gap-1 text-sm text-green-600">
            <CheckCircle className="w-4 h-4" />
            {t("updateSuccess")}
          </span>
        )}
      </div>

      {/* Warning if no methods configured */}
      {hasNoMethods && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              {t("warningTitle")}
            </p>
            <p className="text-sm text-amber-700">
              {t("warningDescription")}
            </p>
          </div>
        </div>
      )}

      {/* Business phone display */}
      <div className="mb-4">
        <label className="text-sm text-neutral-500">{t("businessPhone")}</label>
        <p className="font-medium text-neutral-900">{businessPhone}</p>
      </div>

      {/* Contact method toggles */}
      <div className="space-y-3">
        <label className="text-sm text-neutral-500">{t("enabledMethods")}</label>
        {CONTACT_METHODS.map((method) => {
          const isEnabled = methods.includes(method.id);
          const Icon = method.icon;
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => toggleMethod(method.id)}
              disabled={mutation.isPending}
              className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                isEnabled
                  ? "bg-primary/10 border-primary"
                  : "bg-neutral-50 border-neutral-200 hover:border-neutral-300"
              } ${mutation.isPending ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-5 h-5 ${isEnabled ? "text-primary" : "text-neutral-400"}`}
                />
                <span className={isEnabled ? "font-medium text-primary" : "text-neutral-600"}>
                  {t(method.labelKey)}
                </span>
              </div>
              {mutation.isPending ? (
                <Loader2 className="w-5 h-5 text-neutral-400 animate-spin" />
              ) : isEnabled ? (
                <Check className="w-5 h-5 text-primary" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
