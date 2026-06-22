"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useFormik } from "formik";
import * as yup from "yup";
import { useTranslations } from "next-intl";
import { IconBuildingStore, IconCheck, IconClock, IconX } from "@tabler/icons-react";

import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  getMySellerRequest,
  createSellerRequest,
} from "@/features/seller-requests/actions/seller-requests.actions";
import type { ISellerRequest, SellerRequestStatus } from "@uscg/shared/types";

import Box from "@component/ui/Box";
import Card from "@component/ui/Card";
import Grid from "@component/ui/grid/Grid";
import FlexBox from "@component/ui/FlexBox";
import TextField from "@component/ui/form/text-field";
import TextArea from "@component/ui/form/textarea";
import { Button } from "@component/ui/buttons";
import { H2, H3, Paragraph, Small } from "@component/ui/Typography";

const formSchema = yup.object().shape({
  businessName: yup
    .string()
    .min(3, "Le nom doit contenir au moins 3 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères")
    .required("Le nom de l'entreprise est requis"),
  businessAddress: yup
    .string()
    .min(10, "L'adresse doit contenir au moins 10 caractères")
    .required("L'adresse est requise"),
  businessPhone: yup
    .string()
    .min(8, "Le numéro de téléphone est invalide")
    .required("Le téléphone est requis"),
  taxId: yup.string().optional(),
  description: yup
    .string()
    .min(20, "La description doit contenir au moins 50 caractères")
    .required("La description est requise"),
});

type FormValues = yup.InferType<typeof formSchema>;

// Status banner config
const statusConfig = {
  PENDING: {
    icon: IconClock,
    bgColor: "#FFF8E1",
    borderColor: "#FFCD4E",
    iconColor: "#F59E0B",
  },
  APPROVED: {
    icon: IconCheck,
    bgColor: "#E8F5E9",
    borderColor: "#4CAF50",
    iconColor: "#22C55E",
  },
  REJECTED: {
    icon: IconX,
    bgColor: "#FFEBEE",
    borderColor: "#E94560",
    iconColor: "#E94560",
  },
};

