"use client";

import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Formik, Form, FormikHelpers } from "formik";
import { MainDrawer, Input, Select, DrawerButton } from "@/components/ui";
import usersService from "../services/users.service";
import { CreateStaffDto, UserRole } from "../types/users.types";
import {
  createStaffSchema,
  CreateStaffFormValues,
} from "../schemas/staff.schema";
import { getApiErrorMessage } from "@/shared/utils";

interface StaffDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  callerRole: UserRole;
}

export function StaffDrawer({ isOpen, onClose, callerRole }: StaffDrawerProps) {
  const t = useTranslations("staff.form");
  const queryClient = useQueryClient();

  // ADMIN can only create OPERATOR, SUPER_ADMIN can create both
  const roleOptions =
    callerRole === UserRole.SUPER_ADMIN
      ? [
          { value: UserRole.OPERATOR, label: "Operator" },
          { value: UserRole.ADMIN, label: "Admin" },
        ]
      : [{ value: UserRole.OPERATOR, label: "Operator" }];

  const createMutation = useMutation({
    mutationFn: (data: CreateStaffDto) => usersService.createStaff(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      onClose();
    },
    onError: (error) => {
      console.error("Error:", getApiErrorMessage(error));
    },
  });

  const initialValues: CreateStaffFormValues = {
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    role: UserRole.OPERATOR,
  };

  const handleSubmit = async (
    values: CreateStaffFormValues,
    helpers: FormikHelpers<CreateStaffFormValues>
  ) => {
    const data: CreateStaffDto = {
      email: values.email,
      password: values.password,
      firstName: values.firstName,
      lastName: values.lastName,
      phone: values.phone || undefined,
      role: values.role as UserRole.OPERATOR | UserRole.ADMIN,
    };

    await createMutation.mutateAsync(data);
    helpers.resetForm();
  };

  return (
    <MainDrawer isOpen={isOpen} onClose={onClose} title={t("createTitle")}>
      <Formik
        initialValues={initialValues}
        validationSchema={createStaffSchema}
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
              placeholder="staff@uscg.cd"
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
              label={t("phone")}
              placeholder="+242 06 000 00 00"
              value={values.phone || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.phone ? errors.phone : undefined}
            />

            <Select
              name="role"
              label={t("role")}
              options={roleOptions}
              value={values.role}
              onChange={handleChange}
              error={touched.role ? errors.role : undefined}
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
