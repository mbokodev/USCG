"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Formik, Form } from "formik";
import { Eye, EyeOff } from "lucide-react";
import { Input, Button } from "@/components/ui";
import { loginSchema, LoginRequest, loginAction } from "@/features/auth";
import { ROUTES } from "@/config/routes";

export default function LoginPage() {
  const t = useTranslations("login");
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useMutation({
    mutationFn: loginAction,
    onSuccess: async (result) => {
      if (result.success && result.user) {
        // Mettre à jour le cache React Query avec le nouvel utilisateur
        queryClient.setQueryData(["currentUser"], result.user);

        // Rediriger vers change-password si nécessaire, sinon dashboard
        if (result.user.mustChangePassword) {
          router.push(ROUTES.AUTH.CHANGE_PASSWORD);
        } else {
          router.push(ROUTES.DASHBOARD);
        }
        router.refresh();
      }
    },
  });

  const handleSubmit = async (values: LoginRequest) => {
    loginMutation.mutate(values);
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

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900">{t("title")}</h2>
            <p className="text-neutral-500 mt-1">{t("subtitle")}</p>
          </div>

          {/* Login error message (inclut erreur 403 pour accès refusé) */}
          {loginMutation.data && !loginMutation.data.success && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
              <p className="text-sm text-red-600">
                {loginMutation.data.error || t("error.invalid")}
              </p>
            </div>
          )}

          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={loginSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, handleChange, handleBlur }) => (
              <Form className="space-y-6">
                <Input
                  name="email"
                  type="email"
                  label={t("email")}
                  placeholder={t("emailPlaceholder")}
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.email ? errors.email : undefined}
                  disabled={loginMutation.isPending}
                />

                <div className="relative">
                  <Input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    label={t("password")}
                    placeholder={t("passwordPlaceholder")}
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.password ? errors.password : undefined}
                    disabled={loginMutation.isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  isLoading={loginMutation.isPending}
                >
                  {loginMutation.isPending ? t("loading") : t("submit")}
                </Button>
              </Form>
            )}
          </Formik>

          <p className="mt-8 text-center text-sm text-neutral-500">
            {t("footer")}
          </p>
        </div>
      </div>
    </div>
  );
}
