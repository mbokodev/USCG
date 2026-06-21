import type { Metadata } from "next";
import { Signup } from "@/page-sections/auth";

export const metadata: Metadata = {
  title: "Inscription - USCG Marketplace",
  description: "Créez votre compte sur USCG Marketplace",
};

export default function SignupPage() {
  return <Signup />;
}
