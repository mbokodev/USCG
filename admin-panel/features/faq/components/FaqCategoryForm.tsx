"use client";

import { useState } from "react";
import { useFormik } from "formik";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Loader2, Check, Info, AlertCircle } from "lucide-react";
import { Button, Input, SwitchToggle } from "@/components/ui";
import { faqService } from "../services";
import type { IFaqCategory, FaqCategoryFormValues } from "../types";
import { ROUTES } from "@/config/routes";

interface FaqCategoryFormProps {
  initialData?: IFaqCategory;
  locale: "fr" | "en";
}

export function FaqCategoryForm({ initialData, locale }: FaqCategoryFormProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const t = useTranslations("faq");
  const tCommon = useTranslations("common");

  const [submitError, setSubmitError] = useState<string | null>(null);

  const isCreateMode = !initialData;

  const createMutation = useMutation({
    mutationFn: faqService.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faq-categories"] });
      router.push(ROUTES.FAQ.LIST);
    },
    onError: (error: any) => {
      setSubmitError(error?.message || "Une erreur est survenue");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; dto: any }) =>
      faqService.updateCategory(data.id, data.dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faq-categories"] });
      queryClient.invalidateQueries({ queryKey: ["faq-category", initialData?.id] });
      router.push(ROUTES.FAQ.LIST);
    },
    onError: (error: any) => {
      setSubmitError(error?.message || "Une erreur est survenue");
    },
  });

  const mutation = isCreateMode ? createMutation : updateMutation;

  const formik = useFormik<FaqCategoryFormValues>({
    initialValues: {
      name: initialData?.name?.[locale] || "",
      isActive: initialData?.isActive ?? true,
    },
    onSubmit: async (values) => {
      setSubmitError(null);

      const dto = {
        name: values.name,
        isActive: values.isActive,
        sourceLang: locale,
      };

      if (isCreateMode) {
        await createMutation.mutateAsync(dto);
      } else {
        await updateMutation.mutateAsync({ id: initialData!.id, dto });
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      {/* Language indicator */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center gap-3">
        <Info className="w-5 h-5 text-gray-500 flex-shrink-0" />
        <div className="text-sm text-gray-700">
          <span className="font-medium">
            {locale === "fr"
              ? "Édition de la version française"
              : "Editing the English version"}
          </span>
          <span className="text-gray-500 ml-2">
            ({locale === "fr"
              ? "La version anglaise ne sera pas modifiée"
              : "The French version will not be modified"})
          </span>
        </div>
      </div>

      {/* Auto-translate notice for CREATE mode */}
      {isCreateMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">{t("autoTranslate.title")}</p>
            <p>{t("autoTranslate.description")}</p>
          </div>
        </div>
      )}

      {/* Name */}
      <Input
        label={t("categories.name")}
        name="name"
        value={formik.values.name}
        onChange={formik.handleChange}
        error={formik.touched.name && formik.errors.name ? formik.errors.name : undefined}
        required
      />

      {/* Active status */}
      {!isCreateMode && (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">{tCommon("status")}</p>
            <p className="text-sm text-gray-500">{t("categories.statusDescription")}</p>
          </div>
          <SwitchToggle
            checked={formik.values.isActive ?? true}
            onCheckedChange={(checked) => formik.setFieldValue("isActive", checked)}
          />
        </div>
      )}

      {/* Error */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700">{submitError}</p>
        </div>
      )}

      {/* Success */}
      {mutation.isSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
          {tCommon("success")}
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(ROUTES.FAQ.LIST)}
        >
          {tCommon("cancel")}
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {tCommon("saving")}
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
  );
}
