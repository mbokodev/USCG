"use client";

import { useState } from "react";
import { Formik } from "formik";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui";
import { adsService } from "@/features/ads";
import { filesService } from "@/features/files";
import { getApiErrorMessage } from "@/shared/utils";
import { ROUTES } from "@/config/routes";
import {
  adFormInitialValues,
  getStepSchema,
  getStepFields,
  type AdFormValues,
  type ExistingImage,
} from "../../schemas/ad-form.schema";
import { AdFormStepper, type Step } from "./AdFormStepper";
import { StepCategory } from "./StepCategory";
import { StepInformation } from "./StepInformation";
import { StepImages } from "./StepImages";

export interface AdFormProps {
  mode?: "create" | "edit";
  adId?: string;
  initialValues?: Partial<AdFormValues>;
  onCancel?: () => void;
}

export function AdForm({
  mode = "create",
  adId,
  initialValues,
  onCancel,
}: AdFormProps) {
  const t = useTranslations("ads");
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditMode = mode === "edit";

  const [currentStep, setCurrentStep] = useState(1);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState("");

  // Steps with translations
  const STEPS: Step[] = [
    { id: 1, title: t("stepper.category"), description: t("stepper.categoryDesc") },
    { id: 2, title: t("stepper.information"), description: t("stepper.informationDesc") },
    { id: 3, title: t("stepper.images"), description: t("stepper.imagesDesc") },
  ];

  // Merge initial values with defaults
  const formInitialValues: AdFormValues = {
    ...adFormInitialValues,
    ...initialValues,
  };

  // Validate current step and move to next
  const handleNext = async (
    validateForm: () => Promise<Record<string, unknown>>,
    setTouched: (touched: Record<string, boolean>) => void
  ) => {
    // Mark current step fields as touched
    const stepFields = getStepFields(currentStep);
    const touchedFields = stepFields.reduce(
      (acc, field) => ({ ...acc, [field]: true }),
      {}
    );
    setTouched(touchedFields);

    // Validate current step
    const errors = await validateForm();
    const stepErrors = stepFields.filter((field) => errors[field]);

    if (stepErrors.length === 0) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Final submit handler - called only when clicking "Creer/Modifier l'annonce"
  const handleFinalSubmit = async (values: AdFormValues) => {
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      let uploadedFileIds: string[] = [];

      // Step 1: Upload new images if any
      if (values.images.length > 0) {
        setSubmitProgress(t("form.uploadingImages"));

        for (let i = 0; i < values.images.length; i++) {
          setSubmitProgress(t("form.uploadingImages"));
          const uploadedFile = await filesService.uploadImage(
            values.images[i].file
          );
          uploadedFileIds.push(uploadedFile.id);
        }
      }

      if (isEditMode && adId) {
        // EDIT MODE
        setSubmitProgress(t("form.updatingAd"));

        // Update the ad (remet en PENDING si REJECTED ou MODIFICATION_REQUESTED)
        await adsService.update(adId, {
          title: values.title,
          description: values.description,
          price: values.price,
          discountedPrice: values.discountedPrice,
          quantity: values.quantity,
          type: values.type,
          subCategoryId: values.subCategoryId || undefined,
          city: values.city,
          location: values.location,
        });

        // Delete removed images
        if (values.removedImageIds.length > 0) {
          setSubmitProgress(t("form.deletingImages"));
          for (const fileId of values.removedImageIds) {
            await filesService.delete(fileId);
          }
        }

        // Link new uploaded files
        if (uploadedFileIds.length > 0) {
          setSubmitProgress(t("form.linkingImages"));
          await filesService.linkFilesToAd(uploadedFileIds, adId);
        }

        // Success - redirect
        queryClient.invalidateQueries({ queryKey: ["ads-admin"] });
        queryClient.invalidateQueries({ queryKey: ["admin-ad", adId] });
        router.push(ROUTES.ADS.DETAIL(adId));
      } else {
        // CREATE MODE
        setSubmitProgress(t("form.creatingAd"));
        const createdAd = await adsService.create({
          title: values.title,
          description: values.description,
          price: values.price,
          discountedPrice: values.discountedPrice,
          quantity: values.quantity,
          type: values.type,
          categoryId: values.categoryId,
          subCategoryId: values.subCategoryId || undefined,
          city: values.city,
          location: values.location,
        });

        // Link uploaded files to the ad
        if (uploadedFileIds.length > 0) {
          setSubmitProgress(t("form.linkingImages"));
          await filesService.linkFilesToAd(uploadedFileIds, createdAd.id);
        }

        // Success - redirect
        queryClient.invalidateQueries({ queryKey: ["ads-admin"] });
        router.push(ROUTES.ADS.LIST);
      }
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
      setSubmitProgress("");
    }
  };

  return (
    <>
      {/* Stepper */}
      <AdFormStepper steps={STEPS} currentStep={currentStep} />

      {/* Submit Error */}
      {submitError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {submitError}
        </div>
      )}

      {/* Form - no onSubmit, we handle everything manually */}
      <Formik
        initialValues={formInitialValues}
        validationSchema={getStepSchema(currentStep)}
        onSubmit={() => {}} // Never used - we handle submit manually
        validateOnMount={false}
        validateOnChange={true}
        validateOnBlur={true}
        enableReinitialize={true}
      >
        {({ values, validateForm, setTouched }) => (
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4 sm:p-8">
            {/* Step Content */}
            {currentStep === 1 && <StepCategory isEditMode={isEditMode} />}
            {currentStep === 2 && <StepInformation />}
            {currentStep === 3 && <StepImages isEditMode={isEditMode} adId={adId} />}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-200">
              <div className="flex items-center gap-2">
                {onCancel && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onCancel}
                    disabled={isSubmitting}
                  >
                    {t("form.cancel")}
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrev}
                  disabled={currentStep === 1 || isSubmitting}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t("form.previous")}
                </Button>
              </div>

              {currentStep < STEPS.length ? (
                <Button
                  type="button"
                  onClick={() =>
                    handleNext(
                      validateForm,
                      setTouched as (touched: Record<string, boolean>) => void
                    )
                  }
                >
                  {t("form.next")}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => handleFinalSubmit(values)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {submitProgress || t("form.submitting")}
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      {t("form.submit")}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </Formik>
    </>
  );
}
