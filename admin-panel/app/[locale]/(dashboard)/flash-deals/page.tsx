"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, AlertCircle } from "lucide-react";
import {
  flashDealsService,
  FlashDealTable,
  FlashDealDrawer,
  type FlashDealListItem,
  useFlashDealController,
} from "@/features/flash-deals";
import { PageTitle, Button, DeleteModal } from "@/components/ui";

export default function FlashDealsPage() {
  const queryClient = useQueryClient();
  const t = useTranslations("flashDeals");
  const tCommon = useTranslations("common");

  const {
    // Data
    flashDeals,
    selectedFlashDeal,

    // Loading states
    isLoading,
    fetchError,
    isSubmitting,
    isDeleting,
    submitError,

    // Form
    formik,

    // Drawer control
    isDrawerOpen,
    closeDrawer,

    // Modal control
    isModalOpen,
    closeModal,

    // Handlers
    handleAdd,
    handleEdit,
    handleDelete,
    confirmDelete,
  } = useFlashDealController();

  // Error state
  if (fetchError) {
    return (
      <div>
        <PageTitle title={t("title")} description={t("subtitle")} />
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-400 mb-4" />
          <p className="text-red-700 font-medium">
            {tCommon("errors.generic")}
          </p>
          <p className="text-red-600 text-sm mt-2">
            Impossible de charger les flash deals
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header - Fixed */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 flex-shrink-0">
        <PageTitle title={t("title")} description={t("subtitle")} />
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          {t("addNew")}
        </Button>
      </div>

      {/* Table - Scrollable */}
      <div className="flex-1 overflow-hidden">
        <FlashDealTable
          flashDeals={flashDeals}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={handleAdd}
        />
      </div>

      {/* Drawer */}
      <FlashDealDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        formik={formik}
        isSubmitting={isSubmitting}
        submitError={submitError}
        selectedFlashDeal={selectedFlashDeal}
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={confirmDelete}
        itemName={selectedFlashDeal?.ad.title}
        isLoading={isDeleting}
      />
    </div>
  );
}