// Status banner component (shown below the form)
function StatusBanner({
  status,
  rejectionReason,
  isSeller,
  t,
}: {
  status?: SellerRequestStatus;
  rejectionReason?: string | null;
  isSeller?: boolean;
  t: (key: string) => string;
}) {
  // Already a seller case
  if (isSeller) {
    const config = statusConfig.APPROVED;
    const Icon = config.icon;

    return (
      <Card
        p="1.5rem"
        mt="1.5rem"
        style={{
          backgroundColor: config.bgColor,
          border: `2px solid ${config.borderColor}`,
          borderRadius: 12,
        }}
      >
        <FlexBox alignItems="center" mb="1rem" style={{ gap: 12 }}>
          <FlexBox
            width={48}
            height={48}
            borderRadius="50%"
            alignItems="center"
            justifyContent="center"
            style={{ backgroundColor: "white" }}
          >
            <Icon size={24} color={config.iconColor} />
          </FlexBox>
          <div>
            <H3 my="0px">{t("alreadySeller.title")}</H3>
            <Paragraph color="text.secondary" fontSize="14px">
              {t("alreadySeller.description")}
            </Paragraph>
          </div>
        </FlexBox>

        <FlexBox justifyContent="center" style={{ gap: 12 }} flexWrap="wrap">
          <Link href={process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3002"} target="_blank">
            <Button color="primary" variant="contained">
              {t("alreadySeller.goToPanel")}
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outlined" color="primary">
              {t("buttons.backToHome")}
            </Button>
          </Link>
        </FlexBox>
      </Card>
    );
  }

  // Request status case
  if (!status) return null;

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Card
      p="1.5rem"
      mt="1.5rem"
      style={{
        backgroundColor: config.bgColor,
        border: `2px solid ${config.borderColor}`,
        borderRadius: 12,
      }}
    >
      <FlexBox alignItems="center" mb="1rem" style={{ gap: 12 }}>
        <FlexBox
          width={48}
          height={48}
          borderRadius="50%"
          alignItems="center"
          justifyContent="center"
          style={{ backgroundColor: "white" }}
        >
          <Icon size={24} color={config.iconColor} />
        </FlexBox>
        <div>
          <H3 my="0px">{t(`status.${status.toLowerCase()}.title`)}</H3>
          <Paragraph color="text.secondary" fontSize="14px">
            {t(`status.${status.toLowerCase()}.description`)}
          </Paragraph>
        </div>
      </FlexBox>

      {status === "REJECTED" && rejectionReason && (
        <Card p="1rem" mb="1rem" bg="white" borderRadius={8}>
          <Small color="text.muted" mb="0.25rem">
            {t("status.rejected.reason")}
          </Small>
          <Paragraph>{rejectionReason}</Paragraph>
        </Card>
      )}

      <FlexBox justifyContent="center" style={{ gap: 12 }} flexWrap="wrap">
        {status === "APPROVED" && (
          <Link href={process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3002"} target="_blank">
            <Button color="primary" variant="contained">
              {t("status.approved.goToPanel")}
            </Button>
          </Link>
        )}
        <Link href="/">
          <Button variant={status === "APPROVED" ? "outlined" : "contained"} color="primary">
            {t("buttons.backToHome")}
          </Button>
        </Link>
      </FlexBox>
    </Card>
  );
}

export default function BecomeSellerForm() {
  const t = useTranslations("becomeSeller");
  const { user, isLoading: authLoading, isSeller } = useAuth();

  const [existingRequest, setExistingRequest] = useState<ISellerRequest | null>(null);
  const [isLoadingRequest, setIsLoadingRequest] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch existing request on mount
  useEffect(() => {
    const fetchRequest = async () => {
      if (!user) return;

      const result = await getMySellerRequest();
      if (result.success) {
        setExistingRequest(result.data || null);
      }
      setIsLoadingRequest(false);
    };

    if (!authLoading && user) {
      fetchRequest();
    } else if (!authLoading && !user) {
      setIsLoadingRequest(false);
    }
  }, [user, authLoading]);

  const handleFormSubmit = async (values: FormValues) => {
    setError(null);

    // Always use createSellerRequest - backend handles resubmission automatically
    const result = await createSellerRequest(values);
    if (result.success) {
      setSuccess(true);
      setExistingRequest(result.data || null);
    } else {
      setError(result.error || "Une erreur est survenue");
    }
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      businessName: existingRequest?.businessName || "",
      businessAddress: existingRequest?.businessAddress || "",
      businessPhone: existingRequest?.businessPhone || "",
      taxId: existingRequest?.taxId || "",
      description: existingRequest?.description || "",
    },
    onSubmit: handleFormSubmit,
    validationSchema: formSchema,
  });

  // Loading state
  if (authLoading || isLoadingRequest) {
    return (
      <Box p="4rem" textAlign="center">
        <Paragraph>{t("loading")}</Paragraph>
      </Box>
    );
  }

  // Determine if form should be read-only
  const isReadOnly = isSeller || (existingRequest && existingRequest.status !== "REJECTED") || success;

  // Determine status to display
  const displayStatus = isSeller
    ? undefined
    : existingRequest?.status;

  return (
    <Box maxWidth="800px" mx="auto">
      {/* Header */}
      <FlexBox alignItems="center" mb="2rem" style={{ gap: 12 }}>
        <FlexBox
          width={48}
          height={48}
          bg="primary.light"
          borderRadius="50%"
          alignItems="center"
          justifyContent="center"
        >
          <IconBuildingStore size={24} color="#E94560" />
        </FlexBox>
        <div>
          <H2 my="0px">{t("title")}</H2>
          <Paragraph color="text.secondary">{t("subtitle")}</Paragraph>
        </div>
      </FlexBox>

      {/* Rejection notice (for resubmission) */}
      {existingRequest?.status === "REJECTED" && !success && (
        <Card
          p="1rem"
          mb="1.5rem"
          style={{
            backgroundColor: "#FFEBEE",
            border: "1px solid #E94560",
            borderRadius: 8,
          }}
        >
          <Paragraph fontWeight="600" color="error.main" mb="0.25rem">
            {t("resubmit.title")}
          </Paragraph>
          <Small color="text.secondary">{t("resubmit.description")}</Small>
          {existingRequest.rejectionReason && (
            <Paragraph mt="0.5rem" fontSize="14px">
              <strong>{t("status.rejected.reason")}:</strong> {existingRequest.rejectionReason}
            </Paragraph>
          )}
        </Card>
      )}

      {/* Form */}
      <Card
        p="2rem"
        style={{
          borderRadius: 12,
          boxShadow: "none",
          opacity: isReadOnly ? 0.7 : 1,
        }}
        border="1px solid"
        borderColor="gray.200"
      >
        <form onSubmit={formik.handleSubmit}>
          {error && (
            <Paragraph color="error.main" mb="1rem" fontSize="14px">
              {error}
            </Paragraph>
          )}

          {/* User info (read-only) */}
          <Paragraph fontWeight="600" mb="1rem" color="text.secondary">
            {t("sections.personal")}
          </Paragraph>
          <Grid container spacing={4} mb="1.5rem">
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label={t("fields.firstName")}
                value={user?.firstName || ""}
                disabled
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label={t("fields.lastName")}
                value={user?.lastName || ""}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t("fields.email")}
                value={user?.email || ""}
                disabled
              />
            </Grid>
          </Grid>

          {/* Business info */}
          <Paragraph fontWeight="600" mb="1rem" color="text.secondary">
            {t("sections.business")}
          </Paragraph>
          <Grid container spacing={4} mb="1.5rem">
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                name="businessName"
                label={t("fields.businessName")}
                placeholder={t("placeholders.businessName")}
                onBlur={formik.handleBlur}
                value={formik.values.businessName}
                onChange={formik.handleChange}
                errorText={!isReadOnly && formik.touched.businessName && formik.errors.businessName}
                disabled={isReadOnly}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                name="businessPhone"
                label={t("fields.businessPhone")}
                placeholder={t("placeholders.businessPhone")}
                onBlur={formik.handleBlur}
                value={formik.values.businessPhone}
                onChange={formik.handleChange}
                errorText={!isReadOnly && formik.touched.businessPhone && formik.errors.businessPhone}
                disabled={isReadOnly}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="businessAddress"
                label={t("fields.businessAddress")}
                placeholder={t("placeholders.businessAddress")}
                onBlur={formik.handleBlur}
                value={formik.values.businessAddress}
                onChange={formik.handleChange}
                errorText={!isReadOnly && formik.touched.businessAddress && formik.errors.businessAddress}
                disabled={isReadOnly}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="taxId"
                label={t("fields.taxId")}
                placeholder={t("placeholders.taxId")}
                onBlur={formik.handleBlur}
                value={formik.values.taxId}
                onChange={formik.handleChange}
                errorText={!isReadOnly && formik.touched.taxId && formik.errors.taxId}
                disabled={isReadOnly}
              />
            </Grid>
            <Grid item xs={12}>
              <TextArea
                fullWidth
                rows={5}
                name="description"
                label={t("fields.description")}
                placeholder={t("placeholders.description")}
                onBlur={formik.handleBlur}
                value={formik.values.description}
                onChange={formik.handleChange}
                errorText={!isReadOnly && formik.touched.description && formik.errors.description}
                disabled={isReadOnly}
              />
              {!isReadOnly && (
                <Small color="text.muted" mt="0.5rem">
                  {t("hints.descriptionMin")}
                </Small>
              )}
            </Grid>
          </Grid>

          {/* Submit buttons - only show when form is editable */}
          {!isReadOnly && (
            <FlexBox justifyContent="flex-end" mt="2rem" style={{ gap: 12 }}>
              <Link href="/">
                <Button variant="outlined" color="default">
                  {t("buttons.cancel")}
                </Button>
              </Link>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={formik.isSubmitting}
              >
                {formik.isSubmitting ? t("buttons.submitting") : t("buttons.submit")}
              </Button>
            </FlexBox>
          )}
        </form>
      </Card>

      {/* Status banner - shown when form is read-only */}
      {isReadOnly && (
        <StatusBanner
          status={displayStatus}
          rejectionReason={existingRequest?.rejectionReason}
          isSeller={isSeller}
          t={t}
        />
      )}
    </Box>
  );
}
