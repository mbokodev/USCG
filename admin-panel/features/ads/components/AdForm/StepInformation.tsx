"use client";

import { useFormikContext } from "formik";
import { useTranslations } from "next-intl";
import { Input, Select, TiptapEditor } from "@/components/ui";
import type { AdFormValues } from "../../schemas/ad-form.schema";

export function StepInformation() {
  const t = useTranslations("ads");
  const { values, errors, touched, setFieldValue, handleChange, handleBlur } =
    useFormikContext<AdFormValues>();

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-neutral-900">
        {t("stepper.information")}
      </h2>

      {/* Title */}
      <Input
        name="title"
        label={t("form.titleRequired")}
        placeholder={t("form.titlePlaceholder")}
        value={values.title}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.title && errors.title ? errors.title : undefined}
      />

      {/* Type & Price */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            {t("form.typeRequired")}
          </label>
          <Select
            name="type"
            options={[
              { value: "SALE", label: t("type.SALE") },
              { value: "RENT", label: t("type.RENT") },
            ]}
            value={values.type}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </div>

        <Input
          name="price"
          label={t("form.price")}
          type="number"
          placeholder={t("form.pricePlaceholder")}
          value={values.price ?? ""}
          onChange={(e) =>
            setFieldValue("price", e.target.value ? parseFloat(e.target.value) : null)
          }
          onBlur={handleBlur}
          error={touched.price && errors.price ? errors.price : undefined}
        />
      </div>

      {/* Discounted Price */}
      <div>
        <Input
          name="discountedPrice"
          label={t("form.discountedPrice")}
          type="number"
          placeholder={t("form.discountedPricePlaceholder")}
          value={values.discountedPrice ?? ""}
          onChange={(e) =>
            setFieldValue(
              "discountedPrice",
              e.target.value ? parseFloat(e.target.value) : null
            )
          }
          onBlur={handleBlur}
          disabled={values.price === null || values.price === undefined || values.price <= 0}
          error={
            touched.discountedPrice && errors.discountedPrice
              ? errors.discountedPrice
              : undefined
          }
        />
        <p className="mt-1 text-xs text-neutral-500">
          {t("form.discountedPriceHint")}
        </p>
      </div>

      {/* Quantity */}
      <div>
        <Input
          name="quantity"
          label={t("form.quantity")}
          type="number"
          placeholder={t("form.quantityPlaceholder")}
          value={values.quantity || ""}
          onChange={(e) =>
            setFieldValue(
              "quantity",
              e.target.value ? parseInt(e.target.value) : null
            )
          }
          onBlur={handleBlur}
        />
        <p className="mt-1 text-xs text-neutral-500">{t("form.quantityHint")}</p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          {t("form.description")} *
        </label>
        <TiptapEditor
          content={values.description}
          onChange={(content) => setFieldValue("description", content)}
          placeholder={t("form.descriptionPlaceholder")}
          minHeight="200px"
        />
        {touched.description && errors.description && (
          <p className="mt-1 text-sm text-red-500">
            {typeof errors.description === "string"
              ? errors.description
              : t("form.description")}
          </p>
        )}
      </div>
    </div>
  );
}
