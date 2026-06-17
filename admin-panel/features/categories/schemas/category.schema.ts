import * as Yup from "yup";

// =========================================================================
// CATEGORY SCHEMA
// =========================================================================

export const categorySchema = Yup.object().shape({
  name: Yup.string()
    .required("Le nom est requis")
    .min(2, "Le nom doit contenir au moins 2 caracteres")
    .max(100, "Le nom ne peut pas depasser 100 caracteres"),
  slug: Yup.string()
    .required("Le slug est requis")
    .matches(
      /^[a-z0-9-]+$/,
      "Le slug ne peut contenir que des lettres minuscules, chiffres et tirets"
    )
    .min(2, "Le slug doit contenir au moins 2 caracteres")
    .max(100, "Le slug ne peut pas depasser 100 caracteres"),
  description: Yup.string()
    .max(500, "La description ne peut pas depasser 500 caracteres")
    .nullable(),
  icon: Yup.string()
    .max(50, "L'icone ne peut pas depasser 50 caracteres")
    .nullable(),
  sortOrder: Yup.number().min(0, "L'ordre doit etre positif").default(0),
  isActive: Yup.boolean().default(true),
});

export type CategoryFormValues = {
  name: string;
  slug: string;
  description: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
};

export const initialCategoryValues: CategoryFormValues = {
  name: "",
  slug: "",
  description: "",
  icon: "",
  sortOrder: 0,
  isActive: true,
};

// =========================================================================
// SUBCATEGORY SCHEMA
// =========================================================================

export const subCategorySchema = Yup.object().shape({
  name: Yup.string()
    .required("Le nom est requis")
    .min(2, "Le nom doit contenir au moins 2 caracteres")
    .max(100, "Le nom ne peut pas depasser 100 caracteres"),
  slug: Yup.string()
    .required("Le slug est requis")
    .matches(
      /^[a-z0-9-]+$/,
      "Le slug ne peut contenir que des lettres minuscules, chiffres et tirets"
    )
    .min(2, "Le slug doit contenir au moins 2 caracteres")
    .max(100, "Le slug ne peut pas depasser 100 caracteres"),
  description: Yup.string()
    .max(500, "La description ne peut pas depasser 500 caracteres")
    .nullable(),
  categoryId: Yup.string().required("La categorie parente est requise"),
  sortOrder: Yup.number().min(0, "L'ordre doit etre positif").default(0),
  isActive: Yup.boolean().default(true),
});

export type SubCategoryFormValues = {
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  sortOrder: number;
  isActive: boolean;
};

export const initialSubCategoryValues: SubCategoryFormValues = {
  name: "",
  slug: "",
  description: "",
  categoryId: "",
  sortOrder: 0,
  isActive: true,
};
