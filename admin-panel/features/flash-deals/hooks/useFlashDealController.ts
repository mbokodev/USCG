"use client";

import { useState } from "react";
import { useFormik } from "formik";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { flashDealsService } from "../services";
import type {
  FlashDealListItem,
  CreateFlashDealDto,
  UpdateFlashDealDto,
  FlashDealFormValues,
} from "../types";
import { flashDealSchema, initialFlashDealValues } from "../schemas";
import { getApiErrorMessage } from "@/shared/utils";

export function useFlashDealController() {
  const queryClient = useQueryClient();

  // =========================================================================
  // LOCAL STATE
  // =========================================================================
  const [selectedFlashDeal, setSelectedFlashDeal] = useState<FlashDealListItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // =========================================================================
  // QUERIES
  // =========================================================================
  const {
    data: flashDealsData,
    isLoading,
    error: fetchError,
  } = useQuery({
    queryKey: ["flash-deals"],
    queryFn: () => flashDealsService.getAll(true),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const flashDeals = flashDealsData?.data || [];

  // =========================================================================
  // MUTATIONS
  // =========================================================================
  const createMutation = useMutation({
    mutationFn: async (data: CreateFlashDealDto) => {
      return flashDealsService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flash-deals"] });
      closeDrawer();
      formik.resetForm();
      setSubmitError(null);
    },
    onError: (error) => {
      setSubmitError(getApiErrorMessage(error));
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateFlashDealDto }) => {
      return flashDealsService.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flash-deals"] });
      closeDrawer();
      formik.resetForm();
      setSubmitError(null);
    },
    onError: (error) => {
      setSubmitError(getApiErrorMessage(error));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => flashDealsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flash-deals"] });
      closeModal();
    },
    onError: (error) => {
      console.error("Delete error:", getApiErrorMessage(error));
    },
  });

  // =========================================================================
  // FORM SUBMIT HANDLER
  // =========================================================================
  const handleSubmit = async (values: FlashDealFormValues) => {
    setSubmitError(null);

    try {
      // Prepare DTO
      const data: CreateFlashDealDto = {
        adId: values.adId,
        startDate: new Date(values.startDate).toISOString(),
        endDate: values.hasEndDate && values.endDate ? new Date(values.endDate).toISOString() : null,
        isActive: values.isActive,
      };

      // Create or update
      if (selectedFlashDeal) {
        const updateData: UpdateFlashDealDto = {
          startDate: data.startDate,
          endDate: data.endDate,
          isActive: data.isActive,
        };
        await updateMutation.mutateAsync({ id: selectedFlashDeal.id, data: updateData });
      } else {
        await createMutation.mutateAsync(data);
      }
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    }
  };

  // =========================================================================
  // FORMIK
  // =========================================================================
  const formik = useFormik<FlashDealFormValues>({
    initialValues: selectedFlashDeal
      ? {
          adId: selectedFlashDeal.adId,
          adTitle: selectedFlashDeal.ad.title,
          startDate: new Date(selectedFlashDeal.startDate).toISOString().slice(0, 16),
          endDate: selectedFlashDeal.endDate
            ? new Date(selectedFlashDeal.endDate).toISOString().slice(0, 16)
            : "",
          hasEndDate: !!selectedFlashDeal.endDate,
          isActive: selectedFlashDeal.isActive,
        }
      : initialFlashDealValues,
    validationSchema: flashDealSchema,
    enableReinitialize: true,
    onSubmit: handleSubmit,
  });

  // =========================================================================
  // HANDLERS
  // =========================================================================
  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedFlashDeal(null);
    setSubmitError(null);
    formik.resetForm();
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFlashDeal(null);
  };

  const handleAdd = () => {
    setSelectedFlashDeal(null);
    formik.resetForm();
    openDrawer();
  };

  const handleEdit = (flashDeal: FlashDealListItem) => {
    setSelectedFlashDeal(flashDeal);
    openDrawer();
  };

  const handleDelete = (flashDeal: FlashDealListItem) => {
    setSelectedFlashDeal(flashDeal);
    openModal();
  };

  const confirmDelete = () => {
    if (selectedFlashDeal) {
      deleteMutation.mutate(selectedFlashDeal.id);
    }
  };

  // =========================================================================
  // RETURN
  // =========================================================================
  return {
    // Data
    flashDeals,
    selectedFlashDeal,

    // Loading states
    isLoading,
    fetchError,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
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
