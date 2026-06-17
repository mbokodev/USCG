"use client";

import { useTranslations, useLocale } from "next-intl";
import { FormikProps } from "formik";
import {
  MainDrawer,
  Input,
  Textarea,
  SwitchToggle,
  DrawerButton,
  Select,
} from "@/components/ui";
import { SubCategoryFormValues } from "../schemas/category.schema";
import { Category } from "../types/categories.types";

interface SubCategoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  formik: FormikProps<SubCategoryFormValues>;
  categories: Category[];
  isEditing: boolean;
  isLoading: boolean;
  submitError: string | null;
  generateSlug: (name: string) => string;
}

export function SubCategoryDrawer({
  isOpen,
  onClose,
  formik,
  categories,
  isEditing,
  isLoading,
  submitError,
  generateSlug,
}: SubCategoryDrawerProps) {
  const t = useTranslations("subcategories.form");
  const locale = useLocale() as "fr" | "en";
  const { values, errors, touched, handleChange, handleBlur, setFieldValue, handleSubmit } =
    formik;

  // Convert categories to select options
  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.name[locale] || cat.name.fr,
  }));

  return (
    <MainDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? t("editTitle") : t("createTitle")}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Submit Error */}
        {submitError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {submitError}
          </div>
        )}

        {/* Category Select */}
        <Select
          name="categoryId"
          label={t("category")}
          placeholder={t("selectCategory")}
          options={categoryOptions}
          value={values.categoryId}
          onChange={(e) => setFieldValue("categoryId", e.target.value)}
          onBlur={handleBlur}
          error={touched.categoryId ? errors.categoryId : undefined}
        />

        <Input
          name="name"
          label={t("name")}
          placeholder="Ex: Appartements"
          value={values.name}
          onChange={(e) => {
            handleChange(e);
            // Auto-generate slug when creating
            if (!isEditing && !touched.slug) {
              setFieldValue("slug", generateSlug(e.target.value));
            }
          }}
          onBlur={handleBlur}
          error={touched.name ? errors.name : undefined}
        />

        <Input
          name="slug"
          label={t("slug")}
          placeholder="Ex: appartements"
          value={values.slug}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.slug ? errors.slug : undefined}
        />

        <Textarea
          name="description"
          label={t("description")}
          placeholder="Description de la sous-categorie..."
          rows={3}
          value={values.description || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.description ? errors.description : undefined}
        />

        <Input
          name="sortOrder"
          type="number"
          label="Ordre d'affichage"
          placeholder="0"
          value={values.sortOrder}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.sortOrder ? errors.sortOrder : undefined}
        />

        <SwitchToggle
          label={t("isActive")}
          checked={values.isActive}
          onCheckedChange={(checked) => setFieldValue("isActive", checked)}
        />

        <DrawerButton
          onCancel={onClose}
          submitText={t("submit")}
          cancelText={t("cancel")}
          isLoading={isLoading}
        />
      </form>
    </MainDrawer>
  );
}
