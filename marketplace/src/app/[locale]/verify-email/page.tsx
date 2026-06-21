import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyEmail } from "@/page-sections/auth";

export const metadata: Metadata = {
  title: "Vérification Email - USCG Marketplace",
  description: "Vérifiez votre adresse email pour activer votre compte",
};

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <VerifyEmail />
    </Suspense>
  );
}
