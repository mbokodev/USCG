import * as Yup from "yup";
import type { FlashDealFormValues } from "../types";

export const flashDealSchema = Yup.object().shape({
  adId: Yup.string().required("flashDeals.validation.adRequired"),
  adTitle: Yup.string(),
  startDate: Yup.string().required("flashDeals.validation.startDateRequired"),
  endDate: Yup.string().when("hasEndDate", {
    is: true,
    then: (schema) => schema.required("flashDeals.validation.endDateRequired"),
    otherwise: (schema) => schema.nullable(),
  }),
  hasEndDate: Yup.boolean(),
  isActive: Yup.boolean(),
});

export const initialFlashDealValues: FlashDealFormValues = {
  adId: "",
  adTitle: "",
  startDate: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm format
  endDate: "",
  hasEndDate: false,
  isActive: true,
};
