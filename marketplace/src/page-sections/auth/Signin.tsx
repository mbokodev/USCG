"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { useFormik } from "formik";
import * as yup from "yup";
import { useTranslations } from "next-intl";

import useVisibility from "./useVisibility";
import { loginAction } from "@/features/auth";

import FlexBox from "@component/ui/FlexBox";
import TextField from "@component/ui/form/text-field";
import { Button, IconButton } from "@component/ui/buttons";
import { H3, H5, H6, SemiSpan, Paragraph } from "@component/ui/Typography";
import { StyledRoot } from "./styles";

const formSchema = yup.object({
  email: yup.string().email("Email invalide").required("L'email est requis"),
  password: yup.string().required("Le mot de passe est requis"),
});

type FormValues = yup.InferType<typeof formSchema>;

export default function Signin() {
  const t = useTranslations("auth");
  const router = useRouter();
  const { passwordVisibility, togglePasswordVisibility } = useVisibility();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setError(null);

    const result = await loginAction(values);

    if (result.success) {
      router.push("/");
      router.refresh();
    } else {
      setError(result.error || "Une erreur est survenue");
    }

    setIsLoading(false);
  };

  const { values, errors, touched, handleBlur, handleChange, handleSubmit } = useFormik({
    initialValues: { email: "", password: "" },
    onSubmit: handleFormSubmit,
    validationSchema: formSchema,
  });

  return (
    <StyledRoot>
      <form className="content" onSubmit={handleSubmit}>
        <H3 textAlign="center" mb="0.5rem">
          {t("signin.title")}
        </H3>

        <H5 fontWeight="600" fontSize="12px" color="gray.800" textAlign="center" mb="2.25rem">
          {t("signin.subtitle")}
        </H5>

        {error && (
          <Paragraph color="error.main" textAlign="center" mb="1rem" fontSize="14px">
            {error}
          </Paragraph>
        )}

        <TextField
          fullWidth
          mb="0.75rem"
          name="email"
          type="email"
          onBlur={handleBlur}
          value={values.email}
          onChange={handleChange}
          placeholder="exemple@mail.com"
          label={t("signin.email")}
          errorText={touched.email && errors.email}
        />

        <TextField
          mb="1rem"
          fullWidth
          name="password"
          label={t("signin.password")}
          autoComplete="on"
          onBlur={handleBlur}
          onChange={handleChange}
          placeholder="*********"
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

        <Button
          mb="1.65rem"
          variant="contained"
          color="primary"
          type="submit"
          fullWidth
          disabled={isLoading}
        >
          {isLoading ? t("signin.loading") : t("signin.submit")}
        </Button>

        <FlexBox justifyContent="center" mb="1.25rem">
          <SemiSpan>{t("signin.noAccount")}</SemiSpan>
          <Link href="/signup">
            <H6 ml="0.5rem" borderBottom="1px solid" borderColor="gray.900">
              {t("signin.signup")}
            </H6>
          </Link>
        </FlexBox>
      </form>

      <FlexBox justifyContent="center" bg="gray.200" py="19px">
        <SemiSpan>{t("signin.forgotPassword")}</SemiSpan>
        <Link href="/forgot-password">
          <H6 ml="0.5rem" borderBottom="1px solid" borderColor="gray.900">
            {t("signin.resetPassword")}
          </H6>
        </Link>
      </FlexBox>
    </StyledRoot>
  );
}
