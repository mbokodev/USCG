"use client";

import { useState, useMemo } from "react";
import { useLocale } from "next-intl";
import { useFormik } from "formik";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import categoriesService from "../services/categories.service";
import {
  Category,
  SubCategory,
  CreateSubCategoryDto,
  UpdateSubCategoryDto,
  I18nText,
} from "../types/categories.types";
import {
  subCategorySchema,
  SubCategoryFormValues,
  initialSubCategoryValues,
} from "../schemas/category.schema";
import { getApiErrorMessage } from "@/shared/utils";
import { useDebounce } from "@/shared/hooks";

export function useSubCategoryController() {
  const locale = useLocale() as "fr" | "en";
  const otherLocale = locale === "fr" ? "en" : "fr";
  const queryClient = useQueryClient();

  // =========================================================================
  // LOCAL STATE
  // =========================================================================
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState<string>("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 300);

  // =========================================================================
  // QUERIES
  // =========================================================================

  // Get all categories for dropdown
  const { data: categoriesResponse } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesService.getAll(),
    staleTime: 5 * 60 * 1000,
  });

  const categories = categoriesResponse?.data || [];

  // Get subcategories
  const {
    data: subCategoriesResponse,
    isLoading,
    error: fetchError,
  } = useQuery({
    queryKey: ["subcategories", filterCategoryId, debouncedSearch],
    queryFn: () =>
      categoriesService.getAllSubCategories({
        categoryId: filterCategoryId || undefined,
        search: debouncedSearch || undefined,
        includeCategory: true,
      }),
    staleTime: 5 * 60 * 1000,
  });

  const subCategories = subCategoriesResponse?.data || [];

  // Filter subcategories by search (client-side for name which is i18n)
  const filteredSubCategories = useMemo(() => {
    if (!debouncedSearch) return subCategories;
    const searchLower = debouncedSearch.toLowerCase();
    return subCategories.filter(
      (sub) =>
        sub.name[locale]?.toLowerCase().includes(searchLower) ||
        sub.name[otherLocale]?.toLowerCase().includes(searchLower) ||
        sub.slug.toLowerCase().includes(searchLower)
    );
  }, [subCategories, debouncedSearch, locale, otherLocale]);

  // =========================================================================
  // MUTATIONS
  // =========================================================================
  const createMutation = useMutation({
    mutationFn: async (values: SubCategoryFormValues) => {
      const data: CreateSubCategoryDto = {
        sourceLang: locale,
        name: values.name,
        slug: values.slug,
        description: values.description || undefined,
        categoryId: values.categoryId,
        sortOrder: values.sortOrder,
        isActive: values.isActive,
      };
      return categoriesService.createSubCategory(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] }); // Update counts
      closeDrawer();
      formik.resetForm();
      setSubmitError(null);
    },
    onError: (error) => {
      setSubmitError(getApiErrorMessage(error));
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: SubCategoryFormValues) => {
      if (!selectedSubCategory) throw new Error("No subcategory selected");

      const data: UpdateSubCategoryDto = {
        name: {
          [locale]: values.name,
          [otherLocale]: selectedSubCategory.name[otherLocale] || values.name,
        } as unknown as I18nText,
        slug: values.slug,
        description: values.description
          ? ({
              [locale]: values.description,
              [otherLocale]:
                selectedSubCategory.description?.[otherLocale] || values.description,
            } as unknown as I18nText)
          : undefined,
        categoryId: values.categoryId,
        sortOrder: values.sortOrder,
        isActive: values.isActive,
      };

      return categoriesService.updateSubCategory(selectedSubCategory.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      closeDrawer();
      formik.resetForm();
      setSubmitError(null);
    },
    onError: (error) => {
      setSubmitError(getApiErrorMessage(error));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesService.deleteSubCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      closeModal();
    },
    onError: (error) => {
      console.error("Delete error:", getApiErrorMessage(error));
    },
  });

  // =========================================================================
  // FORMIK
  // =========================================================================
  const formik = useFormik<SubCategoryFormValues>({
    initialValues: selectedSubCategory
      ? {
          name: selectedSubCategory.name[locale] || "",
          slug: selectedSubCategory.slug,
          description: selectedSubCategory.description?.[locale] || "",
          categoryId: selectedSubCategory.categoryId,
          sortOrder: selectedSubCategory.sortOrder,
          isActive: selectedSubCategory.isActive,
        }
      : initialSubCategoryValues,
    validationSchema: subCategorySchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setSubmitError(null);
      if (selectedSubCategory) {
        await updateMutation.mutateAsync(values);
      } else {
        await createMutation.mutateAsync(values);
      }
    },
  });

  // =========================================================================
  // HANDLERS
  // =========================================================================
  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedSubCategory(null);
    setSubmitError(null);
    formik.resetForm();
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSubCategory(null);
  };

  const handleAdd = () => {
    setSelectedSubCategory(null);
    formik.resetForm();
    openDrawer();
  };

  const handleEdit = (subCategory: SubCategory) => {
    setSelectedSubCategory(subCategory);
    openDrawer();
  };

  const handleDelete = (subCategory: SubCategory) => {
    setSelectedSubCategory(subCategory);
    openModal();
  };

  const confirmDelete = () => {
    if (selectedSubCategory) {
      deleteMutation.mutate(selectedSubCategory.id);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleResetSearch = () => {
    setSearchTerm("");
  };

  const handleFilterCategory = (categoryId: string) => {
    setFilterCategoryId(categoryId);
  };

  // Generate slug from name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  // =========================================================================
  // RETURN
  // =========================================================================
  return {
    // Data
    subCategories: filteredSubCategories,
    categories,
    selectedSubCategory,
    locale,

    // Loading states
    isLoading,
    fetchError,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    submitError,

    // Form
    formik,
    generateSlug,

    // Drawer control
    isDrawerOpen,
    openDrawer,
    closeDrawer,

    // Modal control
    isModalOpen,
    openModal,
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
  };
}
