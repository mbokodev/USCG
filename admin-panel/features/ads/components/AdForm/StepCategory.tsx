"use client";

import { useFormikContext } from "formik";
import { useLocale, useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { Input, Select } from "@/components/ui";
import categoriesService from "@/features/categories/services/categories.service";
import type { AdFormValues } from "../../schemas/ad-form.schema";

interface StepCategoryProps {
  isEditMode?: boolean;
}

export function StepCategory({ isEditMode = false }: StepCategoryProps) {
  const t = useTranslations("ads");
  const locale = useLocale();
  const { values, errors, touched, setFieldValue, handleChange, handleBlur } =
    useFormikContext<AdFormValues>();

  // Fetch categories
  const { data: categoriesResponse } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesService.getAll(),
  });
  const categories = categoriesResponse?.data || [];

  // Fetch subcategories based on selected category
  const { data: subCategoriesResponse } = useQuery({
    queryKey: ["subcategories", values.categoryId],
    queryFn: () =>
      categoriesService.getAllSubCategories({ categoryId: values.categoryId }),
    enabled: !!values.categoryId,
  });
  const subCategories = subCategoriesResponse?.data || [];

  // Build category options
  const categoryOptions = [
    { value: "", label: t("form.selectCategory") },
    ...categories.map((cat) => ({
      value: cat.id,
      label: cat.name[locale as "fr" | "en"] || cat.name.fr,
    })),
  ];

  // Build subcategory options
  const subCategoryOptions = [
    { value: "", label: t("form.selectSubcategory") },
    ...subCategories.map((sub) => ({
      value: sub.id,
      label: sub.name[locale as "fr" | "en"] || sub.name.fr,
    })),
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-neutral-900">
        {t("stepper.categoryDesc")}
      </h2>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          {t("form.categoryRequired")}
        </label>
        <Select
          name="categoryId"
          options={categoryOptions}
          value={values.categoryId}
          onChange={(e) => {
            setFieldValue("categoryId", e.target.value);
            setFieldValue("subCategoryId", ""); // Reset subcategory
          }}
          onBlur={handleBlur}
          error={touched.categoryId && errors.categoryId ? errors.categoryId : undefined}
          disabled={isEditMode}
        />
        {isEditMode && (
          <p className="mt-1 text-xs text-amber-600">
            {t("form.category")} - non modifiable
          </p>
        )}
      </div>

      {/* Subcategory */}
      {values.categoryId && subCategories.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            {t("form.subcategory")}
          </label>
          <Select
            name="subCategoryId"
            options={subCategoryOptions}
            value={values.subCategoryId}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </div>
      )}

      {/* City */}
      <Input
        name="city"
        label={t("form.cityRequired")}
        placeholder={t("form.cityPlaceholder")}
        value={values.city}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.city && errors.city ? errors.city : undefined}
      />

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          {t("form.locationRequired")}
        </label>
        <textarea
          name="location"
          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
            touched.location && errors.location
              ? "border-red-300"
              : "border-neutral-300"
          }`}
          rows={3}
          placeholder={t("form.locationPlaceholder")}
          value={values.location}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {touched.location && errors.location && (
          <p className="mt-1 text-sm text-red-500">{errors.location}</p>
        )}
        <p className="mt-1 text-xs text-neutral-500">
          {t("form.locationHint")}
        </p>
      </div>
    </div>
  );
}
