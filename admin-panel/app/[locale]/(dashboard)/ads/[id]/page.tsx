"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Loader2,
  MapPin,
  CheckCircle2,
  XCircle,
  ImageIcon,
  Trash2,
  Pencil,
  Edit3,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import {
  Button,
  StatusBadge,
  RejectModal,
  ConfirmModal,
  DeleteModal,
  TiptapViewer,
} from "@/components/ui";
import { useAuth } from "@/features/auth";
import { adsService, ValidateAdDto, TiptapContent } from "@/features/ads";
import { filesService } from "@/features/files";
import { formatPrice, formatDate, getApiErrorMessage } from "@/shared/utils";
import { ROUTES } from "@/config/routes";

export default function AdDetailPage() {
  const t = useTranslations("ads");
  const tCommon = useTranslations("common");
  const locale = useLocale() as "fr" | "en";
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const adId = params.id as string;
  const { isSuperAdmin } = useAuth();

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showModificationModal, setShowModificationModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { data: ad, isLoading } = useQuery({
    queryKey: ["admin-ad", adId],
    queryFn: () => adsService.getAdminDetail(adId),
    enabled: !!adId,
  });

  const validateMutation = useMutation({
    mutationFn: (data: ValidateAdDto) => adsService.validate(adId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-ads"] });
      queryClient.invalidateQueries({ queryKey: ["admin-ad", adId] });
      setShowRejectModal(false);
      setShowApproveModal(false);
      setShowModificationModal(false);
      router.push(ROUTES.ADS.LIST);
    },
    onError: (error) => {
      console.error("Error:", getApiErrorMessage(error));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => adsService.delete(adId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads-admin"] });
      queryClient.invalidateQueries({ queryKey: ["pending-ads"] });
      setShowDeleteModal(false);
      router.push(ROUTES.ADS.LIST);
    },
    onError: (error) => {
      console.error("Error:", getApiErrorMessage(error));
    },
  });

  const handleApprove = () => {
    validateMutation.mutate({ status: "APPROVED" });
  };

  const handleReject = (reason: string) => {
    validateMutation.mutate({ status: "REJECTED", rejectionReason: reason });
  };

  const handleRequestModification = (reason: string) => {
    validateMutation.mutate({ status: "MODIFICATION_REQUESTED", rejectionReason: reason });
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-600">Annonce non trouvee</p>
        <Link href={ROUTES.ADS.LIST}>
          <Button variant="outline" className="mt-4">
            Retour aux annonces
          </Button>
        </Link>
      </div>
    );
  }

  const hasImages = ad.files && ad.files.length > 0;

  return (
    <div className="h-full overflow-y-auto pb-6">
      {/* Header with Back Button, Edit and Delete */}
      <div className="flex items-center justify-between mb-6">
        <Link href={ROUTES.ADS.LIST}>
          <Button variant="outline" size="sm" className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Link href={ROUTES.ADS.EDIT(adId)}>
            <Button variant="outline" size="sm">
              <Pencil className="w-4 h-4 mr-2" />
              Modifier
            </Button>
          </Link>
          {isSuperAdmin && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </Button>
          )}
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8">
          {/* Left - Image */}
          <div>
            <div className="border border-neutral-200 rounded-xl p-4">
              {hasImages ? (
                <div className="space-y-3">
                  {/* Main Image */}
                  <div className="relative aspect-square bg-neutral-50 rounded-lg overflow-hidden">
                    <img
                      src={filesService.getFileUrl(ad.files![selectedImageIndex])}
                      alt={ad.files![selectedImageIndex].originalName}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  {/* Thumbnails */}
                  {ad.files!.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {ad.files!.map((file, index) => (
                        <button
                          key={file.id}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                            index === selectedImageIndex
                              ? "border-primary ring-2 ring-primary/20"
                              : "border-neutral-200 hover:border-neutral-300"
                          }`}
                        >
                          <img
                            src={filesService.getFileUrl(file)}
                            alt={file.originalName}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-square bg-neutral-50 rounded-lg flex flex-col items-center justify-center text-neutral-400">
                  <ImageIcon className="w-16 h-16 mb-2" />
                  <p>Aucune photo</p>
                </div>
              )}
            </div>
          </div>

          {/* Right - Info */}
          <div className="space-y-4">
            {/* Title + Status */}
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold text-neutral-900">{ad.title}</h1>
              <StatusBadge status={ad.status} />
            </div>

            {/* Price */}
            <p className="text-3xl font-bold text-primary">
              {ad.price !== null ? formatPrice(ad.price) : tCommon("priceOnRequest")}
            </p>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                ad.type === "SALE"
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}>
                {ad.type === "SALE" ? "Vente" : "Location"}
              </span>
              {ad.quantity !== null && (
                <span className="px-3 py-1 bg-neutral-100 rounded-full text-sm">
                  Quantite: <strong>{ad.quantity}</strong>
                </span>
              )}
            </div>

            {/* Description */}
            <div className="pt-2">
              <TiptapViewer
                content={ad.description as TiptapContent}
                className="text-neutral-600 text-sm leading-relaxed"
              />
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-200">
              <div>
                <p className="text-xs text-neutral-400 uppercase tracking-wide mb-1">Categorie</p>
                <p className="font-medium text-neutral-900">
                  {typeof ad.category?.name === "object"
                    ? ((ad.category.name as Record<string, string>)[locale] ?? (ad.category.name as Record<string, string>).fr)
                    : ad.category?.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-400 uppercase tracking-wide mb-1">Vendeur</p>
                <p className="font-medium text-neutral-900">
                  {ad.user?.firstName} {ad.user?.lastName}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-400 uppercase tracking-wide mb-1">Ville</p>
                <p className="font-medium text-neutral-900">{ad.city}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-400 uppercase tracking-wide mb-1">Date</p>
                <p className="font-medium text-neutral-900">{formatDate(ad.createdAt)}</p>
              </div>
            </div>

            {/* Location - Confidential */}
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <MapPin className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800">{ad.location}</p>
                <p className="text-xs text-amber-600">Adresse confidentielle</p>
              </div>
            </div>

            {/* Rejection reason */}
            {ad.status === "REJECTED" && ad.rejectionReason && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800">Raison du refus</p>
                  <p className="text-sm text-red-700">{ad.rejectionReason}</p>
                </div>
              </div>
            )}

            {/* Modification requested reason */}
            {ad.status === "MODIFICATION_REQUESTED" && ad.rejectionReason && (
              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Edit3 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Modifications demandees</p>
                  <p className="text-sm text-blue-700">{ad.rejectionReason}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {(ad.status === "PENDING" || ad.status === "MODIFICATION_REQUESTED") && (
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
                <Button
                    variant="outline"
                    className="px-6 border-blue-300 text-blue-600 hover:bg-blue-50"
                    onClick={() => setShowModificationModal(true)}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Demander des modifications
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
        title="Refuser l'annonce"
        itemName={ad.title}
        isLoading={validateMutation.isPending}
      />

      {/* Approve Confirmation Modal */}
      <ConfirmModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleApprove}
        title="Approuver l'annonce"
        itemName={ad.title}
        message="Cette annonce sera publiee et visible par tous les utilisateurs."
        confirmText="Approuver"
        variant="success"
        isLoading={validateMutation.isPending}
      />

      {/* Modification Request Modal */}
      <RejectModal
        isOpen={showModificationModal}
        onClose={() => setShowModificationModal(false)}
        onReject={handleRequestModification}
        title="Demander des modifications"
        itemName={ad.title}
        variant="modify"
        isLoading={validateMutation.isPending}
      />

      {/* Delete Confirmation Modal - Admin only */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Supprimer l'annonce"
        message="Cette action est irreversible. L'annonce sera definitivement supprimee."
        itemName={ad.title}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
