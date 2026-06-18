"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useTranslations, useLocale } from "next-intl";
import { Loader2, Check } from "lucide-react";
import * as Yup from "yup";
import {
  Input,
  Select,
  SwitchToggle,
  Button,
} from "@/components/ui";
import { featuredSectionsService } from "../services/featured-sections.service";
import { categoriesService } from "@/features/categories";
import { http } from "@/shared/api/http";
import type {
  ICategory,
  ISubCategory,
  IVariant,
  I18nText,
} from "@uscg/shared/types";
import type {
  IFeaturedSection,
  CreateFeaturedSectionDto,
  UpdateFeaturedSectionDto,
} from "../types/featured-section.types";
import { FilterType } from "../types/featured-section.types";
import { getApiErrorMessage } from "@/shared/utils";
import { ROUTES } from "@/config/routes";

interface FeaturedSectionFormProps {
  section?: IFeaturedSection;
  isEditing?: boolean;
}

interface FormValues {
  title: string;
  sourceType: "category" | "subcategory";
  categoryId: string;
  subCategoryId: string;
  filterType: FilterType;
  variantId: string;
  limit: number;
  isActive: boolean;
}

const validationSchema = Yup.object({
  title: Yup.string()
    .required("Le titre est requis")
    .min(2, "Le titre doit contenir au moins 2 caractères")
    .max(200, "Le titre ne peut pas dépasser 200 caractères"),
  sourceType: Yup.string().oneOf(["category", "subcategory"]).required(),
  categoryId: Yup.string().when("sourceType", {
    is: "category",
    then: (schema) => schema.required("Catégorie requise"),
    otherwise: (schema) => schema.notRequired(),
  }),
  subCategoryId: Yup.string().when("sourceType", {
    is: "subcategory",
    then: (schema) => schema.required("Sous-catégorie requise"),
    otherwise: (schema) => schema.notRequired(),
  }),
  filterType: Yup.string().oneOf(["NONE", "CITY", "SUBCATEGORY", "VARIANT"]).required(),
  variantId: Yup.string().when("filterType", {
    is: "VARIANT",
    then: (schema) => schema.required("Variante requise"),
    otherwise: (schema) => schema.notRequired(),
  }),
  limit: Yup.number().min(1).max(100).required(),
  isActive: Yup.boolean().required(),
});

