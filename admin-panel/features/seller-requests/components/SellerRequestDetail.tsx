"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Loader2,
  Building2,
  Phone,
  Mail,
  MapPin,
  Hash,
  CheckCircle2,
  XCircle,
  Calendar,
  User,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import {
  Button,
  StatusBadge,
  RejectModal,
  ConfirmModal,
} from "@/components/ui";
import sellerRequestsService from "../services/seller-requests.service";
import { ValidateSellerRequestDto } from "../types/seller-requests.types";
import { formatDate, getApiErrorMessage } from "@/shared/utils";

interface SellerRequestDetailProps {
  requestId: string;
  backPath: string;
}

export function SellerRequestDetail({
  requestId,
  backPath,
}: SellerRequestDetailProps) {
  const t = useTranslations("sellerRequests");
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);

  const { data: request, isLoading } = useQuery({
    queryKey: ["seller-request", requestId],
    queryFn: () => sellerRequestsService.getById(requestId),
    enabled: !!requestId,
  });

  const validateMutation = useMutation({
    mutationFn: (data: ValidateSellerRequestDto) =>
      sellerRequestsService.validate(requestId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-requests"] });
      queryClient.invalidateQueries({ queryKey: ["seller-requests-pending"] });
      queryClient.invalidateQueries({ queryKey: ["seller-requests-all"] });
      queryClient.invalidateQueries({ queryKey: ["seller-request", requestId] });
      setShowRejectModal(false);
      setShowApproveModal(false);
      router.push(backPath);
    },
    onError: (error) => {
      console.error("Validation error:", getApiErrorMessage(error));
    },
  });

  const handleApprove = () => {
    validateMutation.mutate({ status: "APPROVED" });
  };

  const handleReject = (reason: string) => {
    validateMutation.mutate({ status: "REJECTED", rejectionReason: reason });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-600">Demande non trouvee</p>
        <Link href={backPath}>
          <Button variant="outline" className="mt-4">
            Retour
          </Button>
        </Link>
      </div>
    );
  }

  const hasLogo = request.businessLogo?.url;

  return (
    <div className="h-full overflow-y-auto pb-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between mb-6">
        <Link href={backPath}>
          <Button variant="outline" size="sm" className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
          {/* Left - Logo */}
          <div>
            <div className="border border-neutral-200 rounded-xl p-4">
              {hasLogo ? (
                <div className="aspect-square bg-neutral-50 rounded-lg overflow-hidden">
                  <img
                    src={request.businessLogo!.url}
                    alt={request.businessName}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="aspect-square bg-neutral-50 rounded-lg flex flex-col items-center justify-center text-neutral-400">
                  <Building2 className="w-16 h-16 mb-2" />
                  <p className="text-sm">Pas de logo</p>
                </div>
              )}
            </div>
          </div>

          {/* Right - Info */}
          <div className="space-y-4">
            {/* Business Name + Status */}
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold text-neutral-900">
                {request.businessName}
              </h1>
              <StatusBadge status={request.status} />
            </div>

            {/* User Info Badge */}
            {request.user && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-sm font-medium">
                  <User className="w-4 h-4" />
                  {request.user.firstName} {request.user.lastName}
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-full text-sm">
                  <Mail className="w-4 h-4 text-neutral-500" />
                  {request.user.email}
                </span>
              </div>
            )}

            {/* Description */}
            {request.description && (
              <div className="pt-2">
                <p className="text-neutral-600 text-sm leading-relaxed whitespace-pre-wrap">
                  {request.description}
                </p>
              </div>
            )}

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-200">
              <div>
                <p className="text-xs text-neutral-400 uppercase tracking-wide mb-1">
                  Telephone professionnel
                </p>
                <p className="font-medium text-neutral-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-neutral-400" />
                  {request.businessPhone}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-400 uppercase tracking-wide mb-1">
                  Date de demande
                </p>
                <p className="font-medium text-neutral-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-neutral-400" />
                  {formatDate(request.createdAt)}
                </p>
              </div>
              {request.taxId && (
                <div>
                  <p className="text-xs text-neutral-400 uppercase tracking-wide mb-1">
                    Numero fiscal
                  </p>
                  <p className="font-medium text-neutral-900 flex items-center gap-2">
                    <Hash className="w-4 h-4 text-neutral-400" />
                    {request.taxId}
                  </p>
                </div>
              )}
              {request.validatedAt && (
                <div>
                  <p className="text-xs text-neutral-400 uppercase tracking-wide mb-1">
                    Date de validation
                  </p>
                  <p className="font-medium text-neutral-900">
                    {formatDate(request.validatedAt)}
                  </p>
                </div>
              )}
            </div>

            {/* Business Address */}
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <MapPin className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  {request.businessAddress}
                </p>
                <p className="text-xs text-amber-600">Adresse de l'entreprise</p>
              </div>
            </div>

            {/* Rejection reason */}
            {request.status === "REJECTED" && request.rejectionReason && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800">Raison du refus</p>
                  <p className="text-sm text-red-700">{request.rejectionReason}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {request.status === "PENDING" && (
              <div className="flex flex-wrap items-center gap-3 pt-4">
                <Button
                  variant="success"
                  className="px-6"
                  onClick={() => setShowApproveModal(true)}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approuver
                </Button>
                <Button
                  variant="destructive"
                  className="px-6"
                  onClick={() => setShowRejectModal(true)}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Refuser
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      <RejectModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onReject={handleReject}
        title="Refuser la demande"
        itemName={request.businessName}
        isLoading={validateMutation.isPending}
      />

      {/* Approve Confirmation Modal */}
      <ConfirmModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleApprove}
        title="Approuver la demande"
        itemName={request.businessName}
        message="Cette personne deviendra vendeur et pourra publier des annonces sur la plateforme."
        confirmText="Approuver"
        variant="success"
        isLoading={validateMutation.isPending}
      />
    </div>
  );
}
