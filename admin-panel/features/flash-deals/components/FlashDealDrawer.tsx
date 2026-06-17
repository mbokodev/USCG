"use client";

import { useTranslations } from "next-intl";
import { FormikProps } from "formik";
import { Zap } from "lucide-react";
import {
  MainDrawer,
  SwitchToggle,
  DrawerButton,
  AdAutocomplete,
} from "@/components/ui";
import { flashDealsService } from "../services";
import type { FlashDealFormValues, FlashDealListItem } from "../types";

interface FlashDealDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  formik: FormikProps<FlashDealFormValues>;
  isSubmitting: boolean;
  submitError: string | null;
  selectedFlashDeal: FlashDealListItem | null;
}

export function FlashDealDrawer({
  isOpen,
  onClose,
  formik,
  isSubmitting,
  submitError,
  selectedFlashDeal,
}: FlashDealDrawerProps) {
  const t = useTranslations("flashDeals");
  const tForm = useTranslations("flashDeals.form");
  const tCommon = useTranslations("common");
  const isEditing = !!selectedFlashDeal;

  const { values, errors, touched, handleChange, handleBlur, setFieldValue, handleSubmit } = formik;

  return (
    <MainDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? t("drawer.editTitle") : t("drawer.createTitle")}
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

          {/* Ad Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              {tForm("ad")} <span className="text-red-500">*</span>
            </label>
            <AdAutocomplete
              value={values.adId}
              selectedTitle={values.adTitle}
              onChange={(adId, adTitle) => {
                setFieldValue("adId", adId);
                setFieldValue("adTitle", adTitle);
              }}
              onClear={() => {
                setFieldValue("adId", "");
                setFieldValue("adTitle", "");
              }}
              searchFn={flashDealsService.getEligibleAds}
              placeholder={tForm("searchAd")}
              noResultsText={tForm("noEligibleAds")}
              icon={<Zap className="w-5 h-5 text-primary flex-shrink-0" />}
              showDiscountedPrice
              error={touched.adId && errors.adId ? errors.adId : undefined}
              disabled={isEditing}
            />
            {isEditing && (
              <p className="mt-1 text-xs text-neutral-500">{tForm("adNotEditable")}</p>
            )}
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              {tForm("startDate")} <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              name="startDate"
              value={values.startDate}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                touched.startDate && errors.startDate ? "border-red-300" : "border-neutral-300"
              }`}
            />
            {touched.startDate && errors.startDate && (
              <p className="mt-1 text-sm text-red-600">{t(`validation.${errors.startDate.split('.').pop()}`)}</p>
            )}
          </div>

          {/* Has End Date Toggle */}
          <SwitchToggle
            label={tForm("hasEndDate")}
            checked={values.hasEndDate}
            onCheckedChange={(checked) => setFieldValue("hasEndDate", checked)}
          />

          {/* End Date */}
          {values.hasEndDate && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                {tForm("endDate")} <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="endDate"
                value={values.endDate}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                  touched.endDate && errors.endDate ? "border-red-300" : "border-neutral-300"
                }`}
              />
              {touched.endDate && errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{t(`validation.${errors.endDate.split('.').pop()}`)}</p>
              )}
            </div>
          )}

          {/* Is Active Toggle */}
          <SwitchToggle
            label={tForm("isActive")}
            checked={values.isActive}
            onCheckedChange={(checked) => setFieldValue("isActive", checked)}
          />
        </div>

        {/* Fixed buttons at bottom */}
        <div className="shrink-0 pt-4 mt-4 border-neutral-200">
          <DrawerButton
            onCancel={onClose}
            submitText={tCommon("save")}
            cancelText={tCommon("cancel")}
            isLoading={isSubmitting}
          />
        </div>
      </form>
    </MainDrawer>
  );
}
