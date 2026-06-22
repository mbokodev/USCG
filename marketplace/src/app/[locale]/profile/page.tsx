import type { Metadata } from "next";
import { ProfileView } from "@/page-sections/customer-dashboard/profile";

export const metadata: Metadata = {
  title: "Mon Profil - USCG Marketplace",
  description: "Gérez votre profil utilisateur",
};

export default function ProfilePage() {
  return <ProfileView />;
}
