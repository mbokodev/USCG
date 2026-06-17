import * as Yup from "yup";

export const adSchema = Yup.object().shape({
  title: Yup.string()
    .required("Le titre est requis")
    .min(5, "Le titre doit contenir au moins 5 caracteres")
    .max(100, "Le titre ne peut pas depasser 100 caracteres"),
  description: Yup.string()
    .required("La description est requise")
    .min(20, "La description doit contenir au moins 20 caracteres")
    .max(2000, "La description ne peut pas depasser 2000 caracteres"),
  price: Yup.number()
    .required("Le prix est requis")
    .min(0, "Le prix doit etre positif")
    .typeError("Le prix doit etre un nombre"),
  quantity: Yup.number()
    .nullable()
    .min(0, "La quantite doit etre positive")
    .typeError("La quantite doit etre un nombre"),
  type: Yup.string()
    .required("Le type est requis")
    .oneOf(["SALE", "RENT"], "Type invalide"),
  categoryId: Yup.string().required("La categorie est requise"),
  subCategoryId: Yup.string().nullable(),
  location: Yup.string()
    .required("L'adresse est requise")
    .min(10, "L'adresse doit contenir au moins 10 caracteres"),
  city: Yup.string()
    .required("La ville est requise")
    .min(2, "La ville doit contenir au moins 2 caracteres"),
});

export type AdFormValues = Yup.InferType<typeof adSchema>;
