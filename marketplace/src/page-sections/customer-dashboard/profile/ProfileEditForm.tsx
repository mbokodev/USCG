"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as yup from "yup";
import { useTranslations } from "next-intl";
import { IconUserFilled } from "@tabler/icons-react";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { updateProfileAction } from "@/features/auth/actions/auth.actions";
import Box from "@component/ui/Box";
import Card from "@component/ui/Card";
import Grid from "@component/ui/grid/Grid";
import FlexBox from "@component/ui/FlexBox";
import TextField from "@component/ui/form/text-field";
import { Button } from "@component/ui/buttons";
import { H3, Paragraph } from "@component/ui/Typography";
import { DashboardPageHeader } from "@component/layout/customer-dashboard";

const formSchema = yup.object().shape({
  firstName: yup.string().required("Le prénom est requis"),
  lastName: yup.string().required("Le nom est requis"),
  phone: yup.string().optional(),
});

type FormValues = yup.InferType<typeof formSchema>;

export default function ProfileEditForm() {
  const t = useTranslations("profile");
  const router = useRouter();
  const { user, isLoading, refetch } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFormSubmit = async (values: FormValues) => {
    setError(null);
    setSuccess(false);

    const result = await updateProfileAction(values);

    if (result.success) {
      setSuccess(true);
      refetch?.();
      setTimeout(() => {
        router.push("/profile");
      }, 1500);
    } else {
      setError(result.error || "Une erreur est survenue");
    }
  };

  const { values, errors, touched, handleBlur, handleChange, handleSubmit, isSubmitting } =
    useFormik({
      enableReinitialize: true,
      initialValues: {
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        phone: user?.phone || "",
      },
      onSubmit: handleFormSubmit,
      validationSchema: formSchema,
    });

  if (isLoading) {
    return (
      <Box p="2rem" textAlign="center">
        <Paragraph>{t("loading")}</Paragraph>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box p="2rem" textAlign="center">
        <Paragraph>{t("notFound")}</Paragraph>
      </Box>
    );
  }

  const HEADER_LINK = (
    <Link href="/profile">
      <Button color="primary" variant="outlined">
        {t("back")}
      </Button>
    </Link>
  );

  return (
    <Fragment>
      <DashboardPageHeader
        title={t("editTitle")}
        button={HEADER_LINK}
        Icon={<IconUserFilled size={27} />}
      />

      {/* Form */}
      <Card
        style={{
          borderRadius: 12,
          boxShadow: "none",
          padding: "1.5rem",
        }}
        border="1px solid"
        borderColor="gray.200"
      >
        <form onSubmit={handleSubmit}>
          {error && (
            <Paragraph color="error.main" mb="1rem" fontSize="14px">
              {error}
            </Paragraph>
          )}

          {success && (
            <Paragraph color="success.main" mb="1rem" fontSize="14px">
              {t("updateSuccess")}
            </Paragraph>
          )}

          <Box mb="30px">
            <Grid container spacing={4}>
              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  name="firstName"
                  label={t("fields.firstName")}
                  onBlur={handleBlur}
                  value={values.firstName}
                  onChange={handleChange}
                  errorText={touched.firstName && errors.firstName}
                />
              </Grid>

              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  name="lastName"
                  label={t("fields.lastName")}
                  onBlur={handleBlur}
                  value={values.lastName}
                  onChange={handleChange}
                  errorText={touched.lastName && errors.lastName}
                />
              </Grid>

              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  name="email"
                  type="email"
                  label={t("fields.email")}
                  value={user.email}
                  disabled
                />
              </Grid>

              <Grid item md={6} xs={12}>
                <TextField
                  fullWidth
                  name="phone"
                  label={t("fields.phone")}
                  onBlur={handleBlur}
                  value={values.phone}
                  onChange={handleChange}
                  errorText={touched.phone && errors.phone}
                />
              </Grid>
            </Grid>
          </Box>

          <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
            {isSubmitting ? t("saving") : t("save")}
          </Button>
        </form>
      </Card>
    </Fragment>
  );
}
