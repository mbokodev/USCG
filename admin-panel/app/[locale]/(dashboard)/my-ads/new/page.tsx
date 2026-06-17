"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button, PageTitle } from "@/components/ui";
import { AdForm } from "@/features/ads";
import { ROUTES } from "@/config/routes";

export default function NewMyAdPage() {
  const router = useRouter();

  return (
    <div className="h-full overflow-y-auto pb-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={ROUTES.MY_ADS.LIST}>
          <Button variant="outline" size="sm" className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <PageTitle
          title="Creer une annonce"
          description="Remplissez le formulaire pour publier votre annonce"
        />
      </div>

      {/* Form */}
      <AdForm
        mode="create"
        onCancel={() => router.push(ROUTES.MY_ADS.LIST)}
      />
    </div>
  );
}
