import * as Yup from "yup";
import { UserRole } from "@uscg/shared/types";

export const createStaffSchema = Yup.object().shape({
  email: Yup.string()
    .required("L'email est requis")
    .email("Email invalide"),
  password: Yup.string()
    .required("Le mot de passe est requis")
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  firstName: Yup.string()
    .required("Le prénom est requis")
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(50, "Le prénom ne peut pas dépasser 50 caractères"),
  lastName: Yup.string()
    .required("Le nom est requis")
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères"),
  phone: Yup.string()
    .max(20, "Le téléphone ne peut pas dépasser 20 caractères")
    .nullable(),
  role: Yup.string()
    .required("Le rôle est requis")
    .oneOf([UserRole.OPERATOR, UserRole.ADMIN], "Rôle invalide"),
});

export type CreateStaffFormValues = Yup.InferType<typeof createStaffSchema>;
