"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useFormik } from "formik";
import * as yup from "yup";
import { useTranslations } from "next-intl";
import { IconEye, IconEyeOff, IconLock, IconCheck, IconX } from "@tabler/icons-react";

import useVisibility from "./useVisibility";
import { resetPasswordAction } from "@/features/auth";

import FlexBox from "@component/ui/FlexBox";
import TextField from "@component/ui/form/text-field";
import { Button, IconButton } from "@component/ui/buttons";
import { H3, H5, Paragraph } from "@component/ui/Typography";
import { AuthWrapper, StyledRoot } from "./styles";

const formSchema = yup.object({
  password: yup
    .string()
    .min(8, "Minimum 8 caractères")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial (@$!%*?&)"
    )
    .required("Le mot de passe est requis"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Les mots de passe doivent correspondre")
    .required("Confirmez le mot de passe"),
});

type FormValues = yup.InferType<typeof formSchema>;

type Status = "form" | "loading" | "success" | "error" | "invalid";

export default function ResetPassword() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const { passwordVisibility, togglePasswordVisibility } = useVisibility();
  const [status, setStatus] = useState<Status>(token ? "form" : "invalid");
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (values: FormValues) => {
    if (!token) {
      setStatus("invalid");
      return;
    }

    setStatus("loading");
    setError(null);

    const result = await resetPasswordAction(token, values.password);

    if (result.success) {
      setStatus("success");
    } else {
      setError(result.error || "Une erreur est survenue");
      setStatus("error");
    }
  };

  const { values, errors, touched, handleBlur, handleChange, handleSubmit } = useFormik({
    initialValues: { password: "", confirmPassword: "" },
    onSubmit: handleFormSubmit,
    validationSchema: formSchema,
  });

  // Invalid token state
  if (status === "invalid") {
    return (
      <AuthWrapper>
        <StyledRoot>
          <div className="content" style={{ paddingBottom: "2rem" }}>
            <FlexBox justifyContent="center" mb="1.5rem">
              <FlexBox
                width={60}
                height={60}
                borderRadius="50%"
                bg="error.100"
                alignItems="center"
                justifyContent="center"
              >
                <IconX size={32} color="#dc2626" />
              </FlexBox>
            </FlexBox>

            <H3 textAlign="center" mb="0.5rem">
              {t("resetPassword.invalidTitle")}
            </H3>

            <Paragraph textAlign="center" color="gray.700" mb="2rem">
              {t("resetPassword.invalidMessage")}
            </Paragraph>

            <Link href="/forgot-password" style={{ display: "block" }}>
              <Button variant="contained" color="primary" fullWidth mb="1rem">
                {t("resetPassword.requestNew")}
              </Button>
            </Link>

            <Link href="/signin" style={{ display: "block" }}>
              <Button variant="outlined" color="primary" fullWidth>
                {t("resetPassword.backToLogin")}
              </Button>
            </Link>
          </div>
        </StyledRoot>
      </AuthWrapper>
    );
  }

  // Success state
  if (status === "success") {
    return (
      <AuthWrapper>
        <StyledRoot>
          <div className="content" style={{ paddingBottom: "2rem" }}>
            <FlexBox justifyContent="center" mb="1.5rem">
              <FlexBox
                width={60}
                height={60}
                borderRadius="50%"
                bg="success.main"
                alignItems="center"
                justifyContent="center"
              >
                <IconCheck size={32} color="white" />
              </FlexBox>
            </FlexBox>

            <H3 textAlign="center" mb="0.5rem">
              {t("resetPassword.successTitle")}
            </H3>

            <Paragraph textAlign="center" color="gray.700" mb="2rem">
              {t("resetPassword.successMessage")}
            </Paragraph>

            <Link href="/signin" style={{ display: "block" }}>
              <Button variant="contained" color="primary" fullWidth>
                {t("resetPassword.goToLogin")}
              </Button>
            </Link>
          </div>
        </StyledRoot>
      </AuthWrapper>
    );
  }

  return (
    <AuthWrapper>
      <StyledRoot>
        <form className="content" onSubmit={handleSubmit} style={{ paddingBottom: "2rem" }}>
          <FlexBox justifyContent="center" mb="1.5rem">
            <FlexBox
              width={60}
              height={60}
              borderRadius="50%"
              bg="primary.100"
              alignItems="center"
              justifyContent="center"
            >
              <IconLock size={28} color="#2563eb" />
            </FlexBox>
          </FlexBox>

          <H3 textAlign="center" mb="0.5rem">
            {t("resetPassword.title")}
          </H3>

          <H5 fontWeight="400" fontSize="14px" color="gray.700" textAlign="center" mb="2rem">
            {t("resetPassword.description")}
          </H5>

          {(error || status === "error") && (
            <Paragraph color="error.main" textAlign="center" mb="1rem" fontSize="14px">
              {error}
            </Paragraph>
          )}

          <TextField
            fullWidth
            mb="1rem"
            name="password"
            label={t("resetPassword.password")}
            autoComplete="new-password"
            onBlur={handleBlur}
            onChange={handleChange}
            placeholder="********"
            value={values.password}
            errorText={touched.password && errors.password}
            type={passwordVisibility ? "text" : "password"}
            endAdornment={
              <IconButton
                p="0.25rem"
                mr="0.25rem"
                type="button"
                onClick={togglePasswordVisibility}
                color={passwordVisibility ? "gray.700" : "gray.600"}
              >
                {passwordVisibility ? <IconEyeOff stroke={1.5} /> : <IconEye stroke={1.5} />}
              </IconButton>
            }
          />

          <TextField
            fullWidth
            mb="1.5rem"
            name="confirmPassword"
            label={t("resetPassword.confirmPassword")}
            autoComplete="new-password"
            onBlur={handleBlur}
            onChange={handleChange}
            placeholder="********"
            value={values.confirmPassword}
            errorText={touched.confirmPassword && errors.confirmPassword}
            type={passwordVisibility ? "text" : "password"}
            endAdornment={
              <IconButton
                p="0.25rem"
                mr="0.25rem"
                type="button"
                onClick={togglePasswordVisibility}
                color={passwordVisibility ? "gray.700" : "gray.600"}
              >
                {passwordVisibility ? <IconEyeOff stroke={1.5} /> : <IconEye stroke={1.5} />}
              </IconButton>
            }
          />

          <Button
            mb="1rem"
            variant="contained"
            color="primary"
            type="submit"
            fullWidth
            disabled={status === "loading"}
          >
            {status === "loading" ? t("resetPassword.resetting") : t("resetPassword.submit")}
          </Button>
        </form>
      </StyledRoot>
    </AuthWrapper>
  );
}
