"use client";

import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Formik, Form, FormikHelpers } from "formik";
import { MainDrawer, Input, DrawerButton } from "@/components/ui";
import usersService from "../services/users.service";
import { CreateOperatorDto } from "../types/users.types";
import {
  createOperatorSchema,
  CreateOperatorFormValues,
} from "../schemas/operator.schema";
import { getApiErrorMessage } from "@/shared/utils";

interface OperatorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OperatorDrawer({ isOpen, onClose }: OperatorDrawerProps) {
  const t = useTranslations("users.form");
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateOperatorDto) => usersService.createOperator(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-operators"] });
      onClose();
    },
    onError: (error) => {
      console.error("Error:", getApiErrorMessage(error));
    },
  });

  const initialValues: CreateOperatorFormValues = {
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
  };

  const handleSubmit = async (
    values: CreateOperatorFormValues,
    helpers: FormikHelpers<CreateOperatorFormValues>
  ) => {
    const data: CreateOperatorDto = {
      email: values.email,
      password: values.password,
      firstName: values.firstName,
      lastName: values.lastName,
      phone: values.phone || undefined,
    };

    await createMutation.mutateAsync(data);
    helpers.resetForm();
  };

  return (
    <MainDrawer isOpen={isOpen} onClose={onClose} title={t("createTitle")}>
      <Formik
        initialValues={initialValues}
        validationSchema={createOperatorSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur }) => (
          <Form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="firstName"
                label={t("firstName")}
                placeholder="Jean"
                value={values.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.firstName ? errors.firstName : undefined}
              />

              <Input
                name="lastName"
                label={t("lastName")}
                placeholder="Dupont"
                value={values.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.lastName ? errors.lastName : undefined}
              />
            </div>

            <Input
              name="email"
              type="email"
              label={t("email")}
              placeholder="operateur@uscg.cd"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.email ? errors.email : undefined}
            />

            <Input
              name="password"
              type="password"
              label={t("password")}
              placeholder="********"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.password ? errors.password : undefined}
            />

            <Input
              name="phone"
              label="Telephone (optionnel)"
              placeholder="+242 06 000 00 00"
              value={values.phone || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.phone ? errors.phone : undefined}
            />

            <DrawerButton
              onCancel={onClose}
              submitText={t("submit")}
              cancelText={t("cancel")}
              isLoading={createMutation.isPending}
            />
          </Form>
        )}
      </Formik>
    </MainDrawer>
  );
}
