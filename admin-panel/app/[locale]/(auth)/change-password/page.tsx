"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { AlertTriangle, Lock } from "lucide-react";
import { Input, Button } from "@/components/ui";
import { changePasswordAction } from "@/features/auth";
import { ROUTES } from "@/config/routes";

const changePasswordSchema = Yup.object().shape({
  currentPassword: Yup.string().required("Le mot de passe actuel est requis"),
  newPassword: Yup.string()
    .required("Le nouveau mot de passe est requis")
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial"
    ),
  confirmPassword: Yup.string()
    .required("La confirmation est requise")
    .oneOf([Yup.ref("newPassword")], "Les mots de passe ne correspondent pas"),
});

interface ChangePasswordValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ChangePasswordPage() {
  const t = useTranslations("changePassword");
  const router = useRouter();
  const queryClient = useQueryClient();

  const changeMutation = useMutation({
    mutationFn: (values: ChangePasswordValues) =>
      changePasswordAction(values.currentPassword, values.newPassword),
    onSuccess: async (result) => {
      if (result.success) {
        // Mettre à jour le cache pour refléter mustChangePassword = false
        queryClient.invalidateQueries({ queryKey: ["currentUser"] });
        // Rediriger vers le dashboard
        router.push(ROUTES.DASHBOARD);
        router.refresh();
      }
    },
  });

  const handleSubmit = async (values: ChangePasswordValues) => {
    changeMutation.mutate(values);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-center items-center p-12">
        <Image
          src="/images/logo-white.png"
          alt="Universal Services of Congo"
          width={300}
          height={300}
          className="w-auto h-auto"
          priority
        />
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Image
              src="/images/logo-black.png"
              alt="Universal Services of Congo"
              width={150}
              height={150}
              className="w-auto h-auto"
            />
          </div>

          {/* Warning banner */}
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">{t("required")}</p>
              <p className="text-sm text-amber-700 mt-1">{t("requiredDescription")}</p>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900">{t("title")}</h2>
            </div>
            <p className="text-neutral-500">{t("subtitle")}</p>
          </div>

          {/* Error message */}
          {changeMutation.data && !changeMutation.data.success && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">
                {changeMutation.data.error || t("error")}
              </p>
            </div>
          )}

          {/* Success message */}
          {changeMutation.data?.success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600">{t("success")}</p>
            </div>
          )}

          <Formik
            initialValues={{
              currentPassword: "",
              newPassword: "",
              confirmPassword: "",
            }}
            validationSchema={changePasswordSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, handleChange, handleBlur }) => (
              <Form className="space-y-5">
                <Input
                  name="currentPassword"
                  type="password"
                  label={t("currentPassword")}
                  placeholder="********"
                  value={values.currentPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.currentPassword ? errors.currentPassword : undefined}
                  disabled={changeMutation.isPending}
                />

                <Input
                  name="newPassword"
                  type="password"
                  label={t("newPassword")}
                  placeholder="********"
                  value={values.newPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.newPassword ? errors.newPassword : undefined}
                  disabled={changeMutation.isPending}
                />

                <Input
                  name="confirmPassword"
                  type="password"
                  label={t("confirmPassword")}
                  placeholder="********"
                  value={values.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.confirmPassword ? errors.confirmPassword : undefined}
                  disabled={changeMutation.isPending}
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    isLoading={changeMutation.isPending}
                  >
                    {changeMutation.isPending ? t("loading") : t("submit")}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>

          <p className="mt-6 text-center text-xs text-neutral-400">
            {t("hint")}
          </p>
        </div>
      </div>
    </div>
  );
}
