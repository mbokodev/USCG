import * as Yup from "yup";

export const createOperatorSchema = Yup.object().shape({
  email: Yup.string()
    .required("L'email est requis")
    .email("Email invalide"),
  password: Yup.string()
    .required("Le mot de passe est requis")
    .min(8, "Le mot de passe doit contenir au moins 8 caracteres"),
  firstName: Yup.string()
    .required("Le prenom est requis")
    .min(2, "Le prenom doit contenir au moins 2 caracteres")
    .max(50, "Le prenom ne peut pas depasser 50 caracteres"),
  lastName: Yup.string()
    .required("Le nom est requis")
    .min(2, "Le nom doit contenir au moins 2 caracteres")
    .max(50, "Le nom ne peut pas depasser 50 caracteres"),
  phone: Yup.string()
    .max(20, "Le telephone ne peut pas depasser 20 caracteres")
    .nullable(),
});

export type CreateOperatorFormValues = Yup.InferType<typeof createOperatorSchema>;
