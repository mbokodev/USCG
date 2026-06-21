"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { useFormik } from "formik";
import * as yup from "yup";
import { useTranslations } from "next-intl";

import useVisibility from "./useVisibility";
import { registerAction } from "@/features/auth";

import FlexBox from "@component/ui/FlexBox";
import CheckBox from "@component/ui/form/CheckBox";
import TextField from "@component/ui/form/text-field";
import { Button, IconButton } from "@component/ui/buttons";
import { H3, H5, H6, SemiSpan, Paragraph } from "@component/ui/Typography";
import { StyledRoot } from "./styles";

const formSchema = yup.object().shape({
  firstName: yup.string().required("Le prénom est requis"),
  lastName: yup.string().required("Le nom est requis"),
  email: yup.string().email("Email invalide").required("L'email est requis"),
  phone: yup.string().optional(),
  password: yup
    .string()
    .min(8, "Minimum 8 caractères")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Doit contenir majuscule, minuscule, chiffre et caractère spécial"
    )
    .required("Le mot de passe est requis"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Les mots de passe doivent correspondre")
    .required("Confirmez le mot de passe"),
  acceptTerms: yup
    .bool()
    .oneOf([true], "Vous devez accepter les CGU")
    .required("Vous devez accepter les CGU"),
});

type FormValues = yup.InferType<typeof formSchema>;

export default function Signup() {
  const t = useTranslations("auth");
  const router = useRouter();
  const { passwordVisibility, togglePasswordVisibility } = useVisibility();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFormSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setError(null);

    const result = await registerAction({
      email: values.email,
      password: values.password,
      firstName: values.firstName,
      lastName: values.lastName,
      phone: values.phone,
      acceptTerms: values.acceptTerms,
    });

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || "Une erreur est survenue");
    }

    setIsLoading(false);
  };

  const { values, errors, touched, handleBlur, handleChange, handleSubmit, setFieldValue } =
    useFormik({
      initialValues: {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        acceptTerms: false,
      },
      onSubmit: handleFormSubmit,
      validationSchema: formSchema,
    });

  if (success) {
    return (
      <StyledRoot>
        <div className="content" style={{ paddingBottom: "2rem" }}>
          <H3 textAlign="center" mb="1rem" color="success.main">
            {t("signup.successTitle")}
          </H3>
          <Paragraph textAlign="center" mb="1.5rem">
            {t("signup.successMessage")}
          </Paragraph>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => router.push("/signin")}
          >
            {t("signup.goToSignin")}
          </Button>
        </div>
      </StyledRoot>
    );
  }

  return (
    <StyledRoot>
      <form className="content" onSubmit={handleSubmit}>
        <H3 textAlign="center" mb="0.5rem">
          {t("signup.title")}
        </H3>

        <H5 fontWeight="600" fontSize="12px" color="gray.800" textAlign="center" mb="2.25rem">
          {t("signup.subtitle")}
        </H5>

        {error && (
          <Paragraph color="error.main" textAlign="center" mb="1rem" fontSize="14px">
            {error}
          </Paragraph>
        )}

        <FlexBox style={{ gap: "0.75rem" }} mb="0.75rem">
          <TextField
            fullWidth
            name="firstName"
            label={t("signup.firstName")}
            onBlur={handleBlur}
            value={values.firstName}
            onChange={handleChange}
            placeholder="Jean"
            errorText={touched.firstName && errors.firstName}
          />
          <TextField
            fullWidth
            name="lastName"
            label={t("signup.lastName")}
            onBlur={handleBlur}
            value={values.lastName}
            onChange={handleChange}
            placeholder="Dupont"
            errorText={touched.lastName && errors.lastName}
          />
        </FlexBox>

        <TextField
          fullWidth
          mb="0.75rem"
          name="email"
          type="email"
          onBlur={handleBlur}
          value={values.email}
          onChange={handleChange}
          placeholder="exemple@mail.com"
          label={t("signup.email")}
          errorText={touched.email && errors.email}
        />

        <TextField
          fullWidth
          mb="0.75rem"
          name="phone"
          type="tel"
          onBlur={handleBlur}
          value={values.phone}
          onChange={handleChange}
          placeholder="+243 123 456 789"
          label={t("signup.phone")}
          errorText={touched.phone && errors.phone}
        />

        <TextField
          fullWidth
          mb="0.75rem"
          name="password"
          label={t("signup.password")}
          placeholder="*********"
          onBlur={handleBlur}
          value={values.password}
          onChange={handleChange}
          errorText={touched.password && errors.password}
          type={passwordVisibility ? "text" : "password"}
          endAdornment={
            <IconButton
              p="0.25rem"
              mr="0.25rem"
              type="button"
              color={passwordVisibility ? "gray.700" : "gray.600"}
              onClick={togglePasswordVisibility}
            >
              {passwordVisibility ? <IconEyeOff stroke={1.5} /> : <IconEye stroke={1.5} />}
            </IconButton>
          }
        />

        <TextField
          mb="1rem"
          fullWidth
          name="confirmPassword"
          placeholder="*********"
          label={t("signup.confirmPassword")}
          onBlur={handleBlur}
          onChange={handleChange}
          value={values.confirmPassword}
          type={passwordVisibility ? "text" : "password"}
          errorText={touched.confirmPassword && errors.confirmPassword}
          endAdornment={
            <IconButton
              p="0.25rem"
              size="small"
              mr="0.25rem"
              type="button"
              onClick={togglePasswordVisibility}
              color={passwordVisibility ? "gray.700" : "gray.600"}
            >
              {passwordVisibility ? <IconEyeOff stroke={1.5} /> : <IconEye stroke={1.5} />}
            </IconButton>
          }
        />

        <CheckBox
          mb="1.75rem"
          name="acceptTerms"
          color="secondary"
          onChange={() => setFieldValue("acceptTerms", !values.acceptTerms)}
          checked={values.acceptTerms}
          label={
            <FlexBox>
              <SemiSpan>{t("signup.acceptTerms")}</SemiSpan>
              <a href="/terms" target="_blank" rel="noreferrer noopener">
                <H6 ml="0.5rem" borderBottom="1px solid" borderColor="gray.900">
                  {t("signup.terms")}
                </H6>
              </a>
            </FlexBox>
          }
        />
        {touched.acceptTerms && errors.acceptTerms && (
          <Paragraph color="error.main" fontSize="12px" mt="-1rem" mb="1rem">
            {errors.acceptTerms}
          </Paragraph>
        )}

        <Button
          mb="1.65rem"
          variant="contained"
          color="primary"
          type="submit"
          fullWidth
          disabled={isLoading}
        >
          {isLoading ? t("signup.loading") : t("signup.submit")}
        </Button>
      </form>

      <FlexBox justifyContent="center" bg="gray.200" py="19px">
        <SemiSpan>{t("signup.hasAccount")}</SemiSpan>
        <Link href="/signin">
          <H6 ml="0.5rem" borderBottom="1px solid" borderColor="gray.900">
            {t("signup.signin")}
          </H6>
        </Link>
      </FlexBox>
    </StyledRoot>
  );
}
