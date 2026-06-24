"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Loader2, Check } from "lucide-react";
import {
  Input,
  Textarea,
  SwitchToggle,
  Button,
  SingleImageUpload,
} from "@/components/ui";
import { bannersService } from "../services";
import { filesService } from "@/features/files";
import type { Banner, CreateBannerDto, BannerFormValues, LinkType } from "../types";
import { bannerSchema, initialBannerValues } from "../schemas";
import { LinkSelector } from "./LinkSelector";
import { getApiErrorMessage } from "@/shared/utils";
import { ROUTES } from "@/config/routes";

// Helper to parse existing buttonLink to determine type
function parseLinkType(buttonLink: string | null): { type: LinkType; productId: string; pageLink: string } {
  if (!buttonLink) {
    return { type: "product", productId: "", pageLink: "" };
  }

  const productMatch = buttonLink.match(/^\/product\/([a-zA-Z0-9_-]+)$/);
  if (productMatch) {
    return { type: "product", productId: productMatch[1], pageLink: "" };
  }

  return { type: "page", productId: "", pageLink: buttonLink };
}

interface BannerFormProps {
  banner?: Banner;
  isEditing?: boolean;
}

export function BannerForm({ banner, isEditing = false }: BannerFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations("banners.form");
  const tCommon = useTranslations("common");

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateBannerDto) => bannersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      router.push(ROUTES.BANNERS.LIST);
    },
    onError: (error) => {
      setSubmitError(getApiErrorMessage(error));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateBannerDto }) =>
      bannersService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      router.push(ROUTES.BANNERS.LIST);
    },
    onError: (error) => {
      setSubmitError(getApiErrorMessage(error));
    },
  });

  // Form submit handler
  const handleSubmit = async (values: BannerFormValues) => {
    setSubmitError(null);
    setIsUploading(true);

    try {
      // 1. Upload image if new file
      let finalImageUrl = values.imageUrl;
      if (values.imageFile) {
        const uploaded = await filesService.uploadImage(values.imageFile);
        finalImageUrl = filesService.getFileUrl(uploaded);
      }

      // 2. Build the final buttonLink
      let finalButtonLink = "";
      if (values.buttonLinkType === "product" && values.buttonLinkProductId) {
        finalButtonLink = `/product/${values.buttonLinkProductId}`;
      } else if (values.buttonLinkType === "page" && values.buttonLink) {
        finalButtonLink = values.buttonLink;
      }

      // 3. Prepare DTO
      const data: CreateBannerDto = {
        title: values.title,
        description: values.description || undefined,
        imageUrl: finalImageUrl,
        buttonText: values.buttonText || undefined,
        buttonLink: finalButtonLink || undefined,
        isActive: values.isActive,
        order: values.order,
      };

      // 4. Create or update
      if (isEditing && banner) {
        await updateMutation.mutateAsync({ id: banner.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    } finally {
      setIsUploading(false);
    }
  };

  // Initialize formik with banner data if editing
  const formik = useFormik<BannerFormValues>({
    initialValues: banner
      ? (() => {
          const parsed = parseLinkType(banner.buttonLink);
          return {
            title: banner.title,
            description: banner.description || "",
            imageFile: null,
            imageUrl: banner.imageUrl,
            buttonText: banner.buttonText || "",
            buttonLinkType: parsed.type,
            buttonLinkProductId: parsed.productId,
            buttonLinkProductTitle: "",
            buttonLink: parsed.pageLink,
            isActive: banner.isActive,
            order: banner.order,
          };
        })()
      : initialBannerValues,
    validationSchema: bannerSchema,
    enableReinitialize: true,
    onSubmit: handleSubmit,
  });

  const { values, errors, touched, handleChange, handleBlur, setFieldValue } = formik;
  const isSubmitting = createMutation.isPending || updateMutation.isPending || isUploading;

  // Compute errors
  const imageError =
    touched.imageUrl && !values.imageFile && !values.imageUrl
      ? t("imageRequired")
      : undefined;

  const linkError =
    values.buttonLinkType === "product"
      ? touched.buttonLinkProductId && errors.buttonLinkProductId
        ? t("productRequired")
        : undefined
      : touched.buttonLink && errors.buttonLink
      ? t("pageRequired")
      : undefined;

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

          {/* Description */}
          <Textarea
            name="description"
            label={t("description")}
            placeholder={t("descriptionPlaceholder")}
            rows={4}
            value={values.description}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.description ? errors.description : undefined}
          />

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700">
              {t("image")} <span className="text-red-500">*</span>
            </label>
            <SingleImageUpload
              value={values.imageFile}
              existingUrl={values.imageUrl}
              onChange={(file) => setFieldValue("imageFile", file)}
              onRemoveExisting={() => setFieldValue("imageUrl", "")}
              error={imageError}
            />
            <p className="text-xs text-neutral-500">{t("imageFormats")}</p>
          </div>

          {/* Button Text */}
          <Input
            name="buttonText"
            label={t("buttonText")}
            placeholder={t("buttonTextPlaceholder")}
            value={values.buttonText}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.buttonText ? errors.buttonText : undefined}
          />

          {/* Link Selector */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700">
              {t("linkType")}
            </label>
            <LinkSelector
              linkType={values.buttonLinkType}
              productId={values.buttonLinkProductId}
              productTitle={values.buttonLinkProductTitle}
              pageLink={values.buttonLink}
              onLinkTypeChange={(type: LinkType) => {
                setFieldValue("buttonLinkType", type);
                if (type === "product") {
                  setFieldValue("buttonLink", "");
                } else {
                  setFieldValue("buttonLinkProductId", "");
                  setFieldValue("buttonLinkProductTitle", "");
                }
              }}
              onProductChange={(productId: string, productTitle: string) => {
                setFieldValue("buttonLinkProductId", productId);
                setFieldValue("buttonLinkProductTitle", productTitle);
              }}
              onPageChange={(link: string) => setFieldValue("buttonLink", link)}
              error={linkError}
            />
          </div>

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
              onClick={() => router.push(ROUTES.BANNERS.LIST)}
              disabled={isSubmitting}
            >
              {t("cancel")}
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
                  {t("submit")}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
