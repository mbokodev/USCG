import type { Metadata } from "next";
import { ProfileEditForm } from "@/page-sections/customer-dashboard/profile";

export const metadata: Metadata = {
  title: "Modifier mon profil - USCG Marketplace",
  description: "Modifiez vos informations personnelles",
};

export default function ProfileEditPage() {
  return <ProfileEditForm />;
}
