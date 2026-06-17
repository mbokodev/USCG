import * as Yup from "yup";
import type { TiptapContent, ImagePreview, ExistingImage } from "@/components/ui";
import { AdType } from "../types/ads.types";
import type { AdFile } from "../types/ads.types";

// Re-export types for backwards compatibility
export type { ImagePreview, ExistingImage } from "@/components/ui";

export interface AdFormValues {
  // Step 1: Category
  categoryId: string;
  subCategoryId: string;
  city: string;
  location: string;
  // Step 2: Information
  title: string;
  type: AdType;
  price: number | null; // Null = prix sur devis/variable
  discountedPrice: number | null;
  quantity: number | null;
  description: TiptapContent;
  // Step 3: Images
  images: ImagePreview[];
  // Edit mode: existing images
  existingImages: ExistingImage[];
  removedImageIds: string[];
}

// Initial values
export const adFormInitialValues: AdFormValues = {
  categoryId: "",
  subCategoryId: "",
  city: "",
  location: "",
  title: "",
  type: AdType.SALE,
  price: null,
  discountedPrice: null,
  quantity: null,
  description: { type: "doc", content: [] },
  images: [],
  existingImages: [],
  removedImageIds: [],
};

// Step 1 validation: Category & Location
export const stepCategorySchema = Yup.object().shape({
  categoryId: Yup.string().required("Selectionnez une categorie"),
  subCategoryId: Yup.string(),
  city: Yup.string()
    .min(2, "La ville doit contenir au moins 2 caracteres")
    .required("La ville est requise"),
  location: Yup.string()
    .min(10, "L'adresse doit contenir au moins 10 caracteres")
    .required("L'adresse est requise"),
});

// Step 2 validation: Information
export const stepInformationSchema = Yup.object().shape({
  title: Yup.string()
    .min(10, "Le titre doit contenir au moins 10 caracteres")
    .required("Le titre est requis"),
  type: Yup.string()
    .oneOf(["SALE", "RENT"], "Type invalide")
    .required("Le type est requis"),
  price: Yup.number()
    .nullable()
    .min(1, "Le prix doit etre superieur a 0"),
  discountedPrice: Yup.number()
    .nullable()
    .test(
      "less-than-price",
      "Le prix promotionnel doit etre inferieur au prix normal",
      function (value) {
        if (value === null || value === undefined) return true;
        const { price } = this.parent;
        if (price === null || price === undefined) return false; // Pas de promo sans prix
        return value < price;
      }
    ),
  quantity: Yup.number().nullable(),
  description: Yup.object()
    .test(
      "has-content",
      "La description est requise",
      (value) => {
        if (!value) return false;
        const content = value as TiptapContent;
        return content.content && content.content.length > 0;
      }
    ),
});

// Step 3 validation: Images (optional)
export const stepImagesSchema = Yup.object().shape({
  images: Yup.array().max(10, "Maximum 10 images"),
  existingImages: Yup.array(),
  removedImageIds: Yup.array(),
});

// Full schema (for final submission)
export const adFormSchema = Yup.object().shape({
  ...stepCategorySchema.fields,
  ...stepInformationSchema.fields,
  ...stepImagesSchema.fields,
});

// Get schema for a specific step
export const getStepSchema = (step: number) => {
  switch (step) {
    case 1:
      return stepCategorySchema;
    case 2:
      return stepInformationSchema;
    case 3:
      return stepImagesSchema;
    default:
      return Yup.object();
  }
};

// Get field names for a specific step
export const getStepFields = (step: number): (keyof AdFormValues)[] => {
  switch (step) {
    case 1:
      return ["categoryId", "subCategoryId", "city", "location"];
    case 2:
      return ["title", "type", "price", "discountedPrice", "quantity", "description"];
    case 3:
      return ["images", "existingImages", "removedImageIds"];
    default:
      return [];
  }
};
