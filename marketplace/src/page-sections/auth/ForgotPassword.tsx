"use client";

import { useState } from "react";
import Link from "next/link";
import { useFormik } from "formik";
import * as yup from "yup";
import { useTranslations } from "next-intl";
import { IconMail, IconCheck, IconArrowLeft } from "@tabler/icons-react";

import { forgotPasswordAction } from "@/features/auth";

import FlexBox from "@component/ui/FlexBox";
import TextField from "@component/ui/form/text-field";
import { Button } from "@component/ui/buttons";
import { H3, H5, Paragraph } from "@component/ui/Typography";
import { AuthWrapper, StyledRoot } from "./styles";

const formSchema = yup.object({
  email: yup.string().email("Email invalide").required("L'email est requis"),
});

type FormValues = yup.InferType<typeof formSchema>;

type Status = "form" | "loading" | "success" | "error";

export default function ForgotPassword() {
  const t = useTranslations("auth");
  const [status, setStatus] = useState<Status>("form");
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (values: FormValues) => {
    setStatus("loading");
    setError(null);

    const result = await forgotPasswordAction(values.email);

    if (result.success) {
      setStatus("success");
    } else {
      setError(result.error || "Une erreur est survenue");
      setStatus("error");
    }
  };

  const { values, errors, touched, handleBlur, handleChange, handleSubmit } = useFormik({
    initialValues: { email: "" },
    onSubmit: handleFormSubmit,
    validationSchema: formSchema,
  });

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
              {t("forgotPassword.successTitle")}
            </H3>

            <Paragraph textAlign="center" color="gray.700" mb="2rem">
              {t("forgotPassword.successMessage")}
            </Paragraph>

            <Link href="/signin" style={{ display: "block" }}>
              <Button variant="outlined" color="primary" fullWidth>
                <IconArrowLeft size={18} style={{ marginRight: 8 }} />
                {t("forgotPassword.backToLogin")}
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
              <IconMail size={28} color="#2563eb" />
            </FlexBox>
          </FlexBox>

          <H3 textAlign="center" mb="0.5rem">
            {t("forgotPassword.title")}
          </H3>

          <H5 fontWeight="400" fontSize="14px" color="gray.700" textAlign="center" mb="2rem">
            {t("forgotPassword.description")}
          </H5>

          {(error || status === "error") && (
            <Paragraph color="error.main" textAlign="center" mb="1rem" fontSize="14px">
              {error}
            </Paragraph>
          )}

          <TextField
            fullWidth
            mb="1.5rem"
            name="email"
            type="email"
            onBlur={handleBlur}
            value={values.email}
            onChange={handleChange}
            placeholder="exemple@mail.com"
            label={t("forgotPassword.email")}
            errorText={touched.email && errors.email}
          />

          <Button
            mb="1rem"
            variant="contained"
            color="primary"
            type="submit"
            fullWidth
            disabled={status === "loading"}
          >
            {status === "loading" ? t("forgotPassword.sending") : t("forgotPassword.submit")}
          </Button>

          <FlexBox justifyContent="center">
            <Link href="/signin">
              <Button variant="text" color="primary" p="0">
                <IconArrowLeft size={16} style={{ marginRight: 4 }} />
                {t("forgotPassword.backToLogin")}
              </Button>
            </Link>
          </FlexBox>
        </form>
      </StyledRoot>
    </AuthWrapper>
  );
}
