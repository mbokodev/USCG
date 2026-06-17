"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button, PageTitle } from "@/components/ui";
import { AdForm, adsService, ExistingImage, TiptapContent } from "@/features/ads";
import { FileType } from "@uscg/shared/types";
import { filesService } from "@/features/files";
import { ROUTES } from "@/config/routes";

export default function EditAdPage() {
  const params = useParams();
  const router = useRouter();
  const adId = params.id as string;

  // Fetch ad data
  const { data: ad, isLoading, error } = useQuery({
    queryKey: ["admin-ad", adId],
    queryFn: () => adsService.getAdminDetail(adId),
    enabled: !!adId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !ad) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-600">Annonce non trouvee</p>
        <Link href={ROUTES.ADS.LIST}>
          <Button variant="outline" className="mt-4">
            Retour aux annonces
          </Button>
        </Link>
      </div>
    );
  }

  // Transform ad data to form initial values
  const existingImages: ExistingImage[] = (ad.files || [])
    .filter((file) => file.type === FileType.IMAGE)
    .map((file) => ({
      id: file.id,
      url: filesService.getFileUrl(file),
      originalName: file.originalName,
      isDefault: file.isDefault,
    }));

  // Ensure description is TiptapContent format
  const description = typeof ad.description === "string"
    ? { type: "doc" as const, content: [{ type: "paragraph", content: [{ type: "text", text: ad.description }] }] }
    : (ad.description as TiptapContent);

  const initialValues = {
    categoryId: ad.categoryId,
    subCategoryId: ad.subCategoryId || "",
    city: ad.city,
    location: ad.location || "",
    title: ad.title,
    type: ad.type,
    price: ad.price,
    discountedPrice: ad.discountedPrice ?? null,
    quantity: ad.quantity,
    description,
    images: [] as { file: File; preview: string }[],
    existingImages,
    removedImageIds: [] as string[],
  };

  return (
    <div className="h-full overflow-y-auto pb-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={ROUTES.ADS.DETAIL(adId)}>
          <Button variant="outline" size="sm" className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <PageTitle
          title="Modifier l'annonce"
          description={ad.title}
        />
      </div>

      {/* Form */}
      <AdForm
        mode="edit"
        adId={adId}
        initialValues={initialValues}
        onCancel={() => router.push(ROUTES.ADS.DETAIL(adId))}
      />
    </div>
  );
}
