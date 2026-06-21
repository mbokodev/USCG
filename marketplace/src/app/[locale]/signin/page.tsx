import type { Metadata } from "next";
import { Signin } from "@/page-sections/auth";

export const metadata: Metadata = {
  title: "Connexion - USCG Marketplace",
  description: "Connectez-vous à votre compte USCG Marketplace",
};

export default function SigninPage() {
  return <Signin />;
}
