"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Loader2,
  Mail,
  Phone,
  Calendar,
  Store,
  UserCheck,
  UserX,
  Shield,
  FileCheck,
  Building2,
  MapPin,
  Hash,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui";
import usersService from "@/features/users/services/users.service";
import sellerRequestsService from "@/features/seller-requests/services/seller-requests.service";
import { formatDate } from "@/shared/utils";
import { ROUTES } from "@/config/routes";

export default function CustomerDetailPage() {
  const t = useTranslations("customers");
  const params = useParams();
  const customerId = params.id as string;

  const { data: customer, isLoading } = useQuery({
    queryKey: ["customer", customerId],
    queryFn: () => usersService.getById(customerId),
    enabled: !!customerId,
  });

  // Fetch seller request if customer is a seller
  const { data: sellerRequest } = useQuery({
    queryKey: ["seller-request-user", customerId],
    queryFn: () => sellerRequestsService.getByUserId(customerId),
    enabled: !!customer?.isSeller,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-600">Client non trouve</p>
        <Link href={ROUTES.CUSTOMERS}>
          <Button variant="outline" className="mt-4">
            Retour aux clients
          </Button>
        </Link>
      </div>
    );
  }

  const hasLogo = sellerRequest?.businessLogo?.url;

  return (
    <div className="h-full overflow-y-auto pb-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between mb-6">
        <Link href={ROUTES.CUSTOMERS}>
          <Button variant="outline" size="sm" className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-8">
          {/* Left - Avatar or Logo */}
          <div>
            <div className="border border-neutral-200 rounded-xl p-4">
              {hasLogo ? (
                <div className="aspect-square bg-neutral-50 rounded-lg overflow-hidden">
                  <img
                    src={sellerRequest.businessLogo!.url}
                    alt={sellerRequest.businessName}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="aspect-square bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-6xl font-bold text-primary uppercase">
                    {customer.firstName.charAt(0)}
                    {customer.lastName.charAt(0)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right - Info */}
          <div className="space-y-4">
            {/* Name + Status Badges */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">
                  {customer.firstName} {customer.lastName}
                </h1>
                {sellerRequest && (
                  <p className="text-lg text-primary font-medium mt-1">
                    {sellerRequest.businessName}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {customer.isSeller && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-sm font-medium">
                    <Store className="w-4 h-4" />
                    {t("seller")}
                  </span>
                )}
                {customer.isActive ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-sm font-medium">
                    <UserCheck className="w-4 h-4" />
                    {t("active")}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-sm font-medium">
                    <UserX className="w-4 h-4" />
                    {t("inactive")}
                  </span>
                )}
              </div>
            </div>

            {/* Contact Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-full text-sm">
                <Mail className="w-4 h-4 text-neutral-500" />
                {customer.email}
              </span>
              {customer.phone && (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-full text-sm">
                  <Phone className="w-4 h-4 text-neutral-500" />
                  {customer.phone}
                </span>
              )}
            </div>

            {/* Seller Business Description */}
            {sellerRequest?.description && (
              <div className="pt-2">
                <p className="text-neutral-600 text-sm leading-relaxed whitespace-pre-wrap">
                  {sellerRequest.description}
                </p>
              </div>
            )}

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-200">
              <div>
                <p className="text-xs text-neutral-400 uppercase tracking-wide mb-1">
                  {t("detail.registrationDate")}
                </p>
                <p className="font-medium text-neutral-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-neutral-400" />
                  {formatDate(customer.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-400 uppercase tracking-wide mb-1">
                  Role
                </p>
                <p className="font-medium text-neutral-900 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-neutral-400" />
                  {customer.role === "BUYER" ? "Acheteur" : customer.role}
                </p>
              </div>
              {customer.termsAcceptedAt && (
                <div>
                  <p className="text-xs text-neutral-400 uppercase tracking-wide mb-1">
                    {t("detail.termsAccepted")}
                  </p>
                  <p className="font-medium text-neutral-900 flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-neutral-400" />
                    {formatDate(customer.termsAcceptedAt)}
                  </p>
                </div>
              )}
              {sellerRequest?.businessPhone && (
                <div>
                  <p className="text-xs text-neutral-400 uppercase tracking-wide mb-1">
                    Telephone professionnel
                  </p>
                  <p className="font-medium text-neutral-900 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-neutral-400" />
                    {sellerRequest.businessPhone}
                  </p>
                </div>
              )}
              {sellerRequest?.taxId && (
                <div>
                  <p className="text-xs text-neutral-400 uppercase tracking-wide mb-1">
                    Numero fiscal
                  </p>
                  <p className="font-medium text-neutral-900 flex items-center gap-2">
                    <Hash className="w-4 h-4 text-neutral-400" />
                    {sellerRequest.taxId}
                  </p>
                </div>
              )}
            </div>

            {/* Business Address */}
            {sellerRequest?.businessAddress && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <MapPin className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    {sellerRequest.businessAddress}
                  </p>
                  <p className="text-xs text-amber-600">Adresse de l'entreprise</p>
                </div>
              </div>
            )}

            {/* Seller Status Info (only if seller but no sellerRequest loaded yet) */}
            {customer.isSeller && !sellerRequest && (
              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Store className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Vendeur approuve
                  </p>
                  <p className="text-xs text-blue-600">
                    Cet utilisateur peut publier des annonces sur la plateforme.
                  </p>
                </div>
              </div>
            )}

            {/* Inactive Warning */}
            {!customer.isActive && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <UserX className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    Compte desactive
                  </p>
                  <p className="text-xs text-red-600">
                    Cet utilisateur ne peut plus se connecter a la plateforme.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
