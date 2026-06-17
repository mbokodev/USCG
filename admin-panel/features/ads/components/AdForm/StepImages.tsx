"use client";

import { useState, useEffect } from "react";
import { useFormikContext } from "formik";
import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import { MultiImageUpload, Button, type ExistingImage } from "@/components/ui";
import { filesService } from "@/features/files";
import type { AdFormValues } from "../../schemas/ad-form.schema";

interface StepImagesProps {
  isEditMode?: boolean;
  adId?: string;
}

export function StepImages({ isEditMode = false, adId }: StepImagesProps) {
  const t = useTranslations("ads");
  const tCommon = useTranslations("common");
  const { values, errors, touched, setFieldValue } =
    useFormikContext<AdFormValues>();

  // State for delete confirmation modal
  const [imageToDelete, setImageToDelete] = useState<ExistingImage | null>(null);
  // State for setting default
  const [isSettingDefault, setIsSettingDefault] = useState(false);

  const handleRemoveExistingClick = (imageId: string) => {
    // Find the image to show in confirmation
    const image = values.existingImages.find((img) => img.id === imageId);
    if (image) {
      setImageToDelete(image);
    }
  };

  const handleConfirmDelete = () => {
    if (!imageToDelete) return;

    // Remove from existing images
    const newExisting = values.existingImages.filter((img) => img.id !== imageToDelete.id);
    setFieldValue("existingImages", newExisting);
    // Add to removed list
    setFieldValue("removedImageIds", [...values.removedImageIds, imageToDelete.id]);
    // Close modal
    setImageToDelete(null);
  };

  const handleSetDefault = async (imageId: string) => {
    if (!adId || isSettingDefault) return;

    setIsSettingDefault(true);
    try {
      await filesService.setDefault(imageId, adId);

      // Update local state - set selected image as default, remove from others
      const updatedImages = values.existingImages.map((img) => ({
        ...img,
        isDefault: img.id === imageId,
      }));
      setFieldValue("existingImages", updatedImages);
    } catch (error) {
      console.error("Error setting default image:", error);
    } finally {
      setIsSettingDefault(false);
    }
  };

  const handleUnsetDefault = async (imageId: string) => {
    if (!adId || isSettingDefault) return;

    setIsSettingDefault(true);
    try {
      await filesService.unsetDefault(imageId, adId);

      // Update local state - remove default from the image
      const updatedImages = values.existingImages.map((img) => ({
        ...img,
        isDefault: img.id === imageId ? false : img.isDefault,
      }));
      setFieldValue("existingImages", updatedImages);
    } catch (error) {
      console.error("Error unsetting default image:", error);
    } finally {
      setIsSettingDefault(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-neutral-900">
        {t("images.title")}
      </h2>

      <MultiImageUpload
        images={values.images}
        onChange={(images) => setFieldValue("images", images)}
        existingImages={values.existingImages}
        onRemoveExisting={handleRemoveExistingClick}
        onSetDefault={isEditMode && adId ? handleSetDefault : undefined}
        onUnsetDefault={isEditMode && adId ? handleUnsetDefault : undefined}
        maxImages={10}
        maxSizeMB={5}
        error={
          touched.images && errors.images
            ? typeof errors.images === "string"
              ? errors.images
              : undefined
            : undefined
        }
      />

      {!isEditMode && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-sm text-amber-800">
            <strong>Note :</strong> {t("images.note")}
          </p>
        </div>
      )}

      {/* Delete confirmation modal for existing images */}
      <ImageDeleteModal
        image={imageToDelete}
        onClose={() => setImageToDelete(null)}
        onConfirm={handleConfirmDelete}
        translations={{
          title: t("images.deleteConfirm.title"),
          message: t("images.deleteConfirm.message"),
          cancel: tCommon("cancel"),
          delete: tCommon("delete"),
        }}
      />
    </div>
  );
}

// Custom modal for image deletion with preview
function ImageDeleteModal({
  image,
  onClose,
  onConfirm,
  translations,
}: {
  image: ExistingImage | null;
  onClose: () => void;
  onConfirm: () => void;
  translations: {
    title: string;
    message: string;
    cancel: string;
    delete: string;
  };
}) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (image) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "auto";
    };
  }, [image, onClose]);

  if (!image) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-sm transform rounded-xl bg-white p-6 shadow-xl transition-all mx-4">
        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 mb-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-neutral-900 mb-3">
            {translations.title}
          </h3>

          {/* Image preview */}
          <div className="w-full aspect-video rounded-lg overflow-hidden bg-neutral-100 mb-3">
            <img
              src={image.url}
              alt={image.originalName}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Message */}
          <p className="text-sm text-neutral-500 mb-4">
            {translations.message}
          </p>

          {/* Actions */}
          <div className="flex gap-3 w-full">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              {translations.cancel}
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="flex-1"
              onClick={onConfirm}
            >
              {translations.delete}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
