"use client";

import { useState } from "react";
import { useFormik } from "formik";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Loader2, Check, Info, Languages } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TiptapEditor } from "@/components/ui/editor";
import { staticPagesService } from "../services";
import type { ISellerTermsPage, SellerTermsFormValues } from "../types";

interface SellerTermsFormProps {
  initialData?: ISellerTermsPage;
  locale: "fr" | "en";
}

// Default empty TipTap content
const emptyContent = {
  type: "doc" as const,
  content: [{ type: "paragraph", content: [] }],
};

export function SellerTermsForm({ initialData, locale }: SellerTermsFormProps) {
  const queryClient = useQueryClient();
  const t = useTranslations("staticPages");
  const tCommon = useTranslations("common");

  const [submitError, setSubmitError] = useState<string | null>(null);

  // Determine if this is create or update mode
  const isCreateMode = !initialData || initialData.id === "default-seller-terms";

  const mutation = useMutation({
    mutationFn: staticPagesService.updateSellerTerms,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-terms-page"] });
    },
    onError: (error: any) => {
      setSubmitError(error?.message || "Une erreur est survenue");
    },
  });

  const formik = useFormik<SellerTermsFormValues>({
    initialValues: {
      // Use content for current locale
      content: (initialData?.content?.[locale] || emptyContent) as SellerTermsFormValues["content"],
    },
    onSubmit: async (values) => {
      setSubmitError(null);
      await mutation.mutateAsync({
        sourceLang: locale,
        content: values.content as any,
      });
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      {/* Language indicator */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center gap-3">
        <Info className="w-5 h-5 text-gray-500 flex-shrink-0" />
        <div className="text-sm text-gray-700">
          <span className="font-medium">
            {locale === "fr" ? "Édition de la version française" : "Editing the English version"}
          </span>
          <span className="text-gray-500 ml-2">
            ({locale === "fr"
              ? "La version anglaise ne sera pas modifiée"
              : "The French version will not be modified"})
          </span>
        </div>
      </div>

      {/* Info notice for create mode - auto translation */}
      {isCreateMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <Languages className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">
              {locale === "fr" ? "Traduction automatique" : "Automatic translation"}
            </p>
            <p>
              {locale === "fr"
                ? "Lors de la première sauvegarde, le contenu sera automatiquement traduit en anglais."
                : "On first save, the content will be automatically translated to French."}
            </p>
          </div>
        </div>
      )}

      {/* Content Editor */}
      <div className="min-h-[400px]">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("sellerTerms.content")}
        </label>
        <TiptapEditor
          content={formik.values.content}
          onChange={(content) => formik.setFieldValue("content", content)}
          minHeight="400px"
        />
      </div>

      {/* Error */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {submitError}
        </div>
      )}

      {/* Success */}
      {mutation.isSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
          {tCommon("success")}
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end">
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
