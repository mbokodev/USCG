"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Folder, HelpCircle, AlertCircle } from "lucide-react";
import { Link } from "@/i18n/routing";
import { PageTitle, Button, DeleteModal } from "@/components/ui";
import { FaqCategoryTable, FaqTable, faqService } from "@/features/faq";
import type { IFaqCategory, IFaq } from "@/features/faq";
import { ROUTES } from "@/config/routes";

type TabType = "categories" | "questions";

export default function FaqPage() {
  const t = useTranslations("faq");
  const tCommon = useTranslations("common");
  const locale = useLocale() as "fr" | "en";
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabType>("questions");
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    type: "category" | "faq";
    item: IFaqCategory | IFaq | null;
  }>({ open: false, type: "category", item: null });

  // Fetch categories
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useQuery({
    queryKey: ["faq-categories"],
    queryFn: faqService.getCategories,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch FAQs
  const {
    data: faqs = [],
    isLoading: faqsLoading,
    error: faqsError,
  } = useQuery({
    queryKey: ["faqs"],
    queryFn: faqService.getFaqs,
    staleTime: 5 * 60 * 1000,
  });

  // Delete mutations
  const deleteCategoryMutation = useMutation({
    mutationFn: faqService.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faq-categories"] });
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      setDeleteModal({ open: false, type: "category", item: null });
    },
  });

  const deleteFaqMutation = useMutation({
    mutationFn: faqService.deleteFaq,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      setDeleteModal({ open: false, type: "faq", item: null });
    },
  });

  const handleDeleteCategory = (category: IFaqCategory) => {
    setDeleteModal({ open: true, type: "category", item: category });
  };

  const handleDeleteFaq = (faq: IFaq) => {
    setDeleteModal({ open: true, type: "faq", item: faq });
  };

  const confirmDelete = () => {
    if (!deleteModal.item) return;

    if (deleteModal.type === "category") {
      deleteCategoryMutation.mutate(deleteModal.item.id);
    } else {
      deleteFaqMutation.mutate(deleteModal.item.id);
    }
  };

  const error = categoriesError || faqsError;

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <PageTitle title={t("title")} description={t("description")} />
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-400 mb-4" />
          <p className="text-red-700 font-medium">{tCommon("errors.generic")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 flex-shrink-0">
        <PageTitle title={t("title")} description={t("description")} />
        <div className="flex gap-2">
          {activeTab === "categories" ? (
            <Link href={ROUTES.FAQ.CATEGORY_NEW}>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                {t("categories.create")}
              </Button>
            </Link>
          ) : (
            <Link href={ROUTES.FAQ.CREATE}>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                {t("questions.create")}
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200 mb-6 flex-shrink-0">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("questions")}
            className={`pb-3 px-1 font-medium text-sm transition-colors flex items-center gap-2 ${
              activeTab === "questions"
                ? "text-primary border-b-2 border-primary"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            {t("tabs.questions")}
            <span className="bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full text-xs">
              {faqs.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`pb-3 px-1 font-medium text-sm transition-colors flex items-center gap-2 ${
              activeTab === "categories"
                ? "text-primary border-b-2 border-primary"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            <Folder className="w-4 h-4" />
            {t("tabs.categories")}
            <span className="bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full text-xs">
              {categories.length}
            </span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === "categories" ? (
          <FaqCategoryTable
            categories={categories}
            isLoading={categoriesLoading}
            onDelete={handleDeleteCategory}
          />
        ) : (
          <FaqTable
            faqs={faqs}
            isLoading={faqsLoading}
            onDelete={handleDeleteFaq}
          />
        )}
      </div>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, type: "category", item: null })}
        onConfirm={confirmDelete}
        title={
          deleteModal.type === "category"
            ? t("categories.deleteTitle")
            : t("questions.deleteTitle")
        }
        message={
          deleteModal.type === "category"
            ? t("categories.confirmDelete")
            : t("questions.confirmDelete")
        }
        isLoading={deleteCategoryMutation.isPending || deleteFaqMutation.isPending}
      />
    </div>
  );
}
