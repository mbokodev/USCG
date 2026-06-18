"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, AlertCircle } from "lucide-react";
import {
  featuredSectionsService,
  FeaturedSectionTable,
} from "@/features/featured-sections";
import { PageTitle, Button, DeleteModal } from "@/components/ui";
import { ROUTES } from "@/config/routes";
import type { IFeaturedSection } from "@uscg/shared/types";

export default function FeaturedSectionsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations("featuredSections");
  const tCommon = useTranslations("common");
  const locale = useLocale() as "fr" | "en";

  const [selectedSection, setSelectedSection] = useState<IFeaturedSection | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Fetch sections
  const { data, isLoading, error } = useQuery({
    queryKey: ["featured-sections"],
    queryFn: () => featuredSectionsService.getAll(),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => featuredSectionsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featured-sections"] });
      setIsDeleteModalOpen(false);
      setSelectedSection(null);
    },
  });

  const sections = data?.data || [];

  // Handlers
  const handleAdd = () => {
    router.push(ROUTES.FEATURED_SECTIONS.NEW);
  };

  const handleEdit = (section: IFeaturedSection) => {
    router.push(ROUTES.FEATURED_SECTIONS.EDIT(section.id));
  };

  const handleDelete = (section: IFeaturedSection) => {
    setSelectedSection(section);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedSection) {
      await deleteMutation.mutateAsync(selectedSection.id);
    }
  };

  // Get section title for delete modal
  const getSectionTitle = (section: IFeaturedSection | null) => {
    if (!section) return "";
    const title = section.title as { fr: string; en: string };
    return title[locale] || title.fr || "";
  };

  // Error state
  if (error) {
    return (
      <div>
        <PageTitle title={t("title")} description={t("subtitle")} />
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-400 mb-4" />
          <p className="text-red-700 font-medium">
            {tCommon("errors.generic")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 flex-shrink-0">
        <PageTitle title={t("title")} description={t("subtitle")} />
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          {t("addNew")}
        </Button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-hidden">
        <FeaturedSectionTable
          sections={sections}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={handleAdd}
        />
      </div>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemName={getSectionTitle(selectedSection)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