export function FeaturedSectionForm({
  section,
  isEditing = false,
}: FeaturedSectionFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations("featuredSections.form");
  const tCommon = useTranslations("common");
  const locale = useLocale() as "fr" | "en";
  const otherLocale = locale === "fr" ? "en" : "fr";

  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesService.getAll(),
  });

  // Fetch variants
  const { data: variantsData } = useQuery({
    queryKey: ["variants"],
    queryFn: async () => {
      const response = await http.get<{ data: IVariant[] }>("/variants", {
        params: { limit: 100 },
      });
      return response.data;
    },
  });

  const categories = categoriesData?.data || [];
  const variants = variantsData?.data || [];

  // Helper to get name in locale
  const getName = (name: { fr: string; en: string } | undefined) => {
    if (!name) return "";
    return name[locale] || name.fr || "";
  };

  // Category options for select
  const categoryOptions = useMemo(() => {
    return categories.map((cat: ICategory) => ({
      value: cat.id,
      label: getName(cat.name as { fr: string; en: string }),
    }));
  }, [categories, locale]);

  // Get all subcategories from all categories with parent name
  const subCategoryOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];
    categories.forEach((cat: ICategory) => {
      if (cat.subCategories) {
        const catName = getName(cat.name as { fr: string; en: string });
        cat.subCategories.forEach((sub: ISubCategory) => {
          options.push({
            value: sub.id,
            label: `${catName} → ${getName(sub.name as { fr: string; en: string })}`,
          });
        });
      }
    });
    return options;
  }, [categories, locale]);

  // Variant options for select
  const variantOptions = useMemo(() => {
    return variants.map((variant: IVariant) => ({
      value: variant.id,
      label: getName(variant.name as { fr: string; en: string }),
    }));
  }, [variants, locale]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const data: CreateFeaturedSectionDto = {
        sourceLang: locale,
        title: values.title,
        categoryId: values.sourceType === "category" ? values.categoryId : undefined,
        subCategoryId: values.sourceType === "subcategory" ? values.subCategoryId : undefined,
        filterType: values.filterType,
        variantId: values.filterType === "VARIANT" ? values.variantId : undefined,
        limit: values.limit,
        isActive: values.isActive,
      };
      return featuredSectionsService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featured-sections"] });
      router.push(ROUTES.FEATURED_SECTIONS.LIST);
    },
    onError: (error) => {
      setSubmitError(getApiErrorMessage(error));
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!section) throw new Error("No section selected");

      // Build i18n update - merge with existing values
      const data: UpdateFeaturedSectionDto = {
        title: {
          [locale]: values.title,
          [otherLocale]: (section.title as I18nText)[otherLocale] || values.title,
        } as I18nText,
        categoryId: values.sourceType === "category" ? values.categoryId : null,
        subCategoryId: values.sourceType === "subcategory" ? values.subCategoryId : null,
        filterType: values.filterType,
        variantId: values.filterType === "VARIANT" ? values.variantId : null,
        limit: values.limit,
        isActive: values.isActive,
      };

      return featuredSectionsService.update(section.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featured-sections"] });
      router.push(ROUTES.FEATURED_SECTIONS.LIST);
    },
    onError: (error) => {
      setSubmitError(getApiErrorMessage(error));
    },
  });

  // Determine initial source type
  const getInitialSourceType = (): "category" | "subcategory" => {
    if (section?.subCategoryId) return "subcategory";
    return "category";
  };

  // Get title in current locale
  const getInitialTitle = (): string => {
    if (!section) return "";
    const title = section.title as I18nText;
    return title[locale] || title.fr || "";
  };

  // Form
  const formik = useFormik<FormValues>({
    initialValues: section
      ? {
          title: getInitialTitle(),
          sourceType: getInitialSourceType(),
          categoryId: section.categoryId || "",
          subCategoryId: section.subCategoryId || "",
          filterType: section.filterType as FilterType,
          variantId: section.variantId || "",
          limit: section.limit,
          isActive: section.isActive,
        }
      : {
          title: "",
          sourceType: "category",
          categoryId: "",
          subCategoryId: "",
          filterType: "NONE" as FilterType,
          variantId: "",
          limit: 20,
          isActive: true,
        },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setSubmitError(null);
      if (isEditing && section) {
        await updateMutation.mutateAsync(values);
      } else {
        await createMutation.mutateAsync(values);
      }
    },
  });

  const { values, errors, touched, handleChange, handleBlur, setFieldValue } = formik;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Reset categoryId/subCategoryId when sourceType changes
  const handleSourceTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleChange(e);
    const newSourceType = e.target.value;
    if (newSourceType === "category") {
      setFieldValue("subCategoryId", "");
      // Can't use SUBCATEGORY filter with subcategory source
      if (values.filterType === "SUBCATEGORY") {
        setFieldValue("filterType", "NONE");
      }
    } else {
      setFieldValue("categoryId", "");
      // Can't use SUBCATEGORY filter with subcategory source
      if (values.filterType === "SUBCATEGORY") {
        setFieldValue("filterType", "NONE");
      }
    }
  };

  // Source type options
  const sourceTypeOptions = [
    { value: "category", label: t("sourceTypes.category") },
    { value: "subcategory", label: t("sourceTypes.subcategory") },
  ];

  // Filter type options (dynamically built based on source type)
  const filterTypeOptions = useMemo(() => {
    const options = [
      { value: "NONE", label: t("filterTypes.none") },
      { value: "CITY", label: t("filterTypes.city") },
    ];
    if (values.sourceType === "category") {
      options.push({ value: "SUBCATEGORY", label: t("filterTypes.subcategory") });
    }
    options.push({ value: "VARIANT", label: t("filterTypes.variant") });
    return options;
  }, [values.sourceType, t]);

  return (
    <>
      {/* Submit Error */}
      {submitError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {submitError}
        </div>
      )}

      {/* Card Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4 sm:p-8">
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Title */}
          <Input
            name="title"
            label={t("title")}
            placeholder={t("titlePlaceholder")}
            value={values.title}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.title ? errors.title : undefined}
          />

          {/* Source Type */}
          <Select
            name="sourceType"
            label={t("sourceType")}
            value={values.sourceType}
            onChange={handleSourceTypeChange}
            onBlur={handleBlur}
            options={sourceTypeOptions}
          />

          {/* Category Select (if sourceType = category) */}
          {values.sourceType === "category" && (
            <Select
              name="categoryId"
              label={t("category")}
              value={values.categoryId}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.categoryId ? errors.categoryId : undefined}
              options={categoryOptions}
              placeholder={t("selectCategory")}
            />
          )}

          {/* SubCategory Select (if sourceType = subcategory) */}
          {values.sourceType === "subcategory" && (
            <Select
              name="subCategoryId"
              label={t("subcategory")}
              value={values.subCategoryId}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.subCategoryId ? errors.subCategoryId : undefined}
              options={subCategoryOptions}
              placeholder={t("selectSubcategory")}
            />
          )}

          {/* Filter Type */}
          <Select
            name="filterType"
            label={t("filterType")}
            value={values.filterType}
            onChange={handleChange}
            onBlur={handleBlur}
            options={filterTypeOptions}
          />

          {/* Variant Select (if filterType = VARIANT) */}
          {values.filterType === "VARIANT" && (
            <Select
              name="variantId"
              label={t("variant")}
              value={values.variantId}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.variantId ? errors.variantId : undefined}
              options={variantOptions}
              placeholder={t("selectVariant")}
            />
          )}

          {/* Limit */}
          <Input
            name="limit"
            type="number"
            label={t("limit")}
            placeholder="20"
            value={values.limit}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.limit ? errors.limit : undefined}
          />

          {/* Is Active */}
          <SwitchToggle
            label={t("isActive")}
            checked={values.isActive}
            onCheckedChange={(checked) => setFieldValue("isActive", checked)}
          />

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-neutral-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(ROUTES.FEATURED_SECTIONS.LIST)}
              disabled={isSubmitting}
            >
              {tCommon("cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {tCommon("loading")}
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {tCommon("save")}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
