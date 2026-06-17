"use client";

import { useTranslations } from "next-intl";
import { Search, X, AlertCircle, Plus } from "lucide-react";
import { Link } from "@/i18n/routing";
import {
  useAdsAdminController,
  AdsAdminTable,
  AdStatus,
} from "@/features/ads";
import {
  PageTitle,
  Button,
  Input,
  Select,
  Pagination,
} from "@/components/ui";
import { ROUTES } from "@/config/routes";

const STATUS_OPTIONS = [
  { value: "", label: "Tous les statuts" },
  { value: "PENDING", label: "En attente" },
  { value: "APPROVED", label: "Approuvees" },
  { value: "REJECTED", label: "Refusees" },
  { value: "MODIFICATION_REQUESTED", label: "Modifications demandees" },
];

export default function AdsPage() {
  const t = useTranslations("ads");
  const tCommon = useTranslations("common");

  const {
    // Data
    ads,
    categories,
    locale,

    // Pagination
    page,
    totalPages,
    total,
    handlePageChange,

    // Loading states
    isLoading,
    fetchError,

    // Search & Filter
    searchTerm,
    handleSearch,
    handleResetSearch,
    filterStatus,
    handleFilterStatus,
    filterCategoryId,
    handleFilterCategory,
  } = useAdsAdminController();

  // Build category options for select
  const categoryOptions = [
    { value: "", label: "Toutes les categories" },
    ...categories.map((cat) => ({
      value: cat.id,
      label: cat.name[locale] || cat.name.fr,
    })),
  ];

  // Error state
  if (fetchError) {
    return (
      <div className="flex flex-col h-full">
        <PageTitle title="Annonces" description="Toutes les annonces de la plateforme" />
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-400 mb-4" />
          <p className="text-red-700 font-medium">
            {tCommon("errors.generic")}
          </p>
          <p className="text-red-600 text-sm mt-2">
            Impossible de charger les annonces
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header - Fixed */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 flex-shrink-0">
        <PageTitle title="Annonces" description={`${total} annonces au total`} />
        <Link href={ROUTES.ADS.NEW}>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle annonce
          </Button>
        </Link>
      </div>

      {/* Filters - Fixed */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3 flex-shrink-0">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            placeholder="Rechercher une annonce..."
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

        {/* Status Filter */}
        <div className="w-full sm:w-48">
          <Select
            options={STATUS_OPTIONS}
            value={filterStatus}
            onChange={(e) => handleFilterStatus(e.target.value as AdStatus | "")}
          />
        </div>

        {/* Category Filter */}
        <div className="w-full sm:w-56">
          <Select
            options={categoryOptions}
            value={filterCategoryId}
            onChange={(e) => handleFilterCategory(e.target.value)}
          />
        </div>
      </div>

      {/* Table - Scrollable */}
      <div className="flex-1 overflow-auto min-h-0">
        <AdsAdminTable ads={ads} isLoading={isLoading} />
        {totalPages > 1 && (
            <div className="mt-4 pt-4  border-neutral-200 flex-shrink-0">
              <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
              />
            </div>
        )}
      </div>

      {/* Pagination */}

    </div>
  );
}
