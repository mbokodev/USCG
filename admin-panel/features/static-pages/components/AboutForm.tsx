"use client";

import { useState } from "react";
import { useFormik, FieldArray, FormikProvider } from "formik";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Loader2, Check, Plus, Trash2, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TiptapEditor } from "@/components/ui/editor";
import { IconPicker } from "@/components/ui/icon-picker";
import { staticPagesService } from "../services";
import type { IAboutPage, AboutFormValues } from "../types";

interface AboutFormProps {
  initialData?: IAboutPage;
  locale: "fr" | "en";
}

// Default empty TipTap content
const emptyContent = {
  type: "doc" as const,
  content: [{ type: "paragraph", content: [] }],
};

const emptyValue = {
  icon: "Star",
  title: "",
  description: "",
};

const emptyTeamMember = {
  name: "",
  role: "",
  photoUrl: "",
};

export function AboutForm({ initialData, locale }: AboutFormProps) {
  const queryClient = useQueryClient();
  const t = useTranslations("staticPages");
  const tCommon = useTranslations("common");

  const [activeSection, setActiveSection] = useState<"intro" | "mission" | "vision" | "values" | "team">("intro");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: staticPagesService.updateAbout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["about-page"] });
    },
    onError: (error: any) => {
      setSubmitError(error?.message || "Une erreur est survenue");
    },
  });

  // Get initial values for current locale
  const getInitialValues = (): AboutFormValues => {
    if (!initialData) {
      return {
        introduction: emptyContent,
        mission: emptyContent,
        vision: emptyContent,
        values: [emptyValue, emptyValue, emptyValue],
        team: [],
      };
    }

    // Use content for current locale (cast to match editor type)
    return {
      introduction: (initialData.introduction?.[locale] || emptyContent) as AboutFormValues["introduction"],
      mission: (initialData.mission?.[locale] || emptyContent) as AboutFormValues["mission"],
      vision: (initialData.vision?.[locale] || emptyContent) as AboutFormValues["vision"],
      values: initialData.values?.map((v) => ({
        icon: v.icon,
        title: locale === "fr" ? (v.titleFr || "") : (v.titleEn || ""),
        description: locale === "fr" ? (v.descFr || "") : (v.descEn || ""),
      })) || [emptyValue, emptyValue, emptyValue],
      team: initialData.team || [],
    };
  };

  const formik = useFormik<AboutFormValues>({
    initialValues: getInitialValues(),
    onSubmit: async (values) => {
      setSubmitError(null);
      await mutation.mutateAsync({
        sourceLang: locale,
        introduction: values.introduction as any,
        mission: values.mission as any,
        vision: values.vision as any,
        values: values.values.map((v) => ({
          icon: v.icon,
          title: v.title,
          description: v.description,
        })),
        team: values.team,
      });
    },
  });

  const sections = [
    { key: "intro", label: t("about.introduction") },
    { key: "mission", label: t("about.mission") },
    { key: "vision", label: t("about.vision") },
    { key: "values", label: t("about.values") },
    { key: "team", label: t("about.team") },
  ];

  return (
    <FormikProvider value={formik}>
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

        {/* Section Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-4 overflow-x-auto">
            {sections.map((section) => (
              <button
                key={section.key}
                type="button"
                onClick={() => setActiveSection(section.key as any)}
                className={`pb-4 px-3 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeSection === section.key
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Sections */}
        <div className="min-h-[400px]">
          {/* Introduction */}
          {activeSection === "intro" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 mb-4">
                Texte d'introduction affiché en haut de la page "À propos"
              </p>
              <TiptapEditor
                content={formik.values.introduction}
                onChange={(content) => formik.setFieldValue("introduction", content)}
                minHeight="300px"
              />
            </div>
          )}

          {/* Mission */}
          {activeSection === "mission" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 mb-4">
                Décrivez la mission de votre entreprise
              </p>
              <TiptapEditor
                content={formik.values.mission}
                onChange={(content) => formik.setFieldValue("mission", content)}
                minHeight="300px"
              />
            </div>
          )}

          {/* Vision */}
          {activeSection === "vision" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 mb-4">
                Décrivez la vision de votre entreprise
              </p>
              <TiptapEditor
                content={formik.values.vision}
                onChange={(content) => formik.setFieldValue("vision", content)}
                minHeight="300px"
              />
            </div>
          )}

          {/* Values */}
          {activeSection === "values" && (
            <FieldArray name="values">
              {({ push, remove }) => (
                <div className="space-y-6">
                  <p className="text-sm text-gray-500">
                    Définissez les valeurs de votre entreprise. Les titres et descriptions seront traduits automatiquement.
                  </p>
                  {formik.values.values.map((value, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium">Valeur {index + 1}</h4>
                        {formik.values.values.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Icône
                          </label>
                          <IconPicker
                            value={value.icon}
                            onChange={(icon) => formik.setFieldValue(`values.${index}.icon`, icon)}
                          />
                        </div>
                        <div>
                          <Input
                            label="Titre"
                            value={value.title}
                            onChange={(e) => formik.setFieldValue(`values.${index}.title`, e.target.value)}
                            placeholder="Ex: Confiance"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Input
                            label="Description"
                            value={value.description}
                            onChange={(e) => formik.setFieldValue(`values.${index}.description`, e.target.value)}
                            placeholder="Ex: Nous garantissons des transactions sécurisées et transparentes."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={() => push(emptyValue)}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t("about.addValue")}
                  </Button>
                </div>
              )}
            </FieldArray>
          )}

          {/* Team */}
          {activeSection === "team" && (
            <FieldArray name="team">
              {({ push, remove }) => (
                <div className="space-y-6">
                  {formik.values.team.length === 0 && (
                    <p className="text-gray-500 text-center py-8">
                      Aucun membre ajouté. Cliquez sur le bouton ci-dessous pour ajouter un membre.
                    </p>
                  )}
                  {formik.values.team.map((member, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium">Membre {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                          label="Nom"
                          value={member.name}
                          onChange={(e) => formik.setFieldValue(`team.${index}.name`, e.target.value)}
                        />
                        <Input
                          label="Rôle"
                          value={member.role}
                          onChange={(e) => formik.setFieldValue(`team.${index}.role`, e.target.value)}
                        />
                        <Input
                          label="URL Photo (optionnel)"
                          value={member.photoUrl || ""}
                          onChange={(e) => formik.setFieldValue(`team.${index}.photoUrl`, e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={() => push(emptyTeamMember)}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t("about.addMember")}
                  </Button>
                </div>
              )}
            </FieldArray>
          )}
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
    </FormikProvider>
  );
}
