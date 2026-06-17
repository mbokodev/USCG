"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, AlertCircle } from "lucide-react";
import { bannersService, BannerTable, type Banner } from "@/features/banners";
import { PageTitle, Button, DeleteModal } from "@/components/ui";
import { ROUTES } from "@/config/routes";

export default function BannersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations("banners");
  const tCommon = useTranslations("common");

  // State for delete modal
  const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null);

  // Query banners
  const {
    data: banners = [],
    isLoading,
    error: fetchError,
  } = useQuery({
    queryKey: ["banners"],
    queryFn: () => bannersService.getAll(),
    staleTime: 5 * 60 * 1000,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => bannersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      setBannerToDelete(null);
    },
  });

  // Handlers
  const handleAdd = () => {
    router.push(ROUTES.BANNERS.NEW);
  };

  const handleEdit = (banner: Banner) => {
    router.push(ROUTES.BANNERS.EDIT(banner.id));
  };

  const handleDelete = (banner: Banner) => {
    setBannerToDelete(banner);
  };

  const confirmDelete = () => {
    if (bannerToDelete) {
      deleteMutation.mutate(bannerToDelete.id);
    }
  };

  // Error state
  if (fetchError) {
    return (
      <div>
        <PageTitle title={t("title")} description={t("description")} />
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-400 mb-4" />
          <p className="text-red-700 font-medium">
            {tCommon("errors.generic")}
          </p>
          <p className="text-red-600 text-sm mt-2">
            Impossible de charger les bannieres
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header - Fixed */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 flex-shrink-0">
        <PageTitle title={t("title")} description={t("description")} />
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          {t("add")}
        </Button>
      </div>

      {/* Table - Scrollable */}
      <div className="flex-1 overflow-hidden">
        <BannerTable
          banners={banners}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={handleAdd}
        />
      </div>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={!!bannerToDelete}
        onClose={() => setBannerToDelete(null)}
        onConfirm={confirmDelete}
        itemName={bannerToDelete?.title}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
