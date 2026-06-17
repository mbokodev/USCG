"use client";

import { useState, useMemo } from "react";
import { useLocale } from "next-intl";
import { useFormik } from "formik";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import categoriesService from "../services/categories.service";
import {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
  I18nText,
} from "../types/categories.types";
import {
  categorySchema,
  CategoryFormValues,
  initialCategoryValues,
} from "../schemas/category.schema";
import { getApiErrorMessage } from "@/shared/utils";
import { useDebounce } from "@/shared/hooks";

export function useCategoryController() {
  const locale = useLocale() as "fr" | "en";
  const otherLocale = locale === "fr" ? "en" : "fr";
  const queryClient = useQueryClient();

  // =========================================================================
  // LOCAL STATE
  // =========================================================================
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 300);

  // =========================================================================
  // QUERIES
  // =========================================================================
  const {
    data: categoriesResponse,
    isLoading,
    error: fetchError,
  } = useQuery({
    queryKey: ["categories", debouncedSearch],
    queryFn: () =>
      categoriesService.getAll({
        search: debouncedSearch || undefined,
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const categories = categoriesResponse?.data || [];

  // Filter categories by search (client-side for name which is i18n)
  const filteredCategories = useMemo(() => {
    if (!debouncedSearch) return categories;
    const searchLower = debouncedSearch.toLowerCase();
    return categories.filter(
      (cat) =>
        cat.name[locale]?.toLowerCase().includes(searchLower) ||
        cat.name[otherLocale]?.toLowerCase().includes(searchLower) ||
        cat.slug.toLowerCase().includes(searchLower)
    );
  }, [categories, debouncedSearch, locale, otherLocale]);

  // =========================================================================
  // MUTATIONS
  // =========================================================================
  const createMutation = useMutation({
    mutationFn: async (values: CategoryFormValues) => {
      const data: CreateCategoryDto = {
        sourceLang: locale,
        name: values.name,
        slug: values.slug,
        description: values.description || undefined,
        icon: values.icon || undefined,
        sortOrder: values.sortOrder,
        isActive: values.isActive,
      };
      return categoriesService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      closeDrawer();
      formik.resetForm();
      setSubmitError(null);
    },
    onError: (error) => {
      setSubmitError(getApiErrorMessage(error));
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: CategoryFormValues) => {
      if (!selectedCategory) throw new Error("No category selected");

      // Build i18n update - merge with existing values
      const data: UpdateCategoryDto = {
        name: {
          [locale]: values.name,
          [otherLocale]: selectedCategory.name[otherLocale] || values.name,
        } as unknown as I18nText,
        slug: values.slug,
        description: values.description
          ? ({
              [locale]: values.description,
              [otherLocale]:
                selectedCategory.description?.[otherLocale] || values.description,
            } as unknown as I18nText)
          : undefined,
        icon: values.icon || undefined,
        sortOrder: values.sortOrder,
        isActive: values.isActive,
      };

      return categoriesService.update(selectedCategory.id, data);
    },
    onSuccess: () => {
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
    mutationFn: (id: string) => categoriesService.delete(id),
    onSuccess: () => {
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
  const formik = useFormik<CategoryFormValues>({
    initialValues: selectedCategory
      ? {
          name: selectedCategory.name[locale] || "",
          slug: selectedCategory.slug,
          description: selectedCategory.description?.[locale] || "",
          icon: selectedCategory.icon || "",
          sortOrder: selectedCategory.sortOrder,
          isActive: selectedCategory.isActive,
        }
      : initialCategoryValues,
    validationSchema: categorySchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setSubmitError(null);
      if (selectedCategory) {
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
    setSelectedCategory(null);
    setSubmitError(null);
    formik.resetForm();
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  const handleAdd = () => {
    setSelectedCategory(null);
    formik.resetForm();
    openDrawer();
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    openDrawer();
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    openModal();
  };

  const confirmDelete = () => {
    if (selectedCategory) {
      deleteMutation.mutate(selectedCategory.id);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleResetSearch = () => {
    setSearchTerm("");
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
    categories: filteredCategories,
    selectedCategory,
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

    // Search
    searchTerm,
    handleSearch,
    handleResetSearch,
  };
}
