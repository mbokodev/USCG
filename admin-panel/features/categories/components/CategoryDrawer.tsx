"use client";

import { useTranslations } from "next-intl";
import { FormikProps } from "formik";
import {
  MainDrawer,
  Input,
  Textarea,
  SwitchToggle,
  DrawerButton,
  IconPicker,
} from "@/components/ui";
import { CategoryFormValues } from "../schemas/category.schema";

interface CategoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  formik: FormikProps<CategoryFormValues>;
  isEditing: boolean;
  isLoading: boolean;
  submitError: string | null;
  generateSlug: (name: string) => string;
}

export function CategoryDrawer({
  isOpen,
  onClose,
  formik,
  isEditing,
  isLoading,
  submitError,
  generateSlug,
}: CategoryDrawerProps) {
  const t = useTranslations("categories.form");
  const { values, errors, touched, handleChange, handleBlur, setFieldValue, handleSubmit } =
    formik;

  return (
    <MainDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? t("editTitle") : t("createTitle")}
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        {/* Scrollable form fields */}
        <div className="flex-1 space-y-4 overflow-y-auto">
          {/* Submit Error */}
          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {submitError}
            </div>
          )}

          <Input
            name="name"
            label={t("name")}
            placeholder="Ex: Immobilier"
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
            placeholder="Ex: immobilier"
            value={values.slug}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.slug ? errors.slug : undefined}
          />

          <Textarea
            name="description"
            label={t("description")}
            placeholder="Description de la categorie..."
            rows={3}
            value={values.description || ""}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.description ? errors.description : undefined}
          />

          <IconPicker
            label={t("icon")}
            value={values.icon || null}
            onChange={(iconName) => setFieldValue("icon", iconName || "")}
            error={touched.icon ? errors.icon : undefined}
          />

          <SwitchToggle
            label={t("isActive")}
            checked={values.isActive}
            onCheckedChange={(checked) => setFieldValue("isActive", checked)}
          />
        </div>

        {/* Fixed buttons at bottom */}
        <div className="shrink-0 pt-4 mt-4 border-neutral-200">
          <DrawerButton
            onCancel={onClose}
            submitText={t("submit")}
            cancelText={t("cancel")}
            isLoading={isLoading}
          />
        </div>
      </form>
    </MainDrawer>
  );
}
