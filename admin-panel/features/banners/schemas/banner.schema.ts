import * as Yup from "yup";
import type { BannerFormValues } from "../types";

export const bannerSchema = Yup.object<BannerFormValues>({
  title: Yup.string()
    .required("required")
    .min(3, "min3")
    .max(100, "max100"),
  description: Yup.string()
    .max(500, "max500")
    .default(""),
  // Image: file or URL required
  imageFile: Yup.mixed<File>()
    .nullable()
    .default(null),
  imageUrl: Yup.string()
    .default("")
    .when("imageFile", {
      is: (file: File | null) => !file,
      then: (schema) => schema.required("required"),
      otherwise: (schema) => schema,
    }),
  // Button
  buttonText: Yup.string()
    .max(50, "max50")
    .default(""),
  buttonLinkType: Yup.string()
    .oneOf(["product", "page"])
    .default("product"),
  buttonLinkProductId: Yup.string()
    .default("")
    .when("buttonLinkType", {
      is: "product",
      then: (schema) => schema.required("required"),
      otherwise: (schema) => schema,
    }),
  buttonLinkProductTitle: Yup.string()
    .default(""),
  buttonLink: Yup.string()
    .default("")
    .when("buttonLinkType", {
      is: "page",
      then: (schema) => schema.required("required"),
      otherwise: (schema) => schema,
    }),
  isActive: Yup.boolean()
    .default(true),
  order: Yup.number()
    .min(0, "minZero")
    .default(0),
});

export const initialBannerValues: BannerFormValues = {
  title: "",
  description: "",
  imageFile: null,
  imageUrl: "",
  buttonText: "",
  buttonLinkType: "product",
  buttonLinkProductId: "",
  buttonLinkProductTitle: "",
  buttonLink: "",
  isActive: true,
  order: 0,
};
