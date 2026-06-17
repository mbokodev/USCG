"use client";

import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/routing";
import { PageTitle, Button } from "@/components/ui";
import { AdForm } from "@/features/ads";

export default function CreateAdPage() {
  return (
    <div className="max-w-3xl h-full overflow-y-auto pb-6">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <Link href="/ads">
          <Button variant="outline" size="sm" className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <PageTitle title="Nouvelle annonce" description="" />
      </div>

      {/* Form */}
      <AdForm />
    </div>
  );
}
