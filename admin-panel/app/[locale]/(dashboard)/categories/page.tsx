"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Plus, Search, X, AlertCircle, FolderOpen } from "lucide-react";
import {
  useCategoryController,
  CategoryDrawer,
  CategoryTable,
} from "@/features/categories";
import { PageTitle, Button, DeleteModal, Input } from "@/components/ui";

export default function CategoriesPage() {
  const t = useTranslations("categories");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();

  const {
    // Data
    categories,
    selectedCategory,
    locale: controllerLocale,

    // Loading states
    isLoading,
    fetchError,
    isSubmitting,
    isDeleting,
    submitError,

    // Form
    formik,
    generateSlug,

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

    // Search
    searchTerm,
    handleSearch,
    handleResetSearch,
  } = useCategoryController();

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
            Impossible de charger les categories
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
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.push(`/${locale}/subcategories`)}
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            {t("subcategories")}
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            {t("add")}
          </Button>
        </div>
      </div>

      {/* Search Bar - Fixed */}
      <div className="mb-4 flex gap-2 flex-shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            placeholder="Rechercher une categorie..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
          {searchTerm && (
            <button
              onClick={handleResetSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Table - Scrollable */}
      <div className="flex-1 overflow-hidden">
        <CategoryTable
          categories={categories}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={handleAdd}
        />
      </div>

      {/* Drawer */}
      <CategoryDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        formik={formik}
        isEditing={!!selectedCategory}
        isLoading={isSubmitting}
        submitError={submitError}
        generateSlug={generateSlug}
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={confirmDelete}
        itemName={selectedCategory?.name[controllerLocale] || selectedCategory?.name.fr}
        isLoading={isDeleting}
      />
    </div>
  );
}
