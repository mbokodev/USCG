"use client";

import { useState } from "react";
import { useFormik } from "formik";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bannersService } from "../services";
import { filesService } from "@/features/files";
import type { Banner, CreateBannerDto, UpdateBannerDto, BannerFormValues, LinkType } from "../types";
import { bannerSchema, initialBannerValues } from "../schemas";
import { getApiErrorMessage } from "@/shared/utils";

// Helper to parse existing buttonLink to determine type
function parseLinkType(buttonLink: string | null): { type: LinkType; productId: string; pageLink: string } {
  if (!buttonLink) {
    return { type: "page", productId: "", pageLink: "" };
  }

  // Check if it's a product link (format: /ads/{id})
  const productMatch = buttonLink.match(/^\/ads\/([a-zA-Z0-9_-]+)$/);
  if (productMatch) {
    return { type: "product", productId: productMatch[1], pageLink: "" };
  }

  // Otherwise it's a page link
  return { type: "page", productId: "", pageLink: buttonLink };
}

export function useBannerController() {
  const queryClient = useQueryClient();

  // =========================================================================
  // LOCAL STATE
  // =========================================================================
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // =========================================================================
  // QUERIES
  // =========================================================================
  const {
    data: banners = [],
    isLoading,
    error: fetchError,
  } = useQuery({
    queryKey: ["banners"],
    queryFn: () => bannersService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // =========================================================================
  // MUTATIONS
  // =========================================================================
  const createMutation = useMutation({
    mutationFn: async (data: CreateBannerDto) => {
      return bannersService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      closeDrawer();
      formik.resetForm();
      setSubmitError(null);
    },
    onError: (error) => {
      setSubmitError(getApiErrorMessage(error));
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateBannerDto }) => {
      return bannersService.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      closeDrawer();
      formik.resetForm();
      setSubmitError(null);
    },
    onError: (error) => {
      setSubmitError(getApiErrorMessage(error));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => bannersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      closeModal();
    },
    onError: (error) => {
      console.error("Delete error:", getApiErrorMessage(error));
    },
  });

  // =========================================================================
  // FORM SUBMIT HANDLER
  // =========================================================================
  const handleSubmit = async (values: BannerFormValues) => {
    setSubmitError(null);
    setIsUploading(true);

    try {
      // 1. Upload image if new file
      let finalImageUrl = values.imageUrl;
      if (values.imageFile) {
        const uploaded = await filesService.uploadImage(values.imageFile);
        finalImageUrl = filesService.getFileUrl(uploaded);
      }

      // 2. Build the final buttonLink
      let finalButtonLink = "";
      if (values.buttonLinkType === "product" && values.buttonLinkProductId) {
        finalButtonLink = `/ads/${values.buttonLinkProductId}`;
      } else if (values.buttonLinkType === "page" && values.buttonLink) {
        finalButtonLink = values.buttonLink;
      }

      // 3. Prepare DTO
      const data: CreateBannerDto = {
        title: values.title,
        description: values.description || undefined,
        imageUrl: finalImageUrl,
        buttonText: values.buttonText || undefined,
        buttonLink: finalButtonLink || undefined,
        isActive: values.isActive,
        order: values.order,
      };

      // 4. Create or update
      if (selectedBanner) {
        await updateMutation.mutateAsync({ id: selectedBanner.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    } finally {
      setIsUploading(false);
    }
  };

  // =========================================================================
  // FORMIK
  // =========================================================================
  const formik = useFormik<BannerFormValues>({
    initialValues: selectedBanner
      ? (() => {
          const parsed = parseLinkType(selectedBanner.buttonLink);
          return {
            title: selectedBanner.title,
            description: selectedBanner.description || "",
            imageFile: null,
            imageUrl: selectedBanner.imageUrl,
            buttonText: selectedBanner.buttonText || "",
            buttonLinkType: parsed.type,
            buttonLinkProductId: parsed.productId,
            buttonLinkProductTitle: "", // Will be loaded separately if needed
            buttonLink: parsed.pageLink,
            isActive: selectedBanner.isActive,
            order: selectedBanner.order,
          };
        })()
      : initialBannerValues,
    validationSchema: bannerSchema,
    enableReinitialize: true,
    onSubmit: handleSubmit,
  });

  // =========================================================================
  // HANDLERS
  // =========================================================================
  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedBanner(null);
    setSubmitError(null);
    formik.resetForm();
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBanner(null);
  };

  const handleAdd = () => {
    setSelectedBanner(null);
    formik.resetForm();
    openDrawer();
  };

  const handleEdit = (banner: Banner) => {
    setSelectedBanner(banner);
    openDrawer();
  };

  const handleDelete = (banner: Banner) => {
    setSelectedBanner(banner);
    openModal();
  };

  const confirmDelete = () => {
    if (selectedBanner) {
      deleteMutation.mutate(selectedBanner.id);
    }
  };

  // =========================================================================
  // RETURN
  // =========================================================================
  return {
    // Data
    banners,
    selectedBanner,

    // Loading states
    isLoading,
    fetchError,
    isSubmitting: createMutation.isPending || updateMutation.isPending || isUploading,
    isDeleting: deleteMutation.isPending,
    submitError,

    // Form
    formik,

    // Drawer control
    isDrawerOpen,
    openDrawer,
    closeDrawer,

    // Modal control
    isModalOpen,
    openModal,
    closeModal,

    // Handlers
    handleAdd,
    handleEdit,
    handleDelete,
    confirmDelete,
  };
}
