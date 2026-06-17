"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Hash,
  FileText,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { PageTitle } from "@/components/ui";
import sellerRequestsService from "@/features/seller-requests/services/seller-requests.service";
import { formatDate } from "@/shared/utils";

export default function ProfilePage() {
  const t = useTranslations("profile");
  const { user } = useAuth();

  // Fetch seller request for business info
  const { data: sellerRequest, isLoading: isLoadingBusiness } = useQuery({
    queryKey: ["my-seller-request"],
    queryFn: sellerRequestsService.getMyRequest,
    enabled: !!user?.isSeller,
  });

  return (
    <div className="h-full overflow-y-auto pb-6">
      <PageTitle title={t("title")} description={t("description")} />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Info */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            {t("personalInfo")}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-neutral-500">{t("firstName")}</label>
              <p className="font-medium text-neutral-900">{user?.firstName}</p>
            </div>
            <div>
              <label className="text-sm text-neutral-500">{t("lastName")}</label>
              <p className="font-medium text-neutral-900">{user?.lastName}</p>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-neutral-400" />
              <div>
                <label className="text-sm text-neutral-500">{t("email")}</label>
                <p className="font-medium text-neutral-900">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-neutral-400" />
              <div>
                <label className="text-sm text-neutral-500">{t("phone")}</label>
                <p className="font-medium text-neutral-900">
                  {user?.phone || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Business Info */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            {t("businessInfo")}
          </h3>

          {isLoadingBusiness ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : sellerRequest ? (
            <div className="space-y-4">
              {/* Business Name */}
              <div>
                <label className="text-sm text-neutral-500">{t("businessName")}</label>
                <p className="font-medium text-neutral-900">{sellerRequest.businessName}</p>
              </div>

              {/* Business Address */}
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-neutral-400 mt-0.5" />
                <div>
                  <label className="text-sm text-neutral-500">{t("businessAddress")}</label>
                  <p className="font-medium text-neutral-900">{sellerRequest.businessAddress}</p>
                </div>
              </div>

              {/* Business Phone */}
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-neutral-400" />
                <div>
                  <label className="text-sm text-neutral-500">{t("businessPhone")}</label>
                  <p className="font-medium text-neutral-900">{sellerRequest.businessPhone}</p>
                </div>
              </div>

              {/* Tax ID */}
              {sellerRequest.taxId && (
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-neutral-400" />
                  <div>
                    <label className="text-sm text-neutral-500">{t("taxId")}</label>
                    <p className="font-medium text-neutral-900">{sellerRequest.taxId}</p>
                  </div>
                </div>
              )}

              {/* Description */}
              {sellerRequest.description && (
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-neutral-400 mt-0.5" />
                  <div>
                    <label className="text-sm text-neutral-500">{t("businessDescription")}</label>
                    <p className="font-medium text-neutral-900 whitespace-pre-wrap">
                      {sellerRequest.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Approved Status */}
              {sellerRequest.status === "APPROVED" && sellerRequest.validatedAt && (
                <div className="mt-4 pt-4 border-t border-neutral-200">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {t("approvedAt")} {formatDate(sellerRequest.validatedAt)}
                    </span>
                  </div>
                </div>
              )}

              {/* Business Logo */}
              {sellerRequest.businessLogo?.url && (
                <div className="mt-4 pt-4 border-t border-neutral-200">
                  <label className="text-sm text-neutral-500 mb-2 block">Logo</label>
                  <div className="w-24 h-24 rounded-lg border border-neutral-200 overflow-hidden bg-neutral-50">
                    <img
                      src={sellerRequest.businessLogo.url}
                      alt={sellerRequest.businessName}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-neutral-500 text-sm py-4">
              {t("noBusinessInfo")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
