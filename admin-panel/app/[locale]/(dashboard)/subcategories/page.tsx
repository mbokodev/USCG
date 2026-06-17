"use client";

import { useTranslations } from "next-intl";
import { Plus, Search, X, AlertCircle } from "lucide-react";
import {
  useSubCategoryController,
  SubCategoryDrawer,
  SubCategoryTable,
} from "@/features/categories";
import {
  PageTitle,
  Button,
  DeleteModal,
  Input,
  Select,
} from "@/components/ui";

export default function SubCategoriesPage() {
  const t = useTranslations("subcategories");
  const tCommon = useTranslations("common");

  const {
    // Data
    subCategories,
    categories,
    selectedSubCategory,
    locale,

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

    // Search & Filter
    searchTerm,
    handleSearch,
    handleResetSearch,
    filterCategoryId,
    handleFilterCategory,
  } = useSubCategoryController();

  // Convert categories to select options with "all" option
  const categoryFilterOptions = [
    { value: "", label: t("filter.all") },
    ...categories.map((cat) => ({
      value: cat.id,
      label: cat.name[locale] || cat.name.fr,
    })),
  ];

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
            Impossible de charger les sous-categories
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

      {/* Search & Filter Bar - Fixed */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3 flex-shrink-0">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            placeholder="Rechercher une sous-categorie..."
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

        {/* Category Filter */}
        <div className="w-full sm:w-64">
          <Select
            options={categoryFilterOptions}
            value={filterCategoryId}
            onChange={(e) => handleFilterCategory(e.target.value)}
            placeholder={t("filter.category")}
          />
        </div>
      </div>

      {/* Table - Scrollable */}
      <div className="flex-1 min-h-0 overflow-auto">
        <SubCategoryTable
          subCategories={subCategories}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={handleAdd}
        />
      </div>

      {/* Drawer */}
      <SubCategoryDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        formik={formik}
        categories={categories}
        isEditing={!!selectedSubCategory}
        isLoading={isSubmitting}
        submitError={submitError}
        generateSlug={generateSlug}
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={confirmDelete}
        itemName={
          selectedSubCategory?.name[locale] || selectedSubCategory?.name.fr
        }
        isLoading={isDeleting}
      />
    </div>
  );
}
